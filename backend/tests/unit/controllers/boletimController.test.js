import { jest } from '@jest/globals';
import { getMyBoletim, getBoletim } from '../../../src/controllers/boletimController.js';
import { generateBoletim } from '../../../src/services/boletimService.js';

jest.mock('../../../src/services/boletimService.js');

describe('boletimController', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      params: {},
      user: {}
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

  describe('getMyBoletim', () => {
    it('deve retornar boletim do aluno autenticado com sucesso', async () => {
      req.user = {
        id: 1,
        studentId: 10,
        role: 'student'
      };

      const mockBoletim = {
        student: {
          id: 10,
          nome: 'João Silva',
          class: { id: 1, nome: '1º Ano A' }
        },
        disciplines: [
          {
            subjectName: 'Matemática',
            mediaFinal: 8,
            status: 'Aprovado'
          }
        ],
        statusGeral: 'Aprovado'
      };

      generateBoletim.mockResolvedValue(mockBoletim);

      await getMyBoletim(req, res, next);

      expect(generateBoletim).toHaveBeenCalledWith(10);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockBoletim);
    });

    it('deve retornar erro 403 quando usuário não tem studentId', async () => {
      req.user = {
        id: 1,
        role: 'student'
        // sem studentId
      };

      await getMyBoletim(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Acesso negado. Apenas alunos podem acessar este recurso.'
      });
    });

    it('deve retornar erro 404 quando boletim não é encontrado', async () => {
      req.user = {
        id: 1,
        studentId: 999,
        role: 'student'
      };

      generateBoletim.mockResolvedValue(null);

      await getMyBoletim(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Dados do aluno não encontrados'
      });
    });
  });
  describe('getBoletim', () => {
  describe('getBoletimByStudentId', () => {
    it('deve retornar boletim de um aluno específico com sucesso', async () => {
      req.params.studentId = '10';

      const mockBoletim = {
        student: {
          id: 10,
          nome: 'João Silva',
          class: { id: 1, nome: '1º Ano A' }
        },
        disciplines: [
          {
            subjectName: 'Matemática',
            mediaFinal: 8,
            status: 'Aprovado'
          }
        ],
        statusGeral: 'Aprovado'
      };

      generateBoletim.mockResolvedValue(mockBoletim);

      await getBoletim(req, res, next);

      expect(generateBoletim).toHaveBeenCalledWith(10);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockBoletim);
    });

    it('deve retornar erro 404 quando boletim não é encontrado', async () => {
      req.params.studentId = '999';

      generateBoletim.mockResolvedValue(null);

      await getBoletim(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Aluno não encontrado'
      });
    });

    it('deve retornar erro 400 quando studentId é inválido', async () => {
      req.params.studentId = 'abc';

      await getBoletim(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'studentId inválido'
      });
      expect(generateBoletim).not.toHaveBeenCalled();
    });

    it('deve chamar next quando ocorre erro', async () => {
      req.params.studentId = '10';

      const error = new Error('Database error');
      generateBoletim.mockRejectedValue(error);

      await getBoletim(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
