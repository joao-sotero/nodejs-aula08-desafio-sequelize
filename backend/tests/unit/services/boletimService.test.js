/**
 * TESTES UNITÁRIOS DO SERVIÇO DE BOLETIM (boletimService)
 * 
 * Este arquivo testa a geração de boletins com lógica complexa de cálculo de notas.
 * Usa MOCKS para isolar o service das dependências do banco de dados.
 */

import { jest } from '@jest/globals';

/**
 * CRIANDO MOCKS DOS MODELS
 * Mock = objeto falso que simula o comportamento de um objeto real
 * jest.fn() = cria uma função mock que pode ser controlada e espionada
 */
const Student = {
  findByPk: jest.fn() // Mock da função que busca aluno por ID
};

// Mocks vazios - não usados diretamente mas necessários para a importação
const Class = {};
const Grade = {};
const Subject = {};

/**
 * jest.unstable_mockModule - Mocka um módulo ANTES de importá-lo
 * IMPORTANTE para ESM: deve ser chamado ANTES do import real
 * Substitui o módulo real pelo mock para todos os imports subsequentes
 */
await jest.unstable_mockModule('../../../src/models/index.js', () => ({
  __esModule: true, // Indica que é um módulo ES6
  default: {
    Student, // Injeta o mock do Student
    Class,
    Grade,
    Subject
  }
}));

// Importa o service DEPOIS de mockar as dependências
const { generateBoletim } = await import('../../../src/services/boletimService.js');

describe('boletimService', () => {
  
  /**
   * afterEach - Hook executado DEPOIS de cada teste
   * Limpa todos os mocks para garantir isolamento entre testes
   */
  afterEach(() => {
    jest.clearAllMocks(); // Reseta contadores de chamadas e valores mockados
  });

  describe('generateBoletim', () => {
    
    /**
     * Testa validação de entrada
     * expect().rejects.toThrow() - Verifica se uma promise foi rejeitada com erro
     */
    it('deve lançar erro quando studentId não é fornecido', async () => {
      // Testa com null e undefined
      await expect(generateBoletim(null)).rejects.toThrow('studentId é obrigatório');
      await expect(generateBoletim(undefined)).rejects.toThrow('studentId é obrigatório');
    });

    /**
     * Testa comportamento quando aluno não existe
     * mockResolvedValue() - Configura o retorno de uma promise resolvida
     */
    it('deve retornar null quando aluno não existe', async () => {
      // ARRANGE - Configura o mock para retornar null
      Student.findByPk.mockResolvedValue(null);

      // ACT - Chama a função com ID inexistente
      const result = await generateBoletim(999);

      // ASSERT - Verifica os resultados
      expect(result).toBeNull();
      // toHaveBeenCalledWith() - Verifica se o mock foi chamado com argumentos específicos
      // expect.any(Object) - Aceita qualquer objeto como segundo parâmetro
      expect(Student.findByPk).toHaveBeenCalledWith(999, expect.any(Object));
    });

    /**
     * Testa boletim de aluno sem notas
     */
    it('deve retornar boletim com status "Sem notas" quando aluno não tem notas', async () => {
      // ARRANGE - Mock de aluno sem grades (notas)
      const mockStudent = {
        id: 1,
        nome: 'João Silva',
        class: {
          id: 1,
          nome: '1º Ano A'
        },
        grades: [] // Array vazio = sem notas
      };

      Student.findByPk.mockResolvedValue(mockStudent);

      // ACT
      const result = await generateBoletim(1);

      // ASSERT - Verifica estrutura completa do boletim
      expect(result).toEqual({
        student: {
          id: 1,
          nome: 'João Silva',
          class: {
            id: 1,
            nome: '1º Ano A'
          }
        },
        disciplines: [],
        statusGeral: 'Sem notas',
        totalDisciplinas: 0,
        disciplinasAprovadas: 0,
        disciplinasRecuperacao: [],
        message: 'Aluno não possui notas cadastradas'
      });
    });

    /**
     * Testa cálculo completo de média com 4 unidades
     * Verifica se o aluno é aprovado corretamente
     */
    it('deve calcular boletim com aluno aprovado em todas as disciplinas', async () => {
      // ARRANGE - Mock com 4 notas (completo) de Matemática
      const mockStudent = {
        id: 1,
        nome: 'João Silva',
        class: {
          id: 1,
          nome: '1º Ano A'
        },
        grades: [
          { unidade: 1, subjectId: 1, subject: { nome: 'Matemática' }, teste: 8, prova: 8, mediaUnidade: 8 },
          { unidade: 2, subjectId: 1, subject: { nome: 'Matemática' }, teste: 7, prova: 7, mediaUnidade: 7 },
          { unidade: 3, subjectId: 1, subject: { nome: 'Matemática' }, teste: 9, prova: 9, mediaUnidade: 9 },
          { unidade: 4, subjectId: 1, subject: { nome: 'Matemática' }, teste: 8, prova: 8, mediaUnidade: 8 }
        ]
      };

      Student.findByPk.mockResolvedValue(mockStudent);

      // ACT
      const result = await generateBoletim(1);

      // ASSERT - Verifica os cálculos
      expect(result.statusGeral).toBe('Aprovado');
      expect(result.totalDisciplinas).toBe(1);
      expect(result.disciplinasAprovadas).toBe(1);
      expect(result.disciplinasRecuperacao).toHaveLength(0); // Array vazio
      expect(result.disciplines[0].status).toBe('Aprovado');
      expect(result.disciplines[0].mediaFinal).toBe(8); // Média das 4 unidades
    });

    /**
     * Testa boletim incompleto (faltam unidades)
     */
    it('deve calcular boletim com status "Incompleto" quando faltam unidades', async () => {
      // ARRANGE - Apenas 2 unidades (faltam 3 e 4)
      const mockStudent = {
        id: 1,
        nome: 'João Silva',
        class: {
          id: 1,
          nome: '1º Ano A'
        },
        grades: [
          { unidade: 1, subjectId: 1, subject: { nome: 'Matemática' }, teste: 8, prova: 8, mediaUnidade: 8 },
          { unidade: 2, subjectId: 1, subject: { nome: 'Matemática' }, teste: 7, prova: 7, mediaUnidade: 7 }
        ]
      };

      Student.findByPk.mockResolvedValue(mockStudent);

      // ACT
      const result = await generateBoletim(1);

      // ASSERT
      expect(result.statusGeral).toBe('Incompleto');
      expect(result.disciplines[0].status).toBe('Incompleto');
      expect(result.disciplines[0].unidadesFaltantes).toEqual([3, 4]); // Indica quais faltam
      expect(result.disciplines[0].mediaFinal).toBeNull(); // Sem média final quando incompleto
    });

    /**
     * Testa identificação de disciplinas em recuperação
     */
    it('deve identificar disciplinas em recuperação', async () => {
      // ARRANGE - Notas baixas (média 5 - reprovado)
      const mockStudent = {
        id: 1,
        nome: 'João Silva',
        class: {
          id: 1,
          nome: '1º Ano A'
        },
        grades: [
          { unidade: 1, subjectId: 1, subject: { nome: 'Matemática' }, teste: 5, prova: 5, mediaUnidade: 5 },
          { unidade: 2, subjectId: 1, subject: { nome: 'Matemática' }, teste: 5, prova: 5, mediaUnidade: 5 },
          { unidade: 3, subjectId: 1, subject: { nome: 'Matemática' }, teste: 5, prova: 5, mediaUnidade: 5 },
          { unidade: 4, subjectId: 1, subject: { nome: 'Matemática' }, teste: 5, prova: 5, mediaUnidade: 5 }
        ]
      };

      Student.findByPk.mockResolvedValue(mockStudent);

      // ACT
      const result = await generateBoletim(1);

      // ASSERT
      expect(result.statusGeral).toBe('Reprovado');
      expect(result.disciplines[0].status).toBe('Reprovado');
      expect(result.disciplinasRecuperacao).toContain('Matemática'); // Nome da disciplina em recuperação
    });

    /**
     * Testa agrupamento de notas por disciplina
     * Importante para boletim com múltiplas disciplinas
     */
    it('deve agrupar notas por disciplina corretamente', async () => {
      // ARRANGE - Duas disciplinas diferentes
      const mockStudent = {
        id: 1,
        nome: 'João Silva',
        class: {
          id: 1,
          nome: '1º Ano A'
        },
        grades: [
          // Matemática
          { unidade: 1, subjectId: 1, subject: { nome: 'Matemática' }, teste: 8, prova: 8, mediaUnidade: 8 },
          { unidade: 2, subjectId: 1, subject: { nome: 'Matemática' }, teste: 7, prova: 7, mediaUnidade: 7 },
          // Português
          { unidade: 1, subjectId: 2, subject: { nome: 'Português' }, teste: 9, prova: 9, mediaUnidade: 9 },
          { unidade: 2, subjectId: 2, subject: { nome: 'Português' }, teste: 8, prova: 8, mediaUnidade: 8 }
        ]
      };

      Student.findByPk.mockResolvedValue(mockStudent);

      // ACT
      const result = await generateBoletim(1);

      // ASSERT - Verifica agrupamento
      expect(result.totalDisciplinas).toBe(2);
      expect(result.disciplines).toHaveLength(2);
      
      // Busca cada disciplina no resultado
      const matematica = result.disciplines.find(d => d.subjectName === 'Matemática');
      const portugues = result.disciplines.find(d => d.subjectName === 'Português');
      
      // Verifica se cada disciplina tem suas próprias notas
      expect(matematica.grades).toHaveLength(2);
      expect(portugues.grades).toHaveLength(2);
    });
  });
});
