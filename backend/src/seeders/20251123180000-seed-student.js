/** @type {import('sequelize-cli').Seeder} */
export default {
  async up(queryInterface) {
    const now = new Date();

      const student = await queryInterface.sequelize.query(
      "SELECT id FROM students where nome = 'aluno';",
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    
    if(student.length > 0 )
      return;

    const classId = await queryInterface.sequelize.query(
      "SELECT id FROM classes limit 1",
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    
    await queryInterface.bulkInsert('students', [
      {
        nome: 'aluno',
        classId: classId[0].id,
        createdAt: now,
        updatedAt: now
      }
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('students', {});
  }
};
