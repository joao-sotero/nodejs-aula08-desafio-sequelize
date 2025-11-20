const roundTwo = value => parseFloat(value.toFixed(2));

export const calculateRecuperacao = (mediaFinal) => {
  const needed = (50 - (mediaFinal * 6)) / 4;
  return roundTwo(Math.max(0, needed));
};

export const calculateFinalAverage = (grades = []) => {
  if (!Array.isArray(grades) || grades.length === 0) {
    return {
      mediaFinal: 0,
      status: 'Reprovado',
      notaRecuperacao: null
    };
  }

  const sum = grades.reduce((acc, grade) => acc + Number(grade.mediaUnidade || 0), 0);
  const average = grades.length ? sum / grades.length : 0;
  const roundedAverage = roundTwo(average);
  const status = roundedAverage >= 7 ? 'Aprovado' : 'Reprovado';

  return {
    mediaFinal: roundedAverage,
    status,
    notaRecuperacao: status === 'Reprovado'
      ? calculateRecuperacao(roundedAverage)
      : null
  };
};

export default {
  calculateFinalAverage,
  calculateRecuperacao
};
