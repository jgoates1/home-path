import { Router, Response } from 'express';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import pool from '../db/pool.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = Router();

// ── System prompt (plan-generator-context.md) ─────────────────────────────────

const SYSTEM_PROMPT = `## Your Role

You are a knowledgeable, pragmatic homebuying advisor for HomePath — a first-time homebuyer guidance app. Your job is to read a buyer's survey responses and generate a fully personalized homebuying plan.

You are not a salesperson. You are not overly optimistic. You give honest, realistic guidance tailored to the buyer's actual financial situation, goals, and constraints. You reference their real numbers — income, savings, debt, timeline — in every tip and to-do you generate. Generic advice is not acceptable.

---

## What You Are Receiving

After this context document, you will receive a structured set of survey answers from a prospective first-time homebuyer. The answers cover:

- Who is buying (solo or with a co-buyer)
- Income, employment type, and stability
- Savings and total assets
- Credit score range and any credit issues
- Total monthly debt obligations
- Target purchase price and state
- Timeline and life context
- Goals, motivations, and how long they plan to stay
- Property and location preferences
- Emotional readiness and concerns
- Special situations (veteran, public servant, prior foreclosure, etc.)

Use every relevant answer to personalize the plan. Answers that are not filled in or marked "not provided" should be treated as unknown — do not fabricate data.

---

## Homebuying Knowledge Base

Use the following as your working knowledge of how homebuying works. Apply it when calculating financial metrics and generating tips and to-dos.

### Mortgage Basics
- Use a 30-year fixed mortgage at 7% interest rate for all payment estimates unless instructed otherwise.
- Monthly principal + interest can be estimated with the formula for a fixed-rate mortgage.
- Monthly housing cost also includes property taxes (~1.1% of home value / 12), homeowners insurance (~$150-200/mo), and HOA if applicable.
- PMI applies when down payment is below 20% on a conventional loan. Estimate $50-150/mo per $100k borrowed.

### Down Payment Rules
- Credit score below 620: recommend FHA loan at 3.5% down. Note that FHA requires mortgage insurance premium (MIP) for the life of the loan.
- Credit score 620-749: recommend 10% down conventional.
- Credit score 750+: recommend 20% down to avoid PMI, if savings support it.
- If the buyer expressed interest in house hacking (buying a multi-unit), FHA allows 3.5% down on 2-4 unit properties — flag this as an option.
- If buyer is a veteran, flag VA loan: 0% down, no PMI, competitive rates.
- If buyer is buying in a rural area, flag USDA loan: 0% down, income limits apply.

### Debt-to-Income (DTI) Ratio
- DTI = (monthly debt payments + estimated new mortgage payment) / gross monthly income
- Target: below 43% for conventional loans; FHA allows up to 50% via automated underwriting.
- If calculated DTI exceeds 43%, flag this clearly. The buyer may need to pay down debt, increase income, or target a lower purchase price.
- Express DTI as a decimal (e.g., 0.36 for 36%).

### Closing Costs
- Estimate closing costs at 2-5% of purchase price.
- For buyers with limited savings, use 3% as the baseline estimate.
- Closing costs are separate from the down payment — many first-time buyers are surprised by this.

### Cash Reserve Recommendation
- After down payment and closing costs, the buyer should ideally retain 3-6 months of living expenses as an emergency fund.
- If their total assets minus total cash needed leaves less than 3 months of expenses, flag this as a financial risk and recommend they either wait to build savings or target a lower purchase price.

### Savings Gap
- savings_gap = total_cash_needed - current_savings
- If savings_gap <= 0, the buyer can afford to move forward now.
- If savings_gap > 0, calculate months_to_goal = savings_gap / monthly_savings_target (use 20% of gross monthly income as the default savings target unless their debt load makes that unrealistic).

### Down Payment Assistance (DPA)
- Many states and counties offer grants, zero-interest loans, or deferred second mortgages for first-time buyers.
- If the buyer's state is known, reference that state-specific programs likely exist and direct them to HUD's approved housing counselor directory (hud.gov) and their state housing finance agency.
- Income at or below 80% of area median income (AMI) typically unlocks additional programs.
- Fannie Mae HomeReady and Freddie Mac Home Possible allow 3% down with income limits.

### House Hacking
- If the buyer expressed interest in house hacking, incorporate this into their plan:
  - A duplex, triplex, or fourplex qualifies for FHA financing (3.5% down) if the buyer occupies one unit.
  - For 3-4 unit FHA purchases, the self-sufficiency test applies: 75% of projected rental income must cover the full mortgage payment.
  - Rental income from other units can offset the monthly mortgage cost significantly.
  - This strategy accelerates equity building and reduces effective housing cost.

### Credit Preparation
- Credit score below 620: buyer likely needs to spend 6-18 months repairing credit before qualifying for favorable terms.
- If buyer reported credit dings (missed payments, collections, bankruptcy, foreclosure):
  - Chapter 7 bankruptcy: 2-year waiting period for FHA, 4 years for conventional.
  - Chapter 13 bankruptcy: 1 year into repayment plan for FHA.
  - Foreclosure: 3-year waiting period for FHA, 7 years for conventional.
  - Collections and late payments: recommend disputing errors, paying down balances, and not opening new credit.
- Recommend checking credit reports at annualcreditreport.com.

### Self-Employment Considerations
- Self-employed buyers need 2 years of filed tax returns showing consistent income.
- Lenders use the average of the last 2 years of net income (after write-offs), which is often lower than actual cash flow — this can reduce qualifying loan amount significantly.
- If buyer has been self-employed less than 2 years, they may need to wait before qualifying.

### Timeline Calibration
- "ASAP" or "3-6 months": Emphasize urgency — focus on what can be done immediately. If financials aren't ready, be honest about whether this timeline is realistic.
- "6-12 months": Standard preparation window. Most action items can be completed in this time.
- "1-2 years": More time for credit repair, savings building, or debt paydown.
- "Just exploring": No urgency — focus on education and financial foundation.

### Starter Home vs. Long-Term Home
- Staying fewer than 3 years: homebuying may not break even vs. renting — flag this honestly.
- 3-5 years: buying becomes competitive with renting from an equity standpoint.
- 5+ years: strong financial case for buying.

### Co-Buyer Considerations
- If buying with a spouse or partner, the lender will use both incomes (beneficial) but also both credit scores — the lower score typically drives the rate.
- If the co-buyer has significantly lower credit, the primary buyer may qualify for better terms alone (at the cost of qualifying on one income).
- Unmarried co-buyers should consider how title is held (joint tenancy vs. tenancy in common) — mention this as a legal consideration.

### Common First-Time Buyer Mistakes to Help Them Avoid
- Draining all savings for the down payment and having no emergency fund.
- Getting only one mortgage quote (recommend 3+ lenders).
- Waiving inspection contingencies without understanding the risk.
- Not accounting for property taxes, insurance, HOA, and maintenance in their monthly budget.
- Making large purchases or opening new credit between pre-approval and closing.
- Underestimating how competitive the market is in their target area.

---

## Interpreting Survey Answers

### Age
- Under 25: likely earlier in career; savings may be limited. Be encouraging but realistic.
- 25-35: prime first-time buyer window; standard guidance applies.
- 35+: may have more savings and stability but also more competing financial priorities (retirement, kids). Factor this in.

### Income Type
- Salaried: most straightforward for lenders. Two years at current employer preferred.
- Hourly: similar to salaried; overtime may or may not be counted.
- Commission: lenders average last 2 years of commission income. If commission is variable, qualifying amount may be less than recent earnings.
- Self-employed: see self-employment section above.
- Combination: apply relevant rules for each income stream.

### Credit Score
- Use the midpoint of the stated range for calculations.
- Below 580 / 580-619: flag FHA path, note credit repair is likely needed first.
- 620-659: FHA is viable; conventional possible but expensive.
- 660-699: conventional viable; recommend shopping multiple lenders.
- 700-739: solid conventional footing; good rate territory.
- 740+: excellent; recommend shopping for best rate, may benefit from 20% down.

### Concerns / Fears
- If the buyer flagged specific concerns, address them directly in the relevant step's tips.
- "Not understanding the process" → explain more in tips; add educational to-dos.
- "Being house-poor" → emphasize affordability math and cash reserve.
- "Overpaying" → address offer strategy and market research in Step 3.
- "Market dropping" → address in Step 1 or Step 3 with long-term perspective framing.

### House Hacking Interest
- If "Yes" or "Maybe": incorporate multi-unit strategy into the plan throughout all 4 steps.
- If "What's that?": the UI will have explained it before they answered — treat their answer as informed.

### Renovation Willingness
- "Yes" or "Depends": expand property search options in Step 3 tips; mention fixer-upper pricing advantages.
- "No": focus on move-in ready inventory and note it may limit options in competitive markets.

### Mortgage Familiarity (1-5 scale)
- 1-2: use more explanatory language in tips; add foundational educational to-dos.
- 3-5: assume baseline knowledge; keep tips actionable rather than explanatory.

### Real Estate Agent
- Has one: acknowledge it; relevant to-dos can focus on working with their agent effectively.
- No agent yet: include finding a buyer's agent as an early to-do.

### Special Situations (checkboxes)
- Veteran: flag VA loan prominently in Step 2. No down payment, no PMI — this changes the financial math significantly.
- Public servant: note state-specific programs may exist. Add researching these as a to-do.
- Rural area: flag USDA loan eligibility in Step 2.
- Prior foreclosure or bankruptcy: address waiting periods honestly in Step 1. Adjust timeline expectations accordingly.

---

## Language and Tone

Write everything in plain, clear English. Imagine you're texting a smart friend who knows nothing about mortgages.

- No jargon without explanation. If you use a term like "DTI" or "PMI," define it in the same sentence.
- Short sentences. One idea per sentence.
- Use the buyer's actual numbers whenever possible.
- Tips should feel like advice from someone who's been through this. Not a legal disclaimer.
- Todos should be direct actions. Start with a verb. Keep them under 10 words.
- Never say "it's important to" or "you should consider." Just say what to do.

---

## Trusted Resource Library

Only use URLs from this list. Do not make up or guess URLs.

- Pull your free credit reports: https://www.annualcreditreport.com
- Understand your credit score: https://www.consumerfinance.gov/consumer-tools/credit-reports-and-scores/
- How DTI works: https://www.consumerfinance.gov/ask-cfpb/what-is-a-debt-to-income-ratio-en-1791/
- Budgeting for homeownership: https://www.consumerfinance.gov/owning-a-home/
- CFPB mortgage guide: https://www.consumerfinance.gov/owning-a-home/process/
- FHA loan basics: https://www.hud.gov/buying/loans
- VA home loan program: https://www.benefits.va.gov/homeloans/
- USDA rural loan eligibility: https://eligibility.sc.egov.usda.gov/eligibility/
- Fannie Mae HomeReady (3% down): https://www.fanniemae.com/homeready
- Find down payment assistance programs by state: https://www.hud.gov/findassistance
- Find a HUD-approved housing counselor (free): https://www.hud.gov/findacounselor
- Search homes on Zillow: https://www.zillow.com
- Search homes on Realtor.com: https://www.realtor.com
- Mortgage payment calculator: https://www.bankrate.com/mortgages/mortgage-calculator/
- Rent vs. buy calculator: https://www.nytimes.com/interactive/2014/upshot/buy-rent-calculator.html
- What to expect at closing: https://www.consumerfinance.gov/owning-a-home/process/close/
- Home inspection guide: https://www.realtor.com/advice/buy/what-is-a-home-inspection/

---

## Output Instructions

You must return a single valid JSON object. No markdown, no explanation, no commentary outside the JSON.

The JSON must match the schema exactly. Rules:

### financial_metrics rules
- All numeric values are plain numbers — no strings, currency symbols, or percent signs.
- recommended_loan_type: one of "FHA", "VA", "USDA", "Conventional 3% down", "Conventional 10% down", or "Conventional 20% down".
- recommended_down_payment_pct: 3.5, 3, 10, or 20.
- down_payment_amount: target_purchase_price × (recommended_down_payment_pct / 100).
- closing_cost_estimate: target_purchase_price × 0.03.
- total_cash_needed: down_payment_amount + closing_cost_estimate.
- savings_gap: total_cash_needed − current_savings. Floor at 0.
- monthly_savings_target: gross_monthly_income × 0.20.
- months_to_goal: savings_gap / monthly_savings_target. Round up. Return 0 if savings_gap is 0.
- estimated_monthly_mortgage: 30-year fixed at 7% on loan amount, plus ~1.1% property tax/12 and ~$175/mo insurance. Add PMI if down payment below 20% on conventional.
- debt_to_income_ratio: (monthly_debt + estimated_monthly_mortgage) / gross_monthly_income. Decimal format.

### step_goal_date rules
- YYYY-MM-DD format. Base on today's date and buyer's stated timeline.
- Space 4 steps evenly. If timeline is unrealistic given financials, use realistic dates.

### tips rules
- Exactly 4 tips per step. Plain strings. 2-4 sentences each.
- At least 2 tips per step must reference the buyer's actual numbers or situation.
- Include resource URLs inline where relevant.

### todos rules
- Exactly 4 todos per step. todo_number runs 1–4 per step. is_done is always false on generation.
- Under 10 words. Start with a verb. Be specific.

### Personalization standards
- Reference buyer's actual dollar amounts in at least 2 tips per step.
- If buyer is in a specific state, reference it at least once.
- If buyer flagged a concern, address it in the most relevant step.
- If DTI exceeds 43%, call it out clearly in Step 1.
- If timeline is unrealistic, say so plainly in Step 1.
- If buyer is new to mortgages (familiarity 1-2), include at least one educational link in Step 1 or 2.

## Survey Answers Begin Below
`;

// ── Gemini schema ─────────────────────────────────────────────────────────────

const planSchema = {
  type: SchemaType.OBJECT,
  properties: {
    financial_metrics: {
      type: SchemaType.OBJECT,
      properties: {
        recommended_loan_type:        { type: SchemaType.STRING },
        recommended_down_payment_pct: { type: SchemaType.NUMBER },
        down_payment_amount:          { type: SchemaType.NUMBER },
        closing_cost_estimate:        { type: SchemaType.NUMBER },
        total_cash_needed:            { type: SchemaType.NUMBER },
        savings_gap:                  { type: SchemaType.NUMBER },
        monthly_savings_target:       { type: SchemaType.NUMBER },
        months_to_goal:               { type: SchemaType.INTEGER },
        estimated_monthly_mortgage:   { type: SchemaType.NUMBER },
        debt_to_income_ratio:         { type: SchemaType.NUMBER },
      },
      required: [
        'recommended_loan_type', 'recommended_down_payment_pct', 'down_payment_amount',
        'closing_cost_estimate', 'total_cash_needed', 'savings_gap',
        'monthly_savings_target', 'months_to_goal',
        'estimated_monthly_mortgage', 'debt_to_income_ratio',
      ],
    },
    steps: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          step_number:    { type: SchemaType.INTEGER },
          step_name:      { type: SchemaType.STRING },
          step_goal_date: { type: SchemaType.STRING },
          tips:  { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          todos: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                todo_number:      { type: SchemaType.INTEGER },
                todo_description: { type: SchemaType.STRING },
                is_done:          { type: SchemaType.BOOLEAN },
              },
              required: ['todo_number', 'todo_description', 'is_done'],
            },
          },
        },
        required: ['step_number', 'step_name', 'step_goal_date', 'tips', 'todos'],
      },
    },
  },
  required: ['financial_metrics', 'steps'],
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildModel() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set in your environment');
  }
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  return genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: planSchema as any,
    },
    systemInstruction: SYSTEM_PROMPT,
  });
}

function creditScoreLabel(score: number): string {
  if (score < 580)  return 'Below 580';
  if (score < 620)  return '580-619';
  if (score < 660)  return '620-659';
  if (score < 700)  return '660-699';
  if (score < 740)  return '700-739';
  return '740+';
}

function line(label: string, value: any, prefix = ''): string | null {
  if (value === undefined || value === null || value === '' || value === 'not provided') return null;
  return `${prefix}- ${label}: ${value}`;
}

function buildUserPrompt(financial: any, context: any): string {
  const fmt = (n: any) => Number(n).toLocaleString();

  const sections: (string | null)[] = [
    '## About the Buyer',
    line('Buying', context.buying_with ? `with ${context.buying_with}` : 'solo'),
    line('Age', context.buyer_age),
    '',
    '## Income',
    `- Annual income: $${fmt(financial.annual_income)}`,
    line('Income type', context.income_type),
    context.income_type === 'Self-employed'
      ? line('Self-employed 2+ years', context.self_employed_2yr)
      : null,
    line('Job change in past 2 years', context.job_change_2yr),
    financial.other_income
      ? `- Other income: $${fmt(financial.other_income)}/yr`
      : null,
    context.cobuyerIncome
      ? `- Co-buyer annual income: $${fmt(context.cobuyerIncome)}`
      : null,
    '',
    '## Finances',
    `- Current savings: $${fmt(financial.current_savings)}`,
    financial.total_assets
      ? `- Total assets: $${fmt(financial.total_assets)}`
      : null,
    line('Large upcoming expenses (next 12 months)', context.large_expenses),
    '',
    '## Credit & Debt',
    `- Credit score range: ${creditScoreLabel(Number(financial.credit_score))}`,
    line('Co-buyer credit score range', context.cobuyer_credit_score
      ? creditScoreLabel(Number(context.cobuyer_credit_score))
      : null),
    line('Credit issues (dings, bankruptcy, foreclosure)', context.credit_dings),
    `- Total monthly debt payments: $${fmt(financial.monthly_debt)}`,
    '',
    '## Budget & Timeline',
    `- Target purchase price: $${fmt(financial.target_home_price)}`,
    line('Target state', context.target_state || context.target_location),
    `- Purchase timeline: ${context.purchase_timeline}`,
    line('Upcoming life events', context.life_events),
    '',
    '## Goals',
    line('Main motivation', Array.isArray(context.main_motivation)
      ? context.main_motivation.join(', ')
      : context.main_motivation),
    line('Equity vs low payment priority', context.equity_vs_payment),
    line('Planned length of stay', context.stay_length),
    line('Starter vs long-term home', context.starter_vs_longterm),
    line('House hacking interest', context.house_hacking),
    '',
    '## The Home',
    line('Property type preference', context.property_type),
    line('Bedrooms needed', context.bedrooms),
    line('Renovation willingness', context.renovation),
    line('Target location(s)', context.target_location),
    line('Geographic constraints', context.geo_constraints),
    line('School district matters', context.school_district),
    line('Neighborhood feel', context.neighborhood_feel),
    '',
    '## Mindset & Readiness',
    context.cobuyer_alignment
      ? line('Co-buyer alignment', context.cobuyer_alignment)
      : null,
    line('Concerns / fears', Array.isArray(context.fears)
      ? context.fears.join(', ')
      : context.fears),
    line('Mortgage process familiarity (1-5)', context.mortgage_familiarity),
    line('Has real estate agent', context.has_agent),
    line('Current housing situation', context.current_housing),
    line('Questions about the process', context.process_questions),
    '',
    '## Special Situations',
    Array.isArray(context.special_situations) && context.special_situations.length > 0
      ? `- ${context.special_situations.join(', ')}`
      : '- None specified',
  ];

  return sections.filter((l) => l !== null).join('\n');
}

function buildPlanResponse(
  financial_metrics: any,
  steps: any[],
  todoRows: any[],
  tipRows: any[],
  stepGoalDates: Record<string, string> = {},
) {
  const stepNames = ['Get Your Finances Ready', 'Get Pre-Approved', 'Find Your Home', 'Close the Deal'];
  const builtSteps = [1, 2, 3, 4].map((order) => {
    const stepDef = steps.find((s: any) => (s.step_order ?? s.step_number) === order);
    return {
      step_order: order,
      step_name: stepDef?.step_name ?? stepNames[order - 1],
      step_goal_date: stepGoalDates[String(order)] ?? null,
      tips: tipRows.filter((t: any) => t.step_order === order).map((t: any) => t.tip_text),
      todos: todoRows
        .filter((t: any) => t.step_order === order)
        .map((t: any) => ({ id: t.id, text: t.todo_text, completed: t.completed })),
    };
  });
  return { financial_metrics, steps: builtSteps };
}

// ── Routes ────────────────────────────────────────────────────────────────────

// POST /api/surveys/generate-plan
router.post('/generate-plan', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { financial, context } = req.body;

  if (!financial || !context) {
    return res.status(400).json({ error: 'financial and context are required' });
  }
  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({
      error: 'Gemini is not configured',
      detail: 'Missing GEMINI_API_KEY. Add it to your local .env and restart the server.',
    });
  }

  for (const field of ['annual_income', 'current_savings', 'target_home_price', 'credit_score', 'monthly_debt']) {
    if (financial[field] === undefined || financial[field] === null || financial[field] === '') {
      return res.status(400).json({ error: `financial.${field} is required` });
    }
  }

  for (const field of ['purchase_timeline']) {
    if (!context[field]) {
      return res.status(400).json({ error: `context.${field} is required` });
    }
  }

  let client;
  try {
    const model = buildModel();
    const result = await model.generateContent(buildUserPrompt(financial, context));
    const plan = JSON.parse(result.response.text());
    const { financial_metrics, steps } = plan;

    // Build step_goal_dates map from Gemini response
    const stepGoalDates: Record<string, string> = {};
    for (const step of steps) {
      const order = step.step_number ?? step.step_order;
      if (step.step_goal_date) stepGoalDates[String(order)] = step.step_goal_date;
    }

    client = await pool.connect();
    await client.query('BEGIN');

    await client.query(
      `INSERT INTO user_financial_profile
         (user_id, annual_income, current_savings, target_home_price, credit_score, monthly_debt, survey_context, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       ON CONFLICT (user_id) DO UPDATE SET
         annual_income = $2, current_savings = $3, target_home_price = $4,
         credit_score = $5, monthly_debt = $6, survey_context = $7, updated_at = NOW()`,
      [req.userId, financial.annual_income, financial.current_savings,
       financial.target_home_price, financial.credit_score, financial.monthly_debt,
       JSON.stringify(context)]
    );

    await client.query(
      `INSERT INTO user_plan_metrics
         (user_id, recommended_loan_type, recommended_down_pct, down_payment_amount,
          closing_cost_estimate, total_cash_needed, savings_gap, monthly_savings_target,
          months_to_goal, estimated_monthly_mortgage, debt_to_income_ratio,
          step_goal_dates, generated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
       ON CONFLICT (user_id) DO UPDATE SET
         recommended_loan_type = $2, recommended_down_pct = $3, down_payment_amount = $4,
         closing_cost_estimate = $5, total_cash_needed = $6, savings_gap = $7,
         monthly_savings_target = $8, months_to_goal = $9, estimated_monthly_mortgage = $10,
         debt_to_income_ratio = $11, step_goal_dates = $12, generated_at = NOW()`,
      [req.userId,
       financial_metrics.recommended_loan_type,
       financial_metrics.recommended_down_payment_pct,
       financial_metrics.down_payment_amount,
       financial_metrics.closing_cost_estimate,
       financial_metrics.total_cash_needed,
       financial_metrics.savings_gap,
       financial_metrics.monthly_savings_target,
       financial_metrics.months_to_goal,
       financial_metrics.estimated_monthly_mortgage,
       financial_metrics.debt_to_income_ratio,
       JSON.stringify(stepGoalDates)]
    );

    await client.query('DELETE FROM ai_tips WHERE user_id = $1', [req.userId]);
    await client.query('DELETE FROM ai_todos WHERE user_id = $1', [req.userId]);

    for (const step of steps) {
      const stepOrder = step.step_number ?? step.step_order;
      for (let i = 0; i < step.tips.length; i++) {
        await client.query(
          'INSERT INTO ai_tips (user_id, step_order, tip_text, tip_order) VALUES ($1, $2, $3, $4)',
          [req.userId, stepOrder, step.tips[i], i + 1]
        );
      }
      for (const todo of step.todos) {
        const todoText = typeof todo === 'string' ? todo : todo.todo_description;
        await client.query(
          'INSERT INTO ai_todos (user_id, step_order, todo_text) VALUES ($1, $2, $3)',
          [req.userId, stepOrder, todoText]
        );
      }
    }

    await client.query('COMMIT');

    const [todosResult, tipsResult] = await Promise.all([
      pool.query('SELECT id, step_order, todo_text, completed FROM ai_todos WHERE user_id = $1 ORDER BY step_order, id', [req.userId]),
      pool.query('SELECT step_order, tip_text FROM ai_tips WHERE user_id = $1 ORDER BY step_order, tip_order', [req.userId]),
    ]);

    res.json(buildPlanResponse(financial_metrics, steps, todosResult.rows, tipsResult.rows, stepGoalDates));
  } catch (error: any) {
    if (client) await client.query('ROLLBACK').catch(() => {});
    console.error('generate-plan error:', error);
    res.status(502).json({ error: 'Failed to generate plan', detail: error.message });
  } finally {
    if (client) client.release();
  }
});

// GET /api/surveys/plan
router.get('/plan', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const metricsResult = await pool.query(
      'SELECT * FROM user_plan_metrics WHERE user_id = $1',
      [req.userId]
    );

    if (metricsResult.rows.length === 0) {
      return res.status(404).json({ error: 'No plan found' });
    }

    const m = metricsResult.rows[0];
    const financial_metrics = {
      recommended_loan_type:        m.recommended_loan_type ?? null,
      recommended_down_payment_pct: Number(m.recommended_down_pct),
      down_payment_amount:          Number(m.down_payment_amount),
      closing_cost_estimate:        Number(m.closing_cost_estimate),
      total_cash_needed:            Number(m.total_cash_needed),
      savings_gap:                  Number(m.savings_gap),
      monthly_savings_target:       Number(m.monthly_savings_target),
      months_to_goal:               Number(m.months_to_goal),
      estimated_monthly_mortgage:   Number(m.estimated_monthly_mortgage),
      debt_to_income_ratio:         Number(m.debt_to_income_ratio),
    };

    const stepGoalDates: Record<string, string> = m.step_goal_dates ?? {};

    const [todosResult, tipsResult] = await Promise.all([
      pool.query('SELECT id, step_order, todo_text, completed FROM ai_todos WHERE user_id = $1 ORDER BY step_order, id', [req.userId]),
      pool.query('SELECT step_order, tip_text FROM ai_tips WHERE user_id = $1 ORDER BY step_order, tip_order', [req.userId]),
    ]);

    const stepNames = ['Get Your Finances Ready', 'Get Pre-Approved', 'Find Your Home', 'Close the Deal'];
    const steps = stepNames.map((name, i) => ({ step_order: i + 1, step_name: name }));

    res.json(buildPlanResponse(financial_metrics, steps, todosResult.rows, tipsResult.rows, stepGoalDates));
  } catch (error) {
    console.error('get-plan error:', error);
    res.status(500).json({ error: 'Failed to load plan' });
  }
});

export default router;
