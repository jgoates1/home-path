import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSurvey } from "@/contexts/SurveyContext";
import RoadmapVisual from "@/components/RoadmapVisual";
import { TrendingUp, Target, ListChecks, BarChart3 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const fmt = (n: number) => `$${Math.round(n).toLocaleString()}`;
const fmtPct = (n: number) => `${Math.round(n * 100)}%`;

const DashboardPage = () => {
  const { user } = useAuth();
  const { savedAmount, targetSavings, setSavedAmount, planMetrics, getCompletionPercent, steps, hasPlan, toggleTodo } = useSurvey();
  const navigate = useNavigate();
  const completionPct = getCompletionPercent();
  const [modalOpen, setModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const upNextTodos = steps
    .flatMap((s) => s.todos.map((t) => ({ ...t, stepId: s.id, stepTitle: s.title })))
    .filter((t) => !t.completed)
    .slice(0, 5);

  const goalAmount = targetSavings;
  const savingsPercent = goalAmount > 0 ? Math.min(Math.round((savedAmount / goalAmount) * 100), 100) : 0;

  const handleConfirm = () => {
    const num = parseInt(inputValue.replace(/[^0-9]/g, ""), 10);
    if (!isNaN(num)) setSavedAmount(num);
    setModalOpen(false);
  };

  return (
    <main className="min-h-screen bg-background pb-12">
      {/* Hero banner */}
      <section className="w-full px-6 md:px-8 py-8 md:py-10 bg-surface-container border-b border-border">
        <div className="max-w-6xl mx-auto">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-1">Dashboard</p>
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground tracking-tight">
            Welcome back, <span className="text-primary">{user?.name || "Guest"}</span>
          </h1>
          <p className="text-base mt-2 text-muted-foreground">Goal: <span className="font-semibold text-foreground">Home purchase</span></p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 md:px-8 py-8">
        {!hasPlan && (
          <div className="bg-card rounded-lg p-8 border border-border shadow-sm text-center mb-8">
            <h2 className="text-xl font-heading font-bold text-foreground mb-2">No plan yet</h2>
            <p className="text-muted-foreground mb-4">Complete the survey to generate your personalized homebuying plan.</p>
            <button
              onClick={() => navigate("/survey")}
              className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors"
            >
              Take the Survey
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-8">
          {/* Left: Roadmap */}
          <div className="bg-card rounded-lg p-6 border border-border shadow-sm overflow-hidden">
            <h2 className="text-base font-heading font-semibold text-foreground mb-4">Home Buying Roadmap</h2>
            <RoadmapVisual />
          </div>

          {/* Right: Stats */}
          <div className="flex flex-col gap-6">
            {/* Savings Progress */}
            <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-md bg-secondary/15 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-secondary" />
                </div>
                <span className="font-bold text-foreground text-base">Savings Progress</span>
              </div>
              <p className="text-3xl md:text-4xl font-heading font-bold text-secondary mb-2 tracking-tight">
                {fmt(savedAmount)}
              </p>
              <div className="w-full h-3 bg-muted rounded-full overflow-hidden mb-2">
                <div className="h-full bg-secondary rounded-full transition-all duration-700" style={{ width: `${savingsPercent}%` }} />
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                <span className="font-bold text-secondary text-base">{savingsPercent}%</span>
                {goalAmount > 0 && <> of {fmt(goalAmount)} savings goal</>}
              </p>
              <button
                onClick={() => { setInputValue(savedAmount.toString()); setModalOpen(true); }}
                className="text-sm font-medium px-3 py-2 rounded-md bg-secondary/15 text-secondary hover:bg-secondary/20 transition-colors"
              >
                Update savings
              </button>
            </div>

            {/* Overall Progress */}
            <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-md bg-primary/15 flex items-center justify-center">
                  <Target className="w-5 h-5 text-primary" />
                </div>
                <span className="font-bold text-foreground text-base">Overall Progress</span>
              </div>
              <div className="w-full h-3 bg-muted rounded-full overflow-hidden mb-2">
                <div className="h-full bg-primary rounded-full transition-all duration-700" style={{ width: `${completionPct}%` }} />
              </div>
              <p className="text-sm text-muted-foreground">
                <span className="font-bold text-primary text-base">{completionPct}%</span> of all steps complete
              </p>
            </div>
          </div>
        </div>

        {/* Financial Snapshot */}
        {hasPlan && planMetrics && (
          <div className="bg-card rounded-lg p-6 border border-border shadow-sm mb-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-md bg-primary/15 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground text-base">Financial Snapshot</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <MetricTile label="Recommended Down Payment" value={`${fmt(planMetrics.down_payment_amount)} (${planMetrics.recommended_down_payment_pct}%)`} />
              <MetricTile label="Closing Cost Estimate" value={fmt(planMetrics.closing_cost_estimate)} />
              <MetricTile label="Total Cash Needed" value={fmt(planMetrics.total_cash_needed)} />
              <MetricTile label="Savings Gap" value={fmt(planMetrics.savings_gap)} highlight={planMetrics.savings_gap > 0} />
              <MetricTile label="Monthly Savings Target" value={fmt(planMetrics.monthly_savings_target)} />
              <MetricTile label="Months to Goal" value={`${planMetrics.months_to_goal} months`} />
              <MetricTile label="Est. Monthly Mortgage" value={fmt(planMetrics.estimated_monthly_mortgage)} />
              <MetricTile label="Debt-to-Income Ratio" value={fmtPct(planMetrics.debt_to_income_ratio)} />
            </div>
          </div>
        )}

        {/* Up Next */}
        <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-md bg-primary/15 flex items-center justify-center">
              <ListChecks className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground text-base">Up Next</h3>
          </div>
          <ul className="space-y-2">
            {upNextTodos.map((todo) => (
              <li
                key={todo.id}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-surface-container transition-colors cursor-pointer"
                onClick={() => navigate(`/step/${todo.stepId}`)}
              >
                <button
                  type="button"
                  aria-label={`Mark ${todo.text} complete`}
                  className="w-4 h-4 rounded-sm border-2 border-muted-foreground/50 mt-0.5 shrink-0 hover:border-primary transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    void toggleTodo(todo.stepId, todo.id);
                  }}
                />
                <div>
                  <span className="text-sm font-medium text-foreground">{todo.text}</span>
                  <span className="block text-xs text-muted-foreground">{todo.stepTitle}</span>
                </div>
              </li>
            ))}
            {upNextTodos.length === 0 && hasPlan && (
              <p className="text-base font-semibold text-secondary p-3">All tasks complete. You&apos;re ready to buy.</p>
            )}
            {!hasPlan && (
              <p className="text-sm text-muted-foreground p-3">Complete the survey to see your tasks.</p>
            )}
          </ul>
        </div>
      </div>

      {/* Update Savings Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Savings</DialogTitle>
            <DialogDescription>
              Current savings: <span className="font-semibold">{fmt(savedAmount)}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label htmlFor="savings-input" className="text-sm font-medium text-foreground mb-2 block">
              New savings amount ($)
            </label>
            <input
              id="savings-input"
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2"
              autoFocus
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <button
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-sm font-medium rounded-md border border-border bg-background text-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="px-4 py-2 text-sm font-medium rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors"
            >
              Confirm
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
};

const MetricTile = ({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) => (
  <div className="bg-surface-container rounded-lg p-4">
    <p className="text-xs text-muted-foreground mb-1">{label}</p>
    <p className={`text-base font-bold ${highlight ? "text-destructive" : "text-foreground"}`}>{value}</p>
  </div>
);

export default DashboardPage;
