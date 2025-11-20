/** @type {import('sequelize-cli').Seeder} */
export default {
  async up(queryInterface) {
    const now = new Date();

    await queryInterface.bulkInsert('classes', [
      { nome: '1º Ano A', createdAt: now, updatedAt: now },
      { nome: '2º Ano B', createdAt: now, updatedAt: now },
      { nome: '3º Ano A', createdAt: now, updatedAt: now }
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('classes', {
      nome: ['1º Ano A', '2º Ano B', '3º Ano A']
    });
  }
};
