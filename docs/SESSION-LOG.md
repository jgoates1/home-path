# Session Log

---

## 2026-03-26

**What was done:**
- Moved `current_savings` out of `user_info` and into `user_financial_profile` — dashboard now reads/writes savings from the financial profile table
- Replaced hardcoded `targetSavings: 50000` with `user_plan_metrics.total_cash_needed` as the real savings goal
- Added `PUT /api/users/savings` endpoint for updating savings (writes to `user_financial_profile`)
- Added `current_savings` to `GET /api/surveys/plan` and `POST /api/surveys/generate-plan` responses
- Removed `currentSavings` and `targetSavings` from auth/login/register and profile responses
- Dashboard savings widget now hidden until user has a plan
- Added `last_login` timestamp update on login (`auth.ts`)
- Added `last_login` and `admin_flag` columns to `user_info` in `migrate.sql`

**Files changed:**
- `db/migrate.sql` — dropped `current_savings` from `user_info`, added `last_login` and `admin_flag`
- `server/routes/users.ts` — added `PUT /savings`, removed savings from `GET/PUT /me`
- `server/routes/auth.ts` — removed savings from responses, added `last_login` update
- `server/routes/surveys.ts` — added `current_savings` to plan responses
- `frontend/src/services/api.ts` — added `updateSavings()`, removed savings from types
- `frontend/src/contexts/AuthContext.tsx` — removed `currentSavings`/`targetSavings` from User
- `frontend/src/contexts/SurveyContext.tsx` — loads savings from plan, uses `api.updateSavings()`
- `frontend/src/pages/DashboardPage.tsx` — savings widget gated on `hasPlan`
- `docs/CONTEXT.md`, `docs/DECISIONS.md`, `docs/SESSION-LOG.md`

**Next steps:**
- Run `migrate.sql` against Supabase production
- Teammates run `psql -d homepath_db -f db/migrate.sql` to sync local DB

---

## 2026-03-25 (session 2)

**What was done:**
- Updated all `docs/` files to reflect completed Gemini 2.5-flash integration (CONTEXT, DECISIONS, SETUP, SESSION-LOG)
- Consolidated 5 stale db files into a single `db/migrate.sql` — idempotent, drops old tables, ensures all AI tables, backfills missing columns
- Updated `db/setup.sh`, `db/reset.sh`, and `db/README.md` to use `migrate.sql`
- Both changesets pushed to main (auto-deploys to Vercel)

**Files changed:**
- `docs/CONTEXT.md`, `docs/DECISIONS.md`, `docs/SETUP.md`, `docs/SESSION-LOG.md`
- `db/migrate.sql` (new)
- `db/README.md`, `db/setup.sh`, `db/reset.sh`
- Deleted: `db/schema.sql`, `db/seed.sql`, `db/migration_gemini.sql`, `db/migration_cleanup.sql`, `db/migration_refresh.sql`

**Next steps:**
- Teammates run `psql -d homepath_db -f db/migrate.sql` to sync local DB
- Run `migrate.sql` against Supabase production if not yet done

---

## 2026-03-25

**What was done:**
- Diagnosed 502 error on `POST /api/surveys/generate-plan` — Gemini API key in Vercel had spending cap set to $0
- Switched model from `gemini-2.0-flash` (deprecated for new keys, returns 404) to `gemini-2.5-flash`
- Updated `GEMINI_API_KEY` in Vercel production environment to working key
- Confirmed plan generation works end-to-end in production

**Files changed:**
- `server/routes/surveys.ts` — model changed to `gemini-2.5-flash`

**Decisions made:**
- Use `gemini-2.5-flash` — 2.0 models return 404 for new API keys
- Gemini API key in Vercel must match a key with no spending cap (or sufficient cap)

**Next steps:**
- Confirm new DB schema has been run against Supabase (outstanding — not done this session)
- Monitor Gemini API usage/costs on 2.5-flash

---

## 2026-03-24

### What was done
- Built full 9-section chat-style survey UI (`SurveyPage.tsx`) — bot/user bubbles, typing indicator, adaptive input tray, conditional questions, multiselect chips
- Replaced Gemini system prompt with full `plan-generator-context.md` content
- Updated Gemini schema: `step_number`, `step_goal_date`, todos as objects, `recommended_loan_type`
- Expanded `SurveyInputs` / `SurveyContext` types for all 9 survey sections
- Fixed GitHub Actions deploy workflow (checkout + Vercel CLI instead of API call)
- Created `db/migration_cleanup.sql` (drop 5 old tables, ensure 4 AI tables) and `db/migration_refresh.sql` (add new columns)
- Set Gemini thinking budget to 10,000 tokens (was 0, then dynamic — caused 1M token/min rate limit spike)
- Diagnosed 403 on `/api/surveys/generate-plan` — was stale token from old deployment, resolved after fresh login

### Files changed
- `server/routes/surveys.ts`
- `frontend/src/pages/SurveyPage.tsx`
- `frontend/src/types/plan.ts`
- `frontend/src/contexts/SurveyContext.tsx`
- `frontend/src/contexts/AuthContext.tsx`
- `.github/workflows/deploy.yml`
- `db/migration_cleanup.sql` (new)
- `db/migration_refresh.sql` (new)
- `plans/2026-03-24-survey-frontend.md` (new)

### Decisions made
- Chat UI over form: less intimidating, guides users question by question
- `thinkingBudget: 10000`: allows reasoning without hitting rate limits
- Force-pushed main to overwrite buggy remote commits

### Next steps
- Run `migration_cleanup.sql` and `migration_refresh.sql` in Supabase if not yet applied
- Desktop layout polish (centered card, input 25% above bottom) — user said it looks good as-is
- Monitor Gemini token usage in AI Studio

---

## 2026-03-16

### What was done
- Confirmed GitHub Actions auto-deploy workflow ran successfully after `ci: add Vercel auto-deploy workflow` commit
- Researched free AI APIs for personalized plan generation
- Designed Gemini 2.0 Flash integration architecture for the app
- Discussed team access model and system prompt approach for AI context

### Decisions made
- **Gemini 2.0 Flash** selected as the AI API (free, no credit card, strong instruction-following)
- API key to be stored as `GEMINI_API_KEY` in Vercel environment variables (team access)
- Gemini call will live server-side only (`POST /api/surveys/generate-plan` route)
- System prompt in server code will define HomePath context, rules, and JSON output shape
- Result cached in DB so Gemini is only called when survey is retaken

### Files changed
- `.github/workflows/deploy.yml` — added in previous session; confirmed working

### Next steps
- Build Gemini integration:
  - Add `POST /api/surveys/generate-plan` route in `server/routes/surveys.ts`
  - Add `generatePlan()` in `frontend/src/services/api.ts`
  - Update `SurveyPage.tsx` to call `generatePlan` on survey completion
  - Update `ResultsPage.tsx` to display AI-generated content
  - Update `SurveyContext.tsx` to store AI plan
- Add `GEMINI_API_KEY` to Vercel environment variables
- Set up `docs/` folder — done this session
