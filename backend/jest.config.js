
export default {
  // Define o ambiente de execução dos testes como Node.js (obrigatório)
  // Outras opções: 'jsdom' para testes de navegador
  testEnvironment: 'node',

  // Define transformações para código antes de executar os testes (opcional)
  // {} = sem transformações - necessário para usar ESM nativo no Jest
  // Para TypeScript ou Babel, você configuraria transformações aqui
  transform: {},

  // Mapeia importações de módulos para facilitar testes com ESM (NECESSÁRIO para ESM)
  // Remove a extensão .js das importações para que o Jest resolva corretamente
  // Exemplo: import './file.js' → procura './file'
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },

  // Padrão glob para encontrar arquivos de teste (obrigatório)
  // Busca todos os arquivos .test.js dentro da pasta tests/
  testMatch: ['**/tests/**/*.test.js'],

  // Arquivos de configuração executados após o ambiente de teste ser configurado (opcional)
  // Comentado pois não estamos usando setup global no momento
  // setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],

  // Arquivos a serem incluídos no relatório de cobertura (opcional)
  // Inclui todos os .js da pasta src/ exceto os listados com !
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',           // Excluído: apenas inicia o servidor
    '!src/app.js',              // Excluído: configuração do express
    '!src/models/index.js',     // Excluído: configuração do Sequelize
    '!src/config/**',           // Excluído: apenas configurações
    '!src/migrations/**',       // Excluído: scripts de migração
    '!src/seeders/**'           // Excluído: scripts de seed
  ],

  // Diretório onde os relatórios de cobertura serão salvos (opcional)
  coverageDirectory: 'coverage',

  // Formatos do relatório de cobertura (opcional)
  // text: mostra no terminal
  // lcov: arquivo padrão para ferramentas externas
  // html: gera relatório HTML visual
  coverageReporters: ['text', 'lcov', 'html'],

  // Mostra descrição detalhada de cada teste no console (opcional)
  // false = mostra apenas resumo
  verbose: true,

  // Opções específicas do ambiente de teste (NECESSÁRIO para ESM)
  // customExportConditions: configura como o Node.js resolve exports em package.json
  // Permite que o Jest funcione corretamente com módulos ESM modernos
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons'],
  }
};
