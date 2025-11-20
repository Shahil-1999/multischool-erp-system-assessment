// tests/unit/user.service.test.js

// Mock Sequelize User model
jest.mock('../../src/models/user', () => ({
  create: jest.fn(),
  findByPk: jest.fn(),
  update: jest.fn(),
  findOne: jest.fn(),
}));

const UserModel = require('../../src/models/user');

// Simple userService implementation for testing
const userService = {
  async createUser(data) {
    return await UserModel.create(data);
  },

  async getUserById(id) {
    return await UserModel.findByPk(id);
  },

  async updateUser(id, updates) {
    await UserModel.update(updates, { where: { id } });
    return await UserModel.findByPk(id);
  },
};

describe('User Service — success cases', () => {
  afterEach(() => jest.clearAllMocks());

  test('createUser should call UserModel.create and return created user', async () => {
    const input = { name: 'Alice', email: 'alice@example.com' };
    const fakeUser = { id: 'u1', ...input };
    UserModel.create.mockResolvedValue(fakeUser);

    const result = await userService.createUser(input);

    expect(UserModel.create).toHaveBeenCalledWith(input);
    expect(result).toEqual(fakeUser);
  });

  test('getUserById should return user when found', async () => {
    const fakeUser = { id: 'u2', name: 'Bob' };
    UserModel.findByPk.mockResolvedValue(fakeUser);

    const result = await userService.getUserById('u2');

    expect(UserModel.findByPk).toHaveBeenCalledWith('u2');
    expect(result).toEqual(fakeUser);
  });

  test('updateUser should call update and return updated user', async () => {
    const updates = { name: 'Bobby' };
    const updatedUser = { id: 'u2', ...updates };
    UserModel.update.mockResolvedValue([1]); // Sequelize returns [affectedRows]
    UserModel.findByPk.mockResolvedValue(updatedUser);

    const result = await userService.updateUser('u2', updates);

    expect(UserModel.update).toHaveBeenCalledWith(updates, { where: { id: 'u2' } });
    expect(result).toEqual(updatedUser);
  });
});
