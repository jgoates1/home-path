# Plan: 9-Section Survey Frontend
**Status:** Approved
**Created:** 2026-03-24

## Context

The backend (`server/routes/surveys.ts`) now uses the full `plan-generator-context.md` system prompt and expects a rich survey payload. The current `SurveyPage.tsx` only collects 10 basic fields. This plan rebuilds the survey frontend to match `docs/buyersurvey.md`.

The survey data is sent to the backend as:
```ts
{
  financial: { annual_income, current_savings, target_home_price, credit_score, monthly_debt, other_income?, total_assets? },
  context:   { /* everything else — stored as JSONB in user_financial_profile.survey_context */ }
}
```

## Approach

Keep the one-question-at-a-time UI pattern. Group questions into sections with a section header screen before each group. Use conditional rendering to skip irrelevant questions.

## New `SurveyInputs` Type

Update `frontend/src/types/plan.ts`:

```ts
export interface FinancialProfile {
  annual_income: number;
  current_savings: number;
  target_home_price: number;
  credit_score: number;        // numeric — backend converts to range label
  monthly_debt: number;
  other_income?: number;
  total_assets?: number;
}

export interface SurveyContext {
  // Section 1
  buyer_age?: number;
  buying_with?: string;        // 'solo' | 'Married' | 'Family member' | 'Other'

  // Section 2
  income_type?: string;        // 'Salaried' | 'Hourly' | 'Commission' | 'Self-employed' | 'Combination'
  self_employed_2yr?: string;  // conditional
  job_change_2yr?: string;
  cobuyer_income?: number;     // conditional

  // Section 3
  large_expenses?: string;

  // Section 4
  cobuyer_credit_score?: number; // conditional
  credit_dings?: string;

  // Section 5
  target_state?: string;
  purchase_timeline: string;
  life_events?: string;

  // Section 6
  main_motivation?: string[];
  equity_vs_payment?: string;
  stay_length?: string;
  starter_vs_longterm?: string;
  house_hacking?: string;

  // Section 7
  property_type?: string;
  bedrooms?: number;
  renovation?: string;
  target_location?: string;
  geo_constraints?: string;
  school_district?: string;
  neighborhood_feel?: string;

  // Section 8
  cobuyer_alignment?: string;  // conditional
  fears?: string[];
  mortgage_familiarity?: number;
  has_agent?: string;
  current_housing?: string;
  process_questions?: string;

  // Section 9
  special_situations?: string[];
}
```

## Sections & Questions

### Section 1 — About You (always shown)
1. How old are you? `buyer_age` (number)
2. Are you buying alone or with someone? `buying_with` (select: Solo / With someone)
   - If "With someone": What's your relationship? (select: Married / Family member / Other)

### Section 2 — Your Income (always shown)
1. What's your gross annual income? `annual_income` (number) → `financial`
2. How do you earn it? `income_type` (select: Salaried / Hourly / Commission / Self-employed / Combination)
   - If Self-employed: Filed taxes as self-employed 2+ years? `self_employed_2yr` (select: Yes / No / Under 2 years)
3. Changed jobs or industries in the past 2 years? `job_change_2yr` (select: Yes / No)
4. Any other income? `other_income` (number, optional) → `financial`
5. [If co-buyer] Co-buyer's annual income? `cobuyer_income` (number)

### Section 3 — Your Finances (always shown)
1. How much saved for a home purchase? `current_savings` (number) → `financial`
2. Total assets (savings + investments + retirement)? `total_assets` (number, optional) → `financial`
3. Large expenses coming up in 12 months? `large_expenses` (text, optional)

### Section 4 — Credit & Debt (always shown)
1. Approximate credit score? `credit_score` (select: Below 580 / 580-619 / 620-659 / 660-699 / 700-739 / 740+)
   - Map to midpoint number for `financial.credit_score`: 560 / 599 / 639 / 679 / 719 / 760
2. [If co-buyer] Co-buyer's credit score? `cobuyer_credit_score` (same select options)
3. Any credit dings in past few years? `credit_dings` (text, optional)
4. Total monthly debt payments? `monthly_debt` (number) → `financial`

### Section 5 — Budget & Timeline (always shown)
1. Maximum purchase price in mind? `target_home_price` (number) → `financial`
2. What state are you planning to buy in? `target_state` (text)
3. When hoping to move in? `purchase_timeline` (select: ASAP / 3-6 months / 6-12 months / 1-2 years / Just exploring)
4. Major life events on the horizon? `life_events` (text, optional)

### Section 6 — Your Goals (always shown)
1. Main motivation? `main_motivation` (multi-select chips: Build wealth / Stop paying rent / More space / Stability / Investment / Other)
2. Equity vs low payment? `equity_vs_payment` (select: Build equity fast / Keep payment low / Both equally)
3. How long plan to stay? `stay_length` (select: 2-3 years / 3-5 years / 5-10 years / Long-term / Not sure)
4. Starter or long-term home? `starter_vs_longterm` (select: Starter / Long-term / Not sure)
5. Interested in house hacking? `house_hacking` (select: Yes / Maybe / No / What's that?)
   - If "What's that?": show explanation card before next question

### Section 7 — The Home (always shown)
1. Property type? `property_type` (select: Single-family / Condo / Townhouse / Multi-unit / Open to anything)
2. Bedrooms needed? `bedrooms` (select: 1 / 2 / 3 / 4 / 5+)
3. Willing to buy a home needing renovation? `renovation` (select: Yes / No / Depends on how much)
4. Target city/state or zip? `target_location` (text)
5. Hard geographic constraints? `geo_constraints` (text, optional)
6. Does school district quality matter? `school_district` (select: Yes / No / Will matter in the future)
7. Neighborhood feel? `neighborhood_feel` (select: Urban / Suburban / Quiet-rural / Doesn't matter)

### Section 8 — Mindset & Readiness (always shown)
1. [If co-buyer] How aligned is your co-buyer? `cobuyer_alignment` (select: Fully / Mostly / Still working through it)
2. Concerns about buying? `fears` (multi-select chips — see buyersurvey.md for options)
3. Familiar with the mortgage process? `mortgage_familiarity` (select: 1–5 rendered as radio)
4. Do you have a real estate agent? `has_agent` (select: Yes / No / Interviewing a few)
5. Current housing situation? `current_housing` (select: Renting / With family or friends / Already own / Other)
6. Anything you don't understand yet? `process_questions` (text, optional)

### Section 9 — Special Situations (always shown)
1. Check all that apply: `special_situations` (multi-select checkboxes)
   - I am a veteran or active military
   - I am a teacher, nurse, firefighter, first responder, or other public servant
   - I would be buying in a rural area
   - I have had a prior foreclosure or bankruptcy
   - None of these apply

## Key UI Considerations

- **Progress**: Show section number (e.g. "Section 3 of 9") and question number within section
- **Multi-select**: Use chip/toggle buttons (not checkboxes) for `main_motivation` and `fears`
- **Conditional questions**: Skip based on `buying_with === 'solo'` and `income_type`
- **Credit score**: Collect as a select (ranges), map to numeric midpoint before sending to backend
- **Section intro screens**: Short title + description before each section (optional but nice UX)
- **"What's that?" for house hacking**: Show an explanation card inline before the answer options

## Completion & Submission

On final submit, build `SurveyInputs`:
```ts
const financial: FinancialProfile = {
  annual_income: Number(answers.annual_income),
  current_savings: Number(answers.current_savings),
  target_home_price: Number(answers.target_home_price),
  credit_score: creditScoreMidpoint(answers.credit_score_range), // map range → number
  monthly_debt: Number(answers.monthly_debt),
  ...(answers.other_income ? { other_income: Number(answers.other_income) } : {}),
  ...(answers.total_assets ? { total_assets: Number(answers.total_assets) } : {}),
};

const context: SurveyContext = {
  // everything else from answers
  purchase_timeline: answers.purchase_timeline,
  target_state: answers.target_state,
  target_location: answers.target_location,
  // ... all other fields
};

navigate('/plan-loading', { state: { financial, context } });
```

## Files to Create / Modify

| File | Change |
|---|---|
| `frontend/src/pages/SurveyPage.tsx` | Full rebuild |
| `frontend/src/types/plan.ts` | Already updated in this session |
| `frontend/src/contexts/SurveyContext.tsx` | Minor: update `getBuyerTypeFromTimeline` to handle new timeline values |

## Verification

- [ ] All 9 sections render in order
- [ ] Conditional questions (co-buyer, self-employed) correctly appear/skip
- [ ] Multi-select chips work for `main_motivation` and `fears`
- [ ] Credit score range maps correctly to numeric midpoint
- [ ] Submit sends correct `financial` + `context` shape to `/api/surveys/generate-plan`
- [ ] Plan loading page shows while Gemini call is in-flight
- [ ] Dashboard renders the AI plan with `step_goal_date` visible
