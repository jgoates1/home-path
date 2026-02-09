import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSurvey } from "@/contexts/SurveyContext";
import RoadmapVisual from "@/components/RoadmapVisual";
import { TrendingUp } from "lucide-react";

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
    <div className="min-h-screen bg-background pb-12">
      <div className="max-w-md mx-auto px-6 py-6">
        {/* Welcome */}
        <div className="animate-fade-in mb-6">
          <h1 className="text-2xl font-heading font-bold text-foreground">
            Welcome, {user?.name || "Friend"}! 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Goal: Buy a home <span className="font-semibold text-primary">{committedTimeline?.toLowerCase()}</span>
          </p>
        </div>

        {/* Roadmap */}
        <div className="mb-8">
          <h2 className="text-lg font-heading font-bold text-foreground mb-4">Your Home Buying Roadmap</h2>
          <RoadmapVisual />
        </div>

        {/* Savings Card */}
        <div className="bg-card rounded-2xl p-5 shadow-sm border mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-accent" />
              <span className="font-bold text-foreground">So far you've saved:</span>
            </div>
          </div>
          <p className="text-4xl font-heading font-extrabold text-foreground mb-1">
            ${savedAmount.toLocaleString()}
          </p>
          <div className="w-full h-3 bg-muted rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-accent rounded-full transition-all duration-700"
              style={{ width: `${savingsPercent}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Great job! You're <span className="font-bold text-accent">{savingsPercent}%</span> of the way there!
          </p>
          <button
            onClick={handleUpdateSavings}
            className="text-sm font-semibold text-primary hover:underline"
          >
            Update savings
          </button>
        </div>

        {/* Overall Progress */}
        <div className="bg-card rounded-2xl p-5 shadow-sm border mb-6">
          <h3 className="font-bold text-foreground mb-3">Overall Progress</h3>
          <div className="w-full h-3 bg-muted rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-primary rounded-full transition-all duration-700"
              style={{ width: `${completionPct}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            <span className="font-bold text-primary">{completionPct}%</span> complete
          </p>
        </div>

        {/* Up Next */}
        <div className="bg-card rounded-2xl p-5 shadow-sm border">
          <h3 className="font-bold text-foreground mb-4">Up Next:</h3>
          <ul className="space-y-3">
            {upNextTodos.map((todo) => (
              <li key={todo.id} className="flex items-start gap-3">
                <div className="w-4 h-4 rounded border-2 border-muted-foreground/40 mt-0.5 shrink-0" />
                <span className="text-sm text-foreground">{todo.text}</span>
              </li>
            ))}
            {upNextTodos.length === 0 && (
              <p className="text-sm text-muted-foreground">🎉 All tasks complete! You're ready to buy!</p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
