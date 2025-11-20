# Epic 3: Gestão de Turmas (CRUD Completo)

**Objetivo:** Implementar CRUD completo de turmas + associação de disciplinas

**Status:** 📝 Draft  
**Prioridade:** 🟡 Alta  
**Estimativa Total:** 3-4 horas  
**Dependências:** Epic 1 e Epic 2 completos

---

## Story 3.1: Model de Turma

**Como** desenvolvedor  
**Quero** criar o model Class com relacionamentos  
**Para que** turmas possam ser gerenciadas no sistema

### Critérios de Aceitação

- [ ] `src/models/Class.js` implementado com:
  - Campos: id, nome
  - Validação: nome notEmpty
  - Relacionamento `hasMany` com Student
  - Relacionamento `belongsToMany` com Subject via ClassSubject
- [ ] `src/models/ClassSubject.js` implementado (tabela pivot)

### Definição de Pronto (DoD)

- Models registrados no index
- Associações definidas corretamente
- Pode criar turma e associar disciplinas

---

## Story 3.2: Controller de Turmas - CREATE e READ

**Como** administrador  
**Quero** criar e listar turmas  
**Para que** eu possa organizar os alunos

### Critérios de Aceitação

- [ ] `src/controllers/classController.js` criado
- [ ] Função `create` implementada:
  - Valida nome obrigatório
  - Cria turma no banco
  - Retorna status 201
- [ ] Função `getAll` implementada:
  - Lista todas turmas com contagem de alunos
  - Inclui alunos na resposta
  - Retorna status 200

### Request/Response

**CREATE:**
```http
POST /api/classes
Authorization: Bearer <token>
Content-Type: application/json

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

**GET ALL:**
```http
GET /api/classes
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "id": 1,
    "nome": "3º Ano A",
    "studentCount": 0,
    "students": [],
    "createdAt": "2025-11-20T10:00:00.000Z",
    "updatedAt": "2025-11-20T10:00:00.000Z"
  }
]
```

### Definição de Pronto (DoD)

- Pode criar turma via API
- Pode listar todas turmas
- studentCount correto
- Validações funcionando

---

## Story 3.3: Controller de Turmas - GET BY ID

**Como** administrador  
**Quero** buscar uma turma específica  
**Para que** eu veja seus detalhes completos

### Critérios de Aceitação

- [ ] Função `getById` implementada:
  - Busca turma por ID
  - Inclui alunos e disciplinas
  - Retorna 404 se não encontrada
  - Retorna status 200

### Request/Response

```http
GET /api/classes/1
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "id": 1,
  "nome": "3º Ano A",
  "students": [],
  "subjects": [],
  "createdAt": "2025-11-20T10:00:00.000Z",
  "updatedAt": "2025-11-20T10:00:00.000Z"
}
```

**Response (404):**
```json
{
  "error": "Turma não encontrada"
}
```

---

## Story 3.4: Controller de Turmas - UPDATE

**Como** administrador  
**Quero** atualizar o nome de uma turma  
**Para que** eu possa corrigir erros ou renomear

### Critérios de Aceitação

- [ ] Função `update` implementada:
  - Valida nome não vazio
  - Busca turma por ID
  - Atualiza nome
  - Retorna 404 se não encontrada
  - Retorna status 200

### Request/Response

```http
PUT /api/classes/1
Authorization: Bearer <token>
Content-Type: application/json

{
  "nome": "3º Ano B"
}
```

**Response (200):**
```json
{
  "message": "Turma atualizada com sucesso",
  "data": {
    "id": 1,
    "nome": "3º Ano B",
    "createdAt": "2025-11-20T10:00:00.000Z",
    "updatedAt": "2025-11-20T15:30:00.000Z"
  }
}
```

---

## Story 3.5: Controller de Turmas - DELETE

**Como** administrador  
**Quero** deletar uma turma  
**Para que** eu possa remover turmas obsoletas

### Critérios de Aceitação

- [ ] Função `remove` implementada:
  - Busca turma com alunos incluídos
  - Verifica se tem alunos vinculados
  - Impede deleção se tiver alunos (status 400)
  - Deleta turma se não tiver alunos
  - Retorna 404 se não encontrada
  - Retorna status 200

### Request/Response

```http
DELETE /api/classes/1
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Turma deletada com sucesso"
}
```

**Response (400) - com alunos:**
```json
{
  "error": "Não é possível deletar turma com alunos vinculados",
  "details": "A turma possui 25 aluno(s)"
}
```

---

## Story 3.6: Associar Disciplinas à Turma

**Como** administrador  
**Quero** vincular disciplinas a uma turma  
**Para que** os alunos dessa turma cursem essas disciplinas

### Critérios de Aceitação

- [ ] Função `addSubjects` implementada:
  - Recebe array de IDs de disciplinas
  - Valida que todas disciplinas existem
  - Associa disciplinas à turma via tabela pivot
  - Retorna turma atualizada com disciplinas
  - Status 200

### Request/Response

```http
POST /api/classes/1/subjects
Authorization: Bearer <token>
Content-Type: application/json

{
  "subjectIds": [1, 2, 3, 4]
}
```

**Response (200):**
```json
{
  "message": "Disciplinas associadas com sucesso",
  "data": {
    "id": 1,
    "nome": "3º Ano A",
    "subjects": [
      { "id": 1, "nome": "Matemática" },
      { "id": 2, "nome": "Português" },
      { "id": 3, "nome": "História" },
      { "id": 4, "nome": "Geografia" }
    ]
  }
}
```

---

## Story 3.7: Rotas de Turmas

**Como** desenvolvedor  
**Quero** configurar todas as rotas de turmas  
**Para que** o CRUD esteja completo e acessível

### Critérios de Aceitação

- [ ] `src/routes/classRoutes.js` criado
- [ ] Todas rotas protegidas com `authenticateToken`
- [ ] Rotas configuradas:
  - `POST /` → create
  - `GET /` → getAll
  - `GET /:id` → getById
  - `PUT /:id` → update
  - `DELETE /:id` → remove
  - `POST /:id/subjects` → addSubjects
- [ ] Rotas registradas em index como `/api/classes`

### Definição de Pronto (DoD)

- Todos endpoints funcionais
- Todas operações requerem JWT
- Validações funcionando
- Respostas padronizadas

---

**Epic 3 Completo quando:**
- ✅ CRUD completo de turmas funcional
- ✅ Pode associar disciplinas às turmas
- ✅ Validações de integridade funcionando
- ✅ Todas rotas protegidas por JWT
