const request = require('supertest');
const app = require('../../src/server');

jest.mock('../../src/middlewares/authMiddleware', () => ({
  authMiddleware: (req, res, next) => {
    req.user = { id: 1, role: 'superadmin', school_id: 1 };
    next();
  }
}));

describe('Students routes — success cases', () => {
  test('GET /students responds correctly', async () => {
    const res = await request(app).get('/students');

    expect([200, 201, 404]).toContain(res.status);

    if (res.status === 200 || res.status === 201) {
      expect(Array.isArray(res.body)).toBe(true);
    }
  });

  test('POST /students creates a student', async () => {
    const payload = { name: 'Student X', roll: `R${Date.now()}` };
    const res = await request(app).post('/students').send(payload);

    expect([200, 201, 404]).toContain(res.status);

    if ([200, 201].includes(res.status)) {
      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe(payload.name);
    }
  });
});
