# 🏫 API REST - Sistema de Gestão Escolar

API REST para gerenciamento de notas escolares desenvolvida com Node.js, Express, Sequelize e PostgreSQL.

## 📋 Stack Tecnológico

- **Node.js** v18+
- **Express.js** 4.x
- **Sequelize** 6.x (ORM)
- **PostgreSQL** 14+
- **JWT** (Autenticação)
- **ES Modules**

git clone <url-do-repo>
## 🚀 Como Rodar o Projeto

### Pré-requisitos

- Node.js v18+ (ou superior)
- PostgreSQL 14+ em execução
- npm ou yarn

### Passo a passo

```bash
# 1. Clonar e instalar dependências
git clone <url-do-repo>
cd desaftio-sequelize
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env
# Atualize os valores conforme seu ambiente

# 3. Rodar migrations no banco configurado
npm run db:migrate

# 4. Subir servidor
npm run dev   # desenvolvimento
# ou
npm start     # produção
```

## 📁 Estrutura do Projeto

```
src/
├── config/         # Configurações (database, jwt)
├── models/         # Models do Sequelize
├── migrations/     # Migrations do banco
├── seeders/        # Seeds (dados iniciais)
├── middlewares/    # Middlewares (auth, error handling)
├── controllers/    # Controllers (lógica de rotas)
├── services/       # Services (lógica de negócio)
├── routes/         # Definição de rotas
├── utils/          # Utilitários
├── app.js          # Configuração do Express
└── server.js       # Inicialização do servidor
```

## 🔧 Scripts Disponíveis

```bash
npm run dev              # Inicia servidor em modo desenvolvimento
npm start                # Inicia servidor em produção
npm run db:migrate       # Executa todas migrations pendentes
npm run db:migrate:undo  # Desfaz a última migration aplicada
```

## 🌐 Documentação da API

- A lista completa de **25 endpoints** com exemplos de requisição/resposta, códigos de status e observações está em [`docs/API.md`](docs/API.md).
- Todos os endpoints (exceto `/api/health` e `/api/auth/*`) exigem header `Authorization: Bearer <token>`.

### Endpoints essenciais

| Recurso      | Método/rota principal                | Descrição resumida                         |
|--------------|--------------------------------------|-------------------------------------------|
| Health       | `GET /api/health`                    | Status do serviço                         |
| Auth         | `POST /api/auth/register`, `POST /api/auth/login` | Cadastro e login com JWT        |
| Turmas       | `POST /api/classes` (CRUD completo)  | Gestão de turmas + associação de disciplinas |
| Disciplinas  | `POST /api/subjects` (CRUD completo) | Cadastro de disciplinas                    |
| Alunos       | `POST /api/students` (CRUD completo) | Matrícula e gestão de alunos               |
| Notas        | `POST /api/grades` (CRUD completo)   | Lançamento de notas com média automática   |
| Boletim      | `GET /api/boletim/:studentId`        | Relatório completo por aluno               |

Para detalhes (payloads, respostas de erro, cenários especiais), consulte o arquivo de documentação citado acima.

## 📝 Variáveis de Ambiente

Configure o `.env` com base em `.env.example`. Campos essenciais:

| Variável           | Descrição                                |
|--------------------|------------------------------------------|
| `NODE_ENV`         | Ambiente (`development`, `production`)   |
| `PORT`             | Porta HTTP do servidor                   |
| `DB_HOST/USER/PASS/NAME` | Credenciais do PostgreSQL         |
| `JWT_SECRET`       | Segredo usado para assinar tokens JWT    |
| `JWT_EXPIRES_IN`   | Tempo de expiração do token (ex.: `1d`)  |

> Sempre reinicie o servidor após alterar variáveis sensíveis.

## 🧪 Testando a API

1. Registre um usuário admin via `POST /api/auth/register`.
2. Faça login em `POST /api/auth/login` para obter o JWT.
3. Use o token nas rotas protegidas (`Authorization: Bearer <token>`).
4. Crie dados seguindo a ordem: turmas → disciplinas → alunos → notas → boletim.

Ferramentas recomendadas: Insomnia, Postman ou VS Code REST Client (`.http`).

## 👥 Desenvolvimento

- Metodologia BMAD-METHOD com épicos e stories documentados em `docs/stories/`.
- Casos de uso, PRD e arquitetura estão em `docs/`.

Para entender endpoints e fluxos, leia primeiro `docs/API.md` e o PRD.

## 📄 Licença

ISC
