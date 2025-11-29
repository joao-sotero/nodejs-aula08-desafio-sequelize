import bcrypt from 'bcrypt';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface) {
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    // Pegar um student existente
    const students = await queryInterface.sequelize.query(
      'SELECT id FROM students LIMIT 1;',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (students.length === 0) {
      console.log('Nenhum aluno encontrado. Execute os seeders de students primeiro.');
      return;
    }

    const studentId = students[0].id;

    await queryInterface.bulkInsert('users', [
      {
        nome: 'Aluno Teste',
        email: 'aluno@teste.com',
        password: hashedPassword,
        role: 'student',
        studentId: studentId,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    console.log('Usuário aluno criado com sucesso!');
    console.log('Email: aluno@teste.com');
    console.log('Senha: 123456');
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', {
      email: 'aluno@teste.com'
    });
  }
};
