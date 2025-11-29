import { sequelize } from '../src/models/index.js';

// Executado uma vez antes de TODOS os testes
beforeAll(async () => {
  try {
    // Testa a conexão com o banco
    await sequelize.authenticate();
    console.log('✅ Conexão com banco de dados estabelecida');
    
    // Sincroniza o banco (cria tabelas se não existirem)
    // force: true DROP todas as tabelas e recria (cuidado!)
    await sequelize.sync({ force: true });
    console.log('✅ Banco de dados sincronizado e limpo');
  } catch (error) {
    console.error('❌ Erro ao conectar com banco:', error);
    throw error;
  }
});

// Executado ANTES de cada teste individual
beforeEach(async () => {
  // Limpa todos os dados das tabelas mantendo a estrutura
  await sequelize.truncate({ cascade: true, restartIdentity: true });
});

// Executado uma vez DEPOIS de todos os testes
afterAll(async () => {
  // Fecha a conexão com o banco
  await sequelize.close();
  console.log('✅ Conexão com banco fechada');
});

// Aumenta o timeout global para operações de banco
jest.setTimeout(10000);
