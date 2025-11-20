// tests/integration/users.routes.test.js
const request = require('supertest');
const app = require('../../src/server');

// Mock authMiddleware so requests have a logged-in user
jest.mock('../../src/middlewares/authMiddleware', () => ({
  authMiddleware: (req, res, next) => {
    req.user = { id: 1, role: 'superadmin', school_id: 1 };
    next();
  },
}));

// Mock usersController to return predictable data
jest.mock('../../src/controllers/usersController', () => ({
  listForSchool: (req, res) => res.status(200).json([
    { id: 1, name: 'Alice', email: 'alice@example.com' },
    { id: 2, name: 'Bob', email: 'bob@example.com' },
  ]),
  createForSchool: (req, res) => res.status(201).json({
    id: 3,
    ...req.body
  }),
  getUser: (req, res) => res.status(200).json({ id: req.params.id, name: 'Alice', email: 'alice@example.com' }),
  updateUser: (req, res) => res.status(200).json({ id: req.params.id, ...req.body }),
}));

describe('Users routes — success cases', () => {
  const schoolId = 1;

  test('GET /schools/:school_id/users responds correctly', async () => {
    const res = await request(app).get(`/schools/${schoolId}/users`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('id');
    expect(res.body[0]).toHaveProperty('name');
  });

  test('POST /schools/:school_id/users creates a user', async () => {
    const newUser = {
      name: 'Charlie',
      email: `charlie${Date.now()}@example.com`,
      role: 'teacher',
    };

    const res = await request(app).post(`/schools/${schoolId}/users`).send(newUser);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.email).toBe(newUser.email);
  });

  test('GET /schools/:school_id/users/:id responds with a single user', async () => {
    const userId = 1;
    const res = await request(app).get(`/schools/${schoolId}/users/${userId}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', String(userId));
    expect(res.body).toHaveProperty('name');
  });

  test('PUT /schools/:school_id/users/:id updates a user', async () => {
    const userId = 1;
    const updates = { name: 'Updated Name' };
    const res = await request(app).put(`/schools/${schoolId}/users/${userId}`).send(updates);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', String(userId));
    expect(res.body.name).toBe(updates.name);
  });
});
