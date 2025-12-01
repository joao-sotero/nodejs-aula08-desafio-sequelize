/**
 * ARQUIVO DE CONFIGURAÇÃO DE TESTES (Setup)
 * 
 * Este arquivo contém configurações globais que são executadas antes/durante/depois dos testes.
 * É útil para preparar o ambiente de testes (banco de dados, mocks globais, etc.)
 */

import { sequelize } from '../src/models/index.js';

/**
 * beforeAll - Hook do Jest que executa uma vez ANTES de todos os testes do suite
 * Usado para: configurações pesadas que não precisam ser repetidas (conexão com banco, etc.)
 */
beforeAll(async () => {
  try {
    // Testa a conexão com o banco de dados
    // authenticate() verifica se as credenciais e conexão estão corretas
    await sequelize.authenticate();
    console.log('✅ Conexão com banco de dados estabelecida');
    
    // Sincroniza o banco (cria tabelas se não existirem)
    // force: true → DROP todas as tabelas e recria (CUIDADO: apaga dados!)
    // Ideal para testes pois garante um estado limpo
    await sequelize.sync({ force: true });
    console.log('✅ Banco de dados sincronizado e limpo');
  } catch (error) {
    console.error('❌ Erro ao conectar com banco:', error);
    throw error; // Interrompe os testes se falhar
  }
});

/**
 * beforeEach - Hook do Jest que executa ANTES de cada teste individual
 * Usado para: resetar o estado entre testes (limpar dados, resetar mocks, etc.)
 * Garante isolamento: cada teste começa com dados limpos
 */
beforeEach(async () => {
  // Limpa todos os dados das tabelas mantendo a estrutura
  // cascade: true → limpa tabelas relacionadas também
  // restartIdentity: true → reseta os contadores de ID para 1
  await sequelize.truncate({ cascade: true, restartIdentity: true });
});

/**
 * afterAll - Hook do Jest que executa uma vez DEPOIS de todos os testes
 * Usado para: limpeza final, fechar conexões, liberar recursos
 */
afterAll(async () => {
  // Fecha a conexão com o banco para evitar memory leaks
  // Importante: conexões abertas podem fazer o processo do Jest não finalizar
  await sequelize.close();
  console.log('✅ Conexão com banco fechada');
});

/**
 * Aumenta o timeout global para operações de banco
 * Padrão do Jest: 5000ms (5 segundos)
 * Aumentamos para 10000ms (10 segundos) para operações assíncronas lentas
 */
jest.setTimeout(10000);
