/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TESTES UNITÁRIOS - boletimController
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Testa a geração de boletins escolares:
 * - getMyBoletim: Aluno vê seu próprio boletim
 * - getBoletim: Admin/Professor vê boletim de qualquer aluno
 * - Validações de acesso e permissões
 * - Tratamento de erros
 * 
 * NOTA: Este controller usa um SERVICE (boletimService) que é mockado
 */

import { jest } from '@jest/globals';

// Mock da função de serviço que gera o boletim
const generateBoletim = jest.fn();

await jest.unstable_mockModule('../../../src/services/boletimService.js', () => ({
  __esModule: true,
  generateBoletim,
  default: { generateBoletim }
}));

const { getMyBoletim, getBoletim } = await import('../../../src/controllers/boletimController.js');

describe('boletimController', () => {
  let req, res, next;

  // Prepara mocks antes de cada teste
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

  // Testa rota para aluno ver SEU PRÓPRIO boletim
  describe('getMyBoletim', () => {
    
    /**
     * Cenário de sucesso: aluno autenticado com studentId válido
     * Deve chamar o service e retornar o boletim
     */
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
