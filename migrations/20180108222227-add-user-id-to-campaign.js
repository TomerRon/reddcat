'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
        'campaigns',
        'userId', {
          type: Sequelize.INTEGER,
          references: {
            model: 'users',
            key: 'id'
          },
          onDelete: 'cascade'
        }
    );
  },
  down: (queryInterface, Sequelize) => {
    queryInterface.removeColumn('campaigns', 'userId');
  }
};
