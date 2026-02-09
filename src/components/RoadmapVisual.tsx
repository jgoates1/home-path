import React from "react";
import { useNavigate } from "react-router-dom";
import { useSurvey } from "@/contexts/SurveyContext";
import { CheckCircle2, Circle, Lock } from "lucide-react";

const RoadmapVisual = () => {
  const { steps, currentStep } = useSurvey();
  const navigate = useNavigate();

  const getStepStatus = (stepId: number) => {
    const step = steps.find((s) => s.id === stepId)!;
    const allDone = step.todos.every((t) => t.completed);
    const anyDone = step.todos.some((t) => t.completed);
    if (allDone) return "complete";
    if (stepId <= currentStep) return "active";
    return "locked";
  };

  const positions = [
    { left: "15%", top: "0%" },
    { left: "60%", top: "25%" },
    { left: "20%", top: "50%" },
    { left: "55%", top: "75%" },
  ];

  return (
    <div className="relative w-full" style={{ height: 420 }}>
      {/* Road path SVG */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 400" fill="none" preserveAspectRatio="none">
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
            className={`absolute flex flex-col items-center gap-1 transition-all duration-300 group ${
              status === "locked" ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:scale-110"
            }`}
            style={{ left: pos.left, top: pos.top, transform: "translate(-50%, 0)" }}
          >
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all ${
                status === "complete"
                  ? "bg-success text-success-foreground"
                  : status === "active"
                  ? "bg-primary text-primary-foreground animate-bounce-gentle"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {status === "complete" ? (
                <CheckCircle2 className="w-7 h-7" />
              ) : status === "locked" ? (
                <Lock className="w-5 h-5" />
              ) : (
                <span className="text-lg font-bold">{step.id}</span>
              )}
            </div>
            <span
              className={`text-xs font-semibold text-center max-w-[100px] leading-tight ${
                status === "complete" ? "text-success" : status === "active" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {step.title}
            </span>
          </button>
        );
      })}

      {/* START and FINISH labels */}
      <div className="absolute text-xs font-bold text-accent" style={{ left: "15%", top: "2%", transform: "translateX(-50%)" }}>
        🏁 START
      </div>
      <div className="absolute text-xs font-bold text-success" style={{ left: "55%", top: "95%", transform: "translateX(-50%)" }}>
        🏠 HOME!
      </div>
    </div>
  );
};

export default RoadmapVisual;
