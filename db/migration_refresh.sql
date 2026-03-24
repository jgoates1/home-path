-- Migration: refresh branch additions to support plan-generator-context schema
-- Run once against homepath_db

ALTER TABLE user_plan_metrics
  ADD COLUMN IF NOT EXISTS recommended_loan_type VARCHAR(50),
  ADD COLUMN IF NOT EXISTS step_goal_dates JSONB;
