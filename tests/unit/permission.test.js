// tests/unit/permissions.test.js
const {
  requireRole,
  requireEditStudents,
  canAccessRole,
  dynamicAccess,
} = require('../../src/middlewares/rbacMiddleware'); // adjust path if needed

// Mock Express req/res/next
function mockReqRes(user = {}, params = {}) {
  const req = { user, params };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
  const next = jest.fn();
  return { req, res, next };
}

describe('RBAC Middleware — requireRole()', () => {
  test('allows request when user has allowed role', () => {
    const mw = requireRole('admin', 'teacher');
    const { req, res, next } = mockReqRes({ role: 'teacher' });

    mw(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  test('blocks request when user role is not allowed', () => {
    const mw = requireRole('admin');
    const { req, res, next } = mockReqRes({ role: 'student' });

    mw(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalled();
  });
});

describe('RBAC Middleware — requireEditStudents()', () => {
  test('superadmin bypasses all checks', () => {
    const mw = requireEditStudents();
    const { req, res, next } = mockReqRes({ role: 'superadmin' });

    mw(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  test('admin allowed if school_id matches', () => {
    const mw = requireEditStudents();
    const { req, res, next } = mockReqRes(
      { role: 'admin', school_id: 10 },
      { school_id: 10 }
    );

    mw(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  test('user with can_edit_students is allowed', () => {
    const mw = requireEditStudents();
    const { req, res, next } = mockReqRes(
      { role: 'user', can_edit_students: true, school_id: 5 },
      { school_id: 5 }
    );

    mw(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});

describe('RBAC — canAccessRole()', () => {
  test('superadmin can access any target', () => {
    const result = canAccessRole(
      { role: 'superadmin' },
      { id: 50, school_id: 3 }
    );
    expect(result).toBe(true);
  });

  test('admin can access target in same school', () => {
    const result = canAccessRole(
      { role: 'admin', school_id: 4 },
      { id: 20, school_id: 4 }
    );
    expect(result).toBe(true);
  });

  test('user can only access themselves', () => {
    const result = canAccessRole(
      { role: 'user', id: 10 },
      { id: 10 }
    );
    expect(result).toBe(true);
  });
});

describe('RBAC — dynamicAccess()', () => {
  test('allows request when checkFn returns true', async () => {
    const checkFn = jest.fn().mockResolvedValue(true);
    const mw = dynamicAccess(checkFn);
    const { req, res, next } = mockReqRes();

    await mw(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  test('passes error to next when checkFn throws', async () => {
    const error = new Error('fail');
    const checkFn = jest.fn().mockRejectedValue(error);
    const mw = dynamicAccess(checkFn);
    const { req, res, next } = mockReqRes();

    await mw(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});
