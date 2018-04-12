'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
        'comments',
        'reddit_id', {
          type: Sequelize.STRING
        }
      )
      .then(()=> {
      return queryInterface.addColumn(
        'comments',
        'subreddit', {
          type: Sequelize.STRING,
          allowNull: false,
        }
      )
      .then(() => {
        return queryInterface.addColumn(
        'comments',
        'post_title', {
          type: Sequelize.STRING,
          allowNull: false,
        }
      )
      .then(() => {
        return queryInterface.addColumn(
        'comments',
        'post_link', {
          type: Sequelize.STRING,
          allowNull: false,
        }
      )
      .then(() => {
        return queryInterface.addColumn(
        'comments',
        'comment_link', {
          type: Sequelize.STRING,
          allowNull: false,
        }
      )});
      });
      });
      });
  },
  down: (queryInterface, Sequelize) => {
    queryInterface.removeColumn('comments', 'reddit_id');
    queryInterface.removeColumn('comments', 'subreddit');
    queryInterface.removeColumn('comments', 'post_title');
    queryInterface.removeColumn('comments', 'post_link');
    queryInterface.removeColumn('comments', 'comment_link');
  }
};
