# Epic 1: Setup e Infraestrutura

**Objetivo:** Configurar ambiente de desenvolvimento, estrutura do projeto e banco de dados

**Status:** 📝 Draft  
**Prioridade:** 🔴 Crítica  
**Estimativa Total:** 4-6 horas

---

## Story 1.1: Setup Inicial do Projeto

**Como** desenvolvedor  
**Quero** configurar a estrutura inicial do projeto Node.js  
**Para que** eu possa começar o desenvolvimento com uma base sólida

### Critérios de Aceitação

- [ ] Projeto inicializado com `npm init` (type: "module")
- [ ] Dependências instaladas:
  - express
  - sequelize
  - pg (PostgreSQL driver)
  - pg-hstore
  - jsonwebtoken
  - bcrypt
  - dotenv (gerenciamento de variáveis de ambiente)
- [ ] DevDependencies instaladas:
  - nodemon
  - sequelize-cli (CLI para migrations e seeds)
- [ ] Comando `npx sequelize-cli init` executado para criar estrutura do Sequelize
  - Cria automaticamente: config/, models/, migrations/, seeders/
- [ ] Estrutura de pastas completada manualmente:
  ```
  src/
  ├── config/         # (criado pelo sequelize-cli)
  ├── models/         # (criado pelo sequelize-cli)
  ├── migrations/     # (criado pelo sequelize-cli)
  ├── seeders/        # (criado pelo sequelize-cli)
  ├── middlewares/    # (criar manualmente)
  ├── controllers/    # (criar manualmente)
  ├── services/       # (criar manualmente)
  ├── routes/         # (criar manualmente)
  ├── utils/          # (criar manualmente)
  ├── app.js
  └── server.js
  ```
- [ ] Arquivo `.gitignore` criado (node_modules, .env, logs)
- [ ] Scripts no package.json:
  - `"dev": "nodemon src/server.js"`
  - `"start": "node src/server.js"`
  - `"db:migrate": "npx sequelize-cli db:migrate"`
  - `"db:migrate:undo": "npx sequelize-cli db:migrate:undo"`

### Definição de Pronto (DoD)

- Comando `npm run dev` inicia servidor sem erros
- Estrutura de pastas visível no projeto
- README.md básico criado

### Notas Técnicas

- Usar ES Modules (type: "module" no package.json)
- Node.js v18+ recomendado
- **Sequelize CLI:** `npx sequelize-cli init` cria a estrutura base automaticamente
- **Dotenv:** Importar com `import 'dotenv/config'` no topo do server.js

---

## Story 1.2: Configuração do Banco de Dados

**Como** desenvolvedor  
**Quero** configurar a conexão com PostgreSQL via Sequelize  
**Para que** a aplicação possa persistir dados

### Critérios de Aceitação

- [ ] Banco de dados PostgreSQL criado: `escola_db`
- [ ] Arquivo `.env` criado na raiz do projeto (não commitar)
- [ ] Arquivo `.env.example` criado com variáveis de exemplo:
  ```
  NODE_ENV=development
  PORT=3000
  DB_HOST=localhost
  DB_PORT=5432
  DB_USER=postgres
  DB_PASS=postgres
  DB_NAME=escola_db
  JWT_SECRET=seu-secret-super-seguro
  JWT_EXPIRES_IN=24h
  ```
- [ ] Arquivo `.sequelizerc` criado na raiz para configurar paths do Sequelize:
  ```javascript
  const path = require('path');
  
  module.exports = {
    'config': path.resolve('src', 'config', 'database.js'),
    'models-path': path.resolve('src', 'models'),
    'seeders-path': path.resolve('src', 'seeders'),
    'migrations-path': path.resolve('src', 'migrations')
  };
  ```
- [ ] `src/config/database.js` configurado com ES Modules:
  ```javascript
  import 'dotenv/config';
  
  export default {
    development: {
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      dialect: 'postgres'
    },
    // ... test e production
  };
  ```
- [ ] `src/config/jwt.js` implementado
- [ ] `src/models/index.js` ajustado para ES Modules (se necessário)
- [ ] Conexão testada com sucesso

### Definição de Pronto (DoD)

- Aplicação conecta ao banco sem erros
- Log "✅ Conexão com banco de dados estabelecida" aparece no console
- Comando `npm run dev` funciona

### Notas Técnicas

- **Sequelize-CLI Init:** O comando já criou a estrutura, apenas ajustar para ES Modules
- **Dotenv:** Carregar com `import 'dotenv/config'` no início dos arquivos de config
- **.sequelizerc:** Necessário para o CLI encontrar os paths corretos no src/
- Usar connection pooling padrão do Sequelize
- Configurar logging apenas em development

---

## Story 1.3: Middlewares Básicos e App Setup

**Como** desenvolvedor  
**Quero** configurar Express e middlewares globais  
**Para que** a API esteja pronta para receber requisições

### Critérios de Aceitação

- [ ] `src/app.js` implementado com:
  - `express.json()`
  - `express.urlencoded({ extended: true })`
  - CORS básico configurado
  - Rotas registradas em `/api`
  - 404 handler
  - Error handler como último middleware
- [ ] `src/server.js` implementado:
  - Carrega dotenv no topo: `import 'dotenv/config'`
  - Testa conexão com banco
  - Inicia servidor na porta configurada (process.env.PORT)
- [ ] `src/middlewares/errorHandler.js` implementado:
  - Trata erros do Sequelize (Validation, Unique, ForeignKey)
  - Trata erros customizados
  - Não expõe stack trace em produção
- [ ] `src/routes/index.js` criado (agregador de rotas)
- [ ] Health check endpoint implementado: `GET /api/health`

### Definição de Pronto (DoD)

- Servidor inicia sem erros
- `GET http://localhost:3000/api/health` retorna:
  ```json
  { "status": "OK", "timestamp": "2025-11-20T..." }
  ```
- Rota inexistente retorna 404 com JSON
- Erro genérico retorna 500 com JSON (sem stack em prod)

### Notas Técnicas

- **Dotenv:** Importar no topo do server.js: `import 'dotenv/config'`
- Usar middleware de erro com 4 parâmetros: `(err, req, res, next)`
- Logar erros no console para debugging
- PORT padrão: `process.env.PORT || 3000`

---

## Story 1.4: Migrations do Banco de Dados

**Como** desenvolvedor  
**Quero** criar todas as migrations do banco  
**Para que** o schema seja versionado e reproduzível

### Critérios de Aceitação

**6 Migrations criadas em ordem:**

1. **01-create-users.js**
   - [ ] Tabela `users` com: id, nome, email (unique), password, timestamps
   - [ ] Índice único em email

2. **02-create-classes.js**
   - [ ] Tabela `classes` com: id, nome, timestamps

3. **03-create-subjects.js**
   - [ ] Tabela `subjects` com: id, nome, timestamps

4. **04-create-students.js**
   - [ ] Tabela `students` com: id, nome, classId (FK), timestamps
   - [ ] FK para classes com RESTRICT on delete
   - [ ] Índice em classId

5. **05-create-grades.js**
   - [ ] Tabela `grades` com: id, studentId (FK), subjectId (FK), unidade, teste, prova, mediaUnidade, timestamps
   - [ ] FKs com CASCADE on delete
   - [ ] Índice único: (studentId, subjectId, unidade)
   - [ ] Índices em studentId e subjectId

6. **06-create-class-subjects.js**
   - [ ] Tabela `class_subjects` com: id, classId (FK), subjectId (FK), timestamps
   - [ ] Índice único: (classId, subjectId)
   - [ ] FKs com CASCADE on delete

### Definição de Pronto (DoD)

- Comando `npm run db:migrate` executa sem erros
- Todas as 6 tabelas criadas no banco
- Todos os índices e constraints aplicados
- Comando `npm run db:migrate:undo` desfaz migrations

### Notas Técnicas

- **Criar migrations:** `npx sequelize-cli migration:generate --name create-users`
- **Rodar migrations:** `npx sequelize-cli db:migrate`
- Usar `export default` para ES Modules
- Nomear migrations com prefixo numérico (01, 02, etc.) ou deixar o CLI gerar com timestamp
- FKs de grades usam CASCADE para facilitar remoção
- FKs de students usam RESTRICT para proteger dados
- Migrations ficam em `src/migrations/` (configurado no .sequelizerc)

---

**Epic 1 Completo quando:**
- ✅ Projeto estruturado e rodando
- ✅ Banco conectado e migrations aplicadas
- ✅ Health check funcionando
- ✅ Error handling configurado
