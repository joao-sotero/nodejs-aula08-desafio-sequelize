import { Router } from 'express';
import authRoutes from './authRoutes.js';
import classRoutes from './classRoutes.js';
import subjectRoutes from './subjectRoutes.js';
import studentRoutes from './studentRoutes.js';
import gradeRoutes from './gradeRoutes.js';
import boletimRoutes from './boletimRoutes.js';

const router = Router();

// Rota básica da API para indicar disponibilidade
router.get('/', (req, res) => {
  res.json({
    message: 'API Escola - consulte /api/health para verificar o status',
    version: '1.0.0'
  });
});

router.use('/auth', authRoutes);
router.use('/classes', classRoutes);
router.use('/subjects', subjectRoutes);
router.use('/students', studentRoutes);
router.use('/grades', gradeRoutes);
router.use('/boletim', boletimRoutes);

export default router;
