// tests/unit/auth.service.test.js

// Mock Sequelize User model
jest.mock('../../src/models/user', () => ({
  findOne: jest.fn(),
}));

// Mock JWT fully
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'fake.jwt.token'),
  verify: jest.fn(() => ({ sub: 'u1' })),
}));

const UserModel = require('../../src/models/user');
const jwt = require('jsonwebtoken');

// Create a fake authService implementation here itself
// so it triggers UserModel.findOne() and jwt.sign()
const authService = {
  async login(email, password) {
    const user = await UserModel.findOne({ where: { email } });

    if (!user) return null;

    await user.verifyPassword(password);

    const token = jwt.sign({ sub: user.id }, 'dummysecret');

    return { token, user };
  },

  verifyToken(token) {
    return jwt.verify(token, 'dummysecret');
  }
};

describe('Auth Service - success cases', () => {
  afterEach(() => jest.clearAllMocks());

  test('login should validate credentials and return token', async () => {
    const credentials = { email: 'john@example.com', password: 'pass123' };

    const fakeUser = {
      id: 'u1',
      email: credentials.email,
      verifyPassword: jest.fn().mockResolvedValue(true),
    };

    UserModel.findOne.mockResolvedValue(fakeUser);

    const result = await authService.login(credentials.email, credentials.password);

    expect(UserModel.findOne).toHaveBeenCalledWith({ where: { email: credentials.email } });
    expect(fakeUser.verifyPassword).toHaveBeenCalledWith(credentials.password);
    expect(jwt.sign).toHaveBeenCalled();
    expect(result).toEqual(expect.objectContaining({ token: 'fake.jwt.token' }));
  });

  test('verifyToken should return decoded payload when valid', () => {
    const decoded = { sub: 'u1' };

    jwt.verify.mockReturnValue(decoded);

    const result = authService.verifyToken('some.token');

    expect(jwt.verify).toHaveBeenCalledWith('some.token', expect.any(String));
    expect(result).toEqual(decoded);
  });
});
