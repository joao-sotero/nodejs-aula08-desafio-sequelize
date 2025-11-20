export default (sequelize, DataTypes) => {
  const ClassSubject = sequelize.define('ClassSubject', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    classId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'classes',
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
    }
  }, {
    tableName: 'class_subjects',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['classId', 'subjectId']
      }
    ]
  });

  ClassSubject.associate = models => {
    ClassSubject.belongsTo(models.Class, {
      foreignKey: 'classId',
      as: 'class'
    });

    ClassSubject.belongsTo(models.Subject, {
      foreignKey: 'subjectId',
      as: 'subject'
    });
  };

  return ClassSubject;
};
