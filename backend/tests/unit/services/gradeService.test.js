import { calculateFinalAverage, calculateRecuperacao } from '../../../src/services/gradeService.js';

describe('gradeService', () => {
  describe('calculateFinalAverage', () => {
    it('deve calcular média final e status quando aluno está aprovado', () => {
      const grades = [
        { unidade: 1, mediaUnidade: 7.5 },
        { unidade: 2, mediaUnidade: 8 },
        { unidade: 3, mediaUnidade: 7 },
        { unidade: 4, mediaUnidade: 7.5 }
      ];

      const result = calculateFinalAverage(grades);

      expect(result).toEqual({
        mediaFinal: 7.5,
        status: 'Aprovado',
        notaRecuperacao: null
      });
    });

    it('deve calcular média final e necessidade de recuperação quando aluno está reprovado', () => {
      const grades = [
        { unidade: 1, mediaUnidade: 5 },
        { unidade: 2, mediaUnidade: 6 },
        { unidade: 3, mediaUnidade: 5.5 },
        { unidade: 4, mediaUnidade: 6 }
      ];

      const result = calculateFinalAverage(grades);

      expect(result.mediaFinal).toBeCloseTo(5.63, 2);
      expect(result.status).toBe('Reprovado');
      expect(result.notaRecuperacao).toBeCloseTo(4.05, 2);
    });

    it('deve retornar média 0 e status reprovado quando não há notas', () => {
      expect(calculateFinalAverage([])).toEqual({
        mediaFinal: 0,
        status: 'Reprovado',
        notaRecuperacao: null
      });
    });

    it('deve lidar com valores null ou undefined', () => {
      expect(calculateFinalAverage(null)).toEqual({
        mediaFinal: 0,
        status: 'Reprovado',
        notaRecuperacao: null
      });

      expect(calculateFinalAverage(undefined)).toEqual({
        mediaFinal: 0,
        status: 'Reprovado',
        notaRecuperacao: null
      });
    });
  });

  describe('calculateRecuperacao', () => {
    it('deve calcular nota necessária para aprovação', () => {
      expect(calculateRecuperacao(5)).toBe(5);
      expect(calculateRecuperacao(6)).toBe(3.5);
      expect(calculateRecuperacao(4.75)).toBeCloseTo(5.38, 2);
    });

    it('deve retornar zero quando aluno já tem média suficiente', () => {
      expect(calculateRecuperacao(8)).toBeCloseTo(0.5, 2);
      expect(calculateRecuperacao(10)).toBe(0);
    });
  });
});
