# 📋 Backlog de User Stories - Sistema Escola

**Projeto:** API REST de Gestão Escolar  
**Stack:** Node.js + Express + Sequelize + PostgreSQL  
**Status:** 📝 Pronto para desenvolvimento

---

## 📊 Visão Geral

### Resumo Executivo

Este backlog contém **40 user stories** organizadas em **7 épicos sequenciais**, cobrindo a implementação completa de uma API REST para gestão de notas escolares.

**Total de Endpoints:** 21  
**Estimativa Total:** 20-26 horas  
**Metodologia:** Desenvolvimento incremental com entregas por épico

---

## 🎯 Épicos e Estimativas

| # | Épico | Stories | Estimativa | Prioridade | Status |
|---|-------|---------|------------|------------|--------|
| 1 | Setup e Infraestrutura | 4 | 4-6h | 🔴 Crítica | 📝 Draft |
| 2 | Autenticação e Segurança | 5 | 3-4h | 🔴 Crítica | 📝 Draft |
| 3 | Gestão de Turmas | 7 | 3-4h | 🟡 Alta | 📝 Draft |
| 4 | Gestão de Disciplinas | 6 | 2-3h | 🟡 Alta | 📝 Draft |
| 5 | Gestão de Alunos | 6 | 2-3h | 🟡 Alta | 📝 Draft |
| 6 | Sistema de Notas | 7 | 4-5h | 🔴 Crítica | 📝 Draft |
| 7 | Relatório (Boletim) | 5 | 2-3h | 🟡 Alta | 📝 Draft |

---

## 📁 Estrutura de Documentação

Cada épico está detalhado em um arquivo próprio:

```
docs/stories/
├── epic-01-setup.md          # Setup inicial, banco, migrations
├── epic-02-auth.md           # Autenticação JWT
├── epic-03-classes.md        # CRUD Turmas
├── epic-04-subjects.md       # CRUD Disciplinas
├── epic-05-students.md       # CRUD Alunos
├── epic-06-grades.md         # CRUD Notas + cálculos
├── epic-07-boletim.md        # Relatório final
└── README.md                 # Este arquivo
```

---

## 🚀 Plano de Desenvolvimento

### Fase 1: Fundação (Epics 1-2)
**Objetivo:** Estrutura base e autenticação  
**Estimativa:** 7-10 horas  
**Entregáveis:**
- ✅ Projeto configurado e rodando
- ✅ Banco de dados com 6 tabelas
- ✅ Sistema de autenticação JWT funcional
- ✅ 2 endpoints públicos (register, login)

**Critério de Aceite Fase 1:**
- Servidor rodando sem erros
- Migrations aplicadas com sucesso
- Usuário consegue registrar e fazer login
- Token JWT validado corretamente

---

### Fase 2: Gestão Acadêmica (Epics 3-5)
**Objetivo:** CRUDs completos de entidades principais  
**Estimativa:** 7-10 horas  
**Entregáveis:**
- ✅ CRUD Turmas (6 endpoints)
- ✅ CRUD Disciplinas (5 endpoints)
- ✅ CRUD Alunos (5 endpoints)
- ✅ Associação Turma-Disciplina
- ✅ 16 endpoints protegidos

**Critério de Aceite Fase 2:**
- Todas operações CRUD funcionais
- Validações de integridade referencial
- Alunos vinculados a turmas
- Disciplinas associadas a turmas

---

### Fase 3: Sistema de Notas (Epic 6)
**Objetivo:** Gerenciamento de notas com cálculos  
**Estimativa:** 4-5 horas  
**Entregáveis:**
- ✅ CRUD Notas (5 endpoints)
- ✅ Cálculo automático de média de unidade
- ✅ Service de cálculo de médias finais
- ✅ Validações de notas (0-10, unidades 1-4)

**Critério de Aceite Fase 3:**
- Notas cadastradas com sucesso
- Média de unidade calculada automaticamente
- Validações de duplicação funcionando
- Não permite notas fora do range 0-10

---

### Fase 4: Relatórios (Epic 7)
**Objetivo:** Boletim completo com aprovação/reprovação  
**Estimativa:** 2-3 horas  
**Entregáveis:**
- ✅ Endpoint de boletim (1 endpoint)
- ✅ Cálculo de média final por disciplina
- ✅ Status de aprovação (>= 7.0)
- ✅ Cálculo de nota de recuperação
- ✅ Documentação completa da API

**Critério de Aceite Fase 4:**
- Boletim exibe todas disciplinas do aluno
- Médias finais calculadas corretamente
- Status de aprovação correto
- Identifica disciplinas para recuperação

---

## 📝 Padrão de User Story

Cada story segue o formato:

```markdown
## Story X.Y: Título

**Como** <persona>
**Quero** <funcionalidade>
**Para que** <benefício>

### Critérios de Aceitação
- [ ] Critério 1
- [ ] Critério 2

### Request/Response
<exemplos de API>

### Definição de Pronto (DoD)
- Lista de verificação final
```

---

## 🔗 Dependências entre Épicos

```
Epic 1 (Setup)
    ↓
Epic 2 (Auth)
    ↓
Epic 3 (Turmas) ←→ Epic 4 (Disciplinas)
    ↓                    ↓
Epic 5 (Alunos)
    ↓
Epic 6 (Notas)
    ↓
Epic 7 (Boletim)
```

**Regras de Dependência:**
- Epic 2 só pode iniciar após Epic 1 completo
- Epics 3 e 4 podem ser desenvolvidos em paralelo após Epic 2
- Epic 5 requer Epic 3 completo (aluno precisa de turma)
- Epic 6 requer Epics 3, 4 e 5 completos
- Epic 7 requer Epic 6 completo

---

## 📊 Cobertura de Requisitos

### Requisitos Funcionais (PRD)

| RF | Descrição | Épicos | Stories |
|----|-----------|--------|---------|
| RF01 | Autenticação JWT | Epic 2 | 2.1-2.5 |
| RF02 | CRUD Turmas | Epic 3 | 3.1-3.7 |
| RF03 | CRUD Disciplinas | Epic 4 | 4.1-4.6 |
| RF04 | CRUD Alunos | Epic 5 | 5.1-5.6 |
| RF05 | CRUD Notas | Epic 6 | 6.1-6.7 |
| RF06 | Boletim | Epic 7 | 7.1-7.5 |

**Cobertura:** 100% dos requisitos funcionais

---

## 🎯 Endpoints por Épico

### Epic 2: Autenticação (2 endpoints)
- `POST /api/auth/register` - Registro
- `POST /api/auth/login` - Login

### Epic 3: Turmas (6 endpoints)
- `POST /api/classes` - Criar turma
- `GET /api/classes` - Listar turmas
- `GET /api/classes/:id` - Buscar turma
- `PUT /api/classes/:id` - Atualizar turma
- `DELETE /api/classes/:id` - Deletar turma
- `POST /api/classes/:id/subjects` - Associar disciplinas

### Epic 4: Disciplinas (5 endpoints)
- `POST /api/subjects` - Criar disciplina
- `GET /api/subjects` - Listar disciplinas
- `GET /api/subjects/:id` - Buscar disciplina
- `PUT /api/subjects/:id` - Atualizar disciplina
- `DELETE /api/subjects/:id` - Deletar disciplina

### Epic 5: Alunos (5 endpoints)
- `POST /api/students` - Criar aluno
- `GET /api/students` - Listar alunos
- `GET /api/students/:id` - Buscar aluno
- `PUT /api/students/:id` - Atualizar aluno
- `DELETE /api/students/:id` - Deletar aluno

### Epic 6: Notas (5 endpoints)
- `POST /api/grades` - Criar nota
- `GET /api/grades` - Listar notas
- `GET /api/grades/:id` - Buscar nota
- `PUT /api/grades/:id` - Atualizar nota
- `DELETE /api/grades/:id` - Deletar nota

### Epic 7: Boletim (1 endpoint)
- `GET /api/boletim/:studentId` - Gerar boletim

**Total:** 21 endpoints + 1 health check

---

## ✅ Definição de Pronto (DoD) Global

Para uma story ser considerada "Done":

- [ ] Código implementado seguindo arquitetura em camadas
- [ ] Validações de entrada implementadas
- [ ] Tratamento de erros apropriado
- [ ] Endpoint testado manualmente (Postman/Insomnia)
- [ ] Respostas JSON padronizadas
- [ ] Status HTTP corretos
- [ ] Logs de erro no console
- [ ] Código commitado no Git

Para um épico ser considerado "Done":

- [ ] Todas stories do épico completas
- [ ] Critérios de aceite da fase validados
- [ ] Rotas registradas e funcionais
- [ ] Models e migrations aplicados
- [ ] Testes manuais realizados
- [ ] Documentação atualizada

---

## 🧪 Estratégia de Testes

### Testes Manuais (Postman/Insomnia)

Para cada endpoint, testar:

1. **Happy Path** - Dados válidos, operação bem-sucedida
2. **Validação** - Dados inválidos (campos obrigatórios, formato)
3. **Autorização** - Sem token, token inválido, token expirado
4. **Not Found** - Recursos inexistentes (404)
5. **Integridade** - Violação de FK, duplicação de unique

### Checklist de Testes por Epic

**Epic 2 (Auth):**
- [ ] Registrar usuário com sucesso
- [ ] Registrar com email duplicado (erro)
- [ ] Login com credenciais válidas
- [ ] Login com senha errada (erro)
- [ ] Acessar rota protegida sem token (erro)
- [ ] Acessar rota protegida com token válido

**Epic 3 (Turmas):**
- [ ] Criar turma válida
- [ ] Listar turmas
- [ ] Buscar turma existente
- [ ] Buscar turma inexistente (404)
- [ ] Atualizar nome de turma
- [ ] Deletar turma sem alunos
- [ ] Tentar deletar turma com alunos (erro)
- [ ] Associar disciplinas à turma

**Epic 4 (Disciplinas):**
- [ ] Criar disciplina válida
- [ ] Listar disciplinas ordenadas
- [ ] Atualizar disciplina
- [ ] Deletar disciplina sem notas
- [ ] Tentar deletar disciplina com notas (erro)

**Epic 5 (Alunos):**
- [ ] Criar aluno com turma válida
- [ ] Criar aluno com turma inexistente (erro)
- [ ] Listar alunos com turma incluída
- [ ] Buscar aluno com notas
- [ ] Mudar aluno de turma
- [ ] Deletar aluno sem notas
- [ ] Tentar deletar aluno com notas (erro)

**Epic 6 (Notas):**
- [ ] Criar nota válida (verificar média calculada)
- [ ] Criar nota com aluno inexistente (erro)
- [ ] Criar nota duplicada (erro)
- [ ] Criar nota com valor > 10 (erro)
- [ ] Listar notas com aluno e disciplina
- [ ] Atualizar nota (verificar recálculo de média)
- [ ] Deletar nota

**Epic 7 (Boletim):**
- [ ] Gerar boletim com 4 notas por disciplina
- [ ] Gerar boletim com disciplina incompleta
- [ ] Verificar cálculo de média final
- [ ] Verificar status de aprovação (>= 7.0)
- [ ] Verificar cálculo de recuperação
- [ ] Gerar boletim de aluno inexistente (erro)

---

## 📚 Referências

- **PRD:** `docs/prd.md` - Requisitos funcionais e de negócio
- **Arquitetura:** `docs/architecture.md` - Decisões técnicas e código
- **Desafio Original:** `desafio-escola-node.md` - Especificação inicial

---

## 🎓 Observações Importantes

### Escopo do Projeto

Este é um **projeto de estudo**, focado em:
- ✅ CRUDs completos e funcionais
- ✅ Autenticação básica com JWT
- ✅ Validações de integridade referencial
- ✅ Cálculos automáticos de médias
- ✅ Arquitetura em camadas bem definida

**NÃO inclui** (propositalmente):
- ❌ Rate limiting
- ❌ Soft delete
- ❌ Logging avançado (Winston, etc.)
- ❌ Testes automatizados (unit/integration)
- ❌ Documentação Swagger/OpenAPI
- ❌ Deploy em produção

### Próximos Passos

Após completar todas stories:

1. **Revisar** código para consistência
2. **Testar** todos endpoints manualmente
3. **Documentar** exemplos de uso
4. **Commitar** código final
5. **(Opcional)** Adicionar seeds para dados de exemplo
6. **(Opcional)** Criar collection Postman exportável

---

## 📞 Comandos para Iniciar Desenvolvimento

```bash
# Ativar Dev agent
/dev

# Começar pelo Epic 1, Story 1.1
Implementar story 1.1 do epic-01-setup.md

# Após completar cada story
Implementar próxima story: [número]

# Após completar cada epic
Validar epic completo: [número]
```

---

**Backlog criado por:** Scrum Master (BMAD-METHOD)  
**Data:** 2025-01-20  
**Versão:** 1.0  
**Status:** ✅ Pronto para desenvolvimento

---

## 🎯 Começar Agora

Para iniciar o desenvolvimento:

1. **Leia** `docs/stories/epic-01-setup.md`
2. **Execute** `/dev`
3. **Peça** para implementar story 1.1

Bom desenvolvimento! 🚀
