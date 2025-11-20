import { jest } from '@jest/globals';
import { register, login } from '../../../src/controllers/authController.js';
import models from '../../../src/models/index.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

jest.mock('../../../src/models/index.js');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

const { User, Student } = models;

describe('authController', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {}
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

  describe('register', () => {
    it('deve registrar um usuário admin com sucesso', async () => {
      req.body = {
        email: 'admin@test.com',
        password: 'senha123',
        role: 'admin'
      };

      const mockUser = {
        id: 1,
        email: 'admin@test.com',
        role: 'admin',
        studentId: null
      };

      User.findOne.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('hashedPassword');
      User.create.mockResolvedValue(mockUser);

      await register(req, res, next);

      expect(User.create).toHaveBeenCalledWith({
        email: 'admin@test.com',
        password: 'hashedPassword',
        role: 'admin',
        studentId: null
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Usuário criado com sucesso',
        user: expect.objectContaining({
          email: 'admin@test.com',
          role: 'admin'
        })
      });
    });

    it('deve registrar um usuário student vinculado a um aluno', async () => {
      req.body = {
        email: 'student@test.com',
        password: 'senha123',
        role: 'student',
        studentId: 10
      };

      const mockStudent = { id: 10, nome: 'João Silva' };
      const mockUser = {
        id: 2,
        email: 'student@test.com',
        role: 'student',
        studentId: 10,
        student: mockStudent
      };

      User.findOne.mockResolvedValue(null);
      Student.findByPk.mockResolvedValue(mockStudent);
      bcrypt.hash.mockResolvedValue('hashedPassword');
      User.create.mockResolvedValue(mockUser);

      await register(req, res, next);

      expect(Student.findByPk).toHaveBeenCalledWith(10);
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('deve retornar erro 400 quando email já existe', async () => {
      req.body = {
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
        error: 'Email e senha são obrigatórios'
      });
    });

    it('deve retornar erro 404 quando studentId não existe', async () => {
      req.body = {
        email: 'student@test.com',
        password: 'senha123',
        role: 'student',
        studentId: 999
      };

      User.findOne.mockResolvedValue(null);
      Student.findByPk.mockResolvedValue(null);

      await register(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Aluno não encontrado'
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
        email: 'admin@test.com',
        password: 'hashedPassword',
        role: 'admin',
        studentId: null
      };

      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('mocked-jwt-token');

      await login(req, res, next);

      expect(bcrypt.compare).toHaveBeenCalledWith('senha123', 'hashedPassword');
      expect(jwt.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 1,
          email: 'admin@test.com',
          role: 'admin'
        }),
        expect.any(String),
        expect.any(Object)
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Login realizado com sucesso',
        token: 'mocked-jwt-token',
        user: expect.objectContaining({
          email: 'admin@test.com',
          role: 'admin'
        })
      });
    });

    it('deve retornar erro 401 quando usuário não existe', async () => {
      req.body = {
        email: 'naoexiste@test.com',
        password: 'senha123'
      };

      User.findOne.mockResolvedValue(null);

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
        password: 'hashedPassword',
        role: 'admin'
      };

      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);

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
