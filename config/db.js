require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_DEVELOPMENT_USERNAME,
    password: process.env.DB_DEVELOPMENT_PASSWORD,
    database: process.env.DB_DEVELOPMENT_DBNAME,
    host: process.env.DB_DEVELOPMENT_HOST,
    dialect: "postgres",
    logging: false
  },
  production: {
    username: process.env.DB_PRODUCTION_USERNAME,
    password: process.env.DB_PRODUCTION_PASSWORD,
    database: process.env.DB_PRODUCTION_DBNAME,
    host: process.env.DB_PRODUCTION_HOST,
    dialect: "postgres",
    logging: false,
  }
};
