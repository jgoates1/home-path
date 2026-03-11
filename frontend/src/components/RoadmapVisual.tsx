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

  const pathD = "M60 30 Q180 80 200 130 Q220 180 80 210 Q-20 240 80 290 Q180 340 190 380";

  return (
    <div
      className="relative w-full rounded-lg overflow-hidden"
      style={{ height: 420, background: "hsl(var(--map-bg))" }}
      role="img"
      aria-label="Home buying roadmap showing your progress through 4 steps"
    >
      {/* Road path SVG — visible road with map-like styling */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 300 400"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <title>Roadmap path</title>
        {/* Road fill — warm path color */}
        <path
          d={pathD}
          stroke="hsl(var(--road-fill))"
          strokeWidth="44"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Road edge — subtle border for depth */}
        <path
          d={pathD}
          stroke="hsl(var(--road-line) / 0.4)"
          strokeWidth="42"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Center dashed line — road markings */}
        <path
          d={pathD}
          stroke="hsl(var(--road-line))"
          strokeWidth="2"
          strokeDasharray="10 8"
          strokeLinecap="round"
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
            className={`absolute flex flex-col items-center gap-1.5 transition-colors duration-200 group focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg p-1 ${
              status === "locked" ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:opacity-90"
            }`}
            style={{ left: pos.left, top: pos.top, transform: "translate(-50%, 0)" }}
          >
            <div
              className={`w-12 h-12 rounded-lg flex items-center justify-center shadow-md transition-colors ring-1 ring-offset-1 ring-offset-[hsl(var(--map-bg))] ${
                status === "complete"
                  ? "bg-accent text-accent-foreground ring-accent/60"
                  : status === "active"
                  ? "bg-primary text-primary-foreground ring-primary/60"
                  : "bg-surface-container-high text-muted-foreground ring-border/70"
              }`}
            >
              {status === "complete" ? (
                <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
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
      <div className="absolute text-xs font-semibold text-secondary uppercase tracking-wider" style={{ left: "-2%", top: "3%", transform: "translateY(-50%)" }}>
        Start
      </div>
      <div className="absolute text-xs font-semibold text-accent uppercase tracking-wider" style={{ left: "55%", top: "95%", transform: "translateX(-50%)" }}>
        Home
      </div>
    </div>
  );
};

export default RoadmapVisual;
