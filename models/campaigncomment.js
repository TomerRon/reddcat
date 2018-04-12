module.exports = (sequelize, DataTypes) => {
  var CampaignComment = sequelize.define('CampaignComment', {
    campaignId: {
        allowNull: false,
        type: DataTypes.UUID
    },
    commentId: {
        allowNull: false,
        type: DataTypes.INTEGER
    },
  });

  return CampaignComment;
};