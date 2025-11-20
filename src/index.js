require('dotenv').config(); // Load .env first
const app = require('./server');
const models = require('./models');
const { sequelize } = require('./db');

const port = process.env.PORT || 3000;

async function start() {
  try {
    console.log("🔄 Initializing models...");
    await models.init();

    console.log("🔄 Syncing database...");
    await sequelize.sync({ alter: true }); // auto-migrate changes (optional: { force: true } for dev reset)

    app.listen(port, () => {
      console.log(`✅ Server listening on port ${port}`);
    });

  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

start();

// Optional: handle unhandled promise rejections globally
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
