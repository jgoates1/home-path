import React from "react";
import { BackToTopButton } from "@/components/BackToTopButton";
import { useNavigate } from "react-router-dom";
import { useSurvey } from "@/contexts/SurveyContext";
import { ChevronLeft, Edit3 } from "lucide-react";

const SurveyInsightsPage = () => {
  const { planMetrics, hasPlan } = useSurvey();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="max-w-md mx-auto px-6 py-6 animate-fade-in">
        <button onClick={() => navigate("/dashboard")} className="flex items-center gap-1 text-primary font-semibold mb-6 hover:underline">
          <ChevronLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Plan Insights</h1>
        <p className="text-muted-foreground mb-8">Your financial snapshot from your personalized plan.</p>

        {hasPlan && planMetrics ? (
          <div className="space-y-3 mb-8">
            {[
              ["Recommended Down Payment", `${planMetrics.recommended_down_payment_pct}%`],
              ["Down Payment Amount", `$${Math.round(planMetrics.down_payment_amount).toLocaleString()}`],
              ["Closing Costs", `$${Math.round(planMetrics.closing_cost_estimate).toLocaleString()}`],
              ["Total Cash Needed", `$${Math.round(planMetrics.total_cash_needed).toLocaleString()}`],
              ["Monthly Savings Target", `$${Math.round(planMetrics.monthly_savings_target).toLocaleString()}`],
              ["Months to Goal", `${planMetrics.months_to_goal}`],
              ["Est. Monthly Mortgage", `$${Math.round(planMetrics.estimated_monthly_mortgage).toLocaleString()}`],
              ["Debt-to-Income Ratio", `${Math.round(planMetrics.debt_to_income_ratio * 100)}%`],
            ].map(([label, value]) => (
              <div key={label} className="bg-card rounded-xl p-4 shadow-sm border">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</label>
                <p className="text-base font-semibold text-foreground mt-1">{value}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground mb-8">No plan yet. Complete the survey to see your insights.</p>
        )}

        <button
          onClick={() => navigate("/survey")}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-primary text-primary-foreground font-bold text-base shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
        >
          <Edit3 className="w-5 h-5" />
          Retake Survey
        </button>
      </div>
      <BackToTopButton />
    </div>
  );
};

export default SurveyInsightsPage;
