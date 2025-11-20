const { sequelize, User, Role, School } = require("../../src/models");
const bcrypt = require("bcrypt");

beforeAll(async () => {
  // Recreate all tables
  await sequelize.sync({ force: true });

  // Create roles
  const adminRole = await Role.create({ name: "admin", description: "Admin role" });
  const teacherRole = await Role.create({ name: "teacher", description: "Teacher role" });

  // Create schools
  const school1 = await School.create({ name: "School 1", address: "Addr1", phone: "111111" });
  const school2 = await School.create({ name: "School 2", address: "Addr2", phone: "222222" });

  // Hash password
  const passwordHash = await bcrypt.hash("password123", 10);

  // Seed admin user
  await User.create({
    name: "Admin User",
    email: "admin@test.com",
    password_hash: passwordHash,
    role_id: adminRole.id,
    school_id: school1.id,
    can_edit_students: true
  });

  // Seed regular user
  await User.create({
    name: "Regular User",
    email: "user@test.com",
    password_hash: passwordHash,
    role_id: teacherRole.id,
    school_id: school2.id,
    can_edit_students: false
  });
});

afterAll(async () => {
  await sequelize.close();
});
