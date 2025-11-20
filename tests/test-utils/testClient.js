// tests/test-utils/testClient.js
// Helper to create test users and tokens for integration tests.
// This file is intentionally minimal — you can expand for auth token creation.

const jwt = require('jsonwebtoken');

module.exports = {
  createToken: (payload = { sub: 'test-user' }) => {
    // Use same secret as your app when running tests or update to mock validation
    return jwt.sign(payload, process.env.JWT_SECRET || 'test-secret', { expiresIn: '1h' });
  }
};
