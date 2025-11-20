# Epic 5: Gestão de Alunos (CRUD Completo)

**Objetivo:** Implementar CRUD completo de alunos com validação de turma

**Status:** 📝 Draft  
**Prioridade:** 🟡 Alta  
**Estimativa Total:** 2-3 horas  
**Dependências:** Epic 1, 2, 3 completos

---

## Story 5.1: Model de Aluno

**Como** desenvolvedor  
**Quero** criar o model Student com relacionamentos  
**Para que** alunos possam ser cadastrados no sistema

### Critérios de Aceitação

- [ ] `src/models/Student.js` implementado com:
  - Campos: id, nome, classId (FK)
  - Validações: nome notEmpty, classId required
  - Relacionamento `belongsTo` com Class
  - Relacionamento `hasMany` com Grade

### Definição de Pronto (DoD)

- Model registrado no index
- Associações definidas
- FK para classes funcional

---

## Story 5.2: Controller de Alunos - CREATE e READ

**Como** administrador  
**Quero** cadastrar e listar alunos  
**Para que** eu possa gerenciar a matrícula

### Critérios de Aceitação

- [ ] `src/controllers/studentController.js` criado
- [ ] Função `create` implementada:
  - Valida nome e classId obrigatórios
  - Verifica se turma existe
  - Cria aluno vinculado à turma
  - Retorna aluno com dados da turma
  - Status 201
  - Status 404 se turma não existe
- [ ] Função `getAll` implementada:
  - Lista todos alunos com turma incluída
  - Ordenado alfabeticamente
  - Status 200

### Request/Response

**CREATE:**
```http
POST /api/students
Authorization: Bearer <token>

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

**GET ALL:**
```http
GET /api/students
Authorization: Bearer <token>
```

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
    }
  }
]
```

---

## Story 5.3: Controller de Alunos - GET BY ID

**Como** administrador  
**Quero** buscar um aluno específico  
**Para que** eu veja seus detalhes completos com notas

### Critérios de Aceitação

- [ ] Função `getById` implementada:
  - Busca aluno por ID
  - Inclui turma e notas
  - Notas incluem disciplinas
  - Retorna 404 se não encontrado
  - Status 200

### Request/Response

```http
GET /api/students/1
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "id": 1,
  "nome": "João Silva",
  "classId": 1,
  "class": {
    "id": 1,
    "nome": "3º Ano A"
  },
  "grades": [
    {
      "id": 1,
      "unidade": 1,
      "teste": 8.5,
      "prova": 7.0,
      "mediaUnidade": 7.75,
      "subject": {
        "id": 1,
        "nome": "Matemática"
      }
    }
  ]
}
```

---

## Story 5.4: Controller de Alunos - UPDATE

**Como** administrador  
**Quero** atualizar dados de um aluno  
**Para que** eu possa corrigir informações ou mudar de turma

### Critérios de Aceitação

- [ ] Função `update` implementada:
  - Pode atualizar nome e/ou classId
  - Valida nova turma se fornecida
  - Retorna aluno atualizado com turma
  - Retorna 404 se aluno ou turma não encontrados
  - Status 200

### Request/Response

```http
PUT /api/students/1
Authorization: Bearer <token>

{
  "nome": "João Pedro Silva",
  "classId": 2
}
```

**Response (200):**
```json
{
  "message": "Aluno atualizado com sucesso",
  "data": {
    "id": 1,
    "nome": "João Pedro Silva",
    "classId": 2,
    "class": {
      "id": 2,
      "nome": "3º Ano B"
    }
  }
}
```

---

## Story 5.5: Controller de Alunos - DELETE

**Como** administrador  
**Quero** deletar um aluno  
**Para que** eu possa remover alunos que saíram da escola

### Critérios de Aceitação

- [ ] Função `remove` implementada:
  - Busca aluno com notas incluídas
  - Impede deleção se tiver notas (status 400)
  - Deleta se não tiver notas
  - Retorna 404 se não encontrado
  - Status 200

### Request/Response

```http
DELETE /api/students/1
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Aluno deletado com sucesso"
}
```

**Response (400) - com notas:**
```json
{
  "error": "Não é possível deletar aluno com notas cadastradas",
  "details": "O aluno possui 12 nota(s)"
}
```

---

## Story 5.6: Rotas de Alunos

**Como** desenvolvedor  
**Quero** configurar todas as rotas de alunos  
**Para que** o CRUD esteja completo

### Critérios de Aceitação

- [ ] `src/routes/studentRoutes.js` criado
- [ ] Rotas protegidas com `authenticateToken`
- [ ] Rotas configuradas:
  - `POST /` → create
  - `GET /` → getAll
  - `GET /:id` → getById
  - `PUT /:id` → update
  - `DELETE /:id` → remove
- [ ] Registrado em index como `/api/students`

### Definição de Pronto (DoD)

- Todos endpoints funcionais
- Validação de turma funciona
- CRUD completo testado

---

**Epic 5 Completo quando:**
- ✅ CRUD completo de alunos funcional
- ✅ Aluno sempre vinculado a uma turma válida
- ✅ Pode atualizar turma do aluno
- ✅ Validações de integridade funcionando
