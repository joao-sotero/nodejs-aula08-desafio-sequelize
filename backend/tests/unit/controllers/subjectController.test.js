import { jest } from '@jest/globals';
import {
  create,
  getAll,
  getById,
  update,
  remove
} from '../../../src/controllers/subjectController.js';
import models from '../../../src/models/index.js';

jest.mock('../../../src/models/index.js');

const { Subject, Class } = models;

describe('subjectController', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      query: {}
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('deve criar uma disciplina com sucesso', async () => {
      req.body = { nome: ' Matemática ' };
      const mockSubject = { id: 1, nome: 'Matemática' };
      Subject.create.mockResolvedValue(mockSubject);

      await create(req, res, next);

      expect(Subject.create).toHaveBeenCalledWith({ nome: 'Matemática' });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockSubject);
    });

    it('deve retornar erro 400 quando nome é inválido', async () => {
      req.body = { nome: '   ' };

      await create(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Nome da disciplina é obrigatório' });
    });
  });

  describe('getAll', () => {
    it('deve retornar todas as disciplinas ordenadas', async () => {
      const mockSubjects = [
        { id: 1, nome: 'Matemática' },
        { id: 2, nome: 'Português' }
      ];

      Subject.findAll.mockResolvedValue(mockSubjects);

      await getAll(req, res, next);

      expect(Subject.findAll).toHaveBeenCalledWith({
        order: [['nome', 'ASC']]
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockSubjects);
    });

    it('deve retornar disciplinas vinculadas a uma turma quando classId é informado', async () => {
      req.query = { classId: '1' };

      const classEntity = {
        subjects: [
          { id: 1, nome: 'Matemática' }
        ]
      };

      Class.findByPk.mockResolvedValue(classEntity);

      await getAll(req, res, next);

      expect(Class.findByPk).toHaveBeenCalledWith('1', expect.any(Object));
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(classEntity.subjects);
    });

    it('deve retornar erro 404 quando turma não é encontrada', async () => {
      req.query = { classId: '999' };
      Class.findByPk.mockResolvedValue(null);

      await getAll(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Turma não encontrada' });
    });

    it('deve chamar next quando ocorre erro', async () => {
      const error = new Error('DB error');
      Subject.findAll.mockRejectedValue(error);

      await getAll(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getById', () => {
    it('deve retornar disciplina por ID', async () => {
      req.params.id = '1';
      const mockSubject = { id: 1, nome: 'Matemática' };
      Subject.findByPk.mockResolvedValue(mockSubject);

      await getById(req, res, next);

      expect(Subject.findByPk).toHaveBeenCalledWith('1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockSubject);
    });

    it('deve retornar erro 404 quando disciplina não é encontrada', async () => {
      req.params.id = '999';
      Subject.findByPk.mockResolvedValue(null);

      await getById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Disciplina não encontrada' });
    });
  });

  describe('update', () => {
    it('deve atualizar disciplina com sucesso', async () => {
      req.params.id = '1';
      req.body = { nome: ' Ciências ' };

      const mockSubject = {
        id: 1,
        nome: 'Matemática',
        createdAt: '2025-01-01',
        updatedAt: '2025-01-01',
        save: jest.fn().mockResolvedValue(true)
      };

      Subject.findByPk.mockResolvedValue(mockSubject);

      await update(req, res, next);

      expect(mockSubject.nome).toBe('Ciências');
      expect(mockSubject.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Disciplina atualizada com sucesso',
        data: {
          id: mockSubject.id,
          nome: 'Ciências',
          createdAt: mockSubject.createdAt,
          updatedAt: mockSubject.updatedAt
        }
      });
    });

    it('deve retornar erro 400 quando nome é inválido', async () => {
      req.body = { nome: '' };

      await update(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Nome da disciplina é obrigatório' });
    });

    it('deve retornar erro 404 quando disciplina não existe', async () => {
      req.params.id = '999';
      req.body = { nome: 'História' };
      Subject.findByPk.mockResolvedValue(null);

      await update(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Disciplina não encontrada' });
    });
  });

  describe('remove', () => {
    it('deve deletar disciplina sem notas com sucesso', async () => {
      req.params.id = '1';

      const mockSubject = {
        id: 1,
        grades: [],
        destroy: jest.fn().mockResolvedValue(true)
      };

      Subject.findByPk.mockResolvedValue(mockSubject);

      await remove(req, res, next);

      expect(mockSubject.destroy).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Disciplina deletada com sucesso' });
    });

    it('deve retornar erro 404 quando disciplina não é encontrada', async () => {
      req.params.id = '999';
      Subject.findByPk.mockResolvedValue(null);

      await remove(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Disciplina não encontrada' });
    });

    it('deve retornar erro 400 quando disciplina possui notas', async () => {
      req.params.id = '1';

      const mockSubject = {
        id: 1,
        grades: [{ id: 10 }]
      };

      Subject.findByPk.mockResolvedValue(mockSubject);

      await remove(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Não é possível deletar disciplina com notas cadastradas'
      });
    });
  });
});
