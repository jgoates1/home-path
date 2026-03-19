import { Router, Response } from 'express';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import pool from '../db/pool.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = Router();

// ── Gemini setup ──────────────────────────────────────────────────────────────

const planSchema = {
  type: SchemaType.OBJECT,
  properties: {
    financial_metrics: {
      type: SchemaType.OBJECT,
      properties: {
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
        'recommended_down_payment_pct', 'down_payment_amount',
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
          step_order: { type: SchemaType.INTEGER },
          step_name:  { type: SchemaType.STRING },
          tips:  { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          todos: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        },
        required: ['step_order', 'step_name', 'tips', 'todos'],
      },
    },
  },
  required: ['financial_metrics', 'steps'],
};

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
    systemInstruction: `You are a financial advisor for HomePath, a first-time homebuyer guidance app.
Generate a personalized homebuying plan based on the user's financial profile.
The plan must cover exactly 4 steps in this order:
1. Get Your Finances Ready
2. Get Pre-Approved
3. Find Your Home
4. Close the Deal

For each step, provide exactly 4 practical, specific tips and exactly 4 actionable todos.
Reference the user's actual dollar amounts, location, and timeline where relevant.
For financial_metrics, calculate all values based on the user's data.
Use a recommended down payment of 10% unless the user's credit score is below 620 (use 3.5% FHA) or above 750 (suggest 20%).
Assume a 30-year fixed mortgage at a 7% interest rate for payment estimates.
debt_to_income_ratio should be expressed as a decimal (e.g. 0.28 for 28%).`,
  });
}

function buildUserPrompt(financial: any, context: any): string {
  return `User financial profile:
- Annual income: $${Number(financial.annual_income).toLocaleString()}
- Current savings: $${Number(financial.current_savings).toLocaleString()}
- Target home price: $${Number(financial.target_home_price).toLocaleString()}
- Credit score: ~${financial.credit_score}
- Monthly debt payments: $${Number(financial.monthly_debt).toLocaleString()}
- Target location: ${context.target_location}
- Purchase timeline: ${context.purchase_timeline}
- Location familiarity: ${context.location_familiarity}
- Household size: ${context.household_size}
- Current housing: ${context.current_housing}

Generate their personalized homebuying plan.`;
}

function buildPlanResponse(financial_metrics: any, steps: any[], todoRows: any[], tipRows: any[]) {
  const stepNames = ['Get Your Finances Ready', 'Get Pre-Approved', 'Find Your Home', 'Close the Deal'];
  const builtSteps = [1, 2, 3, 4].map((order) => {
    const stepDef = steps.find((s: any) => s.step_order === order);
    return {
      step_order: order,
      step_name: stepDef?.step_name ?? stepNames[order - 1],
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

  for (const field of ['purchase_timeline', 'target_location', 'location_familiarity', 'household_size', 'current_housing']) {
    if (!context[field] && context[field] !== 0) {
      return res.status(400).json({ error: `context.${field} is required` });
    }
  }

  let client;
  try {
    const model = buildModel();
    const result = await model.generateContent(buildUserPrompt(financial, context));
    const plan = JSON.parse(result.response.text());
    const { financial_metrics, steps } = plan;

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
         (user_id, recommended_down_pct, down_payment_amount, closing_cost_estimate,
          total_cash_needed, savings_gap, monthly_savings_target, months_to_goal,
          estimated_monthly_mortgage, debt_to_income_ratio, generated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
       ON CONFLICT (user_id) DO UPDATE SET
         recommended_down_pct = $2, down_payment_amount = $3, closing_cost_estimate = $4,
         total_cash_needed = $5, savings_gap = $6, monthly_savings_target = $7,
         months_to_goal = $8, estimated_monthly_mortgage = $9, debt_to_income_ratio = $10,
         generated_at = NOW()`,
      [req.userId,
       financial_metrics.recommended_down_payment_pct,
       financial_metrics.down_payment_amount,
       financial_metrics.closing_cost_estimate,
       financial_metrics.total_cash_needed,
       financial_metrics.savings_gap,
       financial_metrics.monthly_savings_target,
       financial_metrics.months_to_goal,
       financial_metrics.estimated_monthly_mortgage,
       financial_metrics.debt_to_income_ratio]
    );

    await client.query('DELETE FROM ai_tips WHERE user_id = $1', [req.userId]);
    await client.query('DELETE FROM ai_todos WHERE user_id = $1', [req.userId]);

    for (const step of steps) {
      for (let i = 0; i < step.tips.length; i++) {
        await client.query(
          'INSERT INTO ai_tips (user_id, step_order, tip_text, tip_order) VALUES ($1, $2, $3, $4)',
          [req.userId, step.step_order, step.tips[i], i + 1]
        );
      }
      for (const todoText of step.todos) {
        await client.query(
          'INSERT INTO ai_todos (user_id, step_order, todo_text) VALUES ($1, $2, $3)',
          [req.userId, step.step_order, todoText]
        );
      }
    }

    await client.query('COMMIT');

    const [todosResult, tipsResult] = await Promise.all([
      pool.query('SELECT id, step_order, todo_text, completed FROM ai_todos WHERE user_id = $1 ORDER BY step_order, id', [req.userId]),
      pool.query('SELECT step_order, tip_text FROM ai_tips WHERE user_id = $1 ORDER BY step_order, tip_order', [req.userId]),
    ]);

    res.json(buildPlanResponse(financial_metrics, steps, todosResult.rows, tipsResult.rows));
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

    const [todosResult, tipsResult] = await Promise.all([
      pool.query('SELECT id, step_order, todo_text, completed FROM ai_todos WHERE user_id = $1 ORDER BY step_order, id', [req.userId]),
      pool.query('SELECT step_order, tip_text FROM ai_tips WHERE user_id = $1 ORDER BY step_order, tip_order', [req.userId]),
    ]);

    const stepNames = ['Get Your Finances Ready', 'Get Pre-Approved', 'Find Your Home', 'Close the Deal'];
    const steps = stepNames.map((name, i) => ({ step_order: i + 1, step_name: name, tips: [], todos: [] }));

    res.json(buildPlanResponse(financial_metrics, steps, todosResult.rows, tipsResult.rows));
  } catch (error) {
    console.error('get-plan error:', error);
    res.status(500).json({ error: 'Failed to load plan' });
  }
});

export default router;
