# Task Management System

Production-grade SaaS-style task management stack built with:

- **Backend:** Node.js, Express, TypeScript, Prisma (PostgreSQL), JWT auth with access/refresh rotation, Zod validation
- **Frontend:** Next.js (App Router) + TypeScript, Tailwind CSS, React Query, Axios interceptor, toast notifications

## Quick start

### Prerequisites
- Node.js 18+
- PostgreSQL database URL

### Backend
```bash
cd backend
cp .env.example .env                 # fill in DATABASE_URL and secrets
npm install
npx prisma migrate dev --name init    # run after setting DATABASE_URL
npm run dev                           # or npm run start after build
```
# TASK-MANAGEMENT-SYSTEM

### Frontend
```bash
cd frontend
cp .env.example .env                 # set NEXT_PUBLIC_API_URL (default http://localhost:4000/api)
npm install
npm run dev
```

Open http://localhost:3000 for the app. Backend defaults to http://localhost:4000.

## API summary
- `POST /api/auth/register` — name, email, password; sets refresh token cookie, returns access token
- `POST /api/auth/login` — email, password; sets refresh token cookie, returns access token
- `POST /api/auth/refresh` — uses HTTP-only refresh cookie, rotates refresh token, returns new access token
- `POST /api/auth/logout` — clears stored refresh token
- Task routes are protected with `Authorization: Bearer <access_token>`
  - `GET /api/tasks` — pagination (`page`, `limit`), filter by `status`, search by `title`, sorted newest first
  - `POST /api/tasks` — create
  - `GET /api/tasks/:id` — fetch one (ownership enforced)
  - `PATCH /api/tasks/:id` — update
  - `PATCH /api/tasks/:id/toggle` — toggle status
  - `DELETE /api/tasks/:id` — delete

## Frontend features
- Access token stored in memory only; refresh via HTTP-only cookie handled by Axios interceptor on 401
- Auth pages (login/register), protected dashboard route
- Dashboard: create/edit/delete/toggle tasks, search, filter (completed/pending), pagination, loading/empty states
- React Query caching + optimistic UX, Toast notifications via Sonner

## Project structure (key paths)
```
backend/
  src/app.ts              # Express app wiring
  src/server.ts           # Server entry
  src/controllers/        # Auth & task controllers
  src/services/           # Business logic
  src/middleware/         # Auth, validation, error handler
  src/prisma/             # Prisma client
  prisma/schema.prisma    # DB schema
frontend/
  src/app/                # Next.js routes (login, register, dashboard)
  src/lib/                # API client, token store, utils
  src/context/AuthContext # Auth state + refresh handling
  src/components/         # UI + task components
```

## Environment variables
- Backend: see `backend/.env.example`
- Frontend: see `frontend/.env.example`

## Scripts
- Backend: `npm run dev`, `npm run build`, `npm run start`, `npm run prisma:migrate`, `npm run prisma:generate`, `npm run lint`
- Frontend: `npm run dev`, `npm run build`, `npm run start`, `npm run lint`

## Notes
- Refresh tokens are HTTP-only cookies; access tokens are short-lived (15m) and kept in memory.
- Refresh token rotation is enforced (stored hashed in DB). Logout invalidates stored hash.
- Input validation uses Zod on both server and client forms.

## Troubleshooting
- If Prisma client errors, ensure `DATABASE_URL` is set and run `npx prisma generate`.
- CORS: set `CORS_ORIGIN` in backend `.env` to your frontend URL.
- Cookies: set `COOKIE_DOMAIN` to match your host (e.g., `localhost`).
