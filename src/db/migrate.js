require('dotenv').config();
const { init } = require('../models'); // make sure init is exported from models/index.js

async function migrate() {
  try {
    console.log('🔄 Migrating database...');
    
    // Initialize models and sync tables
    // Use { alter: true } to update tables without dropping them
    // Use { force: true } if you want to drop & recreate tables (clean slate)
    await init({ alter: true }); 

    console.log('✅ Database migrated successfully.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

migrate();
