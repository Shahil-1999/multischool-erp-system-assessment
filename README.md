# Multi-School ERP Backend (Hiring Task)

A Node.js (Express) backend for a multi-school ERP system with MySQL (Sequelize), JWT-based authentication, RBAC, and student management.

---

## Features Implemented

* **Multi-school support** (`School`, `User`, `Student` models)
* **RBAC (Role-Based Access Control)**

  * Roles: `superadmin`, `admin` (per-school), `user` (per-school)
  * `can_edit_students` flag controls write permissions on student data
* **User management**

  * Auto-generated password on creation
  * Cleartext password emailed once (stubbed in demo)
  * `must_change_password` flag for first-login password reset
* **Student management**

  * CRUD operations scoped to school
  * Access controlled by role and `can_edit_students`
* **Authentication & Authorization**

  * JWT tokens include `id`, `role`, `school_id`, `can_edit_students`
  * Passwords stored hashed (bcrypt)
* **Validation**

  * All requests validated via Joi
* **Password reset workflow**

  * Request reset link via email
  * Reset password using secure token
* **Testing**

  * Jest + Supertest
  * In-memory SQLite for isolation
  * Email sending stubbed
* **Database Seeding**

  * Default roles (`superadmin`, `admin`, `user`) created automatically
  * Seed creates 3 login-ready users:

    * Superadmin: `superadmin@example.com` / `superpass`
    * Admin (per-school): `admin@sample.com` / `adminpass`
    * Regular user (per-school): `user@sample.com` / `userpass`
  * Optional seed data for initial schools

---

## Environment Setup

1. Copy `.env.example` to `.env` and fill in values:

```env
PORT=3000
DATABASE_URL=mysql://user:pass@localhost:3306/multi_school_erp
JWT_SECRET=change_this
JWT_EXPIRES_IN=1h
EMAIL_HOST=localhost
EMAIL_PORT=1025
EMAIL_USER=
EMAIL_PASS=
```

2. Install dependencies:

```bash
npm install
```

3. Run migrations (demo uses simple Sequelize `sync()`):

```bash
npm run migrate
```

4. Run seed script to create roles and initial login users:

```bash
npm run seed
```

5. Start the server:

```bash
npm start
```

Default port: `3000`

---

## Authentication & Authorization

* JWT-based authentication
* Include token in header:

```
Authorization: Bearer <token>
```

* Multi-tenancy enforced via `school_id` checks
* Superadmin has global access

---

## Security Notes

* **Passwords**: bcrypt hashes; never store cleartext
* **Auto-generated passwords**: emailed once; in production, send a secure temporary link and force first-login password change
* **JWT**: short-lived tokens recommended; refresh token strategy advised
* **Multi-tenancy**: enforced by query scoping and `school_id` checks
* **User deletion**: demo uses hard delete; soft-delete recommended in production for audit

---

## Models

* **School**: `id`, `name`
* **User**: `id`, `name`, `email`, `phone`, `password_hash`, `role_id`, `school_id`, `can_edit_students`, `must_change_password`
* **Role**: `id`, `name` (`superadmin`, `admin`, `user`)
* **Student**: `id`, `name`, `dob`, `school_id`

---

## Endpoints

### Authentication

* `POST /auth/login` — Login
* `POST /auth/password/request` — Request password reset (`{ email, baseUrl }`)
* `POST /auth/password/reset/:token` — Reset password (`{ password }`)
* `POST /users/change-password` — Change own password (JWT required)

### Schools (superadmin only)

* `GET /schools` — List all schools
* `POST /schools` — Create school
* `GET /schools/:id` — Get school details

### Users

* `POST /schools/:school_id/users` — Create user (auto-generated password)
* `GET /schools/:school_id/users` — List users
* `GET /users/:id` — Get user details
* `PUT /users/:id` — Update user

### Students

* `POST /schools/:school_id/students` — Create student
* `GET /schools/:school_id/students` — List students
* `GET /schools/:school_id/students/:id` — Get student
* `PUT /schools/:school_id/students/:id` — Update student
* `DELETE /schools/:school_id/students/:id` — Delete student

---

## Sample `curl` Requests

```bash
# Login
curl -X POST http://localhost:3000/auth/login \
-H 'Content-Type: application/json' \
-d '{"email":"root@example.com","password":"superpass"}'

# Create school (with JWT token)
curl -X POST http://localhost:3000/schools \
-H "Authorization: Bearer $TOKEN" \
-H 'Content-Type: application/json' \
-d '{"name":"My School"}'
```

---

## Postman Collection

* Minimal Postman collection included: `postman_collection.json`

---

## Testing

* Jest + Supertest
* In-memory SQLite for isolation
* Email sending stubbed
* Run tests:

```bash
npm test
```

---
