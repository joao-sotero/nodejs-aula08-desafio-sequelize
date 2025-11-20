export default (sequelize, DataTypes) => {
  const Subject = sequelize.define('Subject', {
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
          msg: 'Nome da disciplina é obrigatório'
        }
      }
    }
  }, {
    tableName: 'subjects',
    timestamps: true
  });

  Subject.associate = models => {
    if (models.Class && models.ClassSubject) {
      Subject.belongsToMany(models.Class, {
        through: models.ClassSubject,
        foreignKey: 'subjectId',
        otherKey: 'classId',
        as: 'classes'
      });
    }

    if (models.Grade) {
      Subject.hasMany(models.Grade, {
        foreignKey: 'subjectId',
        as: 'grades'
      });
    }
  };

  return Subject;
};
