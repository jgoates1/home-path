# Database

## Schema

| Table | Purpose |
|---|---|
| `user_info` | User accounts (login, email, archetype) |
| `user_financial_profile` | Survey answers and financial inputs |
| `user_plan_metrics` | AI-generated plan numbers and goal dates |
| `ai_tips` | Plan tips per step |
| `ai_todos` | Todos per step |

## Setup (fresh local database)

```sh
npm run db:setup
```

Or manually:

```sh
createdb homepath_db
psql -d homepath_db -f db/migrate.sql
```

## Existing database (teammates)

If you already have `homepath_db` locally, just run the migration to drop old tables and add any missing columns:

```sh
psql -d homepath_db -f db/migrate.sql
```

Safe to run multiple times — everything is `IF NOT EXISTS` / `IF EXISTS`.

## Reset

```sh
npm run db:reset
```

## Connection

- **Database:** `homepath_db`
- **Host:** `localhost`
- **Port:** `5432`
- **URL:** `postgresql://localhost:5432/homepath_db`

`.env.local` variables: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
