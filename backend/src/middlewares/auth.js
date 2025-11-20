import jwt from 'jsonwebtoken';
import jwtConfig from '../config/jwt.js';

export const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    jwt.verify(token, jwtConfig.secret, (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: 'Token inválido ou expirado' });
      }

      req.user = decoded;
      return next();
    });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao validar token' });
  }
};
