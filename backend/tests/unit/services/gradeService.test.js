/**
 * TESTES UNITÁRIOS DO SERVIÇO DE NOTAS (gradeService)
 * 
 * Testa as funções puras de cálculo de média e recuperação.
 * São testes simples que não precisam de mocks pois não têm dependências externas.
 */

import { calculateFinalAverage, calculateRecuperacao } from '../../../src/services/gradeService.js';

// describe - Agrupa testes relacionados em uma suíte
describe('gradeService', () => {
  
  // Testa a função de cálculo de média final
  describe('calculateFinalAverage', () => {
    
    /**
     * it ou test - Define um caso de teste individual
     * Deve ter um nome descritivo que explique o comportamento esperado
     */
    it('deve calcular média final e status quando aluno está aprovado', () => {
      // ARRANGE (Preparar) - Configura os dados de entrada do teste
      const grades = [
        { unidade: 1, mediaUnidade: 7.5 },
        { unidade: 2, mediaUnidade: 8 },
        { unidade: 3, mediaUnidade: 7 },
        { unidade: 4, mediaUnidade: 7.5 }
      ];

      // ACT (Agir) - Executa a função que está sendo testada
      const result = calculateFinalAverage(grades);

      // ASSERT (Verificar) - Verifica se o resultado é o esperado
      // expect().toEqual() - Compara objetos/arrays por valor
      expect(result).toEqual({
        mediaFinal: 7.5,
        status: 'Aprovado',
        notaRecuperacao: null
      });
    });

    it('deve calcular média final e necessidade de recuperação quando aluno está reprovado', () => {
      // ARRANGE - Dados de entrada (notas baixas)
      const grades = [
        { unidade: 1, mediaUnidade: 5 },
        { unidade: 2, mediaUnidade: 6 },
        { unidade: 3, mediaUnidade: 5.5 },
        { unidade: 4, mediaUnidade: 6 }
      ];

      // ACT - Executa o cálculo
      const result = calculateFinalAverage(grades);

      // ASSERT - Verifica os resultados
      // toBeCloseTo() - Usado para números com casas decimais (evita problemas de precisão)
      // Segundo parâmetro: quantidade de casas decimais a considerar
      expect(result.mediaFinal).toBeCloseTo(5.63, 2);
      expect(result.status).toBe('Reprovado'); // toBe() - Comparação estrita (===)
      expect(result.notaRecuperacao).toBeCloseTo(4.05, 2);
    });

    it('deve retornar média 0 e status reprovado quando não há notas', () => {
      // ARRANGE - Array vazio
      // ACT & ASSERT em uma linha (função simples)
      expect(calculateFinalAverage([])).toEqual({
        mediaFinal: 0,
        status: 'Reprovado',
        notaRecuperacao: null
      });
    });

    it('deve lidar com valores null ou undefined', () => {
      // Testa casos extremos (edge cases)
      // A função deve ser robusta e não quebrar com entradas inválidas
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

  // Testa a função de cálculo de nota de recuperação
  describe('calculateRecuperacao', () => {
    
    it('deve calcular nota necessária para aprovação', () => {
      // Testa vários cenários diferentes com expectativas específicas
      expect(calculateRecuperacao(5)).toBe(5);
      expect(calculateRecuperacao(6)).toBe(3.5);
      expect(calculateRecuperacao(4.75)).toBeCloseTo(5.38, 2);
    });

    it('deve retornar zero quando aluno já tem média suficiente', () => {
      // Verifica o comportamento quando não precisa de recuperação
      expect(calculateRecuperacao(8)).toBeCloseTo(0.5, 2);
      expect(calculateRecuperacao(10)).toBe(0);
    });
  });
});
