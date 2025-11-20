import { Router } from 'express';
import {
  create,
  getAll,
  getById,
  update,
  remove,
  addSubjects,
  removeSubjects
} from '../controllers/classController.js';
import { authenticateToken } from '../middlewares/auth.js';
import { authorize } from '../middlewares/authorize.js';

const router = Router();

router.use(authenticateToken);
router.use(authorize('admin')); // Apenas admin pode gerenciar turmas

router.post('/', create);
router.get('/', getAll);
router.get('/:id', getById);
router.put('/:id', update);
router.delete('/:id', remove);
router.post('/:id/subjects', addSubjects);
router.delete('/:id/subjects', removeSubjects);

export default router;
