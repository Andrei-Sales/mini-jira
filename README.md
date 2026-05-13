# MiniJira

MiniJira is a JIRA-inspired project management web app with a Spring Boot backend and React frontend.

## Tech Stack

- Backend: Java 17, Spring Boot 3, Spring Security, Spring Data JPA, Flyway, Maven
- Frontend: React + TypeScript + Vite
- UI: Tailwind CSS + reusable component library
- Database: PostgreSQL (Supabase-compatible)
- Auth: JWT + BCrypt

## Implemented Features

### Authentication
- Register
- Login
- Logout (JWT stateless flow)
- JWT-protected APIs
- BCrypt password hashing
- Roles: `ADMIN`, `PROJECT_MANAGER`, `DEVELOPER`, `QA`

### User Management
- Admin user listing (with pagination/search)
- Admin create user
- Admin update user role
- Admin deactivate user

### Projects
- Create, edit, delete projects
- View project details
- Assign/remove project members
- Member candidates endpoint for Admin/Project Manager

### Issues / Tickets
- Create, edit, delete issues
- View issue details
- Assign issue to user
- Filter by project, assignee, status, priority, type

### Kanban
- Columns: `TODO`, `IN_PROGRESS`, `IN_REVIEW`, `DONE`
- Drag and drop issue cards
- Status update persisted to backend after drop

### Comments
- Add comments to issue
- View comment history
- Delete own comments (or admin override)

### Dashboard
- Total projects
- Total issues
- Issues by status
- Issues assigned to current user
- Recent activity
- Charts with Recharts

### UI Pages
- Login
- Register
- Dashboard
- Projects list
- Project details
- Kanban board
- Issues page + issue details modal
- User management
- Profile

## Project Structure

```text
backend/
  src/main/java/com/example/minijira/
    config/
    controller/
    dto/
    entity/
    enums/
    exception/
    mapper/
    repository/
    security/
    service/
    util/
  src/main/resources/
    db/migration/
    application.yml

frontend/
  src/
    api/
    components/
    contexts/
    hooks/
    layouts/
    pages/
    routes/
    types/
    utils/
```

## Supabase Setup

1. Create a Supabase project.
2. Go to **Project Settings -> Database**.
3. Copy connection values:
   - Host: `db.<project-ref>.supabase.co`
   - Port: `5432`
   - Database: `postgres`
   - User: usually `postgres`
   - Password: your database password
4. Build JDBC URL:
   - `jdbc:postgresql://db.<project-ref>.supabase.co:5432/postgres?sslmode=require`
5. Set backend environment variables (see `backend/.env.example`).

## Environment Variables

### Backend (`backend/.env`)

```bash
DB_HOST=db.<your-project-ref>.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USERNAME=postgres
DB_PASSWORD=your-supabase-db-password
JWT_SECRET=change-this-to-at-least-32-characters-long-secret
JWT_EXPIRATION=86400000
CORS_ALLOWED_ORIGINS=http://localhost:5173
APP_SEED_ENABLED=true
```

`backend/src/main/resources/application.yml` is configured with `spring.config.import=optional:file:./.env[.properties]`, so this `.env` file is loaded automatically when you run from `backend/`.
`DB_URL` is optional; if present, it overrides `DB_HOST`/`DB_PORT`/`DB_NAME`.

If startup fails with `UnknownHostException` (for example on `db.<project-ref>.supabase.co`), your network/runtime likely cannot use that direct IPv6 host. In Supabase Dashboard, copy the **Session pooler** connection (IPv4-compatible), then set:
- `DB_URL=jdbc:postgresql://aws-0-<region>.pooler.supabase.com:5432/postgres?sslmode=require`
- `DB_USERNAME=postgres.<your-project-ref>`

### Frontend (`frontend/.env`)

```bash
VITE_API_BASE_URL=http://localhost:8080/api
```

## Run Locally

### 1. Backend

```bash
cd backend
mvn spring-boot:run
```

Flyway will create schema automatically. `AppDataSeeder` inserts sample data on first run if `APP_SEED_ENABLED=true`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend default URL: `http://localhost:5173`

## Sample Users

Inserted automatically by backend seeder:

- `admin@minijira.dev` / `Admin@123` (`ADMIN`)
- `pm@minijira.dev` / `Pm@12345` (`PROJECT_MANAGER`)
- `dev@minijira.dev` / `Dev@12345` (`DEVELOPER`)
- `qa@minijira.dev` / `Qa@12345` (`QA`)

## API Documentation (Core Endpoints)

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`

### Profile
- `GET /api/profile`
- `PUT /api/profile`

### Users
- `GET /api/users` (ADMIN)
- `GET /api/users/{id}` (ADMIN)
- `POST /api/users` (ADMIN)
- `PUT /api/users/{id}` (ADMIN)
- `PATCH /api/users/{id}/role` (ADMIN)
- `PATCH /api/users/{id}/deactivate` (ADMIN)

### Projects
- `GET /api/projects`
- `GET /api/projects/{id}`
- `POST /api/projects` (ADMIN, PROJECT_MANAGER)
- `PUT /api/projects/{id}` (ADMIN, PROJECT_MANAGER)
- `DELETE /api/projects/{id}` (ADMIN, PROJECT_MANAGER)
- `POST /api/projects/{id}/members` (ADMIN, PROJECT_MANAGER)
- `DELETE /api/projects/{id}/members/{memberId}` (ADMIN, PROJECT_MANAGER)
- `GET /api/projects/member-candidates` (ADMIN, PROJECT_MANAGER)

### Issues
- `GET /api/issues`
- `GET /api/issues/{id}`
- `POST /api/issues`
- `PUT /api/issues/{id}`
- `PATCH /api/issues/{id}/status`
- `DELETE /api/issues/{id}` (ADMIN, PROJECT_MANAGER)

### Comments
- `GET /api/issues/{issueId}/comments`
- `POST /api/issues/{issueId}/comments`
- `DELETE /api/issues/{issueId}/comments/{commentId}`

### Dashboard
- `GET /api/dashboard/stats`
- `GET /api/dashboard/activity`

## Notes

- Backend schema is managed by Flyway (`V1__init_schema.sql`).
- Seed migration placeholder exists, while real seed data comes from `AppDataSeeder` to ensure BCrypt hashes are generated safely.
- Frontend production build verified with `npm run build`.
