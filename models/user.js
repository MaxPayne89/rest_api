'use strict';
const Sequelize = require('sequelize');

module.exports = (sequelize) => {
  class User extends Sequelize.Model {}
  User.init({
    id: {
      primaryKey: true,
      autoIncrement: true,
      type: Sequelize.INTEGER
    },
    firstName: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "The user must have a first name!"
        },
        notEmpty: {
          msg: "The user must have a first name!"
        }
      }
    },
    lastName: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "The user must have a last name!"
        },
        notEmpty: {
          msg: "The user must have a last name!"
        }
      }
    },
    emailAddress: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "The user must have an email address!"
        },
        notEmpty: {
          msg: "The user must have an email address!"
        }
      }
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "The user must have a password!"
        },
        notEmpty: {
          msg: "The user must have a password!"
        }
      }
    },
  }, { sequelize });

  User.associate = (models) => {
    User.hasMany(models.Course, {
      foreignKey: {
        fieldName: 'userId',
        allowNull: false
      }
    })
  }

  return User;
};
