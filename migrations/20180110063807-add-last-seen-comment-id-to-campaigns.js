'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
        'campaigns',
        'lastSeenCommentId', {
          type: Sequelize.INTEGER,
        }
    );
  },
  down: (queryInterface, Sequelize) => {
    queryInterface.removeColumn('campaigns', 'lastSeenCommentId');
  }
};
