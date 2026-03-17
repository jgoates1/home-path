-- Migration: Gemini AI plan tables
-- Run once against homepath_db

CREATE TABLE IF NOT EXISTS user_financial_profile (
  user_id             INTEGER PRIMARY KEY REFERENCES user_info(user_id) ON DELETE CASCADE,
  annual_income       NUMERIC,
  current_savings     NUMERIC,
  target_home_price   NUMERIC,
  credit_score        INTEGER,
  monthly_debt        NUMERIC,
  survey_context      JSONB,
  created_at          TIMESTAMP DEFAULT NOW(),
  updated_at          TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_plan_metrics (
  user_id                    INTEGER PRIMARY KEY REFERENCES user_info(user_id) ON DELETE CASCADE,
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

CREATE TABLE IF NOT EXISTS ai_tips (
  tip_id     SERIAL PRIMARY KEY,
  user_id    INTEGER REFERENCES user_info(user_id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL,
  tip_text   TEXT NOT NULL,
  tip_order  INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS ai_todos (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER REFERENCES user_info(user_id) ON DELETE CASCADE,
  step_order  INTEGER NOT NULL,
  todo_text   TEXT NOT NULL,
  completed   BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMP DEFAULT NOW()
);
