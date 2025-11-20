# PRD - Sistema Escolar de Gestão de Notas

## 1. Visão Geral & Contexto

### 1.1 Problema
Escolas precisam de um sistema para gerenciar turmas, disciplinas, alunos e suas respectivas notas ao longo do ano letivo. O sistema deve calcular médias automaticamente e determinar aprovação/reprovação dos alunos.

### 1.2 Solução Proposta
API REST desenvolvida em Node.js (ESM) + Express + Sequelize + PostgreSQL que permite:
- Cadastro de turmas e disciplinas
- Gestão de alunos vinculados a turmas
- Registro de notas (teste e prova) por unidade
- Cálculo automático de médias e status de aprovação
- Geração de boletim completo do aluno

### 1.3 Objetivo do Produto
Criar uma API funcional que demonstre:
- Relacionamentos complexos no Sequelize (1:N e N:N)
- Autenticação JWT
- Validação de regras de negócio
- Estruturação profissional de API REST

---

## 2. Objetivos do Produto

### 2.1 Objetivos Principais
- ✅ Implementar autenticação segura com JWT
- ✅ Gerenciar entidades escolares (Turmas, Disciplinas, Alunos)
- ✅ Registrar e calcular notas automaticamente
- ✅ Gerar boletim com médias e aprovação

### 2.2 Métricas de Sucesso
- Todos os CRUDs implementados e funcionais
- Cálculos de média corretos (100% precisão)
- Autenticação JWT funcionando em todas as rotas protegidas
- API documentada e testável

---

## 3. Personas & Casos de Uso

### 3.1 Persona Principal: Administrador do Sistema

**Perfil:**
- Secretário(a) escolar ou coordenador(a)
- Responsável por toda gestão acadêmica
- Precisa de acesso completo ao sistema

**Necessidades:**
- Cadastrar turmas e disciplinas no início do ano
- Matricular alunos nas turmas
- Registrar notas ao longo das 4 unidades
- Consultar boletins e status de aprovação

### 3.2 Casos de Uso Principais

**UC01 - Autenticação**
- Admin cria conta no sistema
- Admin faz login e recebe token JWT
- Token é usado para acessar todas as rotas

**UC02 - Gerenciar Turmas**
- Admin cria turmas (ex: "3º Ano A")
- Admin associa disciplinas às turmas
- Admin consulta lista de turmas

**UC03 - Gerenciar Disciplinas**
- Admin cadastra disciplinas (ex: "Matemática", "Português")
- Admin consulta lista de disciplinas

**UC04 - Gerenciar Alunos**
- Admin cadastra aluno vinculado a uma turma
- Admin consulta lista de alunos
- Aluno herda automaticamente as disciplinas da turma

**UC05 - Registrar Notas**
- Admin registra nota de teste e prova para cada unidade
- Sistema calcula média da unidade automaticamente
- Validações impedem notas inválidas

**UC06 - Consultar Boletim**
- Admin solicita boletim de um aluno
- Sistema retorna:
  - Notas por disciplina e unidade
  - Média por disciplina
  - Média final geral
  - Status: Aprovado/Reprovado

---

## 4. Requisitos Funcionais

### RF01 - Autenticação

**RF01.1 - Registro de Usuário**
- Endpoint: `POST /auth/register`
- Campos: nome, email, senha
- Senha deve ser criptografada com bcrypt
- Email deve ser único

**RF01.2 - Login**
- Endpoint: `POST /auth/login`
- Campos: email, senha
- Retorna token JWT válido por período configurável
- Token contém: userId, email

**RF01.3 - Proteção de Rotas**
- Todas as rotas exceto `/auth/*` requerem JWT válido
- Middleware valida token em cada requisição
- Retorna 401 para requisições não autenticadas

### RF02 - CRUD de Turmas

**RF02.1 - Criar Turma**
- Endpoint: `POST /classes`
- Campos: nome (obrigatório)
- Validação: nome não pode ser vazio

**RF02.2 - Listar Turmas**
- Endpoint: `GET /classes`
- Retorna lista completa de turmas
- Incluir contagem de alunos

**RF02.3 - Associar Disciplinas à Turma**
- Endpoint: `POST /classes/:id/subjects`
- Campos: subjectIds (array de IDs)
- Relacionamento N:N entre turmas e disciplinas
- Validação: disciplinas devem existir

### RF03 - CRUD de Disciplinas

**RF03.1 - Criar Disciplina**
- Endpoint: `POST /subjects`
- Campos: nome (obrigatório)
- Validação: nome não pode ser vazio

**RF03.2 - Listar Disciplinas**
- Endpoint: `GET /subjects`
- Retorna lista completa de disciplinas

### RF04 - CRUD de Alunos

**RF04.1 - Criar Aluno**
- Endpoint: `POST /students`
- Campos: nome, classId (obrigatórios)
- Validação: turma deve existir
- Aluno vinculado a uma única turma

**RF04.2 - Listar Alunos**
- Endpoint: `GET /students`
- Retorna lista de alunos
- Incluir informação da turma

### RF05 - Registro de Notas

**RF05.1 - Criar/Atualizar Nota**
- Endpoint: `POST /grades`
- Campos:
  - studentId (obrigatório)
  - subjectId (obrigatório)
  - unidade (1, 2, 3 ou 4)
  - teste (0-10)
  - prova (0-10)
- Cálculo automático: `mediaUnidade = (teste + prova) / 2`
- Validações:
  - Aluno deve existir
  - Disciplina deve existir
  - Disciplina deve estar vinculada à turma do aluno
  - Unidade deve ser entre 1 e 4
  - Notas devem ser entre 0 e 10

### RF06 - Boletim do Aluno

**RF06.1 - Gerar Boletim**
- Endpoint: `GET /students/:id/boletim`
- Retorna estrutura:
  ```json
  {
    "student": {
      "id": 1,
      "nome": "João Silva",
      "turma": "3º Ano A"
    },
    "disciplinas": [
      {
        "nome": "Matemática",
        "unidades": [
          {
            "unidade": 1,
            "teste": 8.0,
            "prova": 7.5,
            "media": 7.75
          },
          // ... unidades 2, 3, 4
        ],
        "mediaFinal": 7.5
      }
      // ... outras disciplinas
    ],
    "mediaGeralFinal": 7.8,
    "status": "Aprovado"
  }
  ```
- Cálculos:
  - `mediaFinal (por disciplina) = soma das 4 médias / 4`
  - `mediaGeralFinal = média de todas as disciplinas`
  - `status = "Aprovado"` se mediaGeralFinal >= 7, senão `"Reprovado"`

---

## 5. Requisitos Não-Funcionais

### RNF01 - Tecnologias Obrigatórias
- Node.js com ES Modules (type: "module")
- Express.js para API REST
- Sequelize como ORM
- PostgreSQL como banco de dados
- JWT para autenticação
- bcrypt para hash de senhas

### RNF02 - Segurança
- Senhas nunca armazenadas em texto plano
- Tokens JWT com expiração
- Validação de entrada em todos os endpoints
- Proteção contra SQL injection (via Sequelize)

### RNF03 - Estrutura e Código
- Código em inglês (nomes de variáveis, funções, etc.)
- Organização em camadas (routes, controllers, models, middlewares)
- Tratamento de erros adequado
- Status HTTP corretos (200, 201, 400, 401, 404, 500)

### RNF04 - Banco de Dados
- Migrations para criação de tabelas
- Relacionamentos definidos nos models
- Timestamps automáticos (createdAt, updatedAt)

---

## 6. Modelo de Dados

### 6.1 Entidades

#### User (Usuário)
```
- id: INTEGER (PK, AUTO_INCREMENT)
- nome: STRING (NOT NULL)
- email: STRING (UNIQUE, NOT NULL)
- password: STRING (NOT NULL, hashed)
- createdAt: DATE
- updatedAt: DATE
```

#### Class (Turma)
```
- id: INTEGER (PK, AUTO_INCREMENT)
- nome: STRING (NOT NULL)
- createdAt: DATE
- updatedAt: DATE
```

#### Subject (Disciplina)
```
- id: INTEGER (PK, AUTO_INCREMENT)
- nome: STRING (NOT NULL)
- createdAt: DATE
- updatedAt: DATE
```

#### Student (Aluno)
```
- id: INTEGER (PK, AUTO_INCREMENT)
- nome: STRING (NOT NULL)
- classId: INTEGER (FK → Class.id, NOT NULL)
- createdAt: DATE
- updatedAt: DATE
```

#### Grade (Nota)
```
- id: INTEGER (PK, AUTO_INCREMENT)
- studentId: INTEGER (FK → Student.id, NOT NULL)
- subjectId: INTEGER (FK → Subject.id, NOT NULL)
- unidade: INTEGER (1-4, NOT NULL)
- teste: DECIMAL(4,2) (NOT NULL)
- prova: DECIMAL(4,2) (NOT NULL)
- mediaUnidade: DECIMAL(4,2) (CALCULATED)
- createdAt: DATE
- updatedAt: DATE
```

#### ClassSubject (Tabela de Relacionamento)
```
- id: INTEGER (PK, AUTO_INCREMENT)
- classId: INTEGER (FK → Class.id, NOT NULL)
- subjectId: INTEGER (FK → Subject.id, NOT NULL)
- createdAt: DATE
- updatedAt: DATE
```

### 6.2 Relacionamentos

**Class ↔ Subject (N:N)**
- Uma turma tem várias disciplinas
- Uma disciplina pode estar em várias turmas
- Tabela intermediária: ClassSubject

**Class → Student (1:N)**
- Uma turma tem vários alunos
- Um aluno pertence a uma única turma

**Student → Grade (1:N)**
- Um aluno tem várias notas
- Uma nota pertence a um único aluno

**Subject → Grade (1:N)**
- Uma disciplina tem várias notas
- Uma nota pertence a uma única disciplina

---

## 7. Regras de Negócio

### RN01 - Sistema de Avaliação
- Ano letivo possui 4 unidades
- Cada unidade possui 1 teste e 1 prova
- `Média da Unidade = (Teste + Prova) / 2`
- `Média Final (por disciplina) = (Unidade1 + Unidade2 + Unidade3 + Unidade4) / 4`
- `Média Geral Final = Média de todas as disciplinas`

### RN02 - Aprovação
- Aluno aprovado se: `Média Geral Final >= 7.0`
- Aluno reprovado se: `Média Geral Final < 7.0`

### RN03 - Vínculos
- Aluno só pode ter notas em disciplinas da sua turma
- Não é possível registrar nota para disciplina não vinculada à turma do aluno
- Aluno não pode mudar de turma (escopo simplificado)

### RN04 - Validação de Notas
- Notas (teste e prova) devem estar entre 0 e 10
- Unidade deve ser 1, 2, 3 ou 4
- Cada combinação (studentId + subjectId + unidade) deve ser única

### RN05 - Autenticação
- Apenas usuários autenticados podem acessar o sistema
- Token JWT expira após período configurado (ex: 24h)

---

## 8. Especificação de API

### 8.1 Autenticação

#### POST /auth/register
**Request:**
```json
{
  "nome": "Admin",
  "email": "admin@escola.com",
  "password": "senha123"
}
```
**Response (201):**
```json
{
  "message": "Usuário criado com sucesso",
  "user": {
    "id": 1,
    "nome": "Admin",
    "email": "admin@escola.com"
  }
}
```

#### POST /auth/login
**Request:**
```json
{
  "email": "admin@escola.com",
  "password": "senha123"
}
```
**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "nome": "Admin",
    "email": "admin@escola.com"
  }
}
```

### 8.2 Turmas

#### POST /classes
**Headers:** `Authorization: Bearer {token}`
**Request:**
```json
{
  "nome": "3º Ano A"
}
```
**Response (201):**
```json
{
  "id": 1,
  "nome": "3º Ano A",
  "createdAt": "2025-11-20T10:00:00.000Z",
  "updatedAt": "2025-11-20T10:00:00.000Z"
}
```

#### GET /classes
**Headers:** `Authorization: Bearer {token}`
**Response (200):**
```json
[
  {
    "id": 1,
    "nome": "3º Ano A",
    "studentCount": 25,
    "createdAt": "2025-11-20T10:00:00.000Z",
    "updatedAt": "2025-11-20T10:00:00.000Z"
  }
]
```

#### POST /classes/:id/subjects
**Headers:** `Authorization: Bearer {token}`
**Request:**
```json
{
  "subjectIds": [1, 2, 3, 4]
}
```
**Response (200):**
```json
{
  "message": "Disciplinas associadas com sucesso",
  "class": {
    "id": 1,
    "nome": "3º Ano A"
  },
  "subjects": [
    { "id": 1, "nome": "Matemática" },
    { "id": 2, "nome": "Português" },
    { "id": 3, "nome": "História" },
    { "id": 4, "nome": "Geografia" }
  ]
}
```

### 8.3 Disciplinas

#### POST /subjects
**Headers:** `Authorization: Bearer {token}`
**Request:**
```json
{
  "nome": "Matemática"
}
```
**Response (201):**
```json
{
  "id": 1,
  "nome": "Matemática",
  "createdAt": "2025-11-20T10:00:00.000Z",
  "updatedAt": "2025-11-20T10:00:00.000Z"
}
```

#### GET /subjects
**Headers:** `Authorization: Bearer {token}`
**Response (200):**
```json
[
  {
    "id": 1,
    "nome": "Matemática",
    "createdAt": "2025-11-20T10:00:00.000Z",
    "updatedAt": "2025-11-20T10:00:00.000Z"
  }
]
```

### 8.4 Alunos

#### POST /students
**Headers:** `Authorization: Bearer {token}`
**Request:**
```json
{
  "nome": "João Silva",
  "classId": 1
}
```
**Response (201):**
```json
{
  "id": 1,
  "nome": "João Silva",
  "classId": 1,
  "class": {
    "id": 1,
    "nome": "3º Ano A"
  },
  "createdAt": "2025-11-20T10:00:00.000Z",
  "updatedAt": "2025-11-20T10:00:00.000Z"
}
```

#### GET /students
**Headers:** `Authorization: Bearer {token}`
**Response (200):**
```json
[
  {
    "id": 1,
    "nome": "João Silva",
    "classId": 1,
    "class": {
      "id": 1,
      "nome": "3º Ano A"
    },
    "createdAt": "2025-11-20T10:00:00.000Z",
    "updatedAt": "2025-11-20T10:00:00.000Z"
  }
]
```

### 8.5 Notas

#### POST /grades
**Headers:** `Authorization: Bearer {token}`
**Request:**
```json
{
  "studentId": 1,
  "subjectId": 1,
  "unidade": 1,
  "teste": 8.5,
  "prova": 7.0
}
```
**Response (201):**
```json
{
  "id": 1,
  "studentId": 1,
  "subjectId": 1,
  "unidade": 1,
  "teste": 8.5,
  "prova": 7.0,
  "mediaUnidade": 7.75,
  "createdAt": "2025-11-20T10:00:00.000Z",
  "updatedAt": "2025-11-20T10:00:00.000Z"
}
```

### 8.6 Boletim

#### GET /students/:id/boletim
**Headers:** `Authorization: Bearer {token}`
**Response (200):**
```json
{
  "student": {
    "id": 1,
    "nome": "João Silva",
    "class": {
      "id": 1,
      "nome": "3º Ano A"
    }
  },
  "boletim": [
    {
      "subject": {
        "id": 1,
        "nome": "Matemática"
      },
      "notas": [
        {
          "unidade": 1,
          "teste": 8.5,
          "prova": 7.0,
          "mediaUnidade": 7.75
        },
        {
          "unidade": 2,
          "teste": 9.0,
          "prova": 8.0,
          "mediaUnidade": 8.5
        },
        {
          "unidade": 3,
          "teste": 7.0,
          "prova": 6.5,
          "mediaUnidade": 6.75
        },
        {
          "unidade": 4,
          "teste": 8.0,
          "prova": 7.5,
          "mediaUnidade": 7.75
        }
      ],
      "mediaFinal": 7.69
    }
  ],
  "mediaGeralFinal": 7.69,
  "status": "Aprovado"
}
```

---

## 9. Tratamento de Erros

### Códigos de Status HTTP

**200 OK** - Requisição bem-sucedida (GET, PUT)
**201 Created** - Recurso criado com sucesso (POST)
**400 Bad Request** - Dados inválidos ou faltando
**401 Unauthorized** - Token ausente ou inválido
**404 Not Found** - Recurso não encontrado
**500 Internal Server Error** - Erro no servidor

### Formato de Erro Padrão
```json
{
  "error": "Mensagem descritiva do erro",
  "details": "Detalhes adicionais se necessário"
}
```

### Exemplos de Erros

**Validação:**
```json
{
  "error": "Dados inválidos",
  "details": "O campo 'nome' é obrigatório"
}
```

**Autenticação:**
```json
{
  "error": "Token inválido ou expirado"
}
```

**Regra de Negócio:**
```json
{
  "error": "Disciplina não está vinculada à turma do aluno"
}
```

---

## 10. Critérios de Sucesso

### 10.1 Funcionalidades Completas
- ✅ Autenticação JWT funcionando
- ✅ Todos os CRUDs implementados
- ✅ Relacionamentos N:N e 1:N corretos
- ✅ Cálculo de médias preciso
- ✅ Boletim completo gerado corretamente

### 10.2 Qualidade de Código
- ✅ Código organizado em camadas
- ✅ Validações em todos os endpoints
- ✅ Tratamento de erros adequado
- ✅ Migrations funcionais

### 10.3 Documentação
- ✅ README com instruções de setup
- ✅ Variáveis de ambiente documentadas
- ✅ Collection Postman/Insomnia (opcional)

### 10.4 Testes
- ✅ Todos os endpoints testáveis
- ✅ Casos de sucesso funcionando
- ✅ Casos de erro tratados

---

## 11. Entregáveis

### 11.1 Obrigatórios
- Código fonte completo no GitHub
- README.md com:
  - Descrição do projeto
  - Instruções de instalação
  - Instruções de execução
  - Variáveis de ambiente necessárias
  - Estrutura do banco de dados
- Migrations do Sequelize
- Models configurados
- API funcional

### 11.2 Opcionais (Extras)
- Collection do Postman/Insomnia
- Seeders para dados de teste
- Docker Compose para PostgreSQL
- Soft delete nos models
- Paginação nas listagens
- Testes automatizados
- RBAC (diferentes níveis de acesso)

---

## 12. Próximos Passos

Com este PRD, o próximo passo é:

1. **Arquitetura Técnica** - Definir estrutura de pastas, camadas e configurações
2. **Sharding do Documento** - Quebrar o PRD em épicos menores
3. **Criação de Stories** - User stories detalhadas para cada funcionalidade
4. **Implementação** - Desenvolvimento sequencial das stories

---

**Documento criado em:** 20/11/2025  
**Versão:** 1.0  
**Status:** Aprovado para Arquitetura
