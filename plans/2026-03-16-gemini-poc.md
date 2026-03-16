# Plan: Gemini AI Personalized Plan — POC
**Status:** Approved
**Created:** 2026-03-16
**Branch:** gemini-poc

---

## Context

Currently the app uses a 5-question bucket survey with hardcoded tips, todos, and goal amounts. This entire survey is being replaced with a new financial survey. The new survey collects real numeric financial data, sends it to Gemini 2.0 Flash, and generates a fully personalized homebuying plan — per-step tips and todos — stored in the DB per user. This POC runs locally only (not deployed to Vercel).

---

## Key Decisions

- **Old survey is fully replaced** — the 5-question bucket survey and its hardcoded buyer type logic are removed
- **Hardcoded todos are fully replaced** — the static 19-item `todo_items` seed data is replaced by AI-generated todos stored per user in `ai_todos`
- **Local only for now** — no Vercel deployment during POC; API key lives in a local `.env` file
- **Gemini JSON mode** — Gemini is called with `responseMimeType: "application/json"` and a `responseSchema`, which forces valid structured JSON back. No brittle string parsing.

---

## Approach

1. User completes new financial survey (6 numeric inputs)
2. Inputs are sent to `POST /api/surveys/generate-plan`
3. Server builds a Gemini prompt with HomePath context + user's financial data
4. Gemini 2.0 Flash returns guaranteed JSON (via JSON mode + schema enforcement)
5. Server stores the parsed plan across 4 DB tables
6. Frontend displays AI tips and todos on step pages and dashboard

---

## The Four Homebuying Steps (unchanged)

1. Get Your Finances Ready
2. Get Pre-Approved
3. Find Your Home
4. Close the Deal

---

## New Survey Questions

The old 5-question survey is replaced entirely. The new survey is broader — it covers financial data, timing, location, and other homebuying factors. **These are placeholders for now; Michael will finalize the exact questions and options later.**

The survey is a multi-step form (one question per screen, same UX pattern as before). All answers are sent to Gemini as context.

### Placeholder Questions

| # | Category | Placeholder Question | Field Name | Type |
|---|----------|----------------------|------------|------|
| 1 | Financial | What is your annual household income? | `annual_income` | number |
| 2 | Financial | How much do you currently have saved for a down payment? | `current_savings` | number |
| 3 | Financial | What home price range are you targeting? | `target_home_price` | number |
| 4 | Financial | What is your approximate credit score? | `credit_score` | number (300–850) |
| 5 | Financial | What are your total monthly debt payments (car, student loans, etc.)? | `monthly_debt` | number |
| 6 | Timing | When are you hoping to buy a home? | `purchase_timeline` | select: Within 6 months / 6–12 months / 1–2 years / 2+ years |
| 7 | Location | What state or metro area are you looking to buy in? | `target_location` | text |
| 8 | Location | How familiar are you with your target neighborhood? | `location_familiarity` | select: Very familiar / Somewhat familiar / Still exploring |
| 9 | Lifestyle | How many people will be living in the home? | `household_size` | number (1–8) |
| 10 | Situation | What is your current housing situation? | `current_housing` | select: Renting / Living with family / Own a home / Other |

> **Note:** Questions, options, and categories are placeholders. The field names should stay stable since they map to DB columns and the Gemini prompt. Only the display text and answer options will change.

### Financial inputs that feed `user_financial_profile`
`annual_income`, `current_savings`, `target_home_price`, `credit_score`, `monthly_debt`

### Contextual inputs that feed the Gemini prompt only
`purchase_timeline`, `target_location`, `location_familiarity`, `household_size`, `current_housing`

Contextual inputs do not need their own DB columns — they are passed to Gemini to enrich the plan but do not need to be stored individually. They can be serialized as a JSON blob in a `survey_context` column on `user_financial_profile` if we want to persist them.

Collected via a multi-step `SurveyPage` (replaces the old one). On submit, immediately calls `generate-plan`.

---

## Gemini Integration — JSON Mode

### How JSON mode works

The `@google/generative-ai` SDK supports forced JSON output via `generationConfig`:

```ts
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: planSchema,  // enforces exact structure
  },
});
```

This eliminates unreliable JSON extraction from prose. Gemini will return a raw JSON string that maps exactly to `planSchema`. The server calls `JSON.parse(result.response.text())` — if that throws, the call itself failed.

### `responseSchema` definition (server-side)

```ts
const planSchema = {
  type: "object",
  properties: {
    financial_metrics: {
      type: "object",
      properties: {
        recommended_down_payment_pct: { type: "number" },
        down_payment_amount:          { type: "number" },
        closing_cost_estimate:        { type: "number" },
        total_cash_needed:            { type: "number" },
        savings_gap:                  { type: "number" },
        monthly_savings_target:       { type: "number" },
        months_to_goal:               { type: "integer" },
        estimated_monthly_mortgage:   { type: "number" },
        debt_to_income_ratio:         { type: "number" },
      },
      required: [
        "recommended_down_payment_pct", "down_payment_amount",
        "closing_cost_estimate", "total_cash_needed", "savings_gap",
        "monthly_savings_target", "months_to_goal",
        "estimated_monthly_mortgage", "debt_to_income_ratio"
      ]
    },
    steps: {
      type: "array",
      items: {
        type: "object",
        properties: {
          step_order: { type: "integer" },
          step_name:  { type: "string" },
          tips:       { type: "array", items: { type: "string" }, minItems: 3, maxItems: 4 },
          todos:      { type: "array", items: { type: "string" }, minItems: 3, maxItems: 4 },
        },
        required: ["step_order", "step_name", "tips", "todos"]
      },
      minItems: 4,
      maxItems: 4
    }
  },
  required: ["financial_metrics", "steps"]
};
```

### Prompt structure

**System instruction (static):**
```
You are a financial advisor for HomePath, a first-time homebuyer guidance app.
Generate a personalized homebuying plan based on the user's financial profile.
The plan must cover exactly 4 steps in this order:
1. Get Your Finances Ready
2. Get Pre-Approved
3. Find Your Home
4. Close the Deal

For each step, provide 3-4 practical, specific tips and 3-4 actionable todos.
Reference the user's actual dollar amounts and timeline where relevant.
For financial_metrics, calculate all values based on the user's data.
Use a recommended down payment of 10% unless the user's credit score or DTI suggests otherwise.
```

**User data block (dynamic):**
```
User profile:
- Annual income: $95,000
- Current savings: $25,000
- Target home price: $500,000
- Credit score: ~690
- Monthly debt payments: $450
- Target location: Austin, TX
- Purchase timeline: 6–12 months
- Location familiarity: Somewhat familiar
- Household size: 2
- Current housing: Renting
```

---

## Database Changes

### Old tables being removed / emptied

- `todo_items` — static seed data no longer used (table can remain but won't be referenced)
- `user_todos` — hardcoded todo completion tracking; replaced by `ai_todos.completed`
- `survey_questions` / `user_responses` — old bucket survey; replaced by `user_financial_profile`

These tables are left in the DB schema for now (don't drop them during POC) but the app stops writing to / reading from them.

### New table: `user_financial_profile`

```sql
CREATE TABLE user_financial_profile (
  user_id             INTEGER PRIMARY KEY REFERENCES user_info(user_id),
  annual_income       NUMERIC,
  current_savings     NUMERIC,
  target_home_price   NUMERIC,
  credit_score        INTEGER,
  monthly_debt        NUMERIC,
  mortgage_applicants INTEGER,
  created_at          TIMESTAMP DEFAULT NOW(),
  updated_at          TIMESTAMP DEFAULT NOW()
);
```

### New table: `user_plan_metrics`

Stores AI-calculated financial outputs shown on the dashboard.

```sql
CREATE TABLE user_plan_metrics (
  user_id                    INTEGER PRIMARY KEY REFERENCES user_info(user_id),
  recommended_down_pct       NUMERIC,
  down_payment_amount        NUMERIC,
  closing_cost_estimate      NUMERIC,
  total_cash_needed          NUMERIC,
  savings_gap                NUMERIC,
  monthly_savings_target     NUMERIC,
  months_to_goal             INTEGER,
  estimated_monthly_mortgage NUMERIC,
  debt_to_income_ratio       NUMERIC,
  generated_at               TIMESTAMP DEFAULT NOW()
);
```

### New table: `ai_tips`

```sql
CREATE TABLE ai_tips (
  tip_id     SERIAL PRIMARY KEY,
  user_id    INTEGER REFERENCES user_info(user_id),
  step_order INTEGER,
  tip_text   TEXT,
  tip_order  INTEGER
);
```

### New table: `ai_todos`

Replaces `todo_items` + `user_todos`. Todos are AI-generated, unique per user.

```sql
CREATE TABLE ai_todos (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER REFERENCES user_info(user_id),
  step_order  INTEGER,
  todo_text   TEXT,
  completed   BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMP DEFAULT NOW()
);
```

---

## New API Routes

### `POST /api/surveys/generate-plan`

**Auth:** Required (JWT)

**Request body:**
```json
{
  "financial": {
    "annual_income": 95000,
    "current_savings": 25000,
    "target_home_price": 500000,
    "credit_score": 690,
    "monthly_debt": 450
  },
  "context": {
    "purchase_timeline": "6-12 months",
    "target_location": "Austin, TX",
    "location_familiarity": "Somewhat familiar",
    "household_size": 2,
    "current_housing": "Renting"
  }
}
```

**Server logic:**
1. Validate all 6 fields are present and numeric
2. Check if `user_plan_metrics` already has a row for this user — if yes, return cached plan (skip Gemini)
3. Build Gemini prompt with system instruction + user data block
4. Call Gemini 2.0 Flash with `responseMimeType: "application/json"` + `responseSchema`
5. `JSON.parse(result.response.text())`
6. In a single transaction: upsert `user_financial_profile`, upsert `user_plan_metrics`, delete + reinsert `ai_tips` and `ai_todos` for this user
7. Return parsed plan JSON

**Response:**
```json
{
  "financial_metrics": { ... },
  "steps": [
    { "step_order": 1, "step_name": "...", "tips": [...], "todos": [...] },
    ...
  ]
}
```

**Errors:**
- Missing / invalid fields → 400
- Gemini API error → 502
- JSON.parse failure → 502

### `GET /api/surveys/plan`

Returns the cached plan for the logged-in user (reads from DB, no Gemini call).

**Auth:** Required

**Response:** Same shape as generate-plan, or 404 if no plan exists yet.

### `PUT /api/todos/ai/:todoId`

Toggle an AI-generated todo's completion status.

**Auth:** Required

**Request body:** `{ "completed": true }`

**Server logic:** Verify `ai_todos.user_id` matches authenticated user, update `completed`.

---

## Frontend Changes

### 1. `SurveyPage` — replaced

Old multi-step bucket survey removed. New single-page form with 6 numeric inputs:
- Dollar inputs for income, savings, home price, monthly debt
- Number input for credit score (with range hint: 300–850)
- Select/number for mortgage applicants (1–4)

On submit:
1. Calls `POST /api/surveys/generate-plan`
2. Shows loading state ("Building your personalized plan...")
3. On success: stores plan in `SurveyContext`, navigates to `/dashboard`

### 2. `SurveyContext` — updated

Remove old buyer-type logic, hardcoded step defaults, and todo ID mappings.

New state:
```ts
financialProfile: FinancialProfile | null
planMetrics: PlanMetrics | null
aiPlan: AiPlanStep[] | null    // array of 4 steps with tips + todos
hasPlan: boolean
```

New actions:
```ts
generatePlan(inputs: FinancialProfile): Promise<void>
loadPlan(): Promise<void>        // fetches GET /api/surveys/plan on app load
toggleAiTodo(todoId: number, completed: boolean): Promise<void>
```

On app load: if authenticated and `hasPlan` is false, call `loadPlan()` to hydrate from DB.

### 3. `DashboardPage` — updated

Remove hardcoded goal/progress. Add **Financial Snapshot** card showing:

| Label | Value |
|-------|-------|
| Target home | $500,000 |
| Recommended down payment | $50,000 (10%) |
| Closing cost estimate | $8,000 |
| Total cash needed | $58,000 |
| You currently have | $25,000 |
| Savings gap | $33,000 |
| Monthly savings target | $1,375 |
| Estimated monthly mortgage | $2,400 |
| Months to goal | 24 |
| Debt-to-income ratio | 28% |

"Up Next" todos section reads from `ai_todos` (first 5 incomplete across all steps).

### 4. `StepDetailPage` — updated

Remove hardcoded step content. For each step:
- **Tips section** at top: read-only cards from `ai_tips` where `step_order` matches
- **Todos section**: toggleable checkboxes from `ai_todos` where `step_order` matches; toggle calls `PUT /api/todos/ai/:todoId`

### 5. `api.ts` additions

```ts
generatePlan(inputs: FinancialProfile): Promise<PlanResponse>
getPlan(): Promise<PlanResponse>
toggleAiTodo(todoId: number, completed: boolean): Promise<void>
```

---

## Environment Variables (local)

Add to `server/.env` (never commit):

```
GEMINI_API_KEY=<key provided by Michael>
```

Access server-side only via `process.env.GEMINI_API_KEY`.

---

## Data Flow (end to end)

```
User lands on /survey
  → Fills in 6 financial fields
  → Submit → POST /api/surveys/generate-plan
      → Validates inputs
      → Checks cache (user_plan_metrics) — miss on first run
      → Builds prompt: system instruction + user financial block
      → Calls Gemini 2.0 Flash (JSON mode + schema)
      → Receives guaranteed JSON
      → JSON.parse()
      → Transaction:
          UPSERT user_financial_profile
          UPSERT user_plan_metrics
          DELETE + INSERT ai_tips (16 rows: 4 steps × ~4 tips)
          DELETE + INSERT ai_todos (16 rows: 4 steps × ~4 todos)
      → Returns plan JSON
  → SurveyContext stores plan in state
  → Navigate to /dashboard
      → Financial Snapshot card reads planMetrics
      → Up Next todos reads ai_todos (first 5 incomplete)
  → User clicks a step → /step/1
      → ai_tips for step_order=1 shown as tip cards
      → ai_todos for step_order=1 shown as checklist
      → Toggle todo → PUT /api/todos/ai/:todoId → updates ai_todos.completed
```

---

## TypeScript Types

```ts
// Financial inputs — stored in user_financial_profile
interface FinancialProfile {
  annual_income: number;
  current_savings: number;
  target_home_price: number;
  credit_score: number;
  monthly_debt: number;
}

// Contextual inputs — passed to Gemini, optionally stored as JSON blob
interface SurveyContext {
  purchase_timeline: string;
  target_location: string;
  location_familiarity: string;
  household_size: number;
  current_housing: string;
}

// Combined survey submission
interface SurveyInputs {
  financial: FinancialProfile;
  context: SurveyContext;
}

interface PlanMetrics {
  recommended_down_payment_pct: number;
  down_payment_amount: number;
  closing_cost_estimate: number;
  total_cash_needed: number;
  savings_gap: number;
  monthly_savings_target: number;
  months_to_goal: number;
  estimated_monthly_mortgage: number;
  debt_to_income_ratio: number;
}

interface AiPlanStep {
  step_order: number;
  step_name: string;
  tips: string[];
  todos: string[];
}

interface PlanResponse {
  financial_metrics: PlanMetrics;
  steps: AiPlanStep[];
}
```

---

## Sections (Implementation Order)

1. **DB migration** — create `user_financial_profile`, `user_plan_metrics`, `ai_tips`, `ai_todos`
2. **Gemini server route** — `POST /api/surveys/generate-plan` with JSON mode, schema, DB writes
3. **Cached plan route** — `GET /api/surveys/plan`
4. **AI todo toggle route** — `PUT /api/todos/ai/:todoId`
5. **TypeScript types** — shared types file for plan shape
6. **SurveyContext** — remove old logic, add plan state + actions
7. **api.ts** — add `generatePlan`, `getPlan`, `toggleAiTodo`
8. **SurveyPage** — replace old survey with 6-field financial form
9. **DashboardPage** — Financial Snapshot card, wire Up Next to ai_todos
10. **StepDetailPage** — display ai_tips and ai_todos per step

---

## Verification Criteria

- [ ] Completing survey calls Gemini once; second load returns cached plan from DB
- [ ] Gemini returns valid JSON every time (JSON mode enforces this)
- [ ] All 4 DB tables written correctly after plan generation
- [ ] Dashboard Financial Snapshot shows all 9 calculated metrics
- [ ] Each step page shows 3–4 tips (read-only) and 3–4 todos (toggleable)
- [ ] Up Next on dashboard shows first 5 incomplete todos across all steps
- [ ] Todo toggle persists to DB
- [ ] No API key in any committed file
- [ ] App shows clear loading state while Gemini generates
- [ ] App shows clear error state if Gemini fails
