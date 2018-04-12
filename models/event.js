'use strict';
module.exports = (sequelize, DataTypes) => {
  var Event = sequelize.define('event', {
    message: DataTypes.TEXT
  });
  Event.associate = function(models) {
    Event.belongsTo(models.campaign);
  }
  return Event;
};