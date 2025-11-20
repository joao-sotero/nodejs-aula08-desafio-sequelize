import models from '../models/index.js';

const { Grade, Student, Subject, Class } = models;

const isValidScore = value => typeof value === 'number' && value >= 0 && value <= 10;

const normalizeNumber = value => {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

// Helper para validar se disciplina pertence à turma do aluno
const validateSubjectInClass = async (studentId, subjectId) => {
  const student = await Student.findByPk(studentId, {
    include: [{
      model: Class,
      as: 'class',
      attributes: ['id', 'nome']
    }]
  });

  if (!student) {
    return { valid: false, error: 'Aluno não encontrado' };
  }

  if (!student.classId) {
    return { valid: false, error: 'Aluno não está vinculado a nenhuma turma' };
  }

  const subject = await Subject.findByPk(subjectId);

  if (!subject) {
    return { valid: false, error: 'Disciplina não encontrada' };
  }

  const classWithSubjects = await Class.findByPk(student.classId, {
    include: [{
      model: Subject,
      as: 'subjects',
      where: { id: subjectId },
      required: false
    }]
  });

  if (!classWithSubjects || !classWithSubjects.subjects || classWithSubjects.subjects.length === 0) {
    return {
      valid: false,
      error: 'Esta disciplina não está vinculada à turma do aluno',
      details: {
        aluno: student.nome,
        turma: student.class?.nome,
        disciplina: subject.nome,
        mensagem: 'Você precisa vincular esta disciplina à turma antes de lançar notas'
      }
    };
  }

  return { valid: true, student, subject };
};

export const create = async (req, res, next) => {
  try {
    const { studentId, subjectId, unidade, teste, prova } = req.body;

    const normalizedStudentId = normalizeNumber(studentId);
    const normalizedSubjectId = normalizeNumber(subjectId);
    const normalizedUnidade = normalizeNumber(unidade);
    const normalizedTeste = normalizeNumber(teste);
    const normalizedProva = normalizeNumber(prova);

    if (
      normalizedStudentId === null ||
      normalizedSubjectId === null ||
      normalizedUnidade === null ||
      normalizedTeste === null ||
      normalizedProva === null
    ) {
      return res.status(400).json({ error: 'studentId, subjectId, unidade, teste e prova são obrigatórios' });
    }

    if (!Number.isInteger(normalizedStudentId) || !Number.isInteger(normalizedSubjectId)) {
      return res.status(400).json({ error: 'studentId e subjectId devem ser números inteiros' });
    }

    if (!Number.isInteger(normalizedUnidade) || normalizedUnidade < 1 || normalizedUnidade > 4) {
      return res.status(400).json({ error: 'unidade deve ser um número inteiro entre 1 e 4' });
    }

    if (!isValidScore(normalizedTeste) || !isValidScore(normalizedProva)) {
      return res.status(400).json({ error: 'teste e prova devem estar entre 0 e 10' });
    }

    // Validar se disciplina pertence à turma do aluno
    const validation = await validateSubjectInClass(normalizedStudentId, normalizedSubjectId);
    
    if (!validation.valid) {
      return res.status(validation.details ? 400 : 404).json({ 
        error: validation.error,
        ...(validation.details && { details: validation.details })
      });
    }

    const existing = await Grade.findOne({
      where: {
        studentId: normalizedStudentId,
        subjectId: normalizedSubjectId,
        unidade: normalizedUnidade
      }
    });

    if (existing) {
      return res.status(400).json({
        error: 'Já existe nota cadastrada para este aluno nesta disciplina e unidade'
      });
    }

    const grade = await Grade.create({
      studentId: normalizedStudentId,
      subjectId: normalizedSubjectId,
      unidade: normalizedUnidade,
      mediaUnidade: (normalizedTeste + normalizedProva) / 2,
      teste: normalizedTeste,
      prova: normalizedProva
    });

    const gradeWithRelations = await Grade.findByPk(grade.id, {
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'nome']
        },
        {
          model: Subject,
          as: 'subject',
          attributes: ['id', 'nome']
        }
      ]
    });

    return res.status(201).json(gradeWithRelations);
  } catch (error) {
    return next(error);
  }
};

export const getAll = async (req, res, next) => {
  try {
    const grades = await Grade.findAll({
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'nome']
        },
        {
          model: Subject,
          as: 'subject',
          attributes: ['id', 'nome']
        }
      ],
      order: [
        [{ model: Student, as: 'student' }, 'nome', 'ASC'],
        [{ model: Subject, as: 'subject' }, 'nome', 'ASC'],
        ['unidade', 'ASC']
      ]
    });

    return res.status(200).json(grades);
  } catch (error) {
    return next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const grade = await Grade.findByPk(id, {
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'nome']
        },
        {
          model: Subject,
          as: 'subject',
          attributes: ['id', 'nome']
        }
      ]
    });

    if (!grade) {
      return res.status(404).json({ error: 'Nota não encontrada' });
    }

    return res.status(200).json(grade);
  } catch (error) {
    return next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { teste, prova } = req.body;

    if (teste === undefined && prova === undefined) {
      return res.status(400).json({ error: 'Informe teste e/ou prova para atualizar' });
    }

    const grade = await Grade.findByPk(id);

    if (!grade) {
      return res.status(404).json({ error: 'Nota não encontrada' });
    }

    if (teste !== undefined) {
      const parsedTeste = Number(teste);

      if (Number.isNaN(parsedTeste) || parsedTeste < 0 || parsedTeste > 10) {
        return res.status(400).json({ error: 'teste deve estar entre 0 e 10' });
      }

      grade.teste = parsedTeste;
    }

    if (prova !== undefined) {
      const parsedProva = Number(prova);

      if (Number.isNaN(parsedProva) || parsedProva < 0 || parsedProva > 10) {
        return res.status(400).json({ error: 'prova deve estar entre 0 e 10' });
      }

      grade.prova = parsedProva;
    }

    await grade.save();

    return res.status(200).json({
      message: 'Nota atualizada com sucesso',
      data: grade
    });
  } catch (error) {
    return next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const grade = await Grade.findByPk(id);

    if (!grade) {
      return res.status(404).json({ error: 'Nota não encontrada' });
    }

    await grade.destroy();

    return res.status(200).json({ message: 'Nota deletada com sucesso' });
  } catch (error) {
    return next(error);
  }
};
