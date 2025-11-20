import { jest } from '@jest/globals';

const Student = {
  findByPk: jest.fn()
};

const Class = {};
const Grade = {};
const Subject = {};

await jest.unstable_mockModule('../../../src/models/index.js', () => ({
  __esModule: true,
  default: {
    Student,
    Class,
    Grade,
    Subject
  }
}));

const { generateBoletim } = await import('../../../src/services/boletimService.js');

describe('boletimService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateBoletim', () => {
    it('deve lançar erro quando studentId não é fornecido', async () => {
      await expect(generateBoletim(null)).rejects.toThrow('studentId é obrigatório');
      await expect(generateBoletim(undefined)).rejects.toThrow('studentId é obrigatório');
    });

    it('deve retornar null quando aluno não existe', async () => {
      Student.findByPk.mockResolvedValue(null);

      const result = await generateBoletim(999);

      expect(result).toBeNull();
      expect(Student.findByPk).toHaveBeenCalledWith(999, expect.any(Object));
    });

    it('deve retornar boletim com status "Sem notas" quando aluno não tem notas', async () => {
      const mockStudent = {
        id: 1,
        nome: 'João Silva',
        class: {
          id: 1,
          nome: '1º Ano A'
        },
        grades: []
      };

      Student.findByPk.mockResolvedValue(mockStudent);

      const result = await generateBoletim(1);

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

    it('deve calcular boletim com aluno aprovado em todas as disciplinas', async () => {
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

      const result = await generateBoletim(1);

      expect(result.statusGeral).toBe('Aprovado');
      expect(result.totalDisciplinas).toBe(1);
      expect(result.disciplinasAprovadas).toBe(1);
      expect(result.disciplinasRecuperacao).toHaveLength(0);
      expect(result.disciplines[0].status).toBe('Aprovado');
      expect(result.disciplines[0].mediaFinal).toBe(8);
    });

    it('deve calcular boletim com status "Incompleto" quando faltam unidades', async () => {
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

      const result = await generateBoletim(1);

      expect(result.statusGeral).toBe('Incompleto');
      expect(result.disciplines[0].status).toBe('Incompleto');
      expect(result.disciplines[0].unidadesFaltantes).toEqual([3, 4]);
      expect(result.disciplines[0].mediaFinal).toBeNull();
    });

    it('deve identificar disciplinas em recuperação', async () => {
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

      const result = await generateBoletim(1);

      expect(result.statusGeral).toBe('Reprovado');
      expect(result.disciplines[0].status).toBe('Reprovado');
      expect(result.disciplinasRecuperacao).toContain('Matemática');
    });

    it('deve agrupar notas por disciplina corretamente', async () => {
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
          { unidade: 1, subjectId: 2, subject: { nome: 'Português' }, teste: 9, prova: 9, mediaUnidade: 9 },
          { unidade: 2, subjectId: 2, subject: { nome: 'Português' }, teste: 8, prova: 8, mediaUnidade: 8 }
        ]
      };

      Student.findByPk.mockResolvedValue(mockStudent);

      const result = await generateBoletim(1);

      expect(result.totalDisciplinas).toBe(2);
      expect(result.disciplines).toHaveLength(2);
      
      const matematica = result.disciplines.find(d => d.subjectName === 'Matemática');
      const portugues = result.disciplines.find(d => d.subjectName === 'Português');
      
      expect(matematica.grades).toHaveLength(2);
      expect(portugues.grades).toHaveLength(2);
    });
  });
});
