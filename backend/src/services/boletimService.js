import models from '../models/index.js';
import { calculateFinalAverage } from './gradeService.js';

const { Student, Class, Grade, Subject } = models;

const buildStudentInfo = student => ({
  id: student.id,
  nome: student.nome,
  class: student.class ? {
    id: student.class.id,
    nome: student.class.nome
  } : null
});

const REQUIRED_UNITS = [1, 2, 3, 4];

const groupGradesBySubject = (grades = []) => {
  const map = new Map();

  grades.forEach(grade => {
    if (!grade || !grade.subjectId) {
      return;
    }

    const subjectId = grade.subjectId;
    const subjectName = grade.subject ? grade.subject.nome : 'Disciplina';

    if (!map.has(subjectId)) {
      map.set(subjectId, {
        subjectId,
        subjectName,
        grades: [],
        rawGrades: []
      });
    }

    const entry = map.get(subjectId);

    entry.grades.push({
      unidade: grade.unidade,
      teste: grade.teste,
      prova: grade.prova,
      media: grade.mediaUnidade
    });

    entry.rawGrades.push(grade);
  });

  return Array.from(map.values()).map(entry => ({
    ...entry,
    grades: entry.grades.sort((a, b) => a.unidade - b.unidade)
  }));
};

const analyzeDiscipline = discipline => {
  const unidadesPresentes = new Set(discipline.grades.map(grade => grade.unidade));
  const unidadesFaltantes = REQUIRED_UNITS.filter(unit => !unidadesPresentes.has(unit));

  if (unidadesFaltantes.length > 0) {
    return {
      subjectId: discipline.subjectId,
      subjectName: discipline.subjectName,
      grades: discipline.grades,
      mediaFinal: null,
      status: 'Incompleto',
      unidadesFaltantes,
      notaRecuperacao: null
    };
  }

  const calcResult = calculateFinalAverage(discipline.rawGrades);

  return {
    subjectId: discipline.subjectId,
    subjectName: discipline.subjectName,
    grades: discipline.grades,
    mediaFinal: calcResult.mediaFinal,
    status: calcResult.status,
    notaRecuperacao: calcResult.notaRecuperacao,
    unidadesFaltantes: []
  };
};

export const generateBoletim = async (studentId) => {
  if (studentId === undefined || studentId === null) {
    throw new Error('studentId é obrigatório');
  }

  const student = await Student.findByPk(studentId, {
    include: [
      {
        model: Class,
        as: 'class',
        attributes: ['id', 'nome']
      },
      {
        model: Grade,
        as: 'grades',
        include: [
          {
            model: Subject,
            as: 'subject',
            attributes: ['id', 'nome']
          }
        ]
      }
    ]
  });

  if (!student) {
    return null;
  }

  const groupedDisciplines = groupGradesBySubject(student.grades || []);

  if (groupedDisciplines.length === 0) {
    return {
      student: buildStudentInfo(student),
      disciplines: [],
      statusGeral: 'Sem notas',
      totalDisciplinas: 0,
      disciplinasAprovadas: 0,
      disciplinasRecuperacao: [],
      message: 'Aluno não possui notas cadastradas'
    };
  }

  let disciplinasAprovadas = 0;
  const disciplinasRecuperacao = [];
  let possuiIncompletas = false;

  const disciplines = groupedDisciplines.map(discipline => {
    const analysis = analyzeDiscipline(discipline);

    if (analysis.status === 'Aprovado') {
      disciplinasAprovadas += 1;
    } else if (analysis.status === 'Reprovado') {
      disciplinasRecuperacao.push(analysis.subjectName);
    } else if (analysis.status === 'Incompleto') {
      possuiIncompletas = true;
    }

    return analysis;
  });

  let statusGeral = 'Reprovado';

  if (possuiIncompletas) {
    statusGeral = 'Incompleto';
  } else if (disciplinasRecuperacao.length === 0) {
    statusGeral = 'Aprovado';
  }

  return {
    student: buildStudentInfo(student),
    disciplines,
    statusGeral,
    totalDisciplinas: disciplines.length,
    disciplinasAprovadas,
    disciplinasRecuperacao
  };
};

export default {
  generateBoletim
};
