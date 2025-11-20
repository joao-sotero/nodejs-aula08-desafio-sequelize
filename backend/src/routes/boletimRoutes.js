import { Router } from 'express';
import { getBoletim, getMyBoletim } from '../controllers/boletimController.js';
import { authenticateToken } from '../middlewares/auth.js';
import { authorize } from '../middlewares/authorize.js';

const router = Router();

router.use(authenticateToken);

// Rota para aluno ver próprio boletim
router.get('/me', authorize('student'), getMyBoletim);

// Rota para admin/professor ver boletim de qualquer aluno
router.get('/:studentId', authorize('admin'), getBoletim);

export default router;
