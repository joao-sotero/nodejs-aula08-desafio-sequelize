import bcrypt from 'bcrypt';

export default (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
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
          msg: 'Nome é obrigatório'
        }
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        msg: 'Email já cadastrado'
      },
      validate: {
        notEmpty: {
          msg: 'Email é obrigatório'
        },
        isEmail: {
          msg: 'Email inválido'
        }
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [6, 100],
          msg: 'Senha deve ter entre 6 e 100 caracteres'
        }
      }
    },
    role: {
      type: DataTypes.ENUM('admin', 'student'),
      allowNull: false,
      defaultValue: 'admin'
    },
    studentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'students',
        key: 'id'
      }
    }
  }, {
    tableName: 'users',
    timestamps: true,
    defaultScope: {
      attributes: { exclude: ['password'] }
    },
    scopes: {
      withPassword: {
        attributes: { }
      }
    }
  });

  const hashPassword = async (user) => {
    if (user.changed('password')) {
      user.password = await bcrypt.hash(user.password, 10);
    }
  };

  User.beforeCreate(hashPassword);
  User.beforeUpdate(hashPassword);

  User.prototype.validatePassword = function (password) {
    return bcrypt.compare(password, this.password);
  };

  User.associate = models => {
    if (models.Student) {
      User.belongsTo(models.Student, {
        foreignKey: 'studentId',
        as: 'student'
      });
    }
  };

  return User;
};
