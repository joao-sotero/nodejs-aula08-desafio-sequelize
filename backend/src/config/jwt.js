import 'dotenv/config';

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-now';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

export default {
  secret: JWT_SECRET,
  expiresIn: JWT_EXPIRES_IN
};

export { JWT_SECRET, JWT_EXPIRES_IN };
