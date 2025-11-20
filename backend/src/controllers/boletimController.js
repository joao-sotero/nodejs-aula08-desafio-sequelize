import { generateBoletim } from '../services/boletimService.js';

export const getBoletim = async (req, res, next) => {
  try {
    const { studentId } = req.params;

    if (!studentId || Number.isNaN(Number(studentId))) {
      return res.status(400).json({ error: 'studentId inválido' });
    }

    const boletim = await generateBoletim(Number(studentId));

    if (!boletim) {
      return res.status(404).json({ error: 'Aluno não encontrado' });
    }

    return res.status(200).json(boletim);
  } catch (error) {
    return next(error);
  }
};

export const getMyBoletim = async (req, res, next) => {
  try {
    const { studentId, role } = req.user;

    if (role !== 'student' || !studentId) {
      return res.status(403).json({ 
        error: 'Acesso negado. Apenas alunos podem acessar este recurso.' 
      });
    }

    const boletim = await generateBoletim(studentId);

    if (!boletim) {
      return res.status(404).json({ error: 'Dados do aluno não encontrados' });
    }

    return res.status(200).json(boletim);
  } catch (error) {
    return next(error);
  }
};

