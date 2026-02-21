# HomePath

HomePath is a full-stack web application that guides users through a home-buying journey with surveys, personalized steps, todos, and a dashboard.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Installation & Setup](#installation--setup)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Application Routes](#application-routes)
- [Configuration](#configuration)
- [Tech Stack](#tech-stack)
- [API](#api)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Documentation](#documentation)

## Prerequisites

- **Node.js** (v18 or later recommended) and **npm**
- **PostgreSQL** (for the database)

On **Windows**, the database scripts in `db/` are Bash-based. Use [WSL](https://docs.microsoft.com/en-us/windows/wsl/) or follow the manual setup steps in [db/README.md](db/README.md).

## Quick Start

```sh
git clone <YOUR_GIT_URL>
cd home-path
npm install
cp .env.example .env
# Edit .env: set DB_USER, DB_PASSWORD, and JWT_SECRET
npm run db:setup
npm run dev
```

- **Frontend:** http://localhost:5173  
- **Backend API:** http://localhost:3001

## Installation & Setup

1. **Clone and install dependencies**
   ```sh
   git clone <YOUR_GIT_URL>
   cd home-path
   npm install
   ```

2. **Configure environment**
   - Copy `.env.example` to `.env`
   - Set database credentials: `DB_USER`, `DB_PASSWORD` (or use `DATABASE_URL`)
   - Set `JWT_SECRET` for authentication (use a long, random string in production)
   - Optional: `PORT` (backend defaults to 3001 if unset)

3. **Database setup**
   - **macOS / Linux:** Run `npm run db:setup` to create the database, apply the schema, and seed sample data.
   - **Windows:** If `npm run db:setup` is not available (Bash scripts), see [db/README.md](db/README.md) for manual steps: create the database, then run `db/schema.sql` and `db/seed.sql` with `psql`.

## Usage

| Command | Description |
|--------|-------------|
| `npm run dev` | Start frontend and backend together |
| `npm run dev:frontend` | Start Vite dev server only (port 5173) |
| `npm run dev:backend` | Start Express API only (port 3001) |
| `npm run build` | Build frontend and backend for production |
| `npm run build:frontend` | Build React app only |
| `npm run build:backend` | Compile TypeScript server only |
| `npm run preview` | Serve built frontend (after `npm run build`) |
| `npm run lint` | Run ESLint |
| `npm run test` | Run frontend tests (Vitest) |
| `npm run db:setup` | Create DB, run schema and seed (Bash; see db/README on Windows) |
| `npm run db:reset` | Drop and recreate database (Bash; see db/README on Windows) |
| `npm run db:schema` | Apply schema only: `psql -d homepath_db -f db/schema.sql` |
| `npm run db:seed` | Run seed only: `psql -d homepath_db -f db/seed.sql` |

## Project Structure

```
home-path/
├── frontend/           # React + Vite app
│   └── src/
│       ├── components/ # UI and shared components
│       ├── contexts/   # Auth, Survey, etc.
│       ├── hooks/      # Custom React hooks
│       ├── lib/        # Utilities
│       ├── pages/      # Route pages
│       └── services/   # API client (e.g. api.ts)
├── server/             # Express API
│   ├── index.ts        # Server entry
│   ├── db/             # DB connection (pool)
│   ├── middleware/     # Auth (JWT)
│   └── routes/         # auth, users, surveys, todos, steps
├── db/                 # Database
│   ├── schema.sql      # Table definitions
│   ├── seed.sql        # Sample data
│   ├── setup.sh        # Setup script (Bash)
│   └── reset.sh        # Reset script (Bash)
├── .env.example        # Env template
└── package.json        # Scripts and dependencies
```

For the full directory layout, see [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md).

## Application Routes

| Path | Description | Protected |
|------|-------------|-----------|
| `/` | Home | No |
| `/login` | Login | No |
| `/create-account` | Registration | No |
| `/about` | About | Yes |
| `/survey` | Survey | Yes |
| `/results` | Survey results | Yes |
| `/timeline` | Timeline / commit | Yes |
| `/dashboard` | Dashboard | Yes |
| `/step/:stepId` | Step detail | Yes |
| `/profile` | User profile | Yes |
| `/survey-insights` | Survey insights | Yes |
| `*` | 404 Not Found | No |

## Configuration

Environment variables are read from `.env`. Use `.env.example` as a template. Key variables:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Full PostgreSQL URL, or use `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` |
| `PORT` | Backend server port (default: 3001) |
| `JWT_SECRET` | Secret for signing JWT tokens (required for auth) |
| `NODE_ENV` | `development` or `production` |

See [SETUP.md](SETUP.md) and `.env.example` for more detail.

## Tech Stack

- **Frontend:** Vite, React, TypeScript, Tailwind CSS, shadcn/ui, React Router, TanStack Query
- **Backend:** Express, TypeScript, JWT (jsonwebtoken), bcrypt, pg (PostgreSQL client)
- **Database:** PostgreSQL (`homepath_db`)

## API

The backend exposes a REST API at **http://localhost:3001/api**. Main groups:

- **Auth:** `POST /api/auth/register`, `POST /api/auth/login`
- **Users:** `GET /api/users/me`, `PUT /api/users/me`
- **Surveys:** questions and responses
- **Todos:** user todo items
- **Steps:** user journey steps

Most endpoints require a JWT in the `Authorization: Bearer <token>` header. Full reference: [server/README.md](server/README.md).

## Testing

- **Frontend:** Run `npm run test` to execute Vitest tests in `frontend/`.
- **Backend:** Use curl or a tool like Postman; examples are in [SETUP.md](SETUP.md) and [server/README.md](server/README.md).

## Troubleshooting

- **Backend won’t start:** Ensure PostgreSQL is running and that port 3001 is free (e.g. `lsof -i :3001` on macOS/Linux; on Windows, check Task Manager or `netstat`).
- **Database errors:** Run `npm run db:reset` where supported, or reset manually (see [db/README.md](db/README.md)). Verify connection with `psql homepath_db`.
- **CORS errors:** Ensure the backend allows your frontend origin; see `FRONTEND_URL` in docs and server config.
- **Auth errors:** Use the `Authorization: Bearer <token>` header; tokens expire (e.g. after 24 hours).
- **Windows:** `npm run db:setup` and `npm run db:reset` use Bash scripts; use WSL or the manual steps in [db/README.md](db/README.md).

## Documentation

- [SETUP.md](SETUP.md) — Detailed setup and npm scripts
- [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) — Full project layout and workflow
- [INTEGRATION.md](INTEGRATION.md) — Frontend–backend integration
- [server/README.md](server/README.md) — API reference and auth
- [db/README.md](db/README.md) — Database setup and commands
