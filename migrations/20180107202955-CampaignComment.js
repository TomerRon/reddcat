'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('CampaignComments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      campaignId: {
        type: Sequelize.UUID,
        references: { model: 'campaigns', key: 'id' },
        onDelete: 'CASCADE'
      },
      commentId: {
        type: Sequelize.INTEGER,
        references: { model: 'comments', key: 'id' },
        onDelete: 'CASCADE'
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
    return queryInterface.dropTable('CampaignComments');
  }
};
