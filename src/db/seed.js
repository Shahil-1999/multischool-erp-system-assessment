require('dotenv').config();
const bcrypt = require('bcrypt');
const { Role, School, User, init } = require('../models');

async function seed() {
  try {
    // Sync database cleanly
    await init({ force: true }); // force recreates tables

    console.log('🌱 Starting seed...');

    // --- Roles ---
    const roleNames = [
      { name: 'superadmin', description: 'superadmin role' },
      { name: 'admin', description: 'admin role' },
      { name: 'user', description: 'user role' }
    ];

    const roles = {};
    for (const r of roleNames) {
      const role = await Role.create(r);
      roles[r.name] = role;
      console.log(`✔ Role created: ${r.name} (id: ${role.id})`);
    }

    // --- Schools ---
    const schoolNames = ['Alpha School', 'Beta School'];
    const schools = [];
    for (const name of schoolNames) {
      const school = await School.create({ name });
      schools.push(school);
      console.log(`✔ School created: ${name} (id: ${school.id})`);
    }

    // --- Users ---
    const usersToCreate = [
      {
        name: 'Super Admin',
        email: 'root@example.com',
        phone: '0000',
        role: 'superadmin',
        school_id: null,
        can_edit_students: true,
        password: 'superpass'
      },
      ...schools.flatMap(school => [
        {
          name: `${school.name} Admin`,
          email: `${school.name.toLowerCase().replace(/\s+/g,'')}_admin@example.com`,
          phone: '1111',
          role: 'admin',
          school_id: school.id,
          can_edit_students: true,
          password: 'adminpass'
        },
        {
          name: `${school.name} User`,
          email: `${school.name.toLowerCase().replace(/\s+/g,'')}_user@example.com`,
          phone: '2222',
          role: 'user',
          school_id: school.id,
          can_edit_students: false,
          password: 'userpass'
        }
      ])
    ];

    for (const u of usersToCreate) {
      const hashed = await bcrypt.hash(u.password, 10);
      const user = await User.create({
        name: u.name,
        email: u.email,
        phone: u.phone,
        role_id: roles[u.role].id,
        school_id: u.school_id,
        can_edit_students: u.can_edit_students,
        password_hash: hashed
      });
      console.log(`✔ User created: ${u.email} | Password: ${u.password} | Role: ${u.role} | School ID: ${u.school_id}`);
    }

    console.log('🌱 Seeding completed successfully');
    process.exit(0);

  } catch (err) {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  }
}

seed();
