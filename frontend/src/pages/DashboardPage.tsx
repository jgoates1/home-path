import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSurvey } from "@/contexts/SurveyContext";
import RoadmapVisual from "@/components/RoadmapVisual";
import { TrendingUp, Target, ListChecks } from "lucide-react";

const DashboardPage = () => {
  const { user } = useAuth();
  const { savedAmount, setSavedAmount, goalAmount, getCompletionPercent, steps, committedTimeline } = useSurvey();
  const completionPct = getCompletionPercent();

  const upNextTodos = steps
    .flatMap((s) => s.todos.map((t) => ({ ...t, stepTitle: s.title })))
    .filter((t) => !t.completed)
    .slice(0, 5);

  const handleUpdateSavings = () => {
    const input = prompt("Enter your current savings amount ($):");
    if (input) {
      const num = parseInt(input.replace(/[^0-9]/g, ""), 10);
      if (!isNaN(num)) setSavedAmount(num);
    }
  };

  const savingsPercent = goalAmount > 0 ? Math.min(Math.round((savedAmount / goalAmount) * 100), 100) : 0;

  return (
    <main className="min-h-screen bg-background pb-12">
      {/* Hero Welcome Banner */}
      <section
        className="w-full px-6 py-8 md:py-10 animate-fade-in"
        style={{ background: "var(--hero-gradient)" }}
        role="banner"
        aria-label="Welcome section"
      >
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-heading font-extrabold text-white mb-1">
            Welcome back, {user?.name || "Friend"} 👋
          </h1>
          <p className="text-base text-white/80">
            Your goal: buy a home{" "}
            <span className="font-bold text-white">{committedTimeline?.toLowerCase()}</span>
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 -mt-6">
        {/* Responsive 2-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Left: Roadmap */}
          <div className="bg-card rounded-2xl p-6 shadow-md border border-border/50 animate-scale-in">
            <h2 className="text-lg font-heading font-bold text-foreground mb-4">Your Home Buying Roadmap</h2>
            <RoadmapVisual />
          </div>

          {/* Right: Stats stack */}
          <div className="flex flex-col gap-6">
            {/* Savings Card */}
            <div className="bg-card rounded-2xl p-6 shadow-md border-l-4 border-l-secondary border border-border/50 animate-scale-in">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-9 h-9 rounded-xl bg-secondary/15 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-secondary" aria-hidden="true" />
                </div>
                <span className="font-bold text-foreground">Savings Progress</span>
              </div>
              <p className="text-4xl font-heading font-extrabold text-foreground mb-2">
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
                <span className="font-bold text-secondary">{savingsPercent}%</span> of your ${goalAmount.toLocaleString()} goal
              </p>
              <button
                onClick={handleUpdateSavings}
                className="text-sm font-semibold px-4 py-2 rounded-xl bg-secondary/15 text-secondary hover:bg-secondary/25 transition-colors focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2"
              >
                Update savings
              </button>
            </div>

            {/* Overall Progress Card */}
            <div className="bg-card rounded-2xl p-6 shadow-md border-l-4 border-l-primary border border-border/50 animate-scale-in">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
                  <Target className="w-5 h-5 text-primary" aria-hidden="true" />
                </div>
                <span className="font-bold text-foreground">Overall Progress</span>
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
                <span className="font-bold text-primary">{completionPct}%</span> of all steps complete
              </p>
            </div>
          </div>
        </div>

        {/* Up Next — full width */}
        <div className="bg-card rounded-2xl p-6 shadow-md border border-border/50 animate-scale-in">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-xl bg-accent/15 flex items-center justify-center">
              <ListChecks className="w-5 h-5 text-accent" aria-hidden="true" />
            </div>
            <h3 className="font-bold text-foreground text-lg">Up Next</h3>
          </div>
          <ul className="space-y-2">
            {upNextTodos.map((todo, i) => (
              <li
                key={todo.id}
                className="flex items-start gap-3 p-3 rounded-xl hover:bg-surface-container transition-colors"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div
                  className="w-5 h-5 rounded-md border-2 border-primary/40 mt-0.5 shrink-0"
                  aria-label={`Incomplete task: ${todo.text}`}
                />
                <div>
                  <span className="text-sm font-medium text-foreground">{todo.text}</span>
                  <span className="block text-xs text-muted-foreground">{todo.stepTitle}</span>
                </div>
              </li>
            ))}
            {upNextTodos.length === 0 && (
              <p className="text-sm text-muted-foreground p-3">🎉 All tasks complete! You're ready to buy!</p>
            )}
          </ul>
        </div>
      </div>
    </main>
  );
};

export default DashboardPage;
