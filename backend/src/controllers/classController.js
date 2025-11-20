import models from '../models/index.js';

const { Class } = models;

export const create = async (req, res, next) => {
  try {
    const { nome } = req.body;

    if (!nome || !nome.toString().trim()) {
      return res.status(400).json({ error: 'Nome da turma é obrigatório' });
    }

    const newClass = await Class.create({ nome: nome.trim() });

    return res.status(201).json(newClass);
  } catch (error) {
    return next(error);
  }
};

export const getAll = async (req, res, next) => {
  try {
    const include = [];

    if (models.Student) {
      include.push({
        model: models.Student,
        as: 'students',
        attributes: ['id', 'nome', 'classId', 'createdAt', 'updatedAt']
      });
    }

    const classes = await Class.findAll({
      include,
      order: [['nome', 'ASC']]
    });

    const formatted = classes.map(cls => {
      const data = cls.toJSON();
      const students = data.students || [];

      return {
        ...data,
        studentCount: students.length,
        students
      };
    });

    return res.status(200).json(formatted);
  } catch (error) {
    return next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const include = [];

    if (models.Student) {
      include.push({
        model: models.Student,
        as: 'students',
        attributes: ['id', 'nome', 'classId', 'createdAt', 'updatedAt']
      });
    }

    if (models.Subject) {
      include.push({
        model: models.Subject,
        as: 'subjects',
        attributes: ['id', 'nome', 'createdAt', 'updatedAt']
      });
    }

    const classEntity = await Class.findByPk(id, { include });

    if (!classEntity) {
      return res.status(404).json({ error: 'Turma não encontrada' });
    }

    const data = classEntity.toJSON();

    return res.status(200).json({
      ...data,
      students: data.students || [],
      subjects: data.subjects || []
    });
  } catch (error) {
    return next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nome } = req.body;

    if (!nome || !nome.toString().trim()) {
      return res.status(400).json({ error: 'Nome da turma é obrigatório' });
    }

    const classEntity = await Class.findByPk(id);

    if (!classEntity) {
      return res.status(404).json({ error: 'Turma não encontrada' });
    }

    classEntity.nome = nome.trim();
    await classEntity.save();

    return res.status(200).json({
      message: 'Turma atualizada com sucesso',
      data: classEntity
    });
  } catch (error) {
    return next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    const { id } = req.params;

    const include = [];

    if (models.Student) {
      include.push({
        model: models.Student,
        as: 'students',
        attributes: ['id']
      });
    }

    const classEntity = await Class.findByPk(id, { include });

    if (!classEntity) {
      return res.status(404).json({ error: 'Turma não encontrada' });
    }

    const studentCount = (classEntity.students || []).length;

    if (studentCount > 0) {
      return res.status(400).json({
        error: 'Não é possível deletar turma com alunos vinculados',
        details: `A turma possui ${studentCount} aluno(s)`
      });
    }

    await classEntity.destroy();

    return res.status(200).json({ message: 'Turma deletada com sucesso' });
  } catch (error) {
    return next(error);
  }
};

export const addSubjects = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { subjectIds } = req.body;

    if (!Array.isArray(subjectIds) || subjectIds.length === 0) {
      return res.status(400).json({ error: 'subjectIds deve ser um array com pelo menos um ID' });
    }

    if (!models.Subject) {
      return res.status(500).json({ error: 'Model de Subject não disponível' });
    }

    const parsedIds = subjectIds.map(value => Number(value));
    const invalidIds = parsedIds.filter(idValue => !Number.isInteger(idValue) || idValue <= 0);

    if (invalidIds.length > 0) {
      return res.status(400).json({ error: 'Todos os subjectIds devem ser números inteiros positivos' });
    }

    const uniqueIds = [...new Set(parsedIds)];

    const classEntity = await Class.findByPk(id);

    if (!classEntity) {
      return res.status(404).json({ error: 'Turma não encontrada' });
    }

    const subjects = await models.Subject.findAll({
      where: { id: uniqueIds }
    });

    if (subjects.length !== uniqueIds.length) {
      const foundIds = subjects.map(subject => subject.id);
      const missing = uniqueIds.filter(subjectId => !foundIds.includes(subjectId));

      return res.status(400).json({
        error: 'Algumas disciplinas não foram encontradas',
        details: `IDs inválidos: ${missing.join(', ')}`
      });
    }

    await classEntity.setSubjects(uniqueIds);

    const updatedClass = await Class.findByPk(id, {
      include: [
        {
          model: models.Subject,
          as: 'subjects',
          attributes: ['id', 'nome']
        }
      ]
    });

    return res.status(200).json({
      message: 'Disciplinas associadas com sucesso',
      data: {
        id: updatedClass.id,
        nome: updatedClass.nome,
        subjects: updatedClass.subjects || []
      }
    });
  } catch (error) {
    return next(error);
  }
};

export const removeSubjects = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { subjectIds } = req.body;

    if (!Array.isArray(subjectIds) || subjectIds.length === 0) {
      return res.status(400).json({ error: 'subjectIds deve ser um array com pelo menos um ID' });
    }

    const classEntity = await Class.findByPk(id);

    if (!classEntity) {
      return res.status(404).json({ error: 'Turma não encontrada' });
    }

    // Verificar se existem notas lançadas para essas disciplinas nesta turma
    const students = await models.Student.findAll({
      where: { classId: id },
      attributes: ['id']
    });

    if (students.length > 0) {
      const studentIds = students.map(s => s.id);
      const existingGrades = await models.Grade.findAll({
        where: {
          studentId: studentIds,
          subjectId: subjectIds
        },
        include: [
          {
            model: models.Student,
            as: 'student',
            attributes: ['nome']
          },
          {
            model: models.Subject,
            as: 'subject',
            attributes: ['nome']
          }
        ],
        limit: 5
      });

      if (existingGrades.length > 0) {
        const examples = existingGrades.map(g => 
          `${g.student.nome} - ${g.subject.nome} (Unidade ${g.unidade})`
        );
        
        return res.status(400).json({
          error: 'Não é possível remover disciplinas que já possuem notas lançadas',
          details: {
            totalNotas: existingGrades.length,
            exemplos: examples,
            mensagem: 'Remova as notas primeiro antes de desvincular a disciplina da turma'
          }
        });
      }
    }

    await classEntity.removeSubjects(subjectIds);

    const updatedClass = await Class.findByPk(id, {
      include: [
        {
          model: models.Subject,
          as: 'subjects',
          attributes: ['id', 'nome']
        }
      ]
    });

    return res.status(200).json({
      message: 'Disciplinas removidas com sucesso',
      data: {
        id: updatedClass.id,
        nome: updatedClass.nome,
        subjects: updatedClass.subjects || []
      }
    });
  } catch (error) {
    return next(error);
  }
};
