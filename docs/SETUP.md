# Setup & Connections

## Environment Variables

### Vercel (production)
Set in Vercel project → Settings → Environment Variables.

| Variable | Purpose |
|---|---|
| `DB_HOST` | PostgreSQL host |
| `DB_NAME` | Database name (`homepath_db`) |
| `DB_USER` | Database user |
| `DB_PASSWORD` | Database password |
| `JWT_SECRET` | JWT signing secret |
| `GEMINI_API_KEY` | Google Gemini API key (to be added) |

### Local dev (`.env.local` — gitignored)
Each developer needs their own copy with the same variables.

## Dev Commands

```bash
# Install dependencies
npm install

# Run frontend (Vite dev server)
cd frontend && npm run dev

# Run backend (Express)
npm run server

# Build
npm run build
```

## Deployment
- Push to `main` → GitHub Actions triggers → Vercel deploys automatically
- Workflow file: `.github/workflows/deploy.yml`
- Vercel token stored as `VERCEL_TOKEN` secret in GitHub repo settings

## Key URLs
- Repo: github.com/jgoates1/home-path
- Vercel dashboard: vercel.com
- Google AI Studio (Gemini API keys): aistudio.google.com
