/** @type {import('sequelize-cli').Seeder} */
export default {
  async up(queryInterface) {
    const now = new Date();

      const students = await queryInterface.sequelize.query(
      "SELECT id FROM subjects where nome IN ('Matemática', 'Português', 'História', 'Geografia', 'Ciências');",
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if(students.length > 0 )
      return;

    await queryInterface.bulkInsert('subjects', [
      { nome: 'Matemática', createdAt: now, updatedAt: now },
      { nome: 'Português', createdAt: now, updatedAt: now },
      { nome: 'História', createdAt: now, updatedAt: now },
      { nome: 'Geografia', createdAt: now, updatedAt: now },
      { nome: 'Ciências', createdAt: now, updatedAt: now }
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('subjects', {
      nome: ['Matemática', 'Português', 'História', 'Geografia', 'Ciências']
    });
  }
};
