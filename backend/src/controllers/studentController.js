import models from '../models/index.js';

const { Student, Class, Grade, Subject } = models;

export const create = async (req, res, next) => {
  try {
    const { nome, classId } = req.body;

    if (!nome || !nome.toString().trim() || !classId) {
      return res.status(400).json({ error: 'Nome e classId são obrigatórios' });
    }

    if (!Number.isInteger(Number(classId))) {
      return res.status(400).json({ error: 'classId deve ser um número inteiro' });
    }

    const classEntity = await Class.findByPk(classId);

    if (!classEntity) {
      return res.status(404).json({ error: 'Turma não encontrada' });
    }

    const student = await Student.create({
      nome: nome.trim(),
      classId: classEntity.id
    });

    const studentWithClass = await Student.findByPk(student.id, {
      include: [{
        model: Class,
        as: 'class',
        attributes: ['id', 'nome']
      }]
    });

    return res.status(201).json(studentWithClass);
  } catch (error) {
    return next(error);
  }
};

export const getAll = async (req, res, next) => {
  try {
    const students = await Student.findAll({
      include: [{
        model: Class,
        as: 'class',
        attributes: ['id', 'nome']
      }],
      order: [['nome', 'ASC']]
    });

    return res.status(200).json(students);
  } catch (error) {
    return next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const student = await Student.findByPk(id, {
      include: [
        {
          model: Class,
          as: 'class',
          attributes: ['id', 'nome']
        },
        Grade && {
          model: Grade,
          as: 'grades',
          include: [
            Subject && {
              model: Subject,
              as: 'subject',
              attributes: ['id', 'nome']
            }
          ].filter(Boolean)
        }
      ].filter(Boolean)
    });

    if (!student) {
      return res.status(404).json({ error: 'Aluno não encontrado' });
    }

    return res.status(200).json(student);
  } catch (error) {
    return next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nome, classId } = req.body;

    if (!nome && !classId) {
      return res.status(400).json({ error: 'Informe nome e/ou classId para atualização' });
    }

    const student = await Student.findByPk(id, {
      include: [{
        model: Class,
        as: 'class',
        attributes: ['id', 'nome']
      }]
    });

    if (!student) {
      return res.status(404).json({ error: 'Aluno não encontrado' });
    }

    let classEntity = student.class;

    if (classId !== undefined) {
      if (!Number.isInteger(Number(classId))) {
        return res.status(400).json({ error: 'classId deve ser um número inteiro' });
      }

      classEntity = await Class.findByPk(classId);

      if (!classEntity) {
        return res.status(404).json({ error: 'Turma não encontrada' });
      }

      student.classId = classEntity.id;
    }

    if (nome !== undefined) {
      if (!nome.toString().trim()) {
        return res.status(400).json({ error: 'Nome do aluno não pode estar vazio' });
      }

      student.nome = nome.trim();
    }

    await student.save();

    const refreshed = await Student.findByPk(student.id, {
      include: [{
        model: Class,
        as: 'class',
        attributes: ['id', 'nome']
      }]
    });

    return res.status(200).json({
      message: 'Aluno atualizado com sucesso',
      data: refreshed
    });
  } catch (error) {
    return next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    const { id } = req.params;

    const student = await Student.findByPk(id, {
      include: [
        Grade && {
          model: Grade,
          as: 'grades',
          attributes: ['id']
        }
      ].filter(Boolean)
    });

    if (!student) {
      return res.status(404).json({ error: 'Aluno não encontrado' });
    }

    const gradeCount = (student.grades || []).length;

    if (gradeCount > 0) {
      return res.status(400).json({
        error: 'Não é possível deletar aluno com notas cadastradas',
        details: `O aluno possui ${gradeCount} nota(s)`
      });
    }

    await student.destroy();

    return res.status(200).json({ message: 'Aluno deletado com sucesso' });
  } catch (error) {
    return next(error);
  }
};
