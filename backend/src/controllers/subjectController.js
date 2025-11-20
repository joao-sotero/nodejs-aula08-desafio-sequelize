import models from '../models/index.js';

const { Subject } = models;

export const create = async (req, res, next) => {
  try {
    const { nome } = req.body;

    if (!nome || !nome.toString().trim()) {
      return res.status(400).json({ error: 'Nome da disciplina é obrigatório' });
    }

    const subject = await Subject.create({ nome: nome.trim() });

    return res.status(201).json(subject);
  } catch (error) {
    return next(error);
  }
};

export const getAll = async (req, res, next) => {
  try {
    const { classId } = req.query;

    if (classId) {
      const classEntity = await models.Class.findByPk(classId, {
        include: [{
          model: Subject,
          as: 'subjects',
          through: { attributes: [] },
          order: [['nome', 'ASC']]
        }]
      });

      if (!classEntity) {
        return res.status(404).json({ error: 'Turma não encontrada' });
      }

      return res.status(200).json(classEntity.subjects || []);
    }

    // Caso contrário, retorna todas as disciplinas
    const subjects = await Subject.findAll({
      order: [['nome', 'ASC']]
    });

    return res.status(200).json(subjects);
  } catch (error) {
    return next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const subject = await Subject.findByPk(id);

    if (!subject) {
      return res.status(404).json({ error: 'Disciplina não encontrada' });
    }

    return res.status(200).json(subject);
  } catch (error) {
    return next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nome } = req.body;

    if (!nome || !nome.toString().trim()) {
      return res.status(400).json({ error: 'Nome da disciplina é obrigatório' });
    }

    const subject = await Subject.findByPk(id);

    if (!subject) {
      return res.status(404).json({ error: 'Disciplina não encontrada' });
    }

    subject.nome = nome.trim();
    await subject.save();

    return res.status(200).json({
      message: 'Disciplina atualizada com sucesso',
      data: {
        id: subject.id,
        nome: subject.nome,
        createdAt: subject.createdAt,
        updatedAt: subject.updatedAt
      }
    });
  } catch (error) {
    return next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const include = [];

    if (models.Grade) {
      include.push({
        model: models.Grade,
        as: 'grades',
        attributes: ['id']
      });
    }

    const subject = await Subject.findByPk(id, { include });

    if (!subject) {
      return res.status(404).json({ error: 'Disciplina não encontrada' });
    }

    const gradeCount = (subject.grades || []).length;

    if (gradeCount > 0) {
      return res.status(400).json({
        error: 'Não é possível deletar disciplina com notas cadastradas'
      });
    }

    await subject.destroy();

    return res.status(200).json({ message: 'Disciplina deletada com sucesso' });
  } catch (error) {
    return next(error);
  }
};
