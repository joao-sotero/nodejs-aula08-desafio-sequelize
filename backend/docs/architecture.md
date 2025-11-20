# Arquitetura Técnica - Sistema Escolar de Gestão de Notas

## 1. Visão Geral da Arquitetura

### 1.1 Stack Tecnológica

**Backend:**
- Node.js v18+ (ES Modules)
- Express.js 4.x
- Sequelize 6.x (ORM)
- PostgreSQL 14+
- JWT (jsonwebtoken)
- bcrypt (hash de senhas)

**Ferramentas de Desenvolvimento:**
- nodemon (desenvolvimento)
- dotenv (variáveis de ambiente)
- ESLint (opcional - qualidade de código)

### 1.2 Padrão Arquitetural

**Layered Architecture (Arquitetura em Camadas)**

```
┌─────────────────────────────────┐
│      HTTP Client (Postman)      │
└────────────┬────────────────────┘
             │
┌────────────▼────────────────────┐
│      Routes (Endpoints)         │
└────────────┬────────────────────┘
             │
┌────────────▼────────────────────┐
│    Middlewares (Auth/Valid)     │
└────────────┬────────────────────┘
             │
┌────────────▼────────────────────┐
│     Controllers (Lógica)        │
└────────────┬────────────────────┘
             │
┌────────────▼────────────────────┐
│    Services (Regras Negócio)    │
└────────────┬────────────────────┘
             │
┌────────────▼────────────────────┐
│    Models (Sequelize ORM)       │
└────────────┬────────────────────┘
             │
┌────────────▼────────────────────┐
│      PostgreSQL Database        │
└─────────────────────────────────┘
```

**Princípios:**
- Separação de responsabilidades
- Baixo acoplamento
- Alta coesão
- Facilidade de testes

---

## 2. Estrutura de Diretórios

### 2.1 Estrutura Completa

```
desafio-sequelize/
├── src/
│   ├── config/
│   │   ├── database.js          # Configuração do Sequelize
│   │   └── jwt.js               # Configuração do JWT
│   │
│   ├── middlewares/
│   │   ├── auth.js              # Middleware de autenticação JWT
│   │   ├── validation.js        # Middleware de validação
│   │   └── errorHandler.js      # Tratamento centralizado de erros
│   │
│   ├── models/
│   │   ├── index.js             # Inicialização do Sequelize
│   │   ├── User.js              # Model de usuário
│   │   ├── Class.js             # Model de turma
│   │   ├── Subject.js           # Model de disciplina
│   │   ├── Student.js           # Model de aluno
│   │   ├── Grade.js             # Model de nota
│   │   └── ClassSubject.js      # Model de relacionamento (N:N)
│   │
│   ├── controllers/
│   │   ├── authController.js    # Lógica de autenticação
│   │   ├── classController.js   # Lógica de turmas
│   │   ├── subjectController.js # Lógica de disciplinas
│   │   ├── studentController.js # Lógica de alunos
│   │   └── gradeController.js   # Lógica de notas e boletim
│   │
│   ├── services/
│   │   ├── gradeService.js      # Cálculo de médias
│   │   └── boletimService.js    # Geração de boletim
│   │
│   ├── routes/
│   │   ├── index.js             # Agregador de rotas
│   │   ├── authRoutes.js        # Rotas de autenticação
│   │   ├── classRoutes.js       # Rotas de turmas
│   │   ├── subjectRoutes.js     # Rotas de disciplinas
│   │   ├── studentRoutes.js     # Rotas de alunos
│   │   └── gradeRoutes.js       # Rotas de notas
│   │
│   ├── utils/
│   │   ├── validators.js        # Funções de validação
│   │   └── responses.js         # Padronização de respostas
│   │
│   ├── database/
│   │   ├── migrations/          # Migrations do Sequelize
│   │   │   ├── 01-create-users.js
│   │   │   ├── 02-create-classes.js
│   │   │   ├── 03-create-subjects.js
│   │   │   ├── 04-create-students.js
│   │   │   ├── 05-create-grades.js
│   │   │   └── 06-create-class-subjects.js
│   │   │
│   │   └── seeders/             # Seeds (opcional)
│   │       └── demo-data.js
│   │
│   ├── app.js                   # Configuração do Express
│   └── server.js                # Inicialização do servidor
│
├── .env.example                 # Exemplo de variáveis de ambiente
├── .gitignore
├── package.json
├── .sequelizerc                 # Config paths do Sequelize
└── README.md
```

### 2.2 Responsabilidades de Cada Camada

#### **Config/**
- Configurações de banco de dados
- Configurações de JWT (secret, expiration)
- Configurações de ambiente

#### **Middlewares/**
- `auth.js`: Verificação de token JWT
- `validation.js`: Validação de dados de entrada
- `errorHandler.js`: Captura e formatação de erros

#### **Models/**
- Definição de tabelas (schema)
- Relacionamentos entre entidades
- Hooks (beforeCreate, beforeUpdate)
- Validações no nível do modelo

#### **Controllers/**
- Recebe requisições HTTP
- Chama services para lógica complexa
- Retorna respostas HTTP formatadas
- NÃO contém lógica de negócio complexa

#### **Services/**
- Lógica de negócio reutilizável
- Cálculos (médias, aprovação)
- Agregação de dados
- Regras de negócio complexas

#### **Routes/**
- Definição de endpoints
- Mapeamento de URLs para controllers
- Aplicação de middlewares específicos

#### **Utils/**
- Funções auxiliares reutilizáveis
- Validadores customizados
- Formatadores de resposta

---

## 3. Detalhamento dos Models

### 3.1 User Model

```javascript
// src/models/User.js
export default (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nome: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [6, 100]
      }
    }
  }, {
    tableName: 'users',
    timestamps: true
  });

  // Hook para hash de senha
  User.beforeCreate(async (user) => {
    user.password = await bcrypt.hash(user.password, 10);
  });

  return User;
};
```

### 3.2 Class Model

```javascript
// src/models/Class.js
export default (sequelize, DataTypes) => {
  const Class = sequelize.define('Class', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nome: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    }
  }, {
    tableName: 'classes',
    timestamps: true
  });

  Class.associate = (models) => {
    // 1:N com Students
    Class.hasMany(models.Student, {
      foreignKey: 'classId',
      as: 'students'
    });

    // N:N com Subjects
    Class.belongsToMany(models.Subject, {
      through: models.ClassSubject,
      foreignKey: 'classId',
      as: 'subjects'
    });
  };

  return Class;
};
```

### 3.3 Subject Model

```javascript
// src/models/Subject.js
export default (sequelize, DataTypes) => {
  const Subject = sequelize.define('Subject', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nome: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    }
  }, {
    tableName: 'subjects',
    timestamps: true
  });

  Subject.associate = (models) => {
    // N:N com Classes
    Subject.belongsToMany(models.Class, {
      through: models.ClassSubject,
      foreignKey: 'subjectId',
      as: 'classes'
    });

    // 1:N com Grades
    Subject.hasMany(models.Grade, {
      foreignKey: 'subjectId',
      as: 'grades'
    });
  };

  return Subject;
};
```

### 3.4 Student Model

```javascript
// src/models/Student.js
export default (sequelize, DataTypes) => {
  const Student = sequelize.define('Student', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nome: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    classId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'classes',
        key: 'id'
      }
    }
  }, {
    tableName: 'students',
    timestamps: true
  });

  Student.associate = (models) => {
    // N:1 com Class
    Student.belongsTo(models.Class, {
      foreignKey: 'classId',
      as: 'class'
    });

    // 1:N com Grades
    Student.hasMany(models.Grade, {
      foreignKey: 'studentId',
      as: 'grades'
    });
  };

  return Student;
};
```

### 3.5 Grade Model

```javascript
// src/models/Grade.js
export default (sequelize, DataTypes) => {
  const Grade = sequelize.define('Grade', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    studentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'students',
        key: 'id'
      }
    },
    subjectId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'subjects',
        key: 'id'
      }
    },
    unidade: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 4
      }
    },
    teste: {
      type: DataTypes.DECIMAL(4, 2),
      allowNull: false,
      validate: {
        min: 0,
        max: 10
      }
    },
    prova: {
      type: DataTypes.DECIMAL(4, 2),
      allowNull: false,
      validate: {
        min: 0,
        max: 10
      }
    },
    mediaUnidade: {
      type: DataTypes.DECIMAL(4, 2),
      allowNull: true
    }
  }, {
    tableName: 'grades',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['studentId', 'subjectId', 'unidade']
      }
    ]
  });

  // Hook para calcular média antes de salvar
  Grade.beforeCreate((grade) => {
    grade.mediaUnidade = ((parseFloat(grade.teste) + parseFloat(grade.prova)) / 2).toFixed(2);
  });

  Grade.beforeUpdate((grade) => {
    if (grade.changed('teste') || grade.changed('prova')) {
      grade.mediaUnidade = ((parseFloat(grade.teste) + parseFloat(grade.prova)) / 2).toFixed(2);
    }
  });

  Grade.associate = (models) => {
    // N:1 com Student
    Grade.belongsTo(models.Student, {
      foreignKey: 'studentId',
      as: 'student'
    });

    // N:1 com Subject
    Grade.belongsTo(models.Subject, {
      foreignKey: 'subjectId',
      as: 'subject'
    });
  };

  return Grade;
};
```

### 3.6 ClassSubject Model (Join Table)

```javascript
// src/models/ClassSubject.js
export default (sequelize, DataTypes) => {
  const ClassSubject = sequelize.define('ClassSubject', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    classId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'classes',
        key: 'id'
      }
    },
    subjectId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'subjects',
        key: 'id'
      }
    }
  }, {
    tableName: 'class_subjects',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['classId', 'subjectId']
      }
    ]
  });

  return ClassSubject;
};
```

---

## 4. Autenticação e Segurança

### 4.1 Estratégia JWT

**Fluxo de Autenticação:**

```
1. POST /auth/register
   └─> Cria usuário com senha hasheada

2. POST /auth/login
   └─> Valida credenciais
   └─> Gera token JWT
   └─> Retorna token

3. Requisições subsequentes
   └─> Header: Authorization: Bearer <token>
   └─> Middleware verifica e decodifica token
   └─> Anexa user.id ao req.user
   └─> Controller acessa req.user
```

### 4.2 Middleware de Autenticação

```javascript
// src/middlewares/auth.js
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/jwt.js';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(401).json({ error: 'Token inválido ou expirado' });
    }
    
    req.user = user; // { id, email }
    next();
  });
};
```

### 4.3 Configuração JWT

```javascript
// src/config/jwt.js
export const JWT_SECRET = process.env.JWT_SECRET || 'seu-secret-super-seguro';
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
```

### 4.4 Hash de Senhas

```javascript
// No controller de autenticação
import bcrypt from 'bcrypt';

// Registro
const hashedPassword = await bcrypt.hash(password, 10);

// Login
const isValid = await bcrypt.compare(password, user.password);
```

---

## 5. Services (Lógica de Negócio)

### 5.1 Grade Service

```javascript
// src/services/gradeService.js

/**
 * Calcula média da unidade
 */
export const calculateUnitAverage = (teste, prova) => {
  return ((parseFloat(teste) + parseFloat(prova)) / 2).toFixed(2);
};

/**
 * Calcula média final de uma disciplina (4 unidades)
 */
export const calculateSubjectFinalAverage = (grades) => {
  if (grades.length === 0) return 0;
  
  const sum = grades.reduce((acc, grade) => {
    return acc + parseFloat(grade.mediaUnidade);
  }, 0);
  
  return (sum / grades.length).toFixed(2);
};

/**
 * Determina status de aprovação
 */
export const getApprovalStatus = (average) => {
  return parseFloat(average) >= 7.0 ? 'Aprovado' : 'Reprovado';
};

/**
 * Valida se disciplina pertence à turma do aluno
 */
export const validateSubjectInClass = async (studentId, subjectId, models) => {
  const student = await models.Student.findByPk(studentId, {
    include: [{
      model: models.Class,
      as: 'class',
      include: [{
        model: models.Subject,
        as: 'subjects'
      }]
    }]
  });

  if (!student) {
    throw new Error('Aluno não encontrado');
  }

  const hasSubject = student.class.subjects.some(
    subject => subject.id === subjectId
  );

  if (!hasSubject) {
    throw new Error('Disciplina não está vinculada à turma do aluno');
  }

  return true;
};
```

### 5.2 Boletim Service

```javascript
// src/services/boletimService.js
import { calculateSubjectFinalAverage, getApprovalStatus } from './gradeService.js';

/**
 * Gera boletim completo do aluno
 */
export const generateBoletim = async (studentId, models) => {
  // Buscar aluno com turma
  const student = await models.Student.findByPk(studentId, {
    include: [{
      model: models.Class,
      as: 'class',
      include: [{
        model: models.Subject,
        as: 'subjects'
      }]
    }]
  });

  if (!student) {
    throw new Error('Aluno não encontrado');
  }

  // Buscar todas as notas do aluno
  const grades = await models.Grade.findAll({
    where: { studentId },
    include: [{
      model: models.Subject,
      as: 'subject'
    }]
  });

  // Agrupar notas por disciplina
  const subjectGrades = {};
  
  grades.forEach(grade => {
    const subjectId = grade.subjectId;
    if (!subjectGrades[subjectId]) {
      subjectGrades[subjectId] = {
        subject: grade.subject,
        notas: []
      };
    }
    subjectGrades[subjectId].notas.push({
      unidade: grade.unidade,
      teste: parseFloat(grade.teste),
      prova: parseFloat(grade.prova),
      mediaUnidade: parseFloat(grade.mediaUnidade)
    });
  });

  // Calcular médias finais por disciplina
  const boletim = [];
  let sumFinalAverages = 0;
  let subjectCount = 0;

  for (const subjectId in subjectGrades) {
    const { subject, notas } = subjectGrades[subjectId];
    
    // Ordenar por unidade
    notas.sort((a, b) => a.unidade - b.unidade);
    
    const mediaFinal = calculateSubjectFinalAverage(notas);
    
    boletim.push({
      subject: {
        id: subject.id,
        nome: subject.nome
      },
      notas,
      mediaFinal: parseFloat(mediaFinal)
    });

    sumFinalAverages += parseFloat(mediaFinal);
    subjectCount++;
  }

  // Calcular média geral final
  const mediaGeralFinal = subjectCount > 0 
    ? (sumFinalAverages / subjectCount).toFixed(2)
    : 0;

  return {
    student: {
      id: student.id,
      nome: student.nome,
      class: {
        id: student.class.id,
        nome: student.class.nome
      }
    },
    boletim,
    mediaGeralFinal: parseFloat(mediaGeralFinal),
    status: getApprovalStatus(mediaGeralFinal)
  };
};
```

---

## 6. Tratamento de Erros

### 6.1 Error Handler Middleware

```javascript
// src/middlewares/errorHandler.js

export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Erro de validação do Sequelize
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      error: 'Dados inválidos',
      details: err.errors.map(e => e.message)
    });
  }

  // Erro de constraint única
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      error: 'Registro duplicado',
      details: err.errors.map(e => e.message)
    });
  }

  // Erro de foreign key
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      error: 'Referência inválida',
      details: 'O registro relacionado não existe'
    });
  }

  // Erro customizado
  if (err.status) {
    return res.status(err.status).json({
      error: err.message,
      details: err.details
    });
  }

  // Erro genérico
  res.status(500).json({
    error: 'Erro interno do servidor',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};
```

### 6.2 Custom Error Class

```javascript
// src/utils/customError.js

export class CustomError extends Error {
  constructor(message, status = 500, details = null) {
    super(message);
    this.status = status;
    this.details = details;
    this.name = 'CustomError';
  }
}
```

---

## 7. Configuração do Sequelize

### 7.1 Database Config

```javascript
// src/config/database.js
import { config } from 'dotenv';
config();

export default {
  development: {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || 'postgres',
    database: process.env.DB_NAME || 'escola_db',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: console.log,
    define: {
      timestamps: true,
      underscored: false
    }
  },
  test: {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || 'postgres',
    database: process.env.DB_NAME_TEST || 'escola_db_test',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
};
```

### 7.2 .sequelizerc

```javascript
// .sequelizerc
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  'config': path.resolve(__dirname, 'src', 'config', 'database.js'),
  'models-path': path.resolve(__dirname, 'src', 'models'),
  'migrations-path': path.resolve(__dirname, 'src', 'database', 'migrations'),
  'seeders-path': path.resolve(__dirname, 'src', 'database', 'seeders')
};
```

### 7.3 Models Index

```javascript
// src/models/index.js
import { Sequelize } from 'sequelize';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import databaseConfig from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = databaseConfig[env];

const db = {};

// Criar instância do Sequelize
let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

// Importar todos os models
const modelFiles = fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js'
    );
  });

for (const file of modelFiles) {
  const modelPath = path.join(__dirname, file);
  const { default: model } = await import(modelPath);
  const initializedModel = model(sequelize, Sequelize.DataTypes);
  db[initializedModel.name] = initializedModel;
}

// Executar associações
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
```

---

## 8. Estrutura de Rotas

### 8.1 Routes Index

```javascript
// src/routes/index.js
import express from 'express';
import authRoutes from './authRoutes.js';
import classRoutes from './classRoutes.js';
import subjectRoutes from './subjectRoutes.js';
import studentRoutes from './studentRoutes.js';
import gradeRoutes from './gradeRoutes.js';

const router = express.Router();

// Rotas públicas
router.use('/auth', authRoutes);

// Rotas protegidas (necessitam autenticação)
router.use('/classes', classRoutes);
router.use('/subjects', subjectRoutes);
router.use('/students', studentRoutes);
router.use('/grades', gradeRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

export default router;
```

### 8.2 Rotas Completas (CRUD)

#### Classes Routes
```javascript
// src/routes/classRoutes.js
import express from 'express';
import { authenticateToken } from '../middlewares/auth.js';
import * as classController from '../controllers/classController.js';

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(authenticateToken);

// CRUD Completo
router.post('/', classController.create);
router.get('/', classController.getAll);
router.get('/:id', classController.getById);
router.put('/:id', classController.update);
router.delete('/:id', classController.remove);

// Operações especiais
router.post('/:id/subjects', classController.addSubjects);

export default router;
```

#### Subjects Routes
```javascript
// src/routes/subjectRoutes.js
import express from 'express';
import { authenticateToken } from '../middlewares/auth.js';
import * as subjectController from '../controllers/subjectController.js';

const router = express.Router();

router.use(authenticateToken);

router.post('/', subjectController.create);
router.get('/', subjectController.getAll);
router.get('/:id', subjectController.getById);
router.put('/:id', subjectController.update);
router.delete('/:id', subjectController.remove);

export default router;
```

#### Students Routes
```javascript
// src/routes/studentRoutes.js
import express from 'express';
import { authenticateToken } from '../middlewares/auth.js';
import * as studentController from '../controllers/studentController.js';

const router = express.Router();

router.use(authenticateToken);

router.post('/', studentController.create);
router.get('/', studentController.getAll);
router.get('/:id', studentController.getById);
router.put('/:id', studentController.update);
router.delete('/:id', studentController.remove);

export default router;
```

#### Grades Routes
```javascript
// src/routes/gradeRoutes.js
import express from 'express';
import { authenticateToken } from '../middlewares/auth.js';
import * as gradeController from '../controllers/gradeController.js';

const router = express.Router();

router.use(authenticateToken);

router.post('/', gradeController.create);
router.get('/:id', gradeController.getById);
router.put('/:id', gradeController.update);
router.delete('/:id', gradeController.remove);

// Rotas especiais
router.get('/student/:studentId/boletim', gradeController.getBoletim);

export default router;
```

---

## 9. Implementação dos Controllers (CRUD Completo)

### 9.1 Class Controller

```javascript
// src/controllers/classController.js
import db from '../models/index.js';
const { Class, Student, Subject } = db;

// CREATE
export const create = async (req, res, next) => {
  try {
    const { nome } = req.body;
    
    if (!nome || nome.trim() === '') {
      return res.status(400).json({ error: 'Nome é obrigatório' });
    }
    
    const newClass = await Class.create({ nome: nome.trim() });
    
    res.status(201).json(newClass);
  } catch (error) {
    next(error);
  }
};

// READ ALL
export const getAll = async (req, res, next) => {
  try {
    const classes = await Class.findAll({
      include: [
        { 
          model: Student, 
          as: 'students',
          attributes: ['id', 'nome']
        }
      ]
    });
    
    // Adicionar contagem de alunos
    const classesWithCount = classes.map(c => ({
      ...c.toJSON(),
      studentCount: c.students ? c.students.length : 0
    }));
    
    res.json(classesWithCount);
  } catch (error) {
    next(error);
  }
};

// READ ONE
export const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const classData = await Class.findByPk(id, {
      include: [
        { model: Student, as: 'students' },
        { model: Subject, as: 'subjects' }
      ]
    });
    
    if (!classData) {
      return res.status(404).json({ error: 'Turma não encontrada' });
    }
    
    res.json(classData);
  } catch (error) {
    next(error);
  }
};

// UPDATE
export const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nome } = req.body;
    
    if (!nome || nome.trim() === '') {
      return res.status(400).json({ error: 'Nome é obrigatório' });
    }
    
    const classData = await Class.findByPk(id);
    
    if (!classData) {
      return res.status(404).json({ error: 'Turma não encontrada' });
    }
    
    await classData.update({ nome: nome.trim() });
    
    res.json({
      message: 'Turma atualizada com sucesso',
      data: classData
    });
  } catch (error) {
    next(error);
  }
};

// DELETE
export const remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const classData = await Class.findByPk(id, {
      include: [{ model: Student, as: 'students' }]
    });
    
    if (!classData) {
      return res.status(404).json({ error: 'Turma não encontrada' });
    }
    
    // Verificar se tem alunos vinculados
    if (classData.students && classData.students.length > 0) {
      return res.status(400).json({ 
        error: 'Não é possível deletar turma com alunos vinculados',
        details: `A turma possui ${classData.students.length} aluno(s)`
      });
    }
    
    await classData.destroy();
    
    res.json({ message: 'Turma deletada com sucesso' });
  } catch (error) {
    next(error);
  }
};

// SPECIAL: Add Subjects to Class
export const addSubjects = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { subjectIds } = req.body;
    
    if (!Array.isArray(subjectIds) || subjectIds.length === 0) {
      return res.status(400).json({ 
        error: 'subjectIds deve ser um array com ao menos um ID' 
      });
    }
    
    const classData = await Class.findByPk(id);
    
    if (!classData) {
      return res.status(404).json({ error: 'Turma não encontrada' });
    }
    
    // Verificar se todas as disciplinas existem
    const subjects = await Subject.findAll({
      where: { id: subjectIds }
    });
    
    if (subjects.length !== subjectIds.length) {
      return res.status(400).json({ 
        error: 'Uma ou mais disciplinas não foram encontradas' 
      });
    }
    
    // Associar disciplinas à turma
    await classData.setSubjects(subjectIds);
    
    // Buscar turma atualizada
    const updatedClass = await Class.findByPk(id, {
      include: [{ model: Subject, as: 'subjects' }]
    });
    
    res.json({
      message: 'Disciplinas associadas com sucesso',
      data: updatedClass
    });
  } catch (error) {
    next(error);
  }
};
```

### 9.2 Subject Controller

```javascript
// src/controllers/subjectController.js
import db from '../models/index.js';
const { Subject, Grade } = db;

export const create = async (req, res, next) => {
  try {
    const { nome } = req.body;
    
    if (!nome || nome.trim() === '') {
      return res.status(400).json({ error: 'Nome é obrigatório' });
    }
    
    const subject = await Subject.create({ nome: nome.trim() });
    
    res.status(201).json(subject);
  } catch (error) {
    next(error);
  }
};

export const getAll = async (req, res, next) => {
  try {
    const subjects = await Subject.findAll({
      order: [['nome', 'ASC']]
    });
    
    res.json(subjects);
  } catch (error) {
    next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const subject = await Subject.findByPk(id);
    
    if (!subject) {
      return res.status(404).json({ error: 'Disciplina não encontrada' });
    }
    
    res.json(subject);
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nome } = req.body;
    
    if (!nome || nome.trim() === '') {
      return res.status(400).json({ error: 'Nome é obrigatório' });
    }
    
    const subject = await Subject.findByPk(id);
    
    if (!subject) {
      return res.status(404).json({ error: 'Disciplina não encontrada' });
    }
    
    await subject.update({ nome: nome.trim() });
    
    res.json({
      message: 'Disciplina atualizada com sucesso',
      data: subject
    });
  } catch (error) {
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const subject = await Subject.findByPk(id, {
      include: [{ model: Grade, as: 'grades' }]
    });
    
    if (!subject) {
      return res.status(404).json({ error: 'Disciplina não encontrada' });
    }
    
    // Verificar se tem notas vinculadas
    if (subject.grades && subject.grades.length > 0) {
      return res.status(400).json({ 
        error: 'Não é possível deletar disciplina com notas cadastradas'
      });
    }
    
    await subject.destroy();
    
    res.json({ message: 'Disciplina deletada com sucesso' });
  } catch (error) {
    next(error);
  }
};
```

### 9.3 Student Controller

```javascript
// src/controllers/studentController.js
import db from '../models/index.js';
const { Student, Class, Grade } = db;

export const create = async (req, res, next) => {
  try {
    const { nome, classId } = req.body;
    
    if (!nome || nome.trim() === '') {
      return res.status(400).json({ error: 'Nome é obrigatório' });
    }
    
    if (!classId) {
      return res.status(400).json({ error: 'classId é obrigatório' });
    }
    
    // Verificar se a turma existe
    const classExists = await Class.findByPk(classId);
    if (!classExists) {
      return res.status(404).json({ error: 'Turma não encontrada' });
    }
    
    const student = await Student.create({ 
      nome: nome.trim(), 
      classId 
    });
    
    // Buscar com dados da turma
    const studentWithClass = await Student.findByPk(student.id, {
      include: [{ model: Class, as: 'class' }]
    });
    
    res.status(201).json(studentWithClass);
  } catch (error) {
    next(error);
  }
};

export const getAll = async (req, res, next) => {
  try {
    const students = await Student.findAll({
      include: [{ model: Class, as: 'class' }],
      order: [['nome', 'ASC']]
    });
    
    res.json(students);
  } catch (error) {
    next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const student = await Student.findByPk(id, {
      include: [
        { model: Class, as: 'class' },
        { 
          model: Grade, 
          as: 'grades',
          include: [{ model: Subject, as: 'subject' }]
        }
      ]
    });
    
    if (!student) {
      return res.status(404).json({ error: 'Aluno não encontrado' });
    }
    
    res.json(student);
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nome, classId } = req.body;
    
    const student = await Student.findByPk(id);
    
    if (!student) {
      return res.status(404).json({ error: 'Aluno não encontrado' });
    }
    
    const updateData = {};
    
    if (nome) {
      if (nome.trim() === '') {
        return res.status(400).json({ error: 'Nome não pode ser vazio' });
      }
      updateData.nome = nome.trim();
    }
    
    if (classId) {
      const classExists = await Class.findByPk(classId);
      if (!classExists) {
        return res.status(404).json({ error: 'Turma não encontrada' });
      }
      updateData.classId = classId;
    }
    
    await student.update(updateData);
    
    // Retornar com dados da turma
    const updatedStudent = await Student.findByPk(id, {
      include: [{ model: Class, as: 'class' }]
    });
    
    res.json({
      message: 'Aluno atualizado com sucesso',
      data: updatedStudent
    });
  } catch (error) {
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const student = await Student.findByPk(id, {
      include: [{ model: Grade, as: 'grades' }]
    });
    
    if (!student) {
      return res.status(404).json({ error: 'Aluno não encontrado' });
    }
    
    // Verificar se tem notas cadastradas
    if (student.grades && student.grades.length > 0) {
      return res.status(400).json({ 
        error: 'Não é possível deletar aluno com notas cadastradas',
        details: `O aluno possui ${student.grades.length} nota(s)`
      });
    }
    
    await student.destroy();
    
    res.json({ message: 'Aluno deletado com sucesso' });
  } catch (error) {
    next(error);
  }
};
```

### 9.4 Grade Controller

```javascript
// src/controllers/gradeController.js
import db from '../models/index.js';
import { validateSubjectInClass } from '../services/gradeService.js';
import { generateBoletim } from '../services/boletimService.js';

const { Grade, Student, Subject } = db;

export const create = async (req, res, next) => {
  try {
    const { studentId, subjectId, unidade, teste, prova } = req.body;
    
    // Validações básicas
    if (!studentId || !subjectId || !unidade || teste === undefined || prova === undefined) {
      return res.status(400).json({ 
        error: 'Campos obrigatórios: studentId, subjectId, unidade, teste, prova' 
      });
    }
    
    if (unidade < 1 || unidade > 4) {
      return res.status(400).json({ error: 'Unidade deve ser entre 1 e 4' });
    }
    
    if (teste < 0 || teste > 10 || prova < 0 || prova > 10) {
      return res.status(400).json({ error: 'Notas devem estar entre 0 e 10' });
    }
    
    // Validar se disciplina pertence à turma do aluno
    await validateSubjectInClass(studentId, subjectId, db);
    
    // Criar ou atualizar nota
    const [grade, created] = await Grade.findOrCreate({
      where: { studentId, subjectId, unidade },
      defaults: { teste, prova }
    });
    
    if (!created) {
      // Se já existe, atualizar
      await grade.update({ teste, prova });
    }
    
    res.status(created ? 201 : 200).json({
      message: created ? 'Nota criada com sucesso' : 'Nota atualizada com sucesso',
      data: grade
    });
  } catch (error) {
    next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const grade = await Grade.findByPk(id, {
      include: [
        { model: Student, as: 'student' },
        { model: Subject, as: 'subject' }
      ]
    });
    
    if (!grade) {
      return res.status(404).json({ error: 'Nota não encontrada' });
    }
    
    res.json(grade);
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { teste, prova } = req.body;
    
    const grade = await Grade.findByPk(id);
    
    if (!grade) {
      return res.status(404).json({ error: 'Nota não encontrada' });
    }
    
    const updateData = {};
    
    if (teste !== undefined) {
      if (teste < 0 || teste > 10) {
        return res.status(400).json({ error: 'Teste deve estar entre 0 e 10' });
      }
      updateData.teste = teste;
    }
    
    if (prova !== undefined) {
      if (prova < 0 || prova > 10) {
        return res.status(400).json({ error: 'Prova deve estar entre 0 e 10' });
      }
      updateData.prova = prova;
    }
    
    await grade.update(updateData);
    
    res.json({
      message: 'Nota atualizada com sucesso',
      data: grade
    });
  } catch (error) {
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const grade = await Grade.findByPk(id);
    
    if (!grade) {
      return res.status(404).json({ error: 'Nota não encontrada' });
    }
    
    await grade.destroy();
    
    res.json({ message: 'Nota deletada com sucesso' });
  } catch (error) {
    next(error);
  }
};

export const getBoletim = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    
    const boletim = await generateBoletim(studentId, db);
    
    res.json(boletim);
  } catch (error) {
    next(error);
  }
};
```

---

## 10. App Setup

### 9.1 app.js

```javascript
// src/app.js
import express from 'express';
import routes from './routes/index.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

// Middlewares globais
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS (se necessário)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Rotas
app.use('/api', routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Error handler (deve ser o último)
app.use(errorHandler);

export default app;
```

### 9.2 server.js

```javascript
// src/server.js
import app from './app.js';
import db from './models/index.js';

const PORT = process.env.PORT || 3000;

// Testar conexão com banco
db.sequelize.authenticate()
  .then(() => {
    console.log('✅ Conexão com banco de dados estabelecida');
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📝 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    });
  })
  .catch(err => {
    console.error('❌ Erro ao conectar com banco de dados:', err);
    process.exit(1);
  });
```

---

## 10. Variáveis de Ambiente

### 10.1 .env.example

```env
# Server
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=postgres
DB_NAME=escola_db

# JWT
JWT_SECRET=seu-secret-super-seguro-aqui
JWT_EXPIRES_IN=24h
```

### 10.2 .env (não commitar)

```env
# Crie este arquivo baseado no .env.example
# e preencha com suas credenciais reais
```

---

## 11. Package.json

```json
{
  "name": "desafio-sequelize",
  "version": "1.0.0",
  "description": "Sistema Escolar de Gestão de Notas",
  "type": "module",
  "main": "src/server.js",
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js",
    "db:migrate": "npx sequelize-cli db:migrate",
    "db:migrate:undo": "npx sequelize-cli db:migrate:undo",
    "db:seed": "npx sequelize-cli db:seed:all",
    "db:reset": "npx sequelize-cli db:migrate:undo:all && npx sequelize-cli db:migrate && npx sequelize-cli db:seed:all"
  },
  "keywords": ["node", "express", "sequelize", "postgresql", "jwt"],
  "author": "",
  "license": "MIT",
  "dependencies": {
    "express": "^4.18.2",
    "sequelize": "^6.35.0",
    "pg": "^8.11.3",
    "pg-hstore": "^2.3.4",
    "jsonwebtoken": "^9.0.2",
    "bcrypt": "^5.1.1",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.2",
    "sequelize-cli": "^6.6.2"
  }
}
```

---

## 12. Migrations

### 12.1 Migration: Create Users

```javascript
// src/database/migrations/01-create-users.js
export default {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      nome: {
        type: Sequelize.STRING,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Índice para email
    await queryInterface.addIndex('users', ['email'], {
      unique: true,
      name: 'users_email_unique'
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('users');
  }
};
```

### 12.2 Migration: Create Classes

```javascript
// src/database/migrations/02-create-classes.js
export default {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('classes', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      nome: {
        type: Sequelize.STRING,
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('classes');
  }
};
```

### 12.3 Migration: Create Subjects

```javascript
// src/database/migrations/03-create-subjects.js
export default {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('subjects', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      nome: {
        type: Sequelize.STRING,
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('subjects');
  }
};
```

### 12.4 Migration: Create Students

```javascript
// src/database/migrations/04-create-students.js
export default {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('students', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      nome: {
        type: Sequelize.STRING,
        allowNull: false
      },
      classId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'classes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Índice para classId
    await queryInterface.addIndex('students', ['classId'], {
      name: 'students_class_id_index'
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('students');
  }
};
```

### 12.5 Migration: Create Grades

```javascript
// src/database/migrations/05-create-grades.js
export default {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('grades', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      studentId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'students',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      subjectId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'subjects',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      unidade: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 4
        }
      },
      teste: {
        type: Sequelize.DECIMAL(4, 2),
        allowNull: false
      },
      prova: {
        type: Sequelize.DECIMAL(4, 2),
        allowNull: false
      },
      mediaUnidade: {
        type: Sequelize.DECIMAL(4, 2),
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Índice único para evitar duplicatas (student + subject + unidade)
    await queryInterface.addIndex('grades', ['studentId', 'subjectId', 'unidade'], {
      unique: true,
      name: 'grades_student_subject_unit_unique'
    });

    // Índices para consultas
    await queryInterface.addIndex('grades', ['studentId'], {
      name: 'grades_student_id_index'
    });

    await queryInterface.addIndex('grades', ['subjectId'], {
      name: 'grades_subject_id_index'
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('grades');
  }
};
```

### 12.6 Migration: Create ClassSubjects

```javascript
// src/database/migrations/06-create-class-subjects.js
export default {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('class_subjects', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      classId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'classes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      subjectId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'subjects',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Índice único para evitar duplicatas
    await queryInterface.addIndex('class_subjects', ['classId', 'subjectId'], {
      unique: true,
      name: 'class_subjects_class_subject_unique'
    });

    // Índices para consultas
    await queryInterface.addIndex('class_subjects', ['classId'], {
      name: 'class_subjects_class_id_index'
    });

    await queryInterface.addIndex('class_subjects', ['subjectId'], {
      name: 'class_subjects_subject_id_index'
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('class_subjects');
  }
};
```

---

## 13. Diagrama de Banco de Dados

```
┌──────────────────┐
│      users       │
├──────────────────┤
│ PK  id           │
│     nome         │
│ UQ  email        │
│     password     │
│     createdAt    │
│     updatedAt    │
└──────────────────┘

┌──────────────────┐         ┌──────────────────────┐         ┌──────────────────┐
│     classes      │────────▶│   class_subjects     │◀────────│    subjects      │
├──────────────────┤  1:N    ├──────────────────────┤  N:1    ├──────────────────┤
│ PK  id           │         │ PK  id               │         │ PK  id           │
│     nome         │         │ FK  classId          │         │     nome         │
│     createdAt    │         │ FK  subjectId        │         │     createdAt    │
│     updatedAt    │         │     createdAt        │         │     updatedAt    │
└────────┬─────────┘         │     updatedAt        │         └─────────┬────────┘
         │                   └──────────────────────┘                   │
         │ 1:N                                                          │
         │                                                              │
         ▼                                                              │
┌──────────────────┐                                                   │
│    students      │                                                   │
├──────────────────┤                                                   │
│ PK  id           │                                                   │
│     nome         │                                                   │
│ FK  classId      │                                                   │
│     createdAt    │                                                   │
│     updatedAt    │                                                   │
└────────┬─────────┘                                                   │
         │ 1:N                                                         │
         │                                                             │
         ▼                                                             │
┌──────────────────┐                                                   │
│     grades       │                                                   │
├──────────────────┤                                                   │
│ PK  id           │                                                   │
│ FK  studentId    │                                                   │
│ FK  subjectId    │◀──────────────────────────────────────────────────┘
│     unidade      │  N:1
│     teste        │
│     prova        │
│     mediaUnidade │
│     createdAt    │
│     updatedAt    │
└──────────────────┘
```

**Relacionamentos:**
- Classes ↔ Subjects (N:N via class_subjects)
- Classes → Students (1:N)
- Students → Grades (1:N)
- Subjects → Grades (1:N)

**Regras de Deleção:**
- Turma com alunos: ❌ Não pode deletar
- Disciplina com notas: ❌ Não pode deletar
- Aluno com notas: ❌ Não pode deletar
- Nota: ✅ Pode deletar livremente

---

## 14. Fluxo de Dados

### 14.1 Fluxo de Criação de Nota

```
1. Cliente envia POST /grades
   Body: { studentId, subjectId, unidade, teste, prova }

2. Middleware de autenticação valida JWT

3. Controller recebe e valida dados básicos

4. Service valida:
   - Aluno existe?
   - Disciplina existe?
   - Disciplina está na turma do aluno?
   - Unidade entre 1-4?
   - Notas entre 0-10?

5. Model (hook beforeCreate):
   - Calcula mediaUnidade = (teste + prova) / 2

6. Sequelize salva no banco

7. Controller retorna resposta com nota criada
```

### 14.2 Fluxo de Geração de Boletim

```
1. Cliente envia GET /students/:id/boletim

2. Middleware de autenticação valida JWT

3. Controller chama boletimService

4. Service:
   - Busca aluno com turma
   - Busca todas as notas do aluno
   - Agrupa notas por disciplina
   - Calcula média final por disciplina
   - Calcula média geral final
   - Determina status (Aprovado/Reprovado)

5. Controller retorna boletim formatado
```

---

## 15. Considerações de Performance

### 15.1 Índices

**Criados nas migrations:**
- `users.email` (UNIQUE)
- `students.classId` (INDEX)
- `grades.studentId` (INDEX)
- `grades.subjectId` (INDEX)
- `grades.(studentId, subjectId, unidade)` (UNIQUE COMPOSITE)
- `class_subjects.(classId, subjectId)` (UNIQUE COMPOSITE)

### 15.2 Connection Pooling

Sequelize gerencia automaticamente um pool de conexões:
- Max connections: 5 (default)
- Min connections: 0
- Idle timeout: 10000ms

### 15.3 Eager Loading

Use `include` para evitar N+1 queries:

```javascript
// ❌ Ruim - N+1 queries
const students = await Student.findAll();
for (const student of students) {
  const class = await Class.findByPk(student.classId); // N queries
}

// ✅ Bom - 1 query
const students = await Student.findAll({
  include: [{ model: Class, as: 'class' }]
});
```

---

## 16. Segurança

### 16.1 Checklist de Segurança

- ✅ Senhas hasheadas com bcrypt (salt rounds: 10)
- ✅ JWT com secret forte e expiração
- ✅ Validação de entrada em todos os endpoints
- ✅ Proteção contra SQL injection (via Sequelize)
- ✅ CORS configurado
- ✅ Variáveis sensíveis em .env (não commitadas)
- ✅ Tratamento de erros sem expor detalhes em produção

### 16.2 Validações de Regra de Negócio

- ✅ Aluno só pode ter notas de disciplinas da sua turma
- ✅ Notas entre 0 e 10
- ✅ Unidade entre 1 e 4
- ✅ Combinação (student + subject + unidade) única

---

## 17. Testes (Opcional)

### 17.1 Estrutura de Testes

```
tests/
├── unit/
│   ├── services/
│   │   ├── gradeService.test.js
│   │   └── boletimService.test.js
│   └── utils/
│       └── validators.test.js
│
├── integration/
│   ├── auth.test.js
│   ├── classes.test.js
│   ├── subjects.test.js
│   ├── students.test.js
│   └── grades.test.js
│
└── setup.js
```

### 17.2 Ferramentas Sugeridas

- **Jest** ou **Mocha** para testes
- **Supertest** para testes de integração
- **Factory Pattern** para criar dados de teste

---

## 18. Deployment

### 18.1 Checklist de Deploy

- ✅ Variáveis de ambiente configuradas
- ✅ Banco PostgreSQL provisionado
- ✅ Migrations executadas
- ✅ NODE_ENV=production
- ✅ Logs configurados
- ✅ Monitoramento ativo

### 18.2 Plataformas Sugeridas

- **Heroku** (fácil, PostgreSQL incluso)
- **Railway** (moderno, PostgreSQL fácil)
- **Render** (free tier, bom para portfólio)
- **DigitalOcean** (VPS, mais controle)
- **AWS** (EC2 + RDS, escalável)

---

## 19. Lista Completa de Endpoints (API Reference)

### Autenticação
```
POST   /api/auth/register     - Criar usuário
POST   /api/auth/login        - Login e obter JWT
```

### Classes (Turmas)
```
POST   /api/classes           - Criar turma
GET    /api/classes           - Listar todas turmas
GET    /api/classes/:id       - Buscar turma por ID
PUT    /api/classes/:id       - Atualizar turma
DELETE /api/classes/:id       - Deletar turma (se não tiver alunos)
POST   /api/classes/:id/subjects - Associar disciplinas à turma
```

### Subjects (Disciplinas)
```
POST   /api/subjects          - Criar disciplina
GET    /api/subjects          - Listar todas disciplinas
GET    /api/subjects/:id      - Buscar disciplina por ID
PUT    /api/subjects/:id      - Atualizar disciplina
DELETE /api/subjects/:id      - Deletar disciplina (se não tiver notas)
```

### Students (Alunos)
```
POST   /api/students          - Criar aluno
GET    /api/students          - Listar todos alunos
GET    /api/students/:id      - Buscar aluno por ID
PUT    /api/students/:id      - Atualizar aluno
DELETE /api/students/:id      - Deletar aluno (se não tiver notas)
```

### Grades (Notas)
```
POST   /api/grades            - Criar/Atualizar nota
GET    /api/grades/:id        - Buscar nota por ID
PUT    /api/grades/:id        - Atualizar nota
DELETE /api/grades/:id        - Deletar nota
GET    /api/grades/student/:studentId/boletim - Gerar boletim completo
```

### Health Check
```
GET    /api/health            - Verificar status da API
```

**Total:** 21 endpoints (2 públicos + 19 protegidos)

---

## 20. Próximos Passos

Com a arquitetura completa e CRUDs definidos, os próximos passos são:

### **Fase 1: Setup Inicial**
1. Criar estrutura de pastas
2. Instalar dependências (npm install)
3. Configurar .env
4. Criar banco de dados PostgreSQL

### **Fase 2: Configuração Base**
1. Setup do Sequelize (config, models/index.js)
2. Criar migrations
3. Executar migrations

### **Fase 3: Desenvolvimento por Módulos**
1. **Módulo de Autenticação**
   - Models: User
   - Controllers: authController (register, login)
   - Routes: authRoutes
   - Middlewares: auth.js

2. **Módulo de Turmas**
   - Models: Class, ClassSubject
   - Controllers: classController (create, getAll, getById, update, remove, addSubjects)
   - Routes: classRoutes

3. **Módulo de Disciplinas**
   - Models: Subject
   - Controllers: subjectController (create, getAll, getById, update, remove)
   - Routes: subjectRoutes

4. **Módulo de Alunos**
   - Models: Student
   - Controllers: studentController (create, getAll, getById, update, remove)
   - Routes: studentRoutes

5. **Módulo de Notas e Boletim**
   - Models: Grade
   - Services: gradeService, boletimService
   - Controllers: gradeController (create, getById, update, remove, getBoletim)
   - Routes: gradeRoutes

### **Fase 4: Refinamento**
1. Tratamento de erros
2. Validações completas
3. Testes (opcional)
4. Documentação final (README)

---

**Documento criado em:** 20/11/2025  
**Versão:** 2.0 (CRUD Completo)  
**Status:** Aprovado para Desenvolvimento  
**Alterações:** Adicionados endpoints GET/:id, PUT/:id, DELETE/:id para todas entidades + Controllers completos
