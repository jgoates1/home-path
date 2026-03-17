# Session Log

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
