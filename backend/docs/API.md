# API - Sistema de Gestão Escolar

> Todas as rotas (exceto `/api/health` e `/api/auth/*`) exigem `Authorization: Bearer <token>` e `Content-Type: application/json` quando houver corpo.

## Sumário de Endpoints (25)

1. `GET /api/health`
2. `POST /api/auth/register`
3. `POST /api/auth/login`
4. `POST /api/classes`
5. `GET /api/classes`
6. `GET /api/classes/:id`
7. `PUT /api/classes/:id`
8. `DELETE /api/classes/:id`
9. `POST /api/classes/:id/subjects`
10. `POST /api/subjects`
11. `GET /api/subjects`
12. `GET /api/subjects/:id`
13. `PUT /api/subjects/:id`
14. `DELETE /api/subjects/:id`
15. `POST /api/students`
16. `GET /api/students`
17. `GET /api/students/:id`
18. `PUT /api/students/:id`
19. `DELETE /api/students/:id`
20. `POST /api/grades`
21. `GET /api/grades`
22. `GET /api/grades/:id`
23. `PUT /api/grades/:id`
24. `DELETE /api/grades/:id`
25. `GET /api/boletim/:studentId`

---

## 1. Health Check

### `GET /api/health`
- **Headers:** _nenhum_
- **Response 200**
```json
{
  "status": "ok",
  "timestamp": "2025-11-20T15:00:00.000Z"
}
```

---

## 2. Autenticação

### `POST /api/auth/register`
- **Headers:** `Content-Type: application/json`
- **Body**
```json
{
  "nome": "Admin",
  "email": "admin@escola.com",
  "password": "senha123"
}
```
- **Response 201**
```json
{
  "message": "Usuário criado com sucesso",
  "user": {
    "id": 1,
    "nome": "Admin",
    "email": "admin@escola.com",
    "createdAt": "2025-11-20T10:00:00.000Z"
  }
}
```
- **Response 400**
```json
{ "error": "Todos os campos são obrigatórios (nome, email, password)" }
```

### `POST /api/auth/login`
- **Body**
```json
{
  "email": "admin@escola.com",
  "password": "senha123"
}
```
- **Response 200**
```json
{
  "token": "<jwt>",
  "user": { "id": 1, "nome": "Admin", "email": "admin@escola.com" }
}
```
- **Response 401**
```json
{ "error": "Credenciais inválidas" }
```

---

## 3. Turmas (Classes)

### `POST /api/classes`
- **Headers:** `Authorization`
- **Body**
```json
{ "nome": "3º Ano A" }
```
- **Response 201**
```json
{ "id": 1, "nome": "3º Ano A", "createdAt": "2025-11-20T10:00:00.000Z", "updatedAt": "2025-11-20T10:00:00.000Z" }
```
- **Response 400**
```json
{ "error": "Nome da turma é obrigatório" }
```

### `GET /api/classes`
- **Response 200**
```json
[
  {
    "id": 1,
    "nome": "3º Ano A",
    "studentCount": 0,
    "students": []
  }
]
```

### `GET /api/classes/:id`
- **Response 200**
```json
{
  "id": 1,
  "nome": "3º Ano A",
  "students": [],
  "subjects": []
}
```
- **Response 404**
```json
{ "error": "Turma não encontrada" }
```

### `PUT /api/classes/:id`
- **Body**
```json
{ "nome": "3º Ano B" }
```
- **Response 200**
```json
{ "message": "Turma atualizada com sucesso", "data": { "id": 1, "nome": "3º Ano B" } }
```

### `DELETE /api/classes/:id`
- **Response 200**
```json
{ "message": "Turma deletada com sucesso" }
```
- **Response 400**
```json
{ "error": "Não é possível deletar turma com alunos vinculados", "details": "A turma possui 25 aluno(s)" }
```

### `POST /api/classes/:id/subjects`
- **Body**
```json
{ "subjectIds": [1, 2, 3] }
```
- **Response 200**
```json
{
  "message": "Disciplinas associadas com sucesso",
  "data": {
    "id": 1,
    "nome": "3º Ano A",
    "subjects": [ { "id": 1, "nome": "Matemática" } ]
  }
}
```
- **Response 400**
```json
{ "error": "subjectIds deve ser um array com pelo menos um ID" }
```

---

## 4. Disciplinas (Subjects)

### `POST /api/subjects`
- **Body**
```json
{ "nome": "Matemática" }
```
- **Response 201**
```json
{ "id": 1, "nome": "Matemática" }
```

### `GET /api/subjects`
- **Response 200**
```json
[
  { "id": 1, "nome": "Geografia" },
  { "id": 2, "nome": "História" }
]
```

### `GET /api/subjects/:id`
- **Response 200**
```json
{ "id": 1, "nome": "Matemática" }
```
- **Response 404**
```json
{ "error": "Disciplina não encontrada" }
```

### `PUT /api/subjects/:id`
- **Body**
```json
{ "nome": "Matemática Avançada" }
```
- **Response 200**
```json
{
  "message": "Disciplina atualizada com sucesso",
  "data": { "id": 1, "nome": "Matemática Avançada" }
}
```

### `DELETE /api/subjects/:id`
- **Response 200**
```json
{ "message": "Disciplina deletada com sucesso" }
```
- **Response 400**
```json
{ "error": "Não é possível deletar disciplina com notas cadastradas" }
```

---

## 5. Alunos (Students)

### `POST /api/students`
- **Body**
```json
{ "nome": "João Silva", "classId": 1 }
```
- **Response 201**
```json
{
  "id": 1,
  "nome": "João Silva",
  "classId": 1,
  "class": { "id": 1, "nome": "3º Ano A" }
}
```
- **Response 404**
```json
{ "error": "Turma não encontrada" }
```

### `GET /api/students`
- **Response 200**
```json
[
  {
    "id": 1,
    "nome": "João Silva",
    "class": { "id": 1, "nome": "3º Ano A" }
  }
]
```

### `GET /api/students/:id`
- **Response 200**
```json
{
  "id": 1,
  "nome": "João Silva",
  "class": { "id": 1, "nome": "3º Ano A" },
  "grades": [
    {
      "id": 10,
      "unidade": 1,
      "teste": 8.5,
      "prova": 7.0,
      "mediaUnidade": 7.75,
      "subject": { "id": 1, "nome": "Matemática" }
    }
  ]
}
```

### `PUT /api/students/:id`
- **Body**
```json
{ "nome": "João P. Silva", "classId": 2 }
```
- **Response 200**
```json
{
  "message": "Aluno atualizado com sucesso",
  "data": {
    "id": 1,
    "nome": "João P. Silva",
    "class": { "id": 2, "nome": "3º Ano B" }
  }
}
```

### `DELETE /api/students/:id`
- **Response 200**
```json
{ "message": "Aluno deletado com sucesso" }
```
- **Response 400**
```json
{ "error": "Não é possível deletar aluno com notas cadastradas", "details": "O aluno possui 2 nota(s)" }
```

---

## 6. Notas (Grades)

### `POST /api/grades`
- **Body**
```json
{
  "studentId": 1,
  "subjectId": 1,
  "unidade": 1,
  "teste": 8.5,
  "prova": 7.0
}
```
- **Response 201**
```json
{
  "id": 1,
  "studentId": 1,
  "subjectId": 1,
  "unidade": 1,
  "teste": 8.5,
  "prova": 7.0,
  "mediaUnidade": 7.75,
  "student": { "id": 1, "nome": "João Silva" },
  "subject": { "id": 1, "nome": "Matemática" }
}
```
- **Response 400**
```json
{ "error": "Já existe nota cadastrada para este aluno nesta disciplina e unidade" }
```

### `GET /api/grades`
- **Response 200**
```json
[
  {
    "id": 1,
    "unidade": 1,
    "teste": 8.5,
    "prova": 7.0,
    "mediaUnidade": 7.75,
    "student": { "id": 1, "nome": "João Silva" },
    "subject": { "id": 1, "nome": "Matemática" }
  }
]
```

### `GET /api/grades/:id`
- **Response 200**
```json
{ "id": 1, "unidade": 1, "teste": 8.5, "prova": 7.0, "mediaUnidade": 7.75 }
```
- **Response 404**
```json
{ "error": "Nota não encontrada" }
```

### `PUT /api/grades/:id`
- **Body**
```json
{ "teste": 9.0, "prova": 8.5 }
```
- **Response 200**
```json
{
  "message": "Nota atualizada com sucesso",
  "data": {
    "id": 1,
    "teste": 9.0,
    "prova": 8.5,
    "mediaUnidade": 8.75
  }
}
```

### `DELETE /api/grades/:id`
- **Response 200**
```json
{ "message": "Nota deletada com sucesso" }
```

---

## 7. Boletim

### `GET /api/boletim/:studentId`
- **Response 200**
```json
{
  "student": {
    "id": 1,
    "nome": "João Silva",
    "class": { "id": 1, "nome": "3º Ano A" }
  },
  "disciplines": [
    {
      "subjectId": 1,
      "subjectName": "Matemática",
      "grades": [
        { "unidade": 1, "teste": 8.5, "prova": 7.0, "media": 7.75 },
        { "unidade": 2, "teste": 6.0, "prova": 5.0, "media": 5.5 }
      ],
      "mediaFinal": 6.63,
      "status": "Reprovado",
      "notaRecuperacao": 5.25
    }
  ],
  "statusGeral": "Reprovado",
  "totalDisciplinas": 1,
  "disciplinasAprovadas": 0,
  "disciplinasRecuperacao": ["Matemática"]
}
```
- **Response 404**
```json
{ "error": "Aluno não encontrado" }
```
- **Casos especiais**
  - Aluno sem notas ⇒ `statusGeral`: "Sem notas" e `message` informativa.
  - Disciplina com menos de 4 notas ⇒ `status`: "Incompleto" + `unidadesFaltantes`.

---

## 8. Estrutura de Erros

| Status | Cenário                         | Exemplo                                                         |
|--------|---------------------------------|-----------------------------------------------------------------|
| 400    | Validação / dados inválidos     | `{ "error": "Nome da turma é obrigatório" }`                   |
| 401    | Token ausente/inválido          | `{ "error": "Token inválido ou expirado" }`                   |
| 404    | Recurso não encontrado          | `{ "error": "Aluno não encontrado" }`                         |
| 500    | Erro inesperado                 | `{ "error": "Erro interno do servidor" }`                     |

---

## 9. Observações

- Datas em ISO 8601 (UTC).
- Sempre enviar `Content-Type: application/json` quando houver corpo.
- JWT expira conforme `JWT_EXPIRES_IN` definido no `.env`.
- Rode `npm run db:migrate` antes de consumir a API.
