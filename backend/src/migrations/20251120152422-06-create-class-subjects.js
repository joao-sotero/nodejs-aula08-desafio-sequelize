/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('class_subjects', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      classId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'classes',
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

    await queryInterface.addIndex('class_subjects', ['classId', 'subjectId'], {
      unique: true,
      name: 'class_subjects_class_subject_unique'
    });

    await queryInterface.addIndex('class_subjects', ['classId'], {
      name: 'class_subjects_class_id_index'
    });

    await queryInterface.addIndex('class_subjects', ['subjectId'], {
      name: 'class_subjects_subject_id_index'
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('class_subjects');
  }
};
