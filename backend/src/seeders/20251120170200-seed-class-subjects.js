/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface) {
    const now = new Date();

    // Buscar IDs das turmas
    const classes = await queryInterface.sequelize.query(
      'SELECT id, nome FROM classes ORDER BY id;',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    // Buscar IDs das disciplinas
    const subjects = await queryInterface.sequelize.query(
      'SELECT id, nome FROM subjects ORDER BY id;',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (classes.length === 0 || subjects.length === 0) {
      console.log('Nenhuma turma ou disciplina encontrada. Execute os seeders anteriores primeiro.');
      return;
    }

    // Criar vínculos entre turmas e disciplinas
    const classSubjects = [];

    // 1º Ano A - Todas as disciplinas
    if (classes[0]) {
      subjects.forEach(subject => {
        classSubjects.push({
          classId: classes[0].id,
          subjectId: subject.id,
          createdAt: now,
          updatedAt: now
        });
      });
    }

    // 2º Ano B - Matemática, Português, História, Geografia
    if (classes[1]) {
      subjects.slice(0, 4).forEach(subject => {
        classSubjects.push({
          classId: classes[1].id,
          subjectId: subject.id,
          createdAt: now,
          updatedAt: now
        });
      });
    }

    // 3º Ano A - Todas as disciplinas
    if (classes[2]) {
      subjects.forEach(subject => {
        classSubjects.push({
          classId: classes[2].id,
          subjectId: subject.id,
          createdAt: now,
          updatedAt: now
        });
      });
    }

    await queryInterface.bulkInsert('class_subjects', classSubjects);

    console.log('Vínculos entre turmas e disciplinas criados com sucesso!');
    console.log(`Total de vínculos: ${classSubjects.length}`);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('class_subjects', null, {});
  }
};
