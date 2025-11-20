import bcrypt from 'bcrypt';

/** @type {import('sequelize-cli').Seeder} */
export default {
  async up(queryInterface) {
    const now = new Date();
    const passwordHash = await bcrypt.hash('senha123', 10);

    await queryInterface.bulkInsert('users', [
      {
        nome: 'Administrador',
        email: 'admin@escola.com',
        password: passwordHash,
        createdAt: now,
        updatedAt: now
      }
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', { email: 'admin@escola.com' });
  }
};
