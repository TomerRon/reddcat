'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('campaigns', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID
      },
      keywords: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: false,
        validate: {
          len: 1
        }
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('campaigns');
  }
};