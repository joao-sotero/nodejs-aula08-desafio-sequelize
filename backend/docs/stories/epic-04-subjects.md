# Epic 4: Gestão de Disciplinas (CRUD Completo)

**Objetivo:** Implementar CRUD completo de disciplinas

**Status:** 📝 Draft  
**Prioridade:** 🟡 Alta  
**Estimativa Total:** 2-3 horas  
**Dependências:** Epic 1, 2 e 3 completos

---

## Story 4.1: Model de Disciplina

**Como** desenvolvedor  
**Quero** criar o model Subject com relacionamentos  
**Para que** disciplinas possam ser gerenciadas

### Critérios de Aceitação

- [ ] `src/models/Subject.js` implementado com:
  - Campos: id, nome
  - Validação: nome notEmpty
  - Relacionamento `belongsToMany` com Class via ClassSubject
  - Relacionamento `hasMany` com Grade

### Definição de Pronto (DoD)

- Model registrado no index
- Associações definidas
- Pode criar e listar disciplinas

---

## Story 4.2: Controller de Disciplinas - CREATE e READ

**Como** administrador  
**Quero** criar e listar disciplinas  
**Para que** eu possa definir o currículo escolar

### Critérios de Aceitação

- [ ] `src/controllers/subjectController.js` criado
- [ ] Função `create` implementada:
  - Valida nome obrigatório
  - Cria disciplina
  - Status 201
- [ ] Função `getAll` implementada:
  - Lista todas disciplinas ordenadas alfabeticamente
  - Status 200

### Request/Response

**CREATE:**
```http
POST /api/subjects
Authorization: Bearer <token>

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

**GET ALL:**
```http
GET /api/subjects
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  { "id": 4, "nome": "Geografia" },
  { "id": 3, "nome": "História" },
  { "id": 1, "nome": "Matemática" },
  { "id": 2, "nome": "Português" }
]
```

---

## Story 4.3: Controller de Disciplinas - GET BY ID

**Como** administrador  
**Quero** buscar uma disciplina específica  
**Para que** eu veja seus detalhes

### Critérios de Aceitação

- [ ] Função `getById` implementada:
  - Busca disciplina por ID
  - Retorna 404 se não encontrada
  - Status 200

### Request/Response

```http
GET /api/subjects/1
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "id": 1,
  "nome": "Matemática",
  "createdAt": "2025-11-20T10:00:00.000Z",
  "updatedAt": "2025-11-20T10:00:00.000Z"
}
```

---

## Story 4.4: Controller de Disciplinas - UPDATE

**Como** administrador  
**Quero** atualizar o nome de uma disciplina  
**Para que** eu possa corrigir erros de digitação

### Critérios de Aceitação

- [ ] Função `update` implementada:
  - Valida nome não vazio
  - Atualiza disciplina
  - Retorna 404 se não encontrada
  - Status 200

### Request/Response

```http
PUT /api/subjects/1
Authorization: Bearer <token>

{
  "nome": "Matemática Avançada"
}
```

**Response (200):**
```json
{
  "message": "Disciplina atualizada com sucesso",
  "data": {
    "id": 1,
    "nome": "Matemática Avançada",
    "updatedAt": "2025-11-20T15:30:00.000Z"
  }
}
```

---

## Story 4.5: Controller de Disciplinas - DELETE

**Como** administrador  
**Quero** deletar uma disciplina  
**Para que** eu possa remover disciplinas obsoletas

### Critérios de Aceitação

- [ ] Função `remove` implementada:
  - Busca disciplina com notas incluídas
  - Impede deleção se tiver notas (status 400)
  - Deleta se não tiver notas
  - Retorna 404 se não encontrada
  - Status 200

### Request/Response

```http
DELETE /api/subjects/1
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Disciplina deletada com sucesso"
}
```

**Response (400) - com notas:**
```json
{
  "error": "Não é possível deletar disciplina com notas cadastradas"
}
```

---

## Story 4.6: Rotas de Disciplinas

**Como** desenvolvedor  
**Quero** configurar todas as rotas de disciplinas  
**Para que** o CRUD esteja completo

### Critérios de Aceitação

- [ ] `src/routes/subjectRoutes.js` criado
- [ ] Rotas protegidas com `authenticateToken`
- [ ] Rotas configuradas:
  - `POST /` → create
  - `GET /` → getAll
  - `GET /:id` → getById
  - `PUT /:id` → update
  - `DELETE /:id` → remove
- [ ] Registrado em index como `/api/subjects`

### Definição de Pronto (DoD)

- Todos endpoints funcionais
- CRUD completo testado
- Validações funcionando

---

**Epic 4 Completo quando:**
- ✅ CRUD completo de disciplinas funcional
- ✅ Validações de integridade funcionando
- ✅ Pode deletar apenas disciplinas sem notas
