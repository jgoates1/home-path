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
| `GEMINI_API_KEY` | Google Gemini API key (active — gemini-2.5-flash) |

### Local dev (`.env` at repo root — gitignored)
`dotenv` loads `.env` for the Express server. The Vite app uses same-origin `/api` in development (proxied to `http://127.0.0.1:3001`), so you usually do **not** need `VITE_API_URL` unless you have a special setup.

## Dev Commands

```bash
# Install dependencies
npm install

# Run frontend + backend together (recommended)
npm run dev

# Or run each terminal separately:
npm run dev:backend   # Express on http://localhost:3001
# In another terminal — from repo root, with cwd frontend for Vite:
cd frontend && npx vite
```

The frontend calls **`/api/...`**. In dev, Vite proxies those requests to the backend. **If you see “Failed to fetch”, start the backend** (`npm run dev:backend` or `npm run dev`) and reload the page.

## Build

```bash
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
