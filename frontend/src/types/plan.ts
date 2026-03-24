export interface FinancialProfile {
  annual_income: number;
  current_savings: number;
  target_home_price: number;
  credit_score: number;
  monthly_debt: number;
  other_income?: number;
  total_assets?: number;
}

export interface SurveyContext {
  // Section 1
  buyer_age?: number;
  buying_with?: string;
  cobuyer_relationship?: string;
  // Section 2
  income_type?: string;
  self_employed_2yr?: string;
  job_change_2yr?: string;
  cobuyer_income?: number;
  // Section 3
  large_expenses?: string;
  // Section 4
  cobuyer_credit_score?: number;
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
  bedrooms?: string;
  renovation?: string;
  target_location?: string;
  geo_constraints?: string;
  school_district?: string;
  neighborhood_feel?: string;
  // Section 8
  cobuyer_alignment?: string;
  fears?: string[];
  mortgage_familiarity?: string;
  has_agent?: string;
  current_housing?: string;
  process_questions?: string;
  // Section 9
  special_situations?: string[];
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
