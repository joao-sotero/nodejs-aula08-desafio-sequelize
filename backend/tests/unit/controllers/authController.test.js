import { jest } from '@jest/globals';

const scopedUser = {
  findOne: jest.fn()
};

const User = {
  findOne: jest.fn(),
  create: jest.fn(),
  scope: jest.fn(() => scopedUser)
};

const Student = {
  findByPk: jest.fn()
};

const signMock = jest.fn();

await jest.unstable_mockModule('../../../src/models/index.js', () => ({
  __esModule: true,
  default: {
    User,
    Student
  }
}));

await jest.unstable_mockModule('jsonwebtoken', () => ({
  __esModule: true,
  default: {
    sign: signMock
  }
}));

const authController = await import('../../../src/controllers/authController.js');
const { register, login } = authController;
const jwt = (await import('jsonwebtoken')).default;

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
        nome: 'Admin User',
        email: 'admin@test.com',
        password: 'senha123',
        role: 'admin'
      };

      const mockUser = {
        id: 1,
        nome: 'Admin User',
        email: 'admin@test.com',
        role: 'admin',
        studentId: null,
        createdAt: new Date().toISOString()
      };

      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue(mockUser);

      await register(req, res, next);

      expect(User.create).toHaveBeenCalledWith(expect.objectContaining({
        nome: 'Admin User',
        email: 'admin@test.com',
        password: 'senha123',
        role: 'admin'
      }));
      expect(res.status).toHaveBeenCalledWith(201);
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

    it('deve registrar um usuário student vinculado a um aluno', async () => {
      req.body = {
        nome: 'João Souza',
        email: 'student@test.com',
        password: 'senha123',
        role: 'student',
        studentId: 10
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

      await register(req, res, next);

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
