// tests/test-utils/setupTestDB.js
// A lightweight DB mocking setup to ensure deterministic tests.
// If your project uses a real DB connection in tests, replace or expand this file.

module.exports = {
  connect: async () => {
    // If using mongoose, you can connect to an in-memory server here
    // For now, we return a resolved promise to satisfy tests that call setup
    return Promise.resolve();
  },
  clear: async () => Promise.resolve(),
  close: async () => Promise.resolve(),
};
