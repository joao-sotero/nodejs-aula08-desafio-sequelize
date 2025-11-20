import { jest } from '@jest/globals';
import {
  create,
  getAll,
  getById,
  update,
  remove,
  addSubjects,
  removeSubjects
} from '../../../src/controllers/classController.js';
import models from '../../../src/models/index.js';

jest.mock('../../../src/models/index.js');

const { Class, Student, Subject, Grade } = models;

describe('classController', () => {
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
    it('deve criar uma turma com sucesso', async () => {
      req.body = { nome: ' 1º Ano A ' };
      const mockClass = { id: 1, nome: '1º Ano A' };
      Class.create.mockResolvedValue(mockClass);

      await create(req, res, next);

      expect(Class.create).toHaveBeenCalledWith({ nome: '1º Ano A' });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockClass);
    });

    it('deve retornar erro 400 quando nome é inválido', async () => {
      req.body = { nome: '   ' };

      await create(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Nome da turma é obrigatório' });
    });
  });

  describe('getAll', () => {
    it('deve retornar lista de turmas formatada', async () => {
      const mockClasses = [
        {
          toJSON: () => ({
            id: 1,
            nome: '1º Ano A',
            students: [
              { id: 10, nome: 'João' },
              { id: 11, nome: 'Maria' }
            ]
          })
        }
      ];

      Class.findAll.mockResolvedValue(mockClasses);

      await getAll(req, res, next);

      expect(Class.findAll).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([
        expect.objectContaining({
          id: 1,
          nome: '1º Ano A',
          studentCount: 2,
          students: expect.any(Array)
        })
      ]);
    });

    it('deve chamar next quando ocorre erro', async () => {
      const error = new Error('DB error');
      Class.findAll.mockRejectedValue(error);

      await getAll(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getById', () => {
    it('deve retornar uma turma com sucesso', async () => {
      req.params.id = '1';
      const mockClass = {
        toJSON: () => ({ id: 1, nome: '1º Ano A', students: null, subjects: null })
      };

      Class.findByPk.mockResolvedValue(mockClass);

      await getById(req, res, next);

      expect(Class.findByPk).toHaveBeenCalledWith('1', expect.any(Object));
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        id: 1,
        nome: '1º Ano A',
        students: [],
        subjects: []
      });
    });

    it('deve retornar erro 404 quando turma não é encontrada', async () => {
      req.params.id = '999';
      Class.findByPk.mockResolvedValue(null);

      await getById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Turma não encontrada' });
    });
  });

  describe('update', () => {
    it('deve atualizar uma turma com sucesso', async () => {
      req.params.id = '1';
      req.body = { nome: '1º Ano B' };

      const mockClass = {
        id: 1,
        nome: '1º Ano A',
        save: jest.fn().mockResolvedValue(true)
      };

      Class.findByPk.mockResolvedValue(mockClass);

      await update(req, res, next);

      expect(mockClass.nome).toBe('1º Ano B');
      expect(mockClass.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Turma atualizada com sucesso',
        data: mockClass
      });
    });

    it('deve retornar erro 400 quando nome é inválido', async () => {
      req.body = { nome: '   ' };

      await update(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Nome da turma é obrigatório' });
    });

    it('deve retornar erro 404 quando turma não é encontrada', async () => {
      req.params.id = '999';
      req.body = { nome: '1º Ano B' };
      Class.findByPk.mockResolvedValue(null);

      await update(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Turma não encontrada' });
    });
  });

  describe('remove', () => {
    it('deve deletar uma turma sem alunos com sucesso', async () => {
      req.params.id = '1';

      const mockClass = {
        id: 1,
        students: [],
        destroy: jest.fn().mockResolvedValue(true)
      };

      Class.findByPk.mockResolvedValue(mockClass);

      await remove(req, res, next);

      expect(mockClass.destroy).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Turma deletada com sucesso' });
    });

    it('deve retornar erro 404 quando turma não é encontrada', async () => {
      req.params.id = '999';
      Class.findByPk.mockResolvedValue(null);

      await remove(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Turma não encontrada' });
    });

    it('deve retornar erro 400 quando há alunos vinculados', async () => {
      req.params.id = '1';

      const mockClass = {
        id: 1,
        students: [{ id: 10 }]
      };

      Class.findByPk.mockResolvedValue(mockClass);

      await remove(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Não é possível deletar turma com alunos vinculados',
        details: 'A turma possui 1 aluno(s)'
      });
    });
  });

  describe('addSubjects', () => {
    it('deve associar disciplinas com sucesso', async () => {
      req.params.id = '1';
      req.body = { subjectIds: [1, '2'] };

      const classEntity = {
        id: 1,
        setSubjects: jest.fn().mockResolvedValue(true)
      };

      const updatedClass = {
        id: 1,
        nome: '1º Ano A',
        subjects: [{ id: 1, nome: 'Matemática' }]
      };

      Class.findByPk
        .mockResolvedValueOnce(classEntity)
        .mockResolvedValueOnce(updatedClass);

      Subject.findAll.mockResolvedValue([
        { id: 1, nome: 'Matemática' },
        { id: 2, nome: 'Português' }
      ]);

      await addSubjects(req, res, next);

      expect(classEntity.setSubjects).toHaveBeenCalledWith([1, 2]);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Disciplinas associadas com sucesso',
        data: {
          id: 1,
          nome: '1º Ano A',
          subjects: updatedClass.subjects
        }
      });
    });

    it('deve retornar erro 400 quando subjectIds é inválido', async () => {
      req.body = { subjectIds: 'abc' };

      await addSubjects(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'subjectIds deve ser um array com pelo menos um ID'
      });
    });

    it('deve retornar erro 400 quando existem IDs inválidos', async () => {
      req.body = { subjectIds: [1, 0, 'xyz'] };

      await addSubjects(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Todos os subjectIds devem ser números inteiros positivos'
      });
    });

    it('deve retornar erro 404 quando turma não é encontrada', async () => {
      req.params.id = '999';
      req.body = { subjectIds: [1] };

      Class.findByPk.mockResolvedValue(null);

      await addSubjects(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Turma não encontrada' });
    });

    it('deve retornar erro 400 quando disciplinas não existem', async () => {
      req.params.id = '1';
      req.body = { subjectIds: [1, 2] };

      const classEntity = {
        id: 1,
        setSubjects: jest.fn()
      };

      Class.findByPk.mockResolvedValue(classEntity);
      Subject.findAll.mockResolvedValue([{ id: 1, nome: 'Matemática' }]);

      await addSubjects(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Algumas disciplinas não foram encontradas',
        details: 'IDs inválidos: 2'
      });
    });
  });

  describe('removeSubjects', () => {
    it('deve remover disciplinas quando não há notas vinculadas', async () => {
      req.params.id = '1';
      req.body = { subjectIds: [1, 2] };

      const classEntity = {
        id: 1,
        removeSubjects: jest.fn().mockResolvedValue(true)
      };

      const updatedClass = {
        id: 1,
        nome: '1º Ano A',
        subjects: []
      };

      Class.findByPk
        .mockResolvedValueOnce(classEntity)
        .mockResolvedValueOnce(updatedClass);

      Student.findAll.mockResolvedValue([]);
      Grade.findAll.mockResolvedValue([]);

      await removeSubjects(req, res, next);

      expect(classEntity.removeSubjects).toHaveBeenCalledWith([1, 2]);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Disciplinas removidas com sucesso',
        data: {
          id: 1,
          nome: '1º Ano A',
          subjects: []
        }
      });
    });

    it('deve retornar erro 400 quando subjectIds é inválido', async () => {
      req.body = { subjectIds: 'invalid' };

      await removeSubjects(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'subjectIds deve ser um array com pelo menos um ID'
      });
    });

    it('deve retornar erro 404 quando turma não é encontrada', async () => {
      req.params.id = '999';
      req.body = { subjectIds: [1] };

      Class.findByPk.mockResolvedValue(null);

      await removeSubjects(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Turma não encontrada' });
    });

    it('deve retornar erro 400 quando existem notas cadastradas', async () => {
      req.params.id = '1';
      req.body = { subjectIds: [1] };

      const classEntity = {
        id: 1,
        removeSubjects: jest.fn()
      };

      Class.findByPk.mockResolvedValue(classEntity);

      Student.findAll.mockResolvedValue([{ id: 10 }]);
      Grade.findAll.mockResolvedValue([
        {
          student: { nome: 'João' },
          subject: { nome: 'Matemática' },
          unidade: 1
        }
      ]);

      await removeSubjects(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Não é possível remover disciplinas que já possuem notas lançadas',
        details: {
          totalNotas: 1,
          exemplos: ['João - Matemática (Unidade 1)'],
          mensagem: 'Remova as notas primeiro antes de desvincular a disciplina da turma'
        }
      });
    });
  });
});
