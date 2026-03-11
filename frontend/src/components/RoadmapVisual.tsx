import React from "react";
import { useNavigate } from "react-router-dom";
import { useSurvey } from "@/contexts/SurveyContext";
import { CheckCircle2, Lock } from "lucide-react";

const RoadmapVisual = () => {
  const { steps, currentStep } = useSurvey();
  const navigate = useNavigate();

  const getStepStatus = (stepId: number) => {
    const step = steps.find((s) => s.id === stepId)!;
    const allDone = step.todos.every((t) => t.completed);
    if (allDone) return "complete";
    if (stepId <= currentStep) return "active";
    return "locked";
  };

  const statusLabel = (status: string) =>
    status === "complete" ? "complete" : status === "active" ? "in progress" : "locked";

  const positions = [
    { left: "15%", top: "0%" },
    { left: "60%", top: "25%" },
    { left: "20%", top: "50%" },
    { left: "55%", top: "75%" },
  ];

  return (
    <div
      className="relative w-full"
      style={{ height: 420 }}
      role="img"
      aria-label="Home buying roadmap showing your progress through 4 steps"
    >
      {/* Road path SVG */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 300 400"
        fill="none"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <title>Roadmap path</title>
        <path
          d="M60 30 Q180 80 200 130 Q220 180 80 210 Q-20 240 80 290 Q180 340 190 380"
          stroke="hsl(var(--road-bg))"
          strokeWidth="40"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M60 30 Q180 80 200 130 Q220 180 80 210 Q-20 240 80 290 Q180 340 190 380"
          stroke="hsl(var(--border))"
          strokeWidth="2"
          strokeDasharray="8 6"
          fill="none"
        />
      </svg>

      {/* Step markers */}
      {steps.map((step, i) => {
        const status = getStepStatus(step.id);
        const pos = positions[i];

        return (
          <button
            key={step.id}
            onClick={() => status !== "locked" && navigate(`/step/${step.id}`)}
            disabled={status === "locked"}
            aria-disabled={status === "locked"}
            aria-label={`Step ${step.id}: ${step.title} — ${statusLabel(status)}`}
            className={`absolute flex flex-col items-center gap-1.5 transition-all duration-300 group focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-2xl p-1 ${
              status === "locked" ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:scale-110"
            }`}
            style={{ left: pos.left, top: pos.top, transform: "translate(-50%, 0)" }}
          >
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all ${
                status === "complete"
                  ? "bg-accent text-accent-foreground ring-4 ring-accent/20"
                  : status === "active"
                  ? "bg-primary text-primary-foreground animate-pulse-ring"
                  : "bg-surface-container-high text-muted-foreground"
              }`}
            >
              {status === "complete" ? (
                <CheckCircle2 className="w-7 h-7" aria-hidden="true" />
              ) : status === "locked" ? (
                <Lock className="w-5 h-5" aria-hidden="true" />
              ) : (
                <span className="text-lg font-bold">{step.id}</span>
              )}
            </div>
            <span
              className={`text-xs font-semibold text-center max-w-[100px] leading-tight ${
                status === "complete" ? "text-accent" : status === "active" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {step.title}
            </span>
          </button>
        );
      })}

      {/* START and FINISH labels */}
      <div className="absolute text-xs font-bold text-secondary" style={{ left: "-2%", top: "3%", transform: "translateY(-50%)" }}>
        🏁 START
      </div>
      <div className="absolute text-xs font-bold text-accent" style={{ left: "55%", top: "95%", transform: "translateX(-50%)" }}>
        🏠 HOME!
      </div>
    </div>
  );
};

export default RoadmapVisual;
