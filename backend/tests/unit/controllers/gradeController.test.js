import { jest } from '@jest/globals';
import { create, getAll, getById, update, remove } from '../../../src/controllers/gradeController.js';
import models from '../../../src/models/index.js';

jest.mock('../../../src/models/index.js');

const { Grade, Student, Subject, Class } = models;

describe('gradeController', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      params: {}
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
    it('deve criar uma nota com sucesso', async () => {
      req.body = {
        studentId: 1,
        subjectId: 1,
        unidade: 1,
        teste: 8.5,
        prova: 7.5
      };

      const mockStudent = {
        id: 1,
        classId: 1,
        class: { id: 1, nome: '1º Ano A' }
      };

      const mockSubject = { id: 1, nome: 'Matemática' };
      const mockClass = {
        id: 1,
        subjects: [mockSubject]
      };

      const mockGrade = {
        id: 1,
        studentId: 1,
        subjectId: 1,
        unidade: 1,
        teste: 8.5,
        prova: 7.5,
        mediaUnidade: 8,
        student: mockStudent,
        subject: mockSubject
      };

      Student.findByPk.mockResolvedValue(mockStudent);
      Subject.findByPk.mockResolvedValue(mockSubject);
      Class.findByPk.mockResolvedValue(mockClass);
      Grade.findOne.mockResolvedValue(null);
      Grade.create.mockResolvedValue(mockGrade);
      Grade.findByPk.mockResolvedValue(mockGrade);

      await create(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Nota lançada com sucesso',
        data: expect.any(Object)
      }));
    });

    it('deve retornar erro 400 quando campos obrigatórios estão faltando', async () => {
      req.body = {
        studentId: 1,
        subjectId: 1
        // faltam unidade, teste, prova
      };

      await create(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'studentId, subjectId, unidade, teste e prova são obrigatórios'
      });
    });

    it('deve retornar erro 400 quando notas são inválidas', async () => {
      req.body = {
        studentId: 1,
        subjectId: 1,
        unidade: 1,
        teste: 11, // inválido
        prova: 7.5
      };

      await create(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'teste e prova devem estar entre 0 e 10'
      });
    });

    it('deve retornar erro quando disciplina não está vinculada à turma', async () => {
      req.body = {
        studentId: 1,
        subjectId: 1,
        unidade: 1,
        teste: 8.5,
        prova: 7.5
      };

      const mockStudent = {
        id: 1,
        nome: 'João Silva',
        classId: 1,
        class: { id: 1, nome: '1º Ano A' }
      };

      const mockSubject = { id: 1, nome: 'Matemática' };
      const mockClass = {
        id: 1,
        subjects: [] // sem disciplinas vinculadas
      };

      Student.findByPk.mockResolvedValue(mockStudent);
      Subject.findByPk.mockResolvedValue(mockSubject);
      Class.findByPk.mockResolvedValue(mockClass);

      await create(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: 'Esta disciplina não está vinculada à turma do aluno'
      }));
    });

    it('deve retornar erro 400 quando nota já existe para a unidade', async () => {
      req.body = {
        studentId: 1,
        subjectId: 1,
        unidade: 1,
        teste: 8.5,
        prova: 7.5
      };

      const mockStudent = {
        id: 1,
        classId: 1,
        class: { id: 1, nome: '1º Ano A' }
      };

      const mockSubject = { id: 1, nome: 'Matemática' };
      const mockClass = {
        id: 1,
        subjects: [mockSubject]
      };

      const existingGrade = { id: 1, unidade: 1 };

      Student.findByPk.mockResolvedValue(mockStudent);
      Subject.findByPk.mockResolvedValue(mockSubject);
      Class.findByPk.mockResolvedValue(mockClass);
      Grade.findOne.mockResolvedValue(existingGrade);

      await create(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Já existe nota lançada para esta unidade'
      });
    });
  });

  describe('getAll', () => {
    it('deve retornar todas as notas com sucesso', async () => {
      const mockGrades = [
        {
          id: 1,
          teste: 8.5,
          prova: 7.5,
          mediaUnidade: 8,
          student: { nome: 'João Silva' },
          subject: { nome: 'Matemática' }
        }
      ];

      Grade.findAll.mockResolvedValue(mockGrades);

      await getAll(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockGrades);
    });

    it('deve chamar next quando ocorre erro', async () => {
      const error = new Error('Database error');
      Grade.findAll.mockRejectedValue(error);

      await getAll(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getById', () => {
    it('deve retornar uma nota por ID com sucesso', async () => {
      req.params.id = '1';

      const mockGrade = {
        id: 1,
        teste: 8.5,
        prova: 7.5,
        student: { nome: 'João Silva' },
        subject: { nome: 'Matemática' }
      };

      Grade.findByPk.mockResolvedValue(mockGrade);

      await getById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockGrade);
    });

    it('deve retornar erro 404 quando nota não existe', async () => {
      req.params.id = '999';

      Grade.findByPk.mockResolvedValue(null);

      await getById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Nota não encontrada' });
    });
  });

  describe('update', () => {
    it('deve atualizar uma nota com sucesso', async () => {
      req.params.id = '1';
      req.body = {
        teste: 9,
        prova: 8
      };

      const mockGrade = {
        id: 1,
        teste: 8.5,
        prova: 7.5,
        mediaUnidade: 8,
        save: jest.fn().mockResolvedValue(true),
        reload: jest.fn().mockResolvedValue(true),
        student: { nome: 'João Silva' },
        subject: { nome: 'Matemática' }
      };

      Grade.findByPk.mockResolvedValue(mockGrade);

      await update(req, res, next);

      expect(mockGrade.teste).toBe(9);
      expect(mockGrade.prova).toBe(8);
      expect(mockGrade.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('deve retornar erro 404 quando nota não existe', async () => {
      req.params.id = '999';
      req.body = {
        teste: 9,
        prova: 8
      };

      Grade.findByPk.mockResolvedValue(null);

      await update(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Nota não encontrada' });
    });

    it('deve retornar erro 400 quando notas são inválidas', async () => {
      req.params.id = '1';
      req.body = {
        teste: 11, // inválido
        prova: 8
      };

      const mockGrade = {
        id: 1,
        teste: 8.5,
        prova: 7.5
      };

      Grade.findByPk.mockResolvedValue(mockGrade);

      await update(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'teste e prova devem estar entre 0 e 10'
      });
    });
  });

  describe('remove', () => {
    it('deve deletar uma nota com sucesso', async () => {
      req.params.id = '1';

      const mockGrade = {
        id: 1,
        destroy: jest.fn().mockResolvedValue(true)
      };

      Grade.findByPk.mockResolvedValue(mockGrade);

      await remove(req, res, next);

      expect(mockGrade.destroy).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Nota deletada com sucesso'
      });
    });

    it('deve retornar erro 404 quando nota não existe', async () => {
      req.params.id = '999';

      Grade.findByPk.mockResolvedValue(null);

      await remove(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Nota não encontrada' });
    });
  });
});
