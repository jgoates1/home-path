# HomePath — Project Context

## Description
A first-time homebuyer guidance app. Users complete a 5-question survey, get categorized into a buyer type, and receive a personalized roadmap with steps, tips, and todos to track their progress toward buying a home.

## Current Status
Core app is live. Gemini AI integration planned to replace hardcoded tips/results with personalized plans, goals, and metrics.

## Tech Stack
- **Frontend**: React + TypeScript + Vite, Tailwind CSS, shadcn/ui
- **Backend**: Express.js (TypeScript), deployed as serverless on Vercel
- **Database**: PostgreSQL (pool in `server/db/pool.ts`)
- **Auth**: JWT tokens stored in localStorage
- **Deployment**: Vercel, auto-deploys from `main` branch via GitHub Actions

## Repo
github.com/jgoates1/home-path

## Key Files
- `frontend/src/pages/SurveyPage.tsx` — 5-question survey UI
- `frontend/src/contexts/SurveyContext.tsx` — survey state, buyer type logic, goal calc (currently hardcoded)
- `frontend/src/pages/ResultsPage.tsx` — displays buyer type + tips (currently hardcoded)
- `frontend/src/pages/DashboardPage.tsx` — main dashboard with steps/todos/progress
- `frontend/src/services/api.ts` — all frontend API calls
- `server/index.ts` — Express app entry point
- `server/routes/surveys.ts` — survey routes
- `vercel.json` — Vercel routing config
- `.github/workflows/deploy.yml` — GitHub Actions auto-deploy

## Survey Questions (question_id mapping)
1. income — Annual household income
2. savings — Down payment savings
3. location — Location preference
4. timeline — Purchase timeline
5. housing — Current housing situation
