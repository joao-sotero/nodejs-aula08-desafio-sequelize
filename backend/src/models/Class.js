export default (sequelize, DataTypes) => {
  const Class = sequelize.define('Class', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nome: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Nome da turma é obrigatório'
        }
      }
    }
  }, {
    tableName: 'classes',
    timestamps: true
  });

  Class.associate = models => {
    if (models.Student) {
      Class.hasMany(models.Student, {
        foreignKey: 'classId',
        as: 'students'
      });
    }

    if (models.Subject && models.ClassSubject) {
      Class.belongsToMany(models.Subject, {
        through: models.ClassSubject,
        foreignKey: 'classId',
        otherKey: 'subjectId',
        as: 'subjects'
      });
    }
  };

  return Class;
};
