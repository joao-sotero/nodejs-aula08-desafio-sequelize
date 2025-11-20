/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('grades', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      studentId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'students',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      subjectId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'subjects',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      unidade: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      teste: {
        type: Sequelize.DECIMAL(4, 2),
        allowNull: false
      },
      prova: {
        type: Sequelize.DECIMAL(4, 2),
        allowNull: false
      },
      mediaUnidade: {
        type: Sequelize.DECIMAL(4, 2),
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('grades', ['studentId', 'subjectId', 'unidade'], {
      unique: true,
      name: 'grades_student_subject_unit_unique'
    });

    await queryInterface.addIndex('grades', ['studentId'], {
      name: 'grades_student_id_index'
    });

    await queryInterface.addIndex('grades', ['subjectId'], {
      name: 'grades_subject_id_index'
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('grades');
  }
};
