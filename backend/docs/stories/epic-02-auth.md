# Epic 2: Autenticação e Segurança

**Objetivo:** Implementar sistema de autenticação JWT com registro e login

**Status:** 📝 Draft  
**Prioridade:** 🔴 Crítica  
**Estimativa Total:** 3-4 horas  
**Dependências:** Epic 1 completo

---

## Story 2.1: Model de Usuário

**Como** desenvolvedor  
**Quero** criar o model User com validações e hash de senha  
**Para que** usuários possam ser criados de forma segura

### Critérios de Aceitação

- [ ] `src/models/User.js` implementado com:
  - Campos: id, nome, email, password
  - Validações:
    - nome: notEmpty
    - email: isEmail, unique
    - password: len [6, 100]
  - Hook `beforeCreate`: hash de senha com bcrypt (10 rounds)
  - Hook `beforeUpdate`: hash de senha se alterada
  - Método de instância: `validatePassword(password)` para comparação

### Definição de Pronto (DoD)

- Model registrado no `src/models/index.js`
- Senha nunca é armazenada em texto plano
- Validações funcionam (teste manual no console)

### Notas Técnicas

```javascript
User.beforeCreate(async (user) => {
  if (user.password) {
    user.password = await bcrypt.hash(user.password, 10);
  }
});
```

---

## Story 2.2: Auth Controller - Registro

**Como** administrador  
**Quero** criar uma conta no sistema  
**Para que** eu possa fazer login posteriormente

### Critérios de Aceitação

- [ ] `src/controllers/authController.js` criado
- [ ] Função `register` implementada:
  - Valida campos obrigatórios (nome, email, password)
  - Verifica se email já existe
  - Cria usuário no banco
  - Retorna dados do usuário (SEM senha)
  - Status 201 em sucesso
  - Status 400 para email duplicado

### Request/Response

**Request:**
```http
POST /api/auth/register
Content-Type: application/json

{
  "nome": "Admin Escola",
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
    "nome": "Admin Escola",
    "email": "admin@escola.com",
    "createdAt": "2025-11-20T10:00:00.000Z"
  }
}
```

### Definição de Pronto (DoD)

- Endpoint testado via Postman/Insomnia
- Senha armazenada hasheada no banco
- Email duplicado retorna erro apropriado
- Password não aparece na resposta

---

## Story 2.3: Auth Controller - Login

**Como** administrador  
**Quero** fazer login com email e senha  
**Para que** eu receba um token JWT para acessar a API

### Critérios de Aceitação

- [ ] Função `login` implementada em `authController.js`:
  - Valida campos obrigatórios (email, password)
  - Busca usuário por email
  - Compara senha com bcrypt
  - Gera token JWT com payload: { id, email }
  - Token expira conforme JWT_EXPIRES_IN
  - Retorna token e dados do usuário
  - Status 200 em sucesso
  - Status 401 para credenciais inválidas

### Request/Response

**Request:**
```http
POST /api/auth/login
Content-Type: application/json

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
    "nome": "Admin Escola",
    "email": "admin@escola.com"
  }
}
```

**Response (401):**
```json
{
  "error": "Credenciais inválidas"
}
```

### Definição de Pronto (DoD)

- Login com credenciais corretas retorna token válido
- Login com senha errada retorna 401
- Login com email inexistente retorna 401
- Token pode ser decodificado e contém id e email

---

## Story 2.4: Middleware de Autenticação

**Como** desenvolvedor  
**Quero** um middleware que valide tokens JWT  
**Para que** rotas protegidas só sejam acessadas por usuários autenticados

### Critérios de Aceitação

- [ ] `src/middlewares/auth.js` implementado
- [ ] Função `authenticateToken` valida:
  - Header `Authorization: Bearer <token>` presente
  - Token não expirado
  - Token assinado corretamente
  - Anexa dados do usuário em `req.user`
  - Retorna 401 se token ausente/inválido

### Definição de Pronto (DoD)

- Middleware extrai token do header corretamente
- Token válido: `req.user` contém { id, email }
- Token inválido: retorna 401 com mensagem apropriada
- Token expirado: retorna 401 com mensagem apropriada

### Código de Referência

```javascript
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(401).json({ error: 'Token inválido ou expirado' });
    }
    req.user = user;
    next();
  });
};
```

---

## Story 2.5: Rotas de Autenticação

**Como** desenvolvedor  
**Quero** configurar as rotas de autenticação  
**Para que** registro e login estejam acessíveis

### Critérios de Aceitação

- [ ] `src/routes/authRoutes.js` criado
- [ ] Rotas configuradas:
  - `POST /register` → authController.register
  - `POST /login` → authController.login
- [ ] Rotas registradas em `src/routes/index.js` como `/api/auth`
- [ ] Rotas de auth NÃO requerem autenticação

### Definição de Pronto (DoD)

- `POST /api/auth/register` funcional
- `POST /api/auth/login` funcional
- Ambas acessíveis sem token JWT
- Demais rotas (futuras) requerem autenticação

---

**Epic 2 Completo quando:**
- ✅ Usuário pode se registrar
- ✅ Usuário pode fazer login e receber JWT
- ✅ Middleware de autenticação valida tokens
- ✅ Sistema pronto para rotas protegidas
