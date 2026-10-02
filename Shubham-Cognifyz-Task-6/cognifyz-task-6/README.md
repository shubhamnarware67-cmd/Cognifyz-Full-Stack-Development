# Shubham's Private Workspace — Cognifyz Task 6

A protected task workspace using a real SQLite database and token-based authentication.

## Task coverage

- SQLite tables for users and user-owned tasks
- Password hashing with `bcryptjs`
- Register and login endpoints
- Signed JWT sessions
- Authorization middleware on profile and CRUD task endpoints
- Every task query is scoped to the authenticated user's ID
- Browser UI for registration, login, add, complete, and delete

## Run

```bash
npm install
npm start
```

Open `http://localhost:3006`.

The local SQLite file is created automatically as `shubham-workspace.db`.

**Owner:** Shubham