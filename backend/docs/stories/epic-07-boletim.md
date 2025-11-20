# Epic 7: Relatório de Boletim

**Objetivo:** Implementar endpoint de boletim com médias finais e status de aprovação

**Status:** 📝 Draft  
**Prioridade:** 🟡 Alta  
**Estimativa Total:** 2-3 horas  
**Dependências:** Epics 1-6 completos

---

## Story 7.1: Service de Boletim

**Como** desenvolvedor  
**Quero** um service que gere o boletim completo  
**Para que** a lógica de agregação esteja centralizada

### Critérios de Aceitação

- [ ] `src/services/boletimService.js` criado
- [ ] Função `generateBoletim(studentId)` implementada:
  - Busca aluno com turma e todas notas
  - Agrupa notas por disciplina
  - Para cada disciplina:
    - Coleta 4 notas (uma por unidade)
    - Calcula média final usando gradeService
    - Calcula nota necessária para recuperação se reprovado
  - Retorna estrutura completa do boletim
  - Status geral: "Aprovado" se todas disciplinas >= 7.0
  - Lista disciplinas de recuperação se necessário

### Estrutura de Retorno

```javascript
{
  student: {
    id: 1,
    nome: "João Silva",
    class: {
      id: 1,
      nome: "3º Ano A"
    }
  },
  disciplines: [
    {
      subjectId: 1,
      subjectName: "Matemática",
      grades: [
        { unidade: 1, teste: 8.5, prova: 7.0, media: 7.75 },
        { unidade: 2, teste: 6.0, prova: 5.0, media: 5.5 },
        { unidade: 3, teste: 7.5, prova: 8.0, media: 7.75 },
        { unidade: 4, teste: 6.0, prova: 7.0, media: 6.5 }
      ],
      mediaFinal: 6.875,
      status: "Reprovado",
      notaRecuperacao: 5.25
    }
  ],
  statusGeral: "Reprovado",
  totalDisciplinas: 4,
  disciplinasAprovadas: 3,
  disciplinasRecuperacao: ["Matemática"]
}
```

### Definição de Pronto (DoD)

- Service retorna estrutura completa
- Cálculos corretos em todas disciplinas
- Identifica disciplinas de recuperação

---

## Story 7.2: Controller de Boletim

**Como** administrador  
**Quero** consultar o boletim de um aluno  
**Para que** eu veja seu desempenho geral

### Critérios de Aceitação

- [ ] `src/controllers/boletimController.js` criado
- [ ] Função `getBoletim` implementada:
  - Recebe studentId como parâmetro de rota
  - Valida que aluno existe
  - Chama boletimService.generateBoletim()
  - Retorna boletim completo
  - Retorna 404 se aluno não existe
  - Status 200

### Request/Response

**Request:**
```http
GET /api/boletim/1
Authorization: Bearer <token>
```

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
  "disciplines": [
    {
      "subjectId": 1,
      "subjectName": "Matemática",
      "grades": [
        {
          "unidade": 1,
          "teste": 8.5,
          "prova": 7.0,
          "media": 7.75
        },
        {
          "unidade": 2,
          "teste": 9.0,
          "prova": 8.0,
          "media": 8.5
        },
        {
          "unidade": 3,
          "teste": 7.0,
          "prova": 6.5,
          "media": 6.75
        },
        {
          "unidade": 4,
          "teste": 8.0,
          "prova": 7.5,
          "media": 7.75
        }
      ],
      "mediaFinal": 7.69,
      "status": "Aprovado",
      "notaRecuperacao": null
    },
    {
      "subjectId": 2,
      "subjectName": "Português",
      "grades": [
        {
          "unidade": 1,
          "teste": 6.0,
          "prova": 5.0,
          "media": 5.5
        },
        {
          "unidade": 2,
          "teste": 5.5,
          "prova": 6.0,
          "media": 5.75
        },
        {
          "unidade": 3,
          "teste": 7.0,
          "prova": 6.5,
          "media": 6.75
        },
        {
          "unidade": 4,
          "teste": 6.0,
          "prova": 7.0,
          "media": 6.5
        }
      ],
      "mediaFinal": 6.13,
      "status": "Reprovado",
      "notaRecuperacao": 6.37
    }
  ],
  "statusGeral": "Reprovado",
  "totalDisciplinas": 2,
  "disciplinasAprovadas": 1,
  "disciplinasRecuperacao": ["Português"]
}
```

**Response (404):**
```json
{
  "error": "Aluno não encontrado"
}
```

---

## Story 7.3: Validações de Boletim

**Como** sistema  
**Quero** validar regras de negócio do boletim  
**Para que** dados inconsistentes sejam tratados

### Critérios de Aceitação

- [ ] Validação implementada: disciplina sem 4 notas
  - Se disciplina tem menos de 4 notas (uma por unidade)
  - Não calcula média final
  - Status: "Incompleto"
  - Exibe quais unidades faltam

- [ ] Validação implementada: aluno sem notas
  - Se aluno não tem nenhuma nota cadastrada
  - Retorna boletim vazio com mensagem apropriada

### Response (Disciplina Incompleta):

```json
{
  "subjectId": 3,
  "subjectName": "História",
  "grades": [
    { "unidade": 1, "teste": 7.0, "prova": 8.0, "media": 7.5 },
    { "unidade": 2, "teste": 6.0, "prova": 7.0, "media": 6.5 }
  ],
  "mediaFinal": null,
  "status": "Incompleto",
  "unidadesFaltantes": [3, 4],
  "notaRecuperacao": null
}
```

---

## Story 7.4: Rotas de Boletim

**Como** desenvolvedor  
**Quero** configurar a rota de boletim  
**Para que** o endpoint esteja acessível

### Critérios de Aceitação

- [ ] `src/routes/boletimRoutes.js` criado
- [ ] Rota protegida com `authenticateToken`
- [ ] Rota configurada:
  - `GET /:studentId` → getBoletim
- [ ] Registrado em index como `/api/boletim`

### Definição de Pronto (DoD)

- Endpoint funcional
- Retorna boletim completo
- Validações funcionando

---

## Story 7.5: Documentação Final da API

**Como** desenvolvedor  
**Quero** documentar todos os endpoints  
**Para que** a API seja fácil de usar

### Critérios de Aceitação

- [ ] Criar `docs/API.md` com:
  - Lista de todos 21 endpoints
  - Exemplos de request/response para cada um
  - Códigos de status
  - Headers necessários (Authorization)
  - Estrutura de erros
  
- [ ] Atualizar README.md com:
  - Como rodar o projeto
  - Como configurar .env
  - Como rodar migrations
  - Como testar a API
  - Lista de endpoints (link para API.md)

### Definição de Pronto (DoD)

- Documentação completa e clara
- Exemplos funcionais
- README atualizado

---

**Epic 7 Completo quando:**
- ✅ Endpoint de boletim funcional
- ✅ Cálculo de médias finais correto
- ✅ Identificação de disciplinas para recuperação
- ✅ Validação de notas incompletas
- ✅ Documentação completa da API
