import jwt from 'jsonwebtoken';
import models from '../models/index.js';
import jwtConfig from '../config/jwt.js';

const { User } = models;

export const register = async (req, res, next) => {
  try {
    const { nome, email, password, role = 'admin', studentId } = req.body;

    if (!nome || !email || !password) {
      return res.status(400).json({
        error: 'Todos os campos são obrigatórios (nome, email, password)'
      });
    }

    if (role === 'student' && !studentId) {
      return res.status(400).json({
        error: 'studentId é obrigatório para usuários do tipo student'
      });
    }

    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res.status(400).json({
        error: 'Email já cadastrado'
      });
    }

    const user = await User.create({ nome, email, password, role, studentId });

    return res.status(201).json({
      message: 'Usuário criado com sucesso',
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    return next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email e senha são obrigatórios'
      });
    }

    const user = await User.scope('withPassword').findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const isPasswordValid = await user.validatePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, studentId: user.studentId },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        role: user.role,
        studentId: user.studentId
      }
    });
  } catch (error) {
    return next(error);
  }
};
