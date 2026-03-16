# Technical Decisions

---

## 2026-03-16 — Vercel as deployment target, main as production branch
Deleted `vercel-deploy` branch; `main` is now the only branch and the Vercel production branch. GitHub Actions workflow auto-deploys on every push to `main`.

## 2026-03-16 — Gemini 2.0 Flash for AI plan generation
Chose Google Gemini 2.0 Flash over alternatives (Groq, OpenRouter, Mistral, Cohere).
- Free tier, no credit card required
- 15 RPM / 1,000 RPD — sufficient for current user volume
- Strong JSON instruction-following for structured plan output
- API key stored in Vercel env vars; call is server-side only to protect the key

## 2026-03-16 — Server-side only AI calls
Gemini will only be called from the Express backend, never from the frontend directly. Keeps the API key hidden and allows the system prompt (HomePath context, rules) to be controlled centrally by the team.
