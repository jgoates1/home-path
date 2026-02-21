import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSurvey } from "@/contexts/SurveyContext";
import { ChevronLeft, CheckCircle2 } from "lucide-react";

const StepDetailPage = () => {
  const { stepId } = useParams();
  const { steps, toggleTodo } = useSurvey();
  const navigate = useNavigate();

  const step = steps.find((s) => s.id === Number(stepId));
  if (!step) return <div className="p-6">Step not found.</div>;

  const completedCount = step.todos.filter((t) => t.completed).length;
  const progress = Math.round((completedCount / step.todos.length) * 100);

  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="max-w-md mx-auto px-6 py-6 animate-fade-in">
        <button onClick={() => navigate("/dashboard")} className="flex items-center gap-1 text-primary font-semibold mb-6 hover:underline">
          <ChevronLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
            {step.id}
          </div>
          <h1 className="text-2xl font-heading font-bold text-foreground">{step.title}</h1>
        </div>

        <p className="text-muted-foreground mb-6">{step.description}</p>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">{completedCount} of {step.todos.length} tasks</span>
            <span className="font-bold text-primary">{progress}%</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Tips */}
        <div className="bg-card rounded-2xl p-5 shadow-sm border mb-6">
          <h3 className="font-bold text-foreground mb-3">Tips:</h3>
          <ul className="space-y-2">
            {step.tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                <span className="text-sm text-foreground leading-relaxed">{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* To-dos */}
        <div className="bg-card rounded-2xl p-5 shadow-sm border">
          <h3 className="font-bold text-foreground mb-4">To-do:</h3>
          <ul className="space-y-3">
            {step.todos.map((todo) => (
              <li key={todo.id}>
                <button
                  onClick={() => toggleTodo(step.id, todo.id)}
                  className="flex items-start gap-3 w-full text-left group"
                >
                  {todo.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-success mt-0.5 shrink-0" />
                  ) : (
                    <div className="w-5 h-5 rounded border-2 border-muted-foreground/40 mt-0.5 shrink-0 group-hover:border-primary transition-colors" />
                  )}
                  <span className={`text-sm leading-relaxed ${todo.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                    {todo.text}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StepDetailPage;
