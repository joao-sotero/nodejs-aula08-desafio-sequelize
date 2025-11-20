/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'role', {
      type: Sequelize.ENUM('admin', 'student'),
      allowNull: false,
      defaultValue: 'admin',
      after: 'password'
    });

    await queryInterface.addColumn('users', 'studentId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'students',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      after: 'role'
    });

    await queryInterface.addIndex('users', ['studentId'], {
      name: 'users_student_id_index'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'studentId');
    await queryInterface.removeColumn('users', 'role');
  }
};
