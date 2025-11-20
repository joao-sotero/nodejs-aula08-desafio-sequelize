# Fluxo e Regras dos Endpoints da API Escolar

> Documento derivado diretamente das controllers e services atuais. Use-o como referência principal para consumir ou testar a API.

## Convenções Gerais

- **Base URL:** `http://localhost:3000/api`
- **Headers padrão:**
	- `Content-Type: application/json` em requisições com corpo
	- `Authorization: Bearer <token>` em todas as rotas protegidas (todas exceto `/auth/register`, `/auth/login` e `/health`)
- **Autenticação:** token JWT é emitido pelo login e deve ser enviado até expirar.
- **Formato de erro:** `{"error": "mensagem"}` com `details` opcionais quando há contexto adicional.
- **IDs e números:** quando o backend espera inteiros positivos (ex.: `classId`, `subjectId`, `unidade`) valores não numéricos ou <= 0 recebem `400`.
- **Faixa de notas:** `teste` e `prova` devem estar entre 0 e 10, com até duas casas decimais.
- **Datas:** todas em ISO 8601 (UTC).

---

## 1. Saúde do serviço

### `GET /health`
- **Headers:** nenhum
- **Sucesso 200:**
	```json
	{ "status": "ok", "timestamp": "2025-11-20T15:00:00.000Z" }
	```

---

## 2. Autenticação

### `POST /auth/register`
- **Headers:** `Content-Type: application/json`
- **Body:**
	```json
	{ "nome": "Admin", "email": "admin@escola.com", "password": "senha123" }
	```
- **Regras:** todos os campos obrigatórios; falha se email já existir.
- **201:** retorna usuário sem senha.
- **400:** campos faltando ou email duplicado.

### `POST /auth/login`
- **Headers:** `Content-Type: application/json`
- **Body:**
	```json
	{ "email": "admin@escola.com", "password": "senha123" }
	```
- **Regras:** credenciais inválidas geram `401`.
- **200:**
	```json
	{ "token": "<jwt>", "user": { "id": 1, "nome": "Admin", "email": "admin@escola.com" } }
	```

---

## 3. Turmas (`classController`)

### `POST /classes`
- **Headers:** `Authorization`, `Content-Type`
- **Body:** `{ "nome": "1º Ano A" }`
- **Regras:** nome obrigatório e não pode ser apenas espaços.
- **201:** retorna turma criada.
- **400:** mensagem "Nome da turma é obrigatório".

### `GET /classes`
- **Headers:** `Authorization`
- **Retorno 200:** lista ordenada por nome com `students` (se o model estiver carregado) e campo auxiliar `studentCount`.

### `GET /classes/:id`
- **Headers:** `Authorization`
- **Retorno 200:** inclui alunos e disciplinas vinculados.
- **404:** "Turma não encontrada".

### `PUT /classes/:id`
- **Body:** `{ "nome": "1º Ano B" }`
- **Regras:** nome obrigatório; falha se turma não existir.
- **200:** `{ "message": "Turma atualizada com sucesso", "data": { ... } }`

### `DELETE /classes/:id`
- **Regras:** impede exclusão se houver alunos vinculados; retorna `400` com `details`.
- **200:** "Turma deletada com sucesso".

### `POST /classes/:id/subjects`
- **Body:** `{ "subjectIds": [1,2,3] }`
- **Regras:**
	- `subjectIds` deve ser array com pelo menos um inteiro positivo.
	- IDs inexistentes retornam `400` com lista de inválidos.
	- Usa `setSubjects`, portanto substitui as associações anteriores da turma.
- **200:** traz turma com disciplinas atualizadas.

---

## 4. Disciplinas (`subjectController`)

### `POST /subjects`
- **Body:** `{ "nome": "Matemática" }`
- **Regras:** nome obrigatório.
- **201:** disciplina criada.

### `GET /subjects`
- Retorna lista ordenada alfabeticamente.

### `GET /subjects/:id`
- **404:** quando não encontrada.

### `PUT /subjects/:id`
- **Body:** `{ "nome": "Matemática Avançada" }`
- **200:** inclui mensagem e dados atualizados.

### `DELETE /subjects/:id`
- **Regras:** bloqueia exclusão se existir nota (`Grade`) ligada à disciplina.
- **400:** "Não é possível deletar disciplina com notas cadastradas".

---

## 5. Alunos (`studentController`)

### `POST /students`
- **Body mínimo:** `{ "nome": "João Silva", "classId": 1 }`
- **Regras:**
	- `nome` obrigatório e trimado.
	- `classId` obrigatório, inteiro e precisa existir.
- **201:** retorna aluno com dados da turma.
- **404:** "Turma não encontrada" se `classId` inválido.

### `GET /students`
- Lista todos os alunos com dados básicos da turma.

### `GET /students/:id`
- Inclui turma e, se o model estiver carregado, notas com disciplina correspondente.
- **404:** "Aluno não encontrado".

### `PUT /students/:id`
- **Body:** campos opcionais `nome` e/ou `classId`.
- **Regras:** ao menos um campo informado; `classId` segue mesmas validações da criação; `nome` não pode ser vazio.
- **200:** retorna mensagem + aluno atualizado.

### `DELETE /students/:id`
- **Regras:** impede exclusão caso haja notas associadas (retorna quantidade em `details`).
- **200:** "Aluno deletado com sucesso".

---

## 6. Notas (`gradeController`)

### `POST /grades`
- **Body completo:**
	```json
	{
		"studentId": 1,
		"subjectId": 5,
		"unidade": 1,
		"teste": 8.5,
		"prova": 7
	}
	```
- **Regras:**
	- Todos os campos obrigatórios.
	- `studentId` e `subjectId` inteiros existentes.
	- `unidade` é inteiro entre 1 e 4.
	- `teste` e `prova` entre 0 e 10.
	- Bloqueia duplicidade por aluno + disciplina + unidade.
- **201:** retorna nota incluindo aluno e disciplina.
- **Erros comuns:**
	- `400` campos inválidos ou duplicidade.
	- `404` aluno ou disciplina inexistentes.

### `GET /grades`
- Lista todas as notas ordenadas por aluno, disciplina e unidade, incluindo relacionamentos.

### `GET /grades/:id`
- **404:** quando não encontrada.

### `PUT /grades/:id`
- **Body:** `{ "teste": 9, "prova": 8 }` (ao menos um campo).
- **Regras:** valores seguem faixa 0–10.
- **200:** mensagem + nota atualizada.

### `DELETE /grades/:id`
- Remove registro; `404` se já não existir.

---

## 7. Boletim (`boletimController` + `boletimService`)

### `GET /boletim/:studentId`
- **Headers:** `Authorization`
- **Regras:** `studentId` deve ser inteiro válido.
- **Processo:**
	- Carrega aluno, turma e notas com suas disciplinas.
	- Agrupa por disciplina e verifica se há notas para todas as 4 unidades.
	- Calcula média final via `gradeService` (média aritmética das `mediaUnidade`).
	- Determina status por disciplina (`Aprovado`, `Reprovado` ou `Incompleto`).
- **Respostas:**
	- **200:**
		```json
		{
			"student": { "id": 1, "nome": "João", "class": { "id": 2, "nome": "1º Ano A" } },
			"disciplines": [
				{
					"subjectId": 5,
					"subjectName": "Matemática",
					"grades": [ { "unidade": 1, "media": 8.5 } ],
					"mediaFinal": 8.5,
					"status": "Aprovado",
					"notaRecuperacao": null,
					"unidadesFaltantes": []
				}
			],
			"statusGeral": "Aprovado",
			"totalDisciplinas": 1,
			"disciplinasAprovadas": 1,
			"disciplinasRecuperacao": []
		}
		```
	- **Aluno sem notas:** `statusGeral = "Sem notas"` e `message` informando ausência de lançamentos.
	- **404:** quando aluno não existe.

---

## 8. Fluxo recomendando ponta a ponta

1. **Registrar** usuário e **realizar login** para obter o JWT.
2. **Criar turmas** e **disciplinas** necessárias.
3. **Associar disciplinas** às turmas via `/classes/:id/subjects`.
4. **Cadastrar alunos** apontando `classId` correto.
5. **Lançar notas** (`/grades`) respeitando regras de unidade e faixas de nota.
6. **Consultar boletim** para verificar médias, necessidades de recuperação e lacunas de unidades.

---

## 9. Referências úteis

- Documentação detalhada de todos os endpoints (inclusive payloads adicionais): `docs/API.md`.
- Coleção Postman pronta para importação: `docs/postman_collection.json`.
- Regras de negócio de médias e boletim: `src/services/gradeService.js` e `src/services/boletimService.js`.
