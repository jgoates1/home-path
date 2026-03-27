# Technical Decisions

---

## 2026-03-16 — Vercel as deployment target, main as production branch
Deleted `vercel-deploy` branch; `main` is now the only branch and the Vercel production branch. GitHub Actions workflow auto-deploys on every push to `main`.

## 2026-03-16 — Gemini for AI plan generation
Chose Google Gemini over alternatives (Groq, OpenRouter, Mistral, Cohere).
- Free tier, no credit card required
- Strong JSON instruction-following for structured plan output
- API key stored in Vercel env vars; call is server-side only to protect the key

## 2026-03-25 — Switched from Gemini 2.0-flash to 2.5-flash
Gemini 2.0-flash returns 404 for new API keys (deprecated). 2.5-flash is the current stable model on the free tier. `thinkingConfig` removed (caused 1M token/min rate limit spikes); thinking budget set to 10,000 tokens instead.

## 2026-03-16 — Server-side only AI calls
Gemini will only be called from the Express backend, never from the frontend directly. Keeps the API key hidden and allows the system prompt (HomePath context, rules) to be controlled centrally by the team.

## 2026-03-26 — Moved savings tracking from user_info to user_financial_profile
`current_savings` was removed from the `user_info` table. The dashboard now reads and writes savings via `user_financial_profile.current_savings` (new endpoint: `PUT /api/users/savings`). The savings goal uses `user_plan_metrics.total_cash_needed` instead of a hardcoded $50,000. The savings widget is hidden until a plan exists, since both values depend on completing the survey.
