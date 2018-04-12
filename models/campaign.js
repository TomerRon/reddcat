'use strict';

module.exports = (sequelize, DataTypes) => {
  var Campaign = sequelize.define('campaign', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
      primaryKey: true
    },
    keywords: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: false,
        validate: {
          len: 1
        }
    },
    lastSeenCommentId: {
        type: DataTypes.INTEGER,
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  });
  
  Campaign.associate = function(models) {
    Campaign.belongsToMany(models.comment, {through: { model: models.CampaignComment, unique: false }, foreignKey: 'campaignId'});
    Campaign.hasMany(models.event);
    Campaign.belongsTo(models.user);
  }
  return Campaign;
};