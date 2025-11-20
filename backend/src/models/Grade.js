export default (sequelize, DataTypes) => {
  const Grade = sequelize.define('Grade', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    studentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'students',
        key: 'id'
      }
    },
    subjectId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'subjects',
        key: 'id'
      }
    },
    unidade: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: {
          args: [1],
          msg: 'Unidade deve ser no mínimo 1'
        },
        max: {
          args: [4],
          msg: 'Unidade deve ser no máximo 4'
        }
      }
    },
    teste: {
      type: DataTypes.DECIMAL(4, 2),
      allowNull: false,
      get() {
        const value = this.getDataValue('teste');
        return value ? parseFloat(value) : value;
      },
      validate: {
        min: {
          args: [0],
          msg: 'Nota do teste deve ser no mínimo 0'
        },
        max: {
          args: [10],
          msg: 'Nota do teste deve ser no máximo 10'
        }
      }
    },
    prova: {
      type: DataTypes.DECIMAL(4, 2),
      allowNull: false,
      get() {
        const value = this.getDataValue('prova');
        return value ? parseFloat(value) : value;
      },
      validate: {
        min: {
          args: [0],
          msg: 'Nota da prova deve ser no mínimo 0'
        },
        max: {
          args: [10],
          msg: 'Nota da prova deve ser no máximo 10'
        }
      }
    },
    mediaUnidade: {
      type: DataTypes.DECIMAL(4, 2),
      allowNull: false,
      get() {
        const value = this.getDataValue('mediaUnidade');
        return value ? parseFloat(value) : value;
      },
      validate: {
        min: {
          args: [0],
          msg: 'Média da unidade deve ser no mínimo 0'
        },
        max: {
          args: [10],
          msg: 'Média da unidade deve ser no máximo 10'
        }
      }
    }
  }, {
    tableName: 'grades',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['studentId', 'subjectId', 'unidade'],
        name: 'grades_student_subject_unidade_unique'
      }
    ]
  });

  const calculateMedia = gradeInstance => {
    if (gradeInstance.teste !== null && gradeInstance.prova !== null) {
      gradeInstance.mediaUnidade = parseFloat(((gradeInstance.teste + gradeInstance.prova) / 2).toFixed(2));
    }
  };

  Grade.beforeCreate(calculateMedia);
  Grade.beforeUpdate(calculateMedia);
  Grade.beforeSave(calculateMedia);

  Grade.associate = models => {
    if (models.Student) {
      Grade.belongsTo(models.Student, {
        foreignKey: 'studentId',
        as: 'student'
      });
    }

    if (models.Subject) {
      Grade.belongsTo(models.Subject, {
        foreignKey: 'subjectId',
        as: 'subject'
      });
    }
  };

  return Grade;
};
