'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
        'campaigns',
        'active', {
          type: Sequelize.BOOLEAN,
          defaultValue: true
        }
    );
  },
  down: (queryInterface, Sequelize) => {
    queryInterface.removeColumn('campaigns', 'active');
  }
};
