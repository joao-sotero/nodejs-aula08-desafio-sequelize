/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ARQUIVO DE EXEMPLO - TESTE UNITÁRIO COMPLETO E COMENTADO
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Este arquivo serve como REFERÊNCIA EDUCACIONAL para entender como criar
 * testes unitários com Jest usando ESM (ECMAScript Modules).
 * 
 * ESTRUTURA DO TESTE:
 * 1. Configuração de Mocks (dependências falsas)
 * 2. Importação do código a ser testado
 * 3. Suite de testes com describe()
 * 4. Hooks de preparação/limpeza (beforeEach, afterEach)
 * 5. Casos de teste individuais com it()
 * 
 * PADRÃO AAA em cada teste:
 * - ARRANGE (Preparar): Configurar dados e mocks
 * - ACT (Agir): Executar a função testada
 * - ASSERT (Verificar): Validar os resultados
 */

// ═══════════════════════════════════════════════════════════════════════════
// 1. IMPORTAÇÕES DO JEST
// ═══════════════════════════════════════════════════════════════════════════

import { jest } from '@jest/globals';
// Importa funções do Jest para criar mocks e fazer asserções

// ═══════════════════════════════════════════════════════════════════════════
// 2. CRIAÇÃO DOS MOCKS (Objetos Falsos)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * MOCK DO MODEL User
 * 
 * Por que mockar?
 * - Isola o teste do banco de dados real
 * - Torna os testes mais rápidos
 * - Permite controlar o retorno das funções
 * - Evita efeitos colaterais (não modifica dados reais)
 */
const User = {
  // jest.fn() cria uma função mock que pode ser controlada e espionada
  findByPk: jest.fn(),  // Busca por chave primária
  findOne: jest.fn(),   // Busca com filtros
  findAll: jest.fn(),   // Busca todos
  create: jest.fn(),    // Cria novo registro
  update: jest.fn(),    // Atualiza registro
};

/**
 * MOCK DO MODEL Class (Turma)
 * Necessário para validações de relacionamento
 */
const Class = {
  findByPk: jest.fn(),
};

// ═══════════════════════════════════════════════════════════════════════════
// 3. MOCKANDO MÓDULOS (ANTES DE IMPORTAR)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * jest.unstable_mockModule() - Mocka um módulo COMPLETO
 * 
 * IMPORTANTE para ESM:
 * - Deve ser chamado ANTES do import() do módulo
 * - Usa await porque é assíncrono
 * - Substitui todas as exportações do módulo
 * 
 * Por que "unstable"?
 * - O suporte a ESM no Jest ainda está em desenvolvimento
 * - A API pode mudar em versões futuras
 * - Funciona perfeitamente, apenas não é API final
 */
await jest.unstable_mockModule('../../../src/models/index.js', () => ({
  __esModule: true,  // OBRIGATÓRIO: indica que é um módulo ES6
  default: {
    User,   // Injeta nosso mock do User
    Class,  // Injeta nosso mock do Class
  }
}));

// ═══════════════════════════════════════════════════════════════════════════
// 4. IMPORTAÇÃO DO CÓDIGO A SER TESTADO
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Importa o controller DEPOIS de mockar as dependências
 * Assim, quando o controller importar os models, receberá os mocks
 */
const studentController = await import('../../../src/controllers/studentController.js');
const { create, getAll, getById, update, remove } = studentController;

// ═══════════════════════════════════════════════════════════════════════════
// 5. SUITE DE TESTES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * describe() - Agrupa testes relacionados
 * 
 * Benefícios:
 * - Organiza testes por funcionalidade
 * - Permite hooks específicos (beforeEach, afterEach)
 * - Facilita leitura dos relatórios de teste
 * - Pode ser aninhado para maior organização
 */
describe('studentController', () => {
  
  // ───────────────────────────────────────────────────────────────────────
  // 5.1. VARIÁVEIS COMPARTILHADAS
  // ───────────────────────────────────────────────────────────────────────
  
  /**
   * Variáveis que serão usadas em todos os testes
   * Declaradas aqui e inicializadas no beforeEach()
   */
  let req;   // Objeto de requisição (request)
  let res;   // Objeto de resposta (response)
  let next;  // Função de middleware

  // ───────────────────────────────────────────────────────────────────────
  // 5.2. HOOKS DE PREPARAÇÃO
  // ───────────────────────────────────────────────────────────────────────
  
  /**
   * beforeEach() - Executa ANTES de CADA teste
   * 
   * Uso:
   * - Resetar objetos req, res, next para estado inicial
   * - Limpar mocks para não interferir entre testes
   * - Preparar dados padrão
   * 
   * Garante que cada teste começa com um estado limpo
   */
  beforeEach(() => {
    // Mock do objeto Request (req)
    req = {
      body: {},     // Dados enviados no corpo da requisição
      params: {},   // Parâmetros da URL (/users/:id)
      query: {},    // Query string (?page=1&limit=10)
      user: {},     // Usuário autenticado (do middleware)
    };

    // Mock do objeto Response (res)
    res = {
      /**
       * mockReturnThis() - Permite encadeamento de métodos
       * Exemplo: res.status(200).json({ data })
       * 
       * Sem mockReturnThis():
       *   res.status(200) retorna undefined
       *   undefined.json() → ERRO!
       * 
       * Com mockReturnThis():
       *   res.status(200) retorna res
       *   res.json() → funciona!
       */
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };

    // Mock da função next (para tratamento de erros)
    next = jest.fn();
  });

  /**
   * afterEach() - Executa DEPOIS de CADA teste
   * 
   * Uso:
   * - Limpar mocks (resetar contadores e valores)
   * - Liberar recursos
   * - Garantir isolamento entre testes
   */
  afterEach(() => {
    jest.clearAllMocks();
    // Limpa:
    // - Contadores de chamadas (toHaveBeenCalledTimes)
    // - Argumentos passados (toHaveBeenCalledWith)
    // - Valores mockados (mockResolvedValue, mockReturnValue)
  });

  // ───────────────────────────────────────────────────────────────────────
  // 5.3. TESTES DA FUNÇÃO CREATE
  // ───────────────────────────────────────────────────────────────────────
  
  /**
   * describe() aninhado - Agrupa testes de uma função específica
   * Torna mais fácil localizar testes quando há falhas
   */
  describe('create', () => {
    
    /**
     * it() ou test() - Define um caso de teste individual
     * 
     * Nome do teste deve ser:
     * - Descritivo e claro
     * - Começar com "deve" ou "should"
     * - Explicar o comportamento esperado
     * - Incluir a condição testada
     */
    it('deve criar um aluno com sucesso', async () => {
      // ═══════════════════════════════════════════════════════════════
      // ARRANGE (Preparar)
      // ═══════════════════════════════════════════════════════════════
      
      /**
       * Configura os dados de entrada
       * Simula o que viria de uma requisição HTTP real
       */
      req.body = {
        nome: 'João Silva',
        classId: 1
      };

      /**
       * Mock da turma (deve existir para validação)
       */
      const mockClass = {
        id: 1,
        nome: '1º Ano A'
      };

      /**
       * Mock do aluno criado (retorno esperado do banco)
       */
      const mockStudent = {
        id: 1,
        nome: 'João Silva',
        classId: 1,
        class: mockClass
      };

      /**
       * Configura o comportamento dos mocks
       * 
       * mockResolvedValue() - Para funções assíncronas (retorna Promise)
       * mockReturnValue() - Para funções síncronas
       */
      Class.findByPk.mockResolvedValue(mockClass);
      User.create.mockResolvedValue(mockStudent);
      User.findByPk.mockResolvedValue(mockStudent);

      // ═══════════════════════════════════════════════════════════════
      // ACT (Agir)
      // ═══════════════════════════════════════════════════════════════
      
      /**
       * Executa a função que está sendo testada
       * Passa os mocks de req, res, next como parâmetros
       */
      await create(req, res, next);

      // ═══════════════════════════════════════════════════════════════
      // ASSERT (Verificar)
      // ═══════════════════════════════════════════════════════════════
      
      /**
       * Verifica se o status HTTP correto foi definido
       * 201 = Created (recurso criado com sucesso)
       */
      expect(res.status).toHaveBeenCalledWith(201);

      /**
       * Verifica se a resposta JSON contém os dados corretos
       * 
       * toHaveBeenCalledWith() - Verifica os argumentos da chamada
       * toEqual() - Comparação profunda de objetos
       * expect.objectContaining() - Verifica se objeto contém propriedades
       */
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 1,
          nome: 'João Silva',
          classId: 1
        })
      );

      /**
       * Verifica se os mocks foram chamados corretamente
       * 
       * toHaveBeenCalled() - Verifica se foi chamado
       * toHaveBeenCalledTimes(n) - Verifica quantidade de chamadas
       * toHaveBeenCalledWith(...args) - Verifica argumentos
       */
      expect(Class.findByPk).toHaveBeenCalledWith(1);
      expect(User.create).toHaveBeenCalledTimes(1);
      
      /**
       * Verifica que next() NÃO foi chamado
       * Se fosse chamado, indicaria um erro
       */
      expect(next).not.toHaveBeenCalled();
    });

    /**
     * TESTE DE VALIDAÇÃO - Campo obrigatório faltando
     * 
     * É crucial testar casos de erro, não apenas o "caminho feliz"
     */
    it('deve retornar erro 400 quando nome está vazio', async () => {
      // ARRANGE - Nome vazio
      req.body = {
        nome: '   ',  // String vazia após trim()
        classId: 1
      };

      // ACT
      await create(req, res, next);

      // ASSERT
      /**
       * 400 = Bad Request (dados inválidos)
       * 401 = Unauthorized (não autenticado)
       * 403 = Forbidden (sem permissão)
       * 404 = Not Found (recurso não existe)
       * 500 = Internal Server Error (erro do servidor)
       */
      expect(res.status).toHaveBeenCalledWith(400);
      
      expect(res.json).toHaveBeenCalledWith({
        error: 'Nome e classId são obrigatórios'
      });

      /**
       * Verifica que NÃO tentou criar no banco
       * (validação deve acontecer antes)
       */
      expect(User.create).not.toHaveBeenCalled();
    });

    /**
     * TESTE DE RELACIONAMENTO - Entidade relacionada não existe
     */
    it('deve retornar erro 404 quando turma não existe', async () => {
      // ARRANGE
      req.body = {
        nome: 'João Silva',
        classId: 999  // ID inexistente
      };

      // Mock retorna null (não encontrado)
      Class.findByPk.mockResolvedValue(null);

      // ACT
      await create(req, res, next);

      // ASSERT
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Turma não encontrada'
      });
      
      // Não deve tentar criar aluno se turma não existe
      expect(User.create).not.toHaveBeenCalled();
    });

    /**
     * TESTE DE TRATAMENTO DE ERRO - Erro no banco de dados
     * 
     * Testa como o código lida com exceções inesperadas
     */
    it('deve chamar next() quando ocorre erro no banco', async () => {
      // ARRANGE
      req.body = {
        nome: 'João Silva',
        classId: 1
      };

      // Mock de erro (simula problema no banco)
      const dbError = new Error('Conexão com banco falhou');
      Class.findByPk.mockRejectedValue(dbError);

      // ACT
      await create(req, res, next);

      // ASSERT
      /**
       * Em caso de erro, deve chamar next(error)
       * O middleware de erro do Express lidará com isso
       */
      expect(next).toHaveBeenCalledWith(dbError);
      
      // Não deve retornar resposta diretamente
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  // ───────────────────────────────────────────────────────────────────────
  // 5.4. TESTES DA FUNÇÃO GETALL
  // ───────────────────────────────────────────────────────────────────────
  
  describe('getAll', () => {
    
    it('deve retornar lista de alunos com sucesso', async () => {
      // ARRANGE
      const mockStudents = [
        { id: 1, nome: 'João Silva', class: { nome: '1º Ano A' } },
        { id: 2, nome: 'Maria Santos', class: { nome: '1º Ano A' } }
      ];

      User.findAll.mockResolvedValue(mockStudents);

      // ACT
      await getAll(req, res, next);

      // ASSERT
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockStudents);
      
      /**
       * Verifica que findAll foi chamado com includes corretos
       * expect.any(Object) - Aceita qualquer objeto
       */
      expect(User.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.any(Array)
        })
      );
    });

    it('deve retornar array vazio quando não há alunos', async () => {
      // ARRANGE
      User.findAll.mockResolvedValue([]);

      // ACT
      await getAll(req, res, next);

      // ASSERT
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([]);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// OBSERVAÇÕES FINAIS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * DICAS IMPORTANTES:
 * 
 * 1. ISOLAMENTO
 *    - Cada teste deve ser independente
 *    - Use beforeEach() para garantir estado limpo
 *    - Não dependa da ordem de execução
 * 
 * 2. CLAREZA
 *    - Nomes descritivos nos testes
 *    - Siga o padrão AAA (Arrange, Act, Assert)
 *    - Um conceito por teste
 * 
 * 3. COBERTURA
 *    - Teste caminhos de sucesso (happy path)
 *    - Teste validações e erros
 *    - Teste casos extremos (edge cases)
 *    - Teste tratamento de exceções
 * 
 * 4. MANUTENIBILIDADE
 *    - DRY (Don't Repeat Yourself) - use beforeEach
 *    - Organize com describe() aninhados
 *    - Mantenha testes simples e focados
 * 
 * 5. PERFORMANCE
 *    - Use mocks para evitar I/O real
 *    - Evite sleeps/timeouts desnecessários
 *    - Testes devem ser rápidos (<100ms cada)
 */

/**
 * COMANDOS ÚTEIS:
 * 
 * npm test                          # Roda todos os testes
 * npm test -- --coverage            # Com relatório de cobertura
 * npm test -- studentController     # Roda apenas este arquivo
 * npm test -- --watch               # Modo watch (re-executa ao salvar)
 * npm test -- --verbose             # Output detalhado
 */

/**
 * MATCHERS MAIS USADOS:
 * 
 * IGUALDADE:
 * - expect(x).toBe(y)                 # Comparação estrita (===)
 * - expect(x).toEqual(y)              # Comparação de valores (deep)
 * - expect(x).toStrictEqual(y)        # Igual + verifica tipos undefined
 * 
 * TRUTHINESS:
 * - expect(x).toBeTruthy()            # Verdadeiro em contexto booleano
 * - expect(x).toBeFalsy()             # Falso em contexto booleano
 * - expect(x).toBeNull()              # Null
 * - expect(x).toBeUndefined()         # Undefined
 * - expect(x).toBeDefined()           # Não undefined
 * 
 * NÚMEROS:
 * - expect(x).toBeGreaterThan(y)      # x > y
 * - expect(x).toBeLessThan(y)         # x < y
 * - expect(x).toBeCloseTo(y, digits)  # Aproximadamente igual (floats)
 * 
 * STRINGS:
 * - expect(x).toMatch(/regex/)        # Regex match
 * - expect(x).toContain('substring')  # Contém substring
 * 
 * ARRAYS/OBJETOS:
 * - expect(arr).toHaveLength(n)       # Tamanho do array
 * - expect(arr).toContain(item)       # Array contém item
 * - expect(obj).toHaveProperty('key') # Objeto tem propriedade
 * - expect(obj).toMatchObject({...})  # Contém propriedades
 * 
 * PROMISES:
 * - await expect(p).resolves.toBe(x)  # Promise resolve com x
 * - await expect(p).rejects.toThrow() # Promise é rejeitada
 * 
 * MOCKS:
 * - expect(fn).toHaveBeenCalled()           # Foi chamado
 * - expect(fn).toHaveBeenCalledTimes(n)     # Chamado n vezes
 * - expect(fn).toHaveBeenCalledWith(...args) # Chamado com args
 * - expect(fn).not.toHaveBeenCalled()       # Não foi chamado
 * 
 * NEGAÇÃO:
 * - expect(x).not.toBe(y)             # Negação de qualquer matcher
 */
