
# Desafio de Desenvolvimento – Sistema Escolar (Node ESM + Sequelize + Express + JWT)

## 🎯 Objetivo
Criar uma API REST usando **Node.js com ES Modules**, **Express**, **Sequelize** e **PostgreSQL**, com autenticação usando **JWT**. O sistema deve modelar um ambiente escolar com Turmas, Disciplinas, Alunos e Notas por unidade.

---

## 🏫 Contexto do Sistema
- A escola possui **Turmas (Classes)**.
- Cada turma possui um conjunto de **Disciplinas**.
- Cada aluno pertence a **uma única Turma**.
- Todos os alunos de uma turma fazem **as mesmas disciplinas**.
- O ano letivo possui **4 unidades**, cada uma com:
  - 1 **teste**
  - 1 **prova**
- Média da unidade:  
  `media_unidade = (teste + prova) / 2`
- Média final:  
  `media_final = média das 4 unidades`
- Critério de aprovação:  
  **Aprovado se média_final >= 7**

---

## 🧩 Requisitos Técnicos
### Tecnologias obrigatórias:
- Node.js (ESM)
- Express
- Sequelize
- PostgreSQL
- JWT Auth
- bcrypt para senhas

---

## 🔐 Autenticação
Criar sistema de usuários com as rotas:

### Rotas:
- `POST /auth/register` — cria usuário admin
- `POST /auth/login` — retorna JWT

Todas as rotas abaixo requerem autenticação via JWT.

---

## 🗄️ Modelagem do Banco

### **1. Turma (Class)**
- id  
- nome

### **2. Disciplina (Subject)**
- id  
- nome

### **3. Aluno (Student)**
- id  
- nome  
- classId (FK)

### **4. Nota (Grade)**
- id  
- studentId (FK)  
- subjectId (FK)  
- unidade (1–4)  
- teste  
- prova  
- mediaUnidade

---

## 🔧 CRUDs Obrigatórios

### **Turmas**
- `POST /classes`
- `GET /classes`
- `POST /classes/:id/subjects` — relacionar disciplinas à turma

### **Disciplinas**
- `POST /subjects`
- `GET /subjects`

### **Alunos**
- `POST /students`
- `GET /students`

### **Notas**
- `POST /grades`
  - registrar notas por unidade e disciplina

### **Relatório (Boletim)**
- `GET /students/:id/boletim`
  - retorna média por disciplina, média final e aprovação

---

## 🧠 Aprendizado Explorados
- Relacionamentos no Sequelize: 1:N e N:N
- JWT Auth
- Validação de regras de negócio
- Cálculos de médias
- Estruturação de API REST

---

## 📦 Extras (Opcional)
- Soft delete
- Paginação
- Docker Compose com PostgreSQL
- RBAC (admin/user)
- Seeders automáticos

---

## 📝 Entregáveis
- Repositório GitHub
- README com instruções
- Collection do Insomnia/Postman (opcional)

---

Se quiser, posso gerar também:
- Diagramas
- Estrutura inicial do projeto
- Migrations e models base
