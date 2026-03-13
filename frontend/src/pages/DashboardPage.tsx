import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSurvey } from "@/contexts/SurveyContext";
import RoadmapVisual from "@/components/RoadmapVisual";
import { TrendingUp, Target, ListChecks } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const DashboardPage = () => {
  const { user } = useAuth();
  const { savedAmount, setSavedAmount, goalAmount, getCompletionPercent, steps, committedTimeline } = useSurvey();
  const completionPct = getCompletionPercent();
  const [modalOpen, setModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const upNextTodos = steps
    .flatMap((s) => s.todos.map((t) => ({ ...t, stepTitle: s.title })))
    .filter((t) => !t.completed)
    .slice(0, 5);

  const handleOpenModal = () => {
    setInputValue(savedAmount.toString());
    setModalOpen(true);
  };

  const handleConfirm = () => {
    const num = parseInt(inputValue.replace(/[^0-9]/g, ""), 10);
    if (!isNaN(num)) {
      setSavedAmount(num);
    }
    setModalOpen(false);
  };

  const savingsPercent = goalAmount > 0 ? Math.min(Math.round((savedAmount / goalAmount) * 100), 100) : 0;

  const formatTimeline = (t: string | undefined) => {
    if (!t) return null;
    if (t.toLowerCase().includes("flexible")) return "flexible timeline";
    return t.toLowerCase();
  };

  return (
    <main className="min-h-screen bg-background pb-12">
      {/* Hero banner */}
      <section
        className="w-full px-6 md:px-8 py-8 md:py-10 bg-surface-container border-b border-border"
        role="banner"
        aria-label="Welcome section"
      >
        <div className="max-w-6xl mx-auto">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-1">Dashboard</p>
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground tracking-tight">
            Welcome back,{" "}
            <span className="text-primary">{user?.name || "Guest"}</span>
          </h1>
          <p className="text-base mt-2">
            <span className="text-muted-foreground">Goal: </span>
            <span className="font-semibold text-foreground">Home purchase</span>
            {committedTimeline && (
              <span className="text-muted-foreground"> — {formatTimeline(committedTimeline)}</span>
            )}
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 md:px-8 py-8">
        {/* Responsive 2-column grid — M3 surface elevation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-8">
          {/* Left: Roadmap */}
          <div className="bg-card rounded-lg p-6 border border-border shadow-sm overflow-hidden">
            <h2 className="text-base font-heading font-semibold text-foreground mb-4">Home Buying Roadmap</h2>
            <RoadmapVisual />
          </div>

          {/* Right: Stats stack */}
          <div className="flex flex-col gap-6">
            {/* Savings Card */}
            <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-md bg-secondary/15 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-secondary" aria-hidden="true" />
                </div>
                <span className="font-bold text-foreground text-base">Savings Progress</span>
              </div>
              <p className="text-3xl md:text-4xl font-heading font-bold text-secondary mb-2 tracking-tight">
                ${savedAmount.toLocaleString()}
              </p>
              <div
                className="w-full h-3 bg-muted rounded-full overflow-hidden mb-2"
                role="progressbar"
                aria-valuenow={savingsPercent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Savings progress: ${savingsPercent}% of $${goalAmount.toLocaleString()} goal`}
              >
                <div
                  className="h-full bg-secondary rounded-full transition-all duration-700"
                  style={{ width: `${savingsPercent}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                <span className="font-bold text-secondary text-base">{savingsPercent}%</span> of ${goalAmount.toLocaleString()} goal
              </p>
              <button
                onClick={handleOpenModal}
                className="text-sm font-medium px-3 py-2 rounded-md bg-secondary/15 text-secondary hover:bg-secondary/20 transition-colors focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2"
              >
                Update savings
              </button>
            </div>

            {/* Overall Progress Card */}
            <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-md bg-primary/15 flex items-center justify-center">
                  <Target className="w-5 h-5 text-primary" aria-hidden="true" />
                </div>
                <span className="font-bold text-foreground text-base">Overall Progress</span>
              </div>
              <div
                className="w-full h-3 bg-muted rounded-full overflow-hidden mb-2"
                role="progressbar"
                aria-valuenow={completionPct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Overall progress: ${completionPct}% of all steps complete`}
              >
                <div
                  className="h-full bg-primary rounded-full transition-all duration-700"
                  style={{ width: `${completionPct}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                <span className="font-bold text-primary text-base">{completionPct}%</span> of all steps complete
              </p>
            </div>
          </div>
        </div>

        {/* Up Next */}
        <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-md bg-primary/15 flex items-center justify-center">
              <ListChecks className="w-5 h-5 text-primary" aria-hidden="true" />
            </div>
            <h3 className="font-semibold text-foreground text-base">Up Next</h3>
          </div>
          <ul className="space-y-2">
            {upNextTodos.map((todo) => (
              <li
                key={todo.id}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-surface-container transition-colors"
              >
                <div
                  className="w-4 h-4 rounded-sm border-2 border-muted-foreground/50 mt-0.5 shrink-0"
                  aria-label={`Incomplete task: ${todo.text}`}
                />
                <div>
                  <span className="text-sm font-medium text-foreground">{todo.text}</span>
                  <span className="block text-xs text-muted-foreground">{todo.stepTitle}</span>
                </div>
              </li>
            ))}
            {upNextTodos.length === 0 && (
              <p className="text-base font-semibold text-secondary p-3">All tasks complete. You&apos;re ready to buy.</p>
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
              Current savings: <span className="font-semibold">${savedAmount.toLocaleString()}</span>
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

export default DashboardPage;
