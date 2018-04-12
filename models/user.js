'use strict';
var bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  var User = sequelize.define('user', {
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    type: DataTypes.STRING
  });
  
  User.associate = function(models) {
    User.hasMany(models.campaign, {onDelete: 'CASCADE'});
  }
  
  User.generateHash = function generateHash(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8));
  }
  User.prototype.validPassword = function validPassword(password) {
    return bcrypt.compareSync(password, this.password);
  }
  
  return User;
};