const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: process.env.DB_DIALECT || 'mysql',
      logging: console.log,
    })
  : new Sequelize(
      process.env.DB_NAME || 'multi_school_erp',
      process.env.DB_USER || 'root',
      process.env.DB_PASSWORD || '',
      {
        host: process.env.DB_HOST || 'localhost',
        dialect: process.env.DB_DIALECT || 'mysql',
        logging: console.log,
      }
    );

module.exports = { sequelize };
