import { jest } from '@jest/globals';
import { create, getAll, getById, update, remove } from '../../../src/controllers/studentController.js';
import models from '../../../src/models/index.js';

jest.mock('../../../src/models/index.js');

const { Student, Class } = models;

describe('studentController', () => {
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
    it('deve criar um aluno com sucesso', async () => {
      req.body = {
        nome: 'João Silva',
        classId: 1
      };

      const mockClass = { id: 1, nome: '1º Ano A' };
      const mockStudent = {
        id: 1,
        nome: 'João Silva',
        classId: 1,
        class: mockClass
      };

      Class.findByPk.mockResolvedValue(mockClass);
      Student.create.mockResolvedValue(mockStudent);
      Student.findByPk.mockResolvedValue(mockStudent);

      await create(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockStudent);
    });

    it('deve retornar erro 400 quando nome está vazio', async () => {
      req.body = {
        nome: '   ',
        classId: 1
      };

      await create(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Nome do aluno é obrigatório'
      });
    });

    it('deve retornar erro 404 quando turma não existe', async () => {
      req.body = {
        nome: 'João Silva',
        classId: 999
      };

      Class.findByPk.mockResolvedValue(null);

      await create(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Turma não encontrada'
      });
    });
  });

  describe('getAll', () => {
    it('deve retornar todos os alunos com sucesso', async () => {
      const mockStudents = [
        {
          id: 1,
          nome: 'João Silva',
          class: { id: 1, nome: '1º Ano A' }
        },
        {
          id: 2,
          nome: 'Maria Santos',
          class: { id: 1, nome: '1º Ano A' }
        }
      ];

      Student.findAll.mockResolvedValue(mockStudents);

      await getAll(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockStudents);
    });

    it('deve chamar next quando ocorre erro', async () => {
      const error = new Error('Database error');
      Student.findAll.mockRejectedValue(error);

      await getAll(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getById', () => {
    it('deve retornar um aluno por ID com sucesso', async () => {
      req.params.id = '1';

      const mockStudent = {
        id: 1,
        nome: 'João Silva',
        class: { id: 1, nome: '1º Ano A' }
      };

      Student.findByPk.mockResolvedValue(mockStudent);

      await getById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockStudent);
    });

    it('deve retornar erro 404 quando aluno não existe', async () => {
      req.params.id = '999';

      Student.findByPk.mockResolvedValue(null);

      await getById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Aluno não encontrado' });
    });
  });

  describe('update', () => {
    it('deve atualizar um aluno com sucesso', async () => {
      req.params.id = '1';
      req.body = {
        nome: 'João Silva Atualizado',
        classId: 2
      };

      const mockStudent = {
        id: 1,
        nome: 'João Silva',
        classId: 1,
        save: jest.fn().mockResolvedValue(true)
      };

      const mockClass = { id: 2, nome: '2º Ano B' };

      Student.findByPk.mockResolvedValue(mockStudent);
      Class.findByPk.mockResolvedValue(mockClass);

      await update(req, res, next);

      expect(mockStudent.nome).toBe('João Silva Atualizado');
      expect(mockStudent.classId).toBe(2);
      expect(mockStudent.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('deve retornar erro 404 quando aluno não existe', async () => {
      req.params.id = '999';
      req.body = {
        nome: 'João Silva'
      };

      Student.findByPk.mockResolvedValue(null);

      await update(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Aluno não encontrado' });
    });

    it('deve retornar erro 404 quando turma não existe', async () => {
      req.params.id = '1';
      req.body = {
        nome: 'João Silva',
        classId: 999
      };

      const mockStudent = {
        id: 1,
        nome: 'João Silva',
        classId: 1
      };

      Student.findByPk.mockResolvedValue(mockStudent);
      Class.findByPk.mockResolvedValue(null);

      await update(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Turma não encontrada' });
    });
  });

  describe('remove', () => {
    it('deve deletar um aluno sem notas com sucesso', async () => {
      req.params.id = '1';

      const mockStudent = {
        id: 1,
        nome: 'João Silva',
        grades: [],
        destroy: jest.fn().mockResolvedValue(true)
      };

      Student.findByPk.mockResolvedValue(mockStudent);

      await remove(req, res, next);

      expect(mockStudent.destroy).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Aluno deletado com sucesso'
      });
    });

    it('deve retornar erro 404 quando aluno não existe', async () => {
      req.params.id = '999';

      Student.findByPk.mockResolvedValue(null);

      await remove(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Aluno não encontrado' });
    });

    it('deve retornar erro 400 quando aluno tem notas cadastradas', async () => {
      req.params.id = '1';

      const mockStudent = {
        id: 1,
        nome: 'João Silva',
        grades: [{ id: 1 }, { id: 2 }]
      };

      Student.findByPk.mockResolvedValue(mockStudent);

      await remove(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Não é possível deletar aluno com notas cadastradas'
      });
    });
  });
});
