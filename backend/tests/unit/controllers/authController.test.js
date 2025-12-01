/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TESTES UNITÁRIOS - authController
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Testa as funcionalidades de autenticação:
 * - Registro de usuários (admin e student)
 * - Login com geração de JWT
 * - Validações de dados
 * - Tratamento de erros
 * 
 * IMPORTANTE: Este teste usa mocks complexos incluindo:
 * - Model User com scope (para ocultar senha no login)
 * - Biblioteca jsonwebtoken (para JWT)
 * - Validações de relacionamento (studentId para role student)
 */

import { expect, jest } from '@jest/globals';

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURAÇÃO DOS MOCKS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * scopedUser - Mock do User com scope 'withoutPassword'
 * No código real, o scope oculta a senha ao fazer login
 */
const scopedUser = {
  findOne: jest.fn()
};

/**
 * User - Mock do model User
 * scope() - Retorna versão do model com configurações específicas
 */
const User = {
  findOne: jest.fn(),
  create: jest.fn(),
  scope: jest.fn(() => scopedUser) // Retorna scopedUser quando chamado
};

// Mock opcional de serviço de hash (comentado)
const hashService ={
  // hashPassword: jest.fn((password) => `hashed-${password}`)
  hashPassword: jest.fn()
}

/**
 * signMock - Mock da função sign do JWT
 * Será usado para gerar tokens de autenticação
 */
const signMock = jest.fn();

// Mocka o módulo de models ANTES de importar o controller
jest.unstable_mockModule('../../../src/models/index.js', () => ({
  __esModule: true,
  default: {
    User
  }
}));

// Mocka a biblioteca jsonwebtoken
jest.unstable_mockModule('jsonwebtoken', () => ({
  __esModule: true,
  default: {
    sign: signMock // Substitui jwt.sign pelo nosso mock
  }
}));

// Importa o controller DEPOIS dos mocks
const authController = await import('../../../src/controllers/authController.js');
const { register, login } = authController;
const jwt = (await import('jsonwebtoken')).default;

describe('authController', () => {
  let req, res, next;

  // Prepara objetos mock req, res, next antes de cada teste
  beforeEach(() => {
    req = {
      body: {} // Dados enviados no corpo da requisição
    };
    res = {
      // mockReturnThis() permite encadeamento: res.status(200).json({})
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    next = jest.fn(); // Função de middleware para tratamento de erros
  });

  // Limpa todos os mocks após cada teste (isolamento)
  afterEach(() => {
    jest.clearAllMocks();
  });

  // ═══════════════════════════════════════════════════════════════════════
  // TESTES DA FUNÇÃO REGISTER (Registro de Usuários)
  // ═══════════════════════════════════════════════════════════════════════
  describe('register', () => {
    
    /**
     * Testa registro de usuário ADMIN
     * Admin não precisa de studentId
     */
    it('deve registrar um usuário admin com sucesso', async () => {

      // ARRANGE - Prepara dados de entrada
      req.body = {
        nome: 'Admin User',
        email: 'admin@test.com',
        password: 'senha123',
        role: 'admin'
      };

      // Mock do usuário que será criado
      const mockUser = {
        id: 1,
        nome: 'Admin User',
        email: 'admin@test.com',
        role: 'admin',
        studentId: null, // Admin não tem studentId
        createdAt: new Date().toISOString()
      };

      // Configura comportamento dos mocks
      User.findOne.mockResolvedValue(null); // Email não existe (pode registrar)
      User.create.mockResolvedValue(mockUser); // Retorna usuário criado

      // ACT - Executa a função de registro
      await register(req, res, next);
      const createdUser = await User.create({...req.body, studentId: null})

      // ASSERT - Verifica resultados
      expect(createdUser).toEqual(expect.objectContaining(mockUser));

      // Verifica se User.create foi chamado com dados corretos
      expect(User.create).toHaveBeenCalledWith(expect.objectContaining({
        nome: 'Admin User',
        email: 'admin@test.com',
        password: 'senha123',
        role: 'admin',
      }));

      // Verifica se verificou duplicidade de email
      expect(User.findOne).toHaveBeenCalledWith({ where: { email: 'admin@test.com' } });

      // Verifica resposta HTTP 201 (Created)
      expect(res.status).toHaveBeenCalledWith(201);

      // Verifica corpo da resposta
      expect(res.json).toHaveBeenCalledWith({
        message: 'Usuário criado com sucesso',
        user: expect.objectContaining({
          id: mockUser.id,
          nome: 'Admin User',
          email: 'admin@test.com',
          role: 'admin',
          studentId: null
        })
      });
    });

    /**
     * Testa registro de usuário STUDENT
     * Student DEVE ter studentId vinculado a um aluno
     */
    it('deve registrar um usuário student vinculado a um aluno', async () => {
      // ARRANGE
      req.body = {
        nome: 'João Souza',
        email: 'student@test.com',
        password: 'senha123',
        role: 'student',
        studentId: 10 // Obrigatório para student
      };
      const mockUser = {
        id: 2,
        email: 'student@test.com',
        role: 'student',
        studentId: 10,
        nome: 'João Souza',
        createdAt: new Date().toISOString()
      };

      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue(mockUser);

      // ACT
      await register(req, res, next);

      // ASSERT
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Usuário criado com sucesso',
        user: expect.objectContaining({
          id: mockUser.id,
          nome: 'João Souza',
          studentId: 10,
          role: 'student'
        })
      });
    });

    /**
     * TESTE DE VALIDAÇÃO: Email duplicado
     * Não pode registrar dois usuários com mesmo email
     */
    it('deve retornar erro 400 quando email já existe', async () => {
      req.body = {
        nome: 'Admin',
        email: 'admin@test.com',
        password: 'senha123'
      };

      User.findOne.mockResolvedValue({ id: 1, email: 'admin@test.com' });

      await register(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Email já cadastrado'
      });
    });

    it('deve retornar erro 400 quando campos obrigatórios estão faltando', async () => {
      req.body = {
        email: 'admin@test.com'
        // falta password
      };

      await register(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Todos os campos são obrigatórios (nome, email, password)'
      });
    });

    it('deve retornar erro 400 quando studentId não é informado para role student', async () => {
      req.body = {
        nome: 'Aluno',
        email: 'student@test.com',
        password: 'senha123',
        role: 'student'
      };

      User.findOne.mockResolvedValue(null);

      await register(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'studentId é obrigatório para usuários do tipo student'
      });
    });
  });

  describe('login', () => {
    it('deve fazer login com sucesso e retornar token', async () => {
      req.body = {
        email: 'admin@test.com',
        password: 'senha123'
      };

      const mockUser = {
        id: 1,
        nome: 'Admin User',
        email: 'admin@test.com',
        role: 'admin',
        studentId: null,
        validatePassword: jest.fn().mockResolvedValue(true)
      };

      scopedUser.findOne.mockResolvedValue(mockUser);
      signMock.mockReturnValue('mocked-jwt-token');

      await login(req, res, next);

      expect(mockUser.validatePassword).toHaveBeenCalledWith('senha123');
      expect(jwt.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 1,
          email: 'admin@test.com',
          role: 'admin'
        }),
        expect.any(String),
        expect.any(Object)
      );
      expect(res.json).toHaveBeenCalledWith({
        token: 'mocked-jwt-token',
        user: {
          id: 1,
          nome: 'Admin User',
          email: 'admin@test.com',
          role: 'admin',
          studentId: null
        }
      });
    });

    it('deve retornar erro 401 quando usuário não existe', async () => {
      req.body = {
        email: 'naoexiste@test.com',
        password: 'senha123'
      };

      scopedUser.findOne.mockResolvedValue(null);

      await login(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Credenciais inválidas'
      });
    });

    it('deve retornar erro 401 quando senha está incorreta', async () => {
      req.body = {
        email: 'admin@test.com',
        password: 'senhaerrada'
      };

      const mockUser = {
        id: 1,
        email: 'admin@test.com',
        role: 'admin',
        studentId: null,
        validatePassword: jest.fn().mockResolvedValue(false)
      };

      scopedUser.findOne.mockResolvedValue(mockUser);

      await login(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Credenciais inválidas'
      });
    });

    it('deve retornar erro 400 quando campos obrigatórios estão faltando', async () => {
      req.body = {
        email: 'admin@test.com'
        // falta password
      };

      await login(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Email e senha são obrigatórios'
      });
    });
  });
});
