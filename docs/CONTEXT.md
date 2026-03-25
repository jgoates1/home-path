# HomePath — Project Context

## Description
A first-time homebuyer guidance app. Users complete a 9-section chat-style survey, get categorized into a buyer type, and receive a personalized AI-generated roadmap with steps, goal dates, and todos to track their progress toward buying a home.

## Current Status
Core app is live. Gemini 2.5-flash AI integration is complete — survey generates a personalized plan via `POST /api/surveys/generate-plan`. DB migration SQLs exist but must still be run against Supabase.

## Tech Stack
- **Frontend**: React + TypeScript + Vite, Tailwind CSS, shadcn/ui
- **Backend**: Express.js (TypeScript), deployed as serverless on Vercel
- **Database**: PostgreSQL (pool in `server/db/pool.ts`)
- **Auth**: JWT tokens stored in localStorage
- **Deployment**: Vercel, auto-deploys from `main` branch via GitHub Actions

## Repo
github.com/jgoates1/home-path

## Key Files
- `frontend/src/pages/SurveyPage.tsx` — 9-section chat-style survey UI
- `frontend/src/contexts/SurveyContext.tsx` — survey state, buyer type logic, goal calc
- `frontend/src/pages/ResultsPage.tsx` — displays buyer type + AI-generated plan
- `frontend/src/pages/DashboardPage.tsx` — main dashboard with steps/todos/progress
- `frontend/src/services/api.ts` — all frontend API calls
- `server/index.ts` — Express app entry point
- `server/routes/surveys.ts` — survey routes
- `vercel.json` — Vercel routing config
- `.github/workflows/deploy.yml` — GitHub Actions auto-deploy

## Survey Sections (9 total)
See `docs/buyersurvey.md` for full question mapping.
