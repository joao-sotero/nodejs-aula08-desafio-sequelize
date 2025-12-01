# 📚 Guia Completo de Testes Unitários com Jest

> **Para alunos que NUNCA fizeram testes antes**
> Leia este guia do início ao fim, seguindo a ordem. Não pule seções!

---

## 📖 Índice

1. [O que são Testes Unitários?](#1-o-que-são-testes-unitários)
2. [Por que Testar?](#2-por-que-testar)
3. [Primeiro Teste - Passo a Passo](#3-primeiro-teste---passo-a-passo)
4. [Estrutura AAA](#4-estrutura-aaa)
5. [Matchers Básicos](#5-matchers-básicos)
6. [Hooks do Jest](#6-hooks-do-jest)
7. [O que são Mocks?](#7-o-que-são-mocks)
8. [Testando com Mocks](#8-testando-com-mocks)
9. [Testando Controllers](#9-testando-controllers)
10. [Trabalhando com ESM](#10-trabalhando-com-esm)
11. [Exemplos Práticos](#11-exemplos-práticos)
12. [Cheat Sheet](#12-cheat-sheet-consulta-rápida)
13. [Exercícios Práticos](#13-exercícios-práticos)

---

## 1. O que são Testes Unitários?

**Testes unitários** verificam se pequenos pedaços do seu código (funções, métodos) funcionam corretamente **de forma isolada**.

### Analogia do Carro 🚗

Imagine que você está fabricando um carro:

- **Teste Unitário**: Testar se o motor liga sozinho
- **Teste de Integração**: Testar se o motor funciona com a transmissão
- **Teste E2E**: Testar se o carro inteiro anda

Neste guia, focaremos em **testes unitários** usando o **Jest**.

### O que é Jest?

Jest é um **framework de testes** para JavaScript/Node.js. Ele fornece:

- Funções para escrever testes
- Ferramentas para simular dependências (mocks)
- Relatórios de cobertura
- Execução rápida e paralela

---

## 2. Por que Testar?

### ✅ Vantagens

1. **Confiança no Código**: Sabe que funciona antes de subir
2. **Documentação Viva**: Testes mostram como usar o código
3. **Facilita Refatoração**: Muda código sem medo de quebrar
4. **Encontra Bugs Cedo**: Antes do usuário encontrar
5. **Melhora Design**: Código testável é código bem estruturado

### ❌ Sem Testes

- Testa manualmente toda vez (perde tempo)
- Medo de mudar código
- Bugs aparecem em produção
- Não sabe se mudança quebrou algo

---

## 3. Primeiro Teste - Passo a Passo

Vamos criar o teste mais simples possível.

### Passo 1: A Função que Vamos Testar

```javascript
// calculadora.js
export function somar(a, b) {
  return a + b;
}
```

### Passo 2: O Teste

```javascript
// calculadora.test.js
import { somar } from './calculadora.js';

// describe = agrupa testes relacionados
describe('Calculadora', () => {
  
  // it ou test = define um teste individual
  it('deve somar dois números corretamente', () => {
    // Executa a função
    const resultado = somar(2, 3);
  
    // Verifica se o resultado é o esperado
    expect(resultado).toBe(5);
  });
});
```

### Passo 3: Executar

```bash
npm test
```

### Resultado Esperado ✅

```
PASS  calculadora.test.js
  Calculadora
    ✓ deve somar dois números corretamente (2ms)

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
```

### Entendendo o Código

```javascript
describe('Calculadora', () => {
  // ↑ Agrupa testes relacionados. Nome descritivo!
  
  it('deve somar dois números corretamente', () => {
    // ↑ Define UM teste. Nome explica O QUE testa
  
    const resultado = somar(2, 3);
    // ↑ Executa a função que queremos testar
  
    expect(resultado).toBe(5);
    // ↑ Verifica se resultado é igual a 5
  });
});
```

---

## 4. Estrutura AAA

**TODO teste deve seguir o padrão AAA:**

### A - Arrange (Preparar)

Configure os dados de entrada e o ambiente

### A - Act (Agir)

Execute a função ou código que está testando

### A - Assert (Verificar)

Verifique se o resultado é o esperado

### Exemplo Completo

```javascript
it('deve calcular média de três números', () => {
  // ═══════════════════════════════════════
  // ARRANGE (Preparar)
  // ═══════════════════════════════════════
  const nota1 = 7;
  const nota2 = 8;
  const nota3 = 9;
  
  // ═══════════════════════════════════════
  // ACT (Agir)
  // ═══════════════════════════════════════
  const media = calcularMedia(nota1, nota2, nota3);
  
  // ═══════════════════════════════════════
  // ASSERT (Verificar)
  // ═══════════════════════════════════════
  expect(media).toBe(8);
});
```

**💡 Dica:** Sempre que escrever um teste, pense "AAA"!

---

## 5. Matchers Básicos

Matchers são os métodos que usamos após `expect()` para verificar valores.

### Igualdade

```javascript
// toBe - Comparação estrita (===) para valores primitivos
expect(5).toBe(5);
expect('hello').toBe('hello');

// toEqual - Comparação de valores (para objetos/arrays)
expect({ nome: 'João' }).toEqual({ nome: 'João' });
expect([1, 2, 3]).toEqual([1, 2, 3]);
```

**❓ Quando usar qual?**

- `toBe`: números, strings, booleans
- `toEqual`: objetos, arrays

### Truthiness (Verdadeiro/Falso)

```javascript
expect(true).toBeTruthy();        // Verdadeiro
expect(false).toBeFalsy();        // Falso
expect(null).toBeNull();          // É null
expect(undefined).toBeUndefined(); // É undefined
expect('algo').toBeDefined();     // Não é undefined
```

### Números

```javascript
expect(10).toBeGreaterThan(5);        // 10 > 5
expect(10).toBeGreaterThanOrEqual(10); // 10 >= 10
expect(5).toBeLessThan(10);           // 5 < 10
expect(7.5).toBeCloseTo(7.5, 2);      // Aproximadamente 7.5 (2 casas decimais)
```

**💡 Use `toBeCloseTo` para números decimais!**

### Strings

```javascript
expect('Hello World').toContain('World');     // Contém substring
expect('teste@email.com').toMatch(/@/);       // Regex
expect('JavaScript').toMatch(/script/i);      // Case insensitive
```

### Arrays

```javascript
const frutas = ['maçã', 'banana', 'laranja'];

expect(frutas).toHaveLength(3);           // Tamanho 3
expect(frutas).toContain('banana');       // Contém 'banana'
```

### Negação

```javascript
expect(5).not.toBe(10);              // NÃO é 10
expect('teste').not.toContain('xyz'); // NÃO contém 'xyz'
```

**💡 Use `.not` para negar qualquer matcher!**

---

## 6. Hooks do Jest

Hooks são funções que executam em momentos específicos dos testes.

### Os 4 Hooks Principais

```javascript
describe('Meus Testes', () => {
  
  // ────────────────────────────────────────
  // beforeAll - Executa UMA VEZ antes de TODOS os testes
  // ────────────────────────────────────────
  beforeAll(() => {
    console.log('Setup pesado - executa 1x');
    // Ex: Conectar banco de dados
  });
  
  // ────────────────────────────────────────
  // beforeEach - Executa ANTES de CADA teste
  // ────────────────────────────────────────
  beforeEach(() => {
    console.log('Setup leve - antes de cada teste');
    // Ex: Limpar dados, resetar variáveis
  });
  
  // ────────────────────────────────────────
  // afterEach - Executa DEPOIS de CADA teste
  // ────────────────────────────────────────
  afterEach(() => {
    console.log('Limpeza - depois de cada teste');
    // Ex: Limpar mocks
  });
  
  // ────────────────────────────────────────
  // afterAll - Executa UMA VEZ depois de TODOS
  // ────────────────────────────────────────
  afterAll(() => {
    console.log('Limpeza final - executa 1x');
    // Ex: Fechar conexão com banco
  });
  
  it('teste 1', () => { /* ... */ });
  it('teste 2', () => { /* ... */ });
});
```

### Quando Usar Cada Hook?

| Hook           | Quando Usar                | Exemplo                          |
| -------------- | -------------------------- | -------------------------------- |
| `beforeAll`  | Setup pesado (1x)          | Conectar banco de dados          |
| `beforeEach` | Limpar estado entre testes | Resetar variáveis, limpar mocks |
| `afterEach`  | Limpeza após cada teste   | Limpar mocks, restaurar estado   |
| `afterAll`   | Limpeza final (1x)         | Fechar conexões                 |

### Exemplo Prático

```javascript
describe('Calculadora', () => {
  let calculadora;
  
  beforeEach(() => {
    // Cria nova instância antes de cada teste
    calculadora = new Calculadora();
  });
  
  it('teste 1', () => {
    calculadora.somar(1, 2);
    expect(calculadora.resultado).toBe(3);
  });
  
  it('teste 2', () => {
    // calculadora é nova aqui (graças ao beforeEach)
    calculadora.somar(5, 5);
    expect(calculadora.resultado).toBe(10);
  });
});
```

---

## 7. O que são Mocks?

**Mock** = Objeto falso que simula o comportamento de um objeto real.

### Por que Usar Mocks?

Imagine que você quer testar uma função que:

1. Busca dados do banco
2. Calcula algo
3. Envia email

```javascript
function processarPedido(pedidoId) {
  const pedido = bancoDeDados.buscar(pedidoId);  // ← Depende do banco
  const total = calcular(pedido);                 // ← Lógica pura
  emailService.enviar(pedido.email, total);       // ← Depende de serviço externo
}
```

**Problema:** Para testar, você precisaria:

- ❌ Banco de dados funcionando
- ❌ Servidor de email funcionando
- ❌ Dados de teste no banco
- ❌ Testes ficam lentos

**Solução: Mocks!**

- ✅ Simula o banco retornando dados falsos
- ✅ Simula o envio de email
- ✅ Testa APENAS a lógica
- ✅ Testes rápidos e isolados

### Analogia 🎬

Pense em mocks como **dublês de cinema**:

- O ator real = código real (banco, API, etc)
- O dublê = mock (simula o comportamento)
- Você testa apenas o protagonista (sua função)

---

## 8. Testando com Mocks

### Criando um Mock Simples

```javascript
import { jest } from '@jest/globals';

// Cria uma função mock
const minhaFuncaoMock = jest.fn();

// Configura o que ela deve retornar
minhaFuncaoMock.mockReturnValue('olá');

// Usa no teste
const resultado = minhaFuncaoMock();
console.log(resultado); // 'olá'

// Verifica se foi chamada
expect(minhaFuncaoMock).toHaveBeenCalled();
```

### Mock com Promises (Async)

```javascript
const buscarUsuario = jest.fn();

// Mock retorna promise resolvida
buscarUsuario.mockResolvedValue({ 
  id: 1, 
  nome: 'João' 
});

// Usa no teste
const usuario = await buscarUsuario(1);
expect(usuario.nome).toBe('João');
```

### Verificando Chamadas do Mock

```javascript
const mock = jest.fn();

mock('arg1', 'arg2');
mock('arg3');

// Foi chamado?
expect(mock).toHaveBeenCalled();

// Quantas vezes?
expect(mock).toHaveBeenCalledTimes(2);

// Com quais argumentos?
expect(mock).toHaveBeenCalledWith('arg1', 'arg2');

// Não foi chamado?
expect(mock).not.toHaveBeenCalled();
```

### Exemplo Completo: Mockando um Service

```javascript
import { jest } from '@jest/globals';

describe('UserController', () => {
  it('deve buscar usuário por ID', async () => {
    // ═══════════════════════════════════════
    // ARRANGE
    // ═══════════════════════════════════════
  
    // 1. Cria mock do service
    const userService = {
      findById: jest.fn()
    };
  
    // 2. Configura o que o mock deve retornar
    userService.findById.mockResolvedValue({
      id: 1,
      nome: 'João'
    });
  
    // 3. Cria o controller com o service mockado
    const controller = new UserController(userService);
  
    // ═══════════════════════════════════════
    // ACT
    // ═══════════════════════════════════════
    const usuario = await controller.getById(1);
  
    // ═══════════════════════════════════════
    // ASSERT
    // ═══════════════════════════════════════
    expect(usuario.nome).toBe('João');
    expect(userService.findById).toHaveBeenCalledWith(1);
  });
});
```

---

## 9. Testando Controllers

Controllers são funções que:

1. Recebem `req` (request) e `res` (response)
2. Processam dados
3. Retornam resposta HTTP

### Anatomia de um Controller

```javascript
// studentController.js
export async function getById(req, res) {
  const id = req.params.id;
  const student = await Student.findByPk(id);
  
  if (!student) {
    return res.status(404).json({ error: 'Aluno não encontrado' });
  }
  
  res.status(200).json(student);
}
```

### Testando o Controller

```javascript
import { jest } from '@jest/globals';

describe('studentController', () => {
  let req, res;
  
  beforeEach(() => {
    // Mock do objeto req
    req = {
      params: {},
      body: {},
      query: {}
    };
  
    // Mock do objeto res
    res = {
      status: jest.fn().mockReturnThis(),  // ← Permite encadeamento
      json: jest.fn().mockReturnThis()
    };
  });
  
  it('deve retornar aluno quando ID existe', async () => {
    // ARRANGE
    req.params.id = '1';
  
    // Mock do Model
    const Student = {
      findByPk: jest.fn().mockResolvedValue({
        id: 1,
        nome: 'João'
      })
    };
  
    // ACT
    await getById(req, res);
  
    // ASSERT
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      id: 1,
      nome: 'João'
    });
  });
  
  it('deve retornar 404 quando aluno não existe', async () => {
    // ARRANGE
    req.params.id = '999';
  
    const Student = {
      findByPk: jest.fn().mockResolvedValue(null)  // ← Não encontrado
    };
  
    // ACT
    await getById(req, res);
  
    // ASSERT
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Aluno não encontrado'
    });
  });
});
```

### Por que `mockReturnThis()`?

Permite encadear métodos:

```javascript
res.status(200).json({ data: 'teste' });
//     ↑           ↑
//     retorna     retorna
//     res         res
```

Sem `mockReturnThis()`:

```javascript
res.status(200)  // → retorna undefined
undefined.json() // → ERRO!
```

---

## 10. Trabalhando com ESM

ESM = ECMAScript Modules (usa `import`/`export` em vez de `require`)

### Diferença Principal

```javascript
// CommonJS (antigo)
const express = require('express');
module.exports = { algo };

// ESM (moderno) ← Este projeto usa isso
import express from 'express';
export { algo };
```

### Mockando Módulos com ESM

**❗ IMPORTANTE:** Mock DEVE vir ANTES do import!

```javascript
import { jest } from '@jest/globals';

// ────────────────────────────────────────
// 1. MOCKA O MÓDULO (antes de importar)
// ────────────────────────────────────────
await jest.unstable_mockModule('./models/User.js', () => ({
  __esModule: true,  // ← Obrigatório!
  default: {
    findByPk: jest.fn()
  }
}));

// ────────────────────────────────────────
// 2. IMPORTA O CÓDIGO (depois do mock)
// ────────────────────────────────────────
const { getUser } = await import('./controller.js');

// ────────────────────────────────────────
// 3. USA NOS TESTES
// ────────────────────────────────────────
describe('getUser', () => {
  it('deve buscar usuário', async () => {
    // agora getUser usa o mock!
  });
});
```

### Por que "unstable"?

Não se preocupe! "unstable" significa que a API pode mudar no futuro, mas **funciona perfeitamente**. É a forma correta de mockar módulos ESM no Jest.

### Configuração Necessária

No `jest.config.js`:

```javascript
export default {
  // Sem transformações (usa ESM nativo)
  transform: {},
  
  // Remove extensão .js das importações
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  
  // Configuração para ESM funcionar
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons'],
  }
};
```

---

## 11. Exemplos Práticos

### Exemplo 1: Teste de Service Simples

```javascript
// gradeService.js
export function calcularMedia(notas) {
  if (!notas || notas.length === 0) return 0;
  
  const soma = notas.reduce((acc, nota) => acc + nota, 0);
  return soma / notas.length;
}
```

```javascript
// gradeService.test.js
import { calcularMedia } from './gradeService.js';

describe('calcularMedia', () => {
  it('deve calcular média corretamente', () => {
    // ARRANGE
    const notas = [7, 8, 9, 6];
  
    // ACT
    const media = calcularMedia(notas);
  
    // ASSERT
    expect(media).toBe(7.5);
  });
  
  it('deve retornar 0 quando não há notas', () => {
    expect(calcularMedia([])).toBe(0);
    expect(calcularMedia(null)).toBe(0);
    expect(calcularMedia(undefined)).toBe(0);
  });
  
  it('deve calcular média com uma nota', () => {
    expect(calcularMedia([10])).toBe(10);
  });
});
```

### Exemplo 2: Teste de Controller Completo

```javascript
// studentController.js
export async function create(req, res) {
  const { nome, classId } = req.body;
  
  // Validação
  if (!nome || !classId) {
    return res.status(400).json({ 
      error: 'Nome e classId são obrigatórios' 
    });
  }
  
  // Verifica se turma existe
  const classExists = await Class.findByPk(classId);
  if (!classExists) {
    return res.status(404).json({ 
      error: 'Turma não encontrada' 
    });
  }
  
  // Cria aluno
  const student = await Student.create({ nome, classId });
  res.status(201).json(student);
}
```

```javascript
// studentController.test.js
import { jest } from '@jest/globals';

// Mocks dos Models
const Student = {
  create: jest.fn(),
  findByPk: jest.fn()
};

const Class = {
  findByPk: jest.fn()
};

// Mocka módulo de models
await jest.unstable_mockModule('./models/index.js', () => ({
  __esModule: true,
  default: { Student, Class }
}));

// Importa controller
const { create } = await import('./studentController.js');

describe('studentController.create', () => {
  let req, res;
  
  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    jest.clearAllMocks();
  });
  
  it('deve criar aluno com sucesso', async () => {
    // ARRANGE
    req.body = { nome: 'João', classId: 1 };
  
    Class.findByPk.mockResolvedValue({ id: 1, nome: '1º Ano' });
    Student.create.mockResolvedValue({ 
      id: 1, 
      nome: 'João', 
      classId: 1 
    });
  
    // ACT
    await create(req, res);
  
    // ASSERT
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ 
        id: 1, 
        nome: 'João' 
      })
    );
    expect(Student.create).toHaveBeenCalledWith({ 
      nome: 'João', 
      classId: 1 
    });
  });
  
  it('deve retornar erro 400 quando dados faltando', async () => {
    // ARRANGE
    req.body = { nome: '' };
  
    // ACT
    await create(req, res);
  
    // ASSERT
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Nome e classId são obrigatórios'
    });
    expect(Student.create).not.toHaveBeenCalled();
  });
  
  it('deve retornar erro 404 quando turma não existe', async () => {
    // ARRANGE
    req.body = { nome: 'João', classId: 999 };
    Class.findByPk.mockResolvedValue(null);
  
    // ACT
    await create(req, res);
  
    // ASSERT
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Turma não encontrada'
    });
    expect(Student.create).not.toHaveBeenCalled();
  });
});
```

---

## 12. Cheat Sheet (Consulta Rápida)

### Estrutura Básica

```javascript
describe('Nome do Grupo', () => {
  beforeEach(() => { /* setup */ });
  afterEach(() => { /* limpeza */ });
  
  it('deve fazer algo', () => {
    // ARRANGE - prepara
    // ACT - executa
    // ASSERT - verifica
  });
});
```

### Matchers Mais Usados

```javascript
// Igualdade
expect(x).toBe(y);              // ===
expect(obj).toEqual(obj2);      // deep equal

// Truthiness
expect(x).toBeTruthy();
expect(x).toBeFalsy();
expect(x).toBeNull();
expect(x).toBeUndefined();

// Números
expect(x).toBeGreaterThan(5);
expect(x).toBeLessThan(10);
expect(x).toBeCloseTo(7.5, 2);

// Strings/Arrays
expect(str).toContain('sub');
expect(arr).toHaveLength(3);

// Mocks
expect(fn).toHaveBeenCalled();
expect(fn).toHaveBeenCalledWith(arg);
expect(fn).toHaveBeenCalledTimes(2);
```

### Mocks

```javascript
// Criar mock
const mock = jest.fn();

// Configurar retorno
mock.mockReturnValue(valor);
mock.mockResolvedValue(valor);      // Promise
mock.mockRejectedValue(erro);       // Promise com erro

// Limpar
jest.clearAllMocks();
```

### Mock de req/res

```javascript
const req = {
  body: {},
  params: {},
  query: {}
};

const res = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis()
};
```

### Comandos CLI

```bash
npm test                    # Todos os testes
npm test -- --coverage      # Com cobertura
npm test -- --watch         # Modo watch
npm test -- studentController # Arquivo específico
```

---

## 13. Exercícios Práticos

### Exercício 1: Função Simples ⭐

Crie testes para esta função:

```javascript
function ehPar(numero) {
  return numero % 2 === 0;
}
```

<details>
<summary>Ver Solução</summary>

```javascript
describe('ehPar', () => {
  it('deve retornar true para número par', () => {
    expect(ehPar(2)).toBe(true);
    expect(ehPar(10)).toBe(true);
  });
  
  it('deve retornar false para número ímpar', () => {
    expect(ehPar(1)).toBe(false);
    expect(ehPar(7)).toBe(false);
  });
  
  it('deve funcionar com zero', () => {
    expect(ehPar(0)).toBe(true);
  });
  
  it('deve funcionar com números negativos', () => {
    expect(ehPar(-2)).toBe(true);
    expect(ehPar(-3)).toBe(false);
  });
});
```

</details>

### Exercício 2: Função com Array ⭐⭐

Crie testes para:

```javascript
function encontrarMaior(numeros) {
  if (!numeros || numeros.length === 0) return null;
  return Math.max(...numeros);
}
```

<details>
<summary>Ver Solução</summary>

```javascript
describe('encontrarMaior', () => {
  it('deve retornar o maior número', () => {
    expect(encontrarMaior([1, 5, 3, 9, 2])).toBe(9);
  });
  
  it('deve retornar null para array vazio', () => {
    expect(encontrarMaior([])).toBeNull();
  });
  
  it('deve retornar null para null/undefined', () => {
    expect(encontrarMaior(null)).toBeNull();
    expect(encontrarMaior(undefined)).toBeNull();
  });
  
  it('deve funcionar com um elemento', () => {
    expect(encontrarMaior([7])).toBe(7);
  });
  
  it('deve funcionar com negativos', () => {
    expect(encontrarMaior([-1, -5, -3])).toBe(-1);
  });
});
```

</details>

### Exercício 3: Controller com Mock ⭐⭐⭐

Crie testes para este controller:

```javascript
export async function deleteStudent(req, res) {
  const { id } = req.params;
  
  const student = await Student.findByPk(id);
  
  if (!student) {
    return res.status(404).json({ error: 'Aluno não encontrado' });
  }
  
  await student.destroy();
  res.status(200).json({ message: 'Aluno deletado com sucesso' });
}
```

<details>
<summary>Ver Solução</summary>

```javascript
import { jest } from '@jest/globals';

const Student = {
  findByPk: jest.fn()
};

await jest.unstable_mockModule('./models/index.js', () => ({
  __esModule: true,
  default: { Student }
}));

const { deleteStudent } = await import('./controller.js');

describe('deleteStudent', () => {
  let req, res;
  
  beforeEach(() => {
    req = { params: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    jest.clearAllMocks();
  });
  
  it('deve deletar aluno existente', async () => {
    // ARRANGE
    req.params.id = '1';
    const mockStudent = {
      id: 1,
      destroy: jest.fn()
    };
    Student.findByPk.mockResolvedValue(mockStudent);
  
    // ACT
    await deleteStudent(req, res);
  
    // ASSERT
    expect(Student.findByPk).toHaveBeenCalledWith('1');
    expect(mockStudent.destroy).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Aluno deletado com sucesso'
    });
  });
  
  it('deve retornar 404 quando aluno não existe', async () => {
    // ARRANGE
    req.params.id = '999';
    Student.findByPk.mockResolvedValue(null);
  
    // ACT
    await deleteStudent(req, res);
  
    // ASSERT
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Aluno não encontrado'
    });
  });
});
```

</details>

---

## 🎯 Próximos Passos

Agora que você terminou este guia:

1. ✅ **Pratique**: Abra `tests/unit/services/gradeService.test.js` e leia
2. ✅ **Execute**: `npm test` e veja os testes passando
3. ✅ **Modifique**: Mude valores nos testes e veja falhar
4. ✅ **Crie**: Tente escrever um teste novo para uma função simples
5. ✅ **Explore**: Veja os outros testes em `tests/unit/controllers/`

### 📚 Recursos Adicionais

- [Documentação Oficial Jest](https://jestjs.io/)
- [Jest Cheat Sheet](https://github.com/sapegin/jest-cheat-sheet)
- Consulte `tests/EXEMPLO_TESTE_COMENTADO.test.js` para exemplo completo

---

## 💡 Dicas Finais

1. **Teste primeiro o caminho feliz** (quando tudo funciona)
2. **Depois teste os erros** (validações, 404, etc)
3. **Use nomes descritivos** nos testes
4. **Siga AAA sempre** (Arrange, Act, Assert)
5. **Não tenha medo de console.log** nos testes para debugar
6. **Execute testes frequentemente** enquanto desenvolve
7. **Leia mensagens de erro** com atenção (Jest explica bem!)

---

**🎉 Parabéns! Você completou o guia de testes unitários!**

Agora você sabe:

- ✅ O que são testes unitários
- ✅ Como escrever testes com Jest
- ✅ Estrutura AAA
- ✅ Matchers básicos
- ✅ Hooks
- ✅ O que são mocks e como usar
- ✅ Como testar controllers
- ✅ Como trabalhar com ESM

**Continue praticando e os testes ficarão naturais!** 🚀
