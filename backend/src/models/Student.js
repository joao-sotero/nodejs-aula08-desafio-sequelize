export default (sequelize, DataTypes) => {
  const Student = sequelize.define('Student', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Nome do aluno é obrigatório'
        }
      }
    },
    classId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'classes',
        key: 'id'
      },
      validate: {
        notEmpty: {
          msg: 'classId é obrigatório'
        },
        isInt: {
          msg: 'classId deve ser um número inteiro'
        }
      }
    }
  }, {
    tableName: 'students',
    timestamps: true
  });

  Student.associate = models => {
    if (models.Class) {
      Student.belongsTo(models.Class, {
        foreignKey: 'classId',
        as: 'class'
      });
    }

    if (models.Grade) {
      Student.hasMany(models.Grade, {
        foreignKey: 'studentId',
        as: 'grades'
      });
    }

    if (models.User) {
      Student.hasOne(models.User, {
        foreignKey: 'studentId',
        as: 'user'
      });
    }
  };

  return Student;
};
