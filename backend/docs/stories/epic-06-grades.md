# Epic 6: Sistema de Notas

**Objetivo:** Implementar CRUD de notas com cálculo automático de médias

**Status:** 📝 Draft  
**Prioridade:** 🔴 Crítica  
**Estimativa Total:** 4-5 horas  
**Dependências:** Epics 1-5 completos

---

## Story 6.1: Model de Nota

**Como** desenvolvedor  
**Quero** criar o model Grade com validações de negócio  
**Para que** notas sejam armazenadas corretamente

### Critérios de Aceitação

- [ ] `src/models/Grade.js` implementado com:
  - Campos: id, studentId (FK), subjectId (FK), unidade, teste, prova, mediaUnidade
  - Validações:
    - studentId, subjectId, unidade: required
    - teste, prova: 0 a 10
    - unidade: 1 a 4 (enum)
  - Relacionamentos:
    - `belongsTo` Student
    - `belongsTo` Subject
  - Hook `beforeSave`: calcula mediaUnidade automaticamente
    - Fórmula: `(teste + prova) / 2`

### Código de Referência

```javascript
Grade.beforeCreate((grade) => {
  if (grade.teste !== null && grade.prova !== null) {
    grade.mediaUnidade = (grade.teste + grade.prova) / 2;
  }
});

Grade.beforeUpdate((grade) => {
  if (grade.teste !== null && grade.prova !== null) {
    grade.mediaUnidade = (grade.teste + grade.prova) / 2;
  }
});
```

### Definição de Pronto (DoD)

- Model registrado no index
- Validações funcionam
- mediaUnidade calculada automaticamente
- Não pode criar notas duplicadas (mesmo aluno + disciplina + unidade)

---

## Story 6.2: Service de Cálculo de Médias

**Como** desenvolvedor  
**Quero** um service que calcule médias finais  
**Para que** a lógica de negócio esteja centralizada

### Critérios de Aceitação

- [ ] `src/services/gradeService.js` criado
- [ ] Função `calculateFinalAverage(grades)` implementada:
  - Recebe array de 4 notas (uma por unidade)
  - Retorna média final: `(U1 + U2 + U3 + U4) / 4`
  - Retorna status de aprovação: `>= 7.0 ? "Aprovado" : "Reprovado"`
- [ ] Função `calculateRecuperacao(mediaFinal)`:
  - Calcula nota necessária na recuperação
  - Fórmula: `(50 - (mediaFinal * 6)) / 4`
  - Retorna nota arredondada com 2 decimais

### Código de Referência

```javascript
export const calculateFinalAverage = (grades) => {
  const sum = grades.reduce((acc, grade) => acc + grade.mediaUnidade, 0);
  const average = sum / grades.length;
  const status = average >= 7.0 ? 'Aprovado' : 'Reprovado';
  
  return {
    mediaFinal: parseFloat(average.toFixed(2)),
    status,
    notaRecuperacao: status === 'Reprovado' 
      ? calculateRecuperacao(average) 
      : null
  };
};
```

### Definição de Pronto (DoD)

- Service exporta funções corretamente
- Cálculos matematicamente corretos
- Retorna objetos estruturados

---

## Story 6.3: Controller de Notas - CREATE

**Como** administrador  
**Quero** cadastrar notas de alunos  
**Para que** o desempenho seja registrado

### Critérios de Aceitação

- [ ] `src/controllers/gradeController.js` criado
- [ ] Função `create` implementada:
  - Valida campos obrigatórios (studentId, subjectId, unidade, teste, prova)
  - Valida que aluno existe
  - Valida que disciplina existe
  - Valida que unidade está entre 1-4
  - Valida que teste e prova estão entre 0-10
  - Verifica se já existe nota para mesma combinação (student + subject + unidade)
  - Cria nota (mediaUnidade calculada automaticamente pelo hook)
  - Retorna nota criada com aluno e disciplina incluídos
  - Status 201
  - Status 400 se já existir nota
  - Status 404 se aluno ou disciplina não existir

### Request/Response

**Request:**
```http
POST /api/grades
Authorization: Bearer <token>

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
  "student": {
    "id": 1,
    "nome": "João Silva"
  },
  "subject": {
    "id": 1,
    "nome": "Matemática"
  },
  "createdAt": "2025-11-20T10:00:00.000Z"
}
```

**Response (400) - duplicada:**
```json
{
  "error": "Já existe nota cadastrada para este aluno nesta disciplina e unidade"
}
```

---

## Story 6.4: Controller de Notas - READ

**Como** administrador  
**Quero** listar e buscar notas  
**Para que** eu possa consultar o histórico

### Critérios de Aceitação

- [ ] Função `getAll` implementada:
  - Lista todas notas com aluno e disciplina
  - Ordenado por aluno, disciplina, unidade
  - Status 200
- [ ] Função `getById` implementada:
  - Busca nota por ID
  - Inclui aluno e disciplina
  - Retorna 404 se não encontrada
  - Status 200

### Request/Response

**GET ALL:**
```http
GET /api/grades
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "id": 1,
    "unidade": 1,
    "teste": 8.5,
    "prova": 7.0,
    "mediaUnidade": 7.75,
    "student": {
      "id": 1,
      "nome": "João Silva"
    },
    "subject": {
      "id": 1,
      "nome": "Matemática"
    }
  }
]
```

**GET BY ID:**
```http
GET /api/grades/1
Authorization: Bearer <token>
```

---

## Story 6.5: Controller de Notas - UPDATE

**Como** administrador  
**Quero** atualizar notas  
**Para que** eu possa corrigir erros de lançamento

### Critérios de Aceitação

- [ ] Função `update` implementada:
  - Pode atualizar teste e/ou prova
  - Valida que valores estão entre 0-10
  - Recalcula mediaUnidade automaticamente (via hook)
  - Retorna nota atualizada
  - Retorna 404 se não encontrada
  - Status 200

### Request/Response

```http
PUT /api/grades/1
Authorization: Bearer <token>

{
  "teste": 9.0,
  "prova": 8.5
}
```

**Response (200):**
```json
{
  "message": "Nota atualizada com sucesso",
  "data": {
    "id": 1,
    "unidade": 1,
    "teste": 9.0,
    "prova": 8.5,
    "mediaUnidade": 8.75,
    "updatedAt": "2025-11-20T15:30:00.000Z"
  }
}
```

---

## Story 6.6: Controller de Notas - DELETE

**Como** administrador  
**Quero** deletar notas  
**Para que** eu possa remover lançamentos incorretos

### Critérios de Aceitação

- [ ] Função `remove` implementada:
  - Busca nota por ID
  - Deleta nota
  - Retorna 404 se não encontrada
  - Status 200

### Request/Response

```http
DELETE /api/grades/1
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Nota deletada com sucesso"
}
```

---

## Story 6.7: Rotas de Notas

**Como** desenvolvedor  
**Quero** configurar todas as rotas de notas  
**Para que** o CRUD esteja completo

### Critérios de Aceitação

- [ ] `src/routes/gradeRoutes.js` criado
- [ ] Rotas protegidas com `authenticateToken`
- [ ] Rotas configuradas:
  - `POST /` → create
  - `GET /` → getAll
  - `GET /:id` → getById
  - `PUT /:id` → update
  - `DELETE /:id` → remove
- [ ] Registrado em index como `/api/grades`

### Definição de Pronto (DoD)

- Todos endpoints funcionais
- Validações funcionando
- mediaUnidade calculada automaticamente

---

**Epic 6 Completo quando:**
- ✅ CRUD completo de notas funcional
- ✅ Média de unidade calculada automaticamente
- ✅ Service de cálculo de médias implementado
- ✅ Validações de 0-10 e unidades 1-4 funcionando
