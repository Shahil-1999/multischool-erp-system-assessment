// tests/jest.setup.js
// Global test setup: prevent real DB connections and bypass auth/permission middleware.

process.env.NODE_ENV = process.env.NODE_ENV || 'test';

// --- Mock permission / auth middleware so routes don't return 401 in integration tests ---
// Adjust path names if your real middleware has a different filename.
// We try to mock both common names used in your repo.
const mockPermissions = {
  requireLogin: (req, res, next) => next(),
  requireRole: (...roles) => (req, res, next) => next(),
  requireEditStudents: (opts) => (req, res, next) => next(),
  canAccessRole: (user, target, opts) => true,
  dynamicAccess: (fn) => (req, res, next) => next(),
};

try {
  jest.mock('../../src/middleware/permissions', () => mockPermissions);
} catch (e) {
  // ignore if file not present
}

try {
  jest.mock('../../src/middleware/auth', () => ({
    requireLogin: (req, res, next) => next(),
    requireRole: (...roles) => (req, res, next) => next(),
  }));
} catch (e) {}


// --- Mock models / sequelize to avoid real DB connections during require() ---
// This prevents src/index or any model file from trying to connect to MySQL at import time.
// We provide minimal shape used by app code (User, Role, sequelize.sync).
const noop = () => {};
const mockSequelize = {
  sync: jest.fn().mockResolvedValue(),
  authenticate: jest.fn().mockResolvedValue(),
};

const mockModel = () => ({
  findOne: jest.fn().mockResolvedValue(null),
  findAll: jest.fn().mockResolvedValue([]),
  create: jest.fn().mockResolvedValue({}),
  findByPk: jest.fn().mockResolvedValue(null),
  findById: jest.fn().mockResolvedValue(null),
  findByIdAndUpdate: jest.fn().mockResolvedValue(null),
  findByIdAndDelete: jest.fn().mockResolvedValue(null),
  update: jest.fn().mockResolvedValue([1]),
  destroy: jest.fn().mockResolvedValue(1),
});

try {
  jest.mock('../../src/models', () => ({
    sequelize: mockSequelize,
    Sequelize: {}, // minimal placeholder
    User: mockModel(),
    Role: mockModel(),
    Student: mockModel(),
  }));
} catch (e) {}

try {
  // Also mock explicit model files if your tests import them directly
  jest.mock('../../src/models/user', () => mockModel());
  jest.mock('../../src/models/role', () => mockModel());
  jest.mock('../../src/models/student', () => mockModel());
} catch (e) {}
