'use strict';

module.exports = (sequelize, DataTypes) => {
  var Comment = sequelize.define('comment', {
    author: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: 1
        }
    },
    body: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          len: 1
        }
    },
    reddit_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    subreddit: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    post_title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    post_link: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    comment_link: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });
  Comment.associate = function(models) {
    Comment.belongsToMany(models.campaign, {through: { model: models.CampaignComment, unique: false }, foreignKey: 'commentId'});
  }
  return Comment;
};