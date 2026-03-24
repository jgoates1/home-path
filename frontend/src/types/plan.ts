export interface FinancialProfile {
  annual_income: number;
  current_savings: number;
  target_home_price: number;
  credit_score: number;
  monthly_debt: number;
}

export interface SurveyContext {
  purchase_timeline: string;
  target_location: string;
  location_familiarity: string;
  household_size: number;
  current_housing: string;
}

export interface SurveyInputs {
  financial: FinancialProfile;
  context: SurveyContext;
}

export interface PlanMetrics {
  recommended_loan_type: string | null;
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

export interface AiPlanStep {
  step_order: number;
  step_name: string;
  step_goal_date: string | null;
  tips: string[];
  todos: Array<{ id: number; text: string; completed: boolean }>;
}

export interface PlanResponse {
  financial_metrics: PlanMetrics;
  steps: AiPlanStep[];
}
