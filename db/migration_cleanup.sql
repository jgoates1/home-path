-- Migration: clean up old tables, ensure current schema
-- Run once against homepath_db in Supabase

-- ── Drop old unused tables ────────────────────────────────────────────────────
DROP TABLE IF EXISTS user_todos CASCADE;
DROP TABLE IF EXISTS todo_items CASCADE;
DROP TABLE IF EXISTS user_responses CASCADE;
DROP TABLE IF EXISTS survey_questions CASCADE;
DROP TABLE IF EXISTS steps CASCADE;

-- ── Ensure AI tables exist ────────────────────────────────────────────────────

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
  recommended_loan_type      VARCHAR(50),
  step_goal_dates            JSONB,
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

-- ── Add new columns if not yet present ───────────────────────────────────────
ALTER TABLE user_plan_metrics
  ADD COLUMN IF NOT EXISTS recommended_loan_type VARCHAR(50),
  ADD COLUMN IF NOT EXISTS step_goal_dates JSONB;
