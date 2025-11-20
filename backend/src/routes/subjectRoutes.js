import { Router } from 'express';
import {
  create,
  getAll,
  getById,
  update,
  remove
} from '../controllers/subjectController.js';
import { authenticateToken } from '../middlewares/auth.js';
import { authorize } from '../middlewares/authorize.js';

const router = Router();

router.use(authenticateToken);
router.use(authorize('admin')); // Apenas admin pode gerenciar disciplinas

router.post('/', create);
router.get('/', getAll);
router.get('/:id', getById);
router.put('/:id', update);
router.delete('/:id', remove);

export default router;
