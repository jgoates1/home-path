import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useSurvey } from "@/contexts/SurveyContext";
import { CheckCircle2, Lock } from "lucide-react";

const RoadmapVisual = () => {
  const { steps, currentStep } = useSurvey();
  const navigate = useNavigate();

   // SVG path refs for animated progress and car position
  const pathRef = useRef<SVGPathElement | null>(null);
  const [pathLength, setPathLength] = useState(0);
  const [carPos, setCarPos] = useState<{ x: number; y: number } | null>(null);

  // Compute coarse progress along the journey (0 at first step, 1 at last step)
  const totalSteps = steps.length || 1;
  const clampedCurrent = Math.min(Math.max(currentStep, 1), totalSteps);
  const progressFraction = totalSteps > 1 ? (clampedCurrent - 1) / (totalSteps - 1) : 0;

  useEffect(() => {
    if (!pathRef.current) return;
    try {
      const length = pathRef.current.getTotalLength();
      setPathLength(length);
    } catch {
      // Fail silently if path metrics are unavailable
    }
  }, []);

  const dashLength = pathLength || 1;
  const progressOffset = dashLength * (1 - progressFraction);

  useEffect(() => {
    if (!pathRef.current || !pathLength) return;
    try {
      const distance = pathLength * progressFraction;
      const point = pathRef.current.getPointAtLength(distance);
      setCarPos({ x: point.x, y: point.y });
    } catch {
      // Ignore if SVG length computation fails
    }
  }, [pathLength, progressFraction]);

  // Overall completion for celebratory effects
  const allStepsComplete =
    steps.length > 0 && steps.every((step) => step.todos.every((t) => t.completed));
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (!allStepsComplete) return;
    setShowConfetti(true);
    const timeout = window.setTimeout(() => setShowConfetti(false), 2800);
    return () => window.clearTimeout(timeout);
  }, [allStepsComplete]);

  const confettiAnimations = [
    "confetti-out-up",
    "confetti-out-down",
    "confetti-out-left",
    "confetti-out-right",
    "confetti-out-ne",
    "confetti-out-nw",
    "confetti-out-se",
    "confetti-out-sw",
    "confetti-out-nne",
    "confetti-out-ene",
    "confetti-out-ese",
    "confetti-out-sse",
    "confetti-out-ssw",
    "confetti-out-wsw",
    "confetti-out-wnw",
    "confetti-out-nnw",
  ];
  const confettiColors = [
    "hsl(var(--primary))",
    "hsl(var(--secondary))",
    "hsl(var(--accent))",
    "hsl(38 85% 55%)",
    "hsl(280 65% 60%)",
  ];

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
    // Step 1: all the way top, a little left. Step 2 & 4: right. Step 3: left of road.
    { left: "16%", top: "2%" },    // Step 1 – Get Your Finances Ready (all the way top, a little left)
    { left: "88%", top: "30%" },   // Step 2 – more right
    { left: "10%", top: "54%" },   // Step 3 – left of road
    { left: "86%", top: "78%" },   // Step 4 – more right
  ];

  const pathD = "M60 30 Q180 80 200 130 Q220 180 80 210 Q-20 240 80 290 Q180 340 190 380";

  return (
    <div
      className="relative w-full h-[340px] sm:h-[420px] rounded-lg overflow-hidden pl-12 sm:pl-24"
      style={{ background: "hsl(var(--map-bg))" }}
      role="img"
      aria-label="Home buying roadmap showing your progress through 4 steps"
    >
      {/* Road path SVG — viewBox adds left padding so road and step 1 have room */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="-55 0 355 400"
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

        {/* Progress overlay along the road */}
        <path
          d={pathD}
          ref={pathRef}
          stroke="hsl(var(--secondary))"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={dashLength}
          strokeDashoffset={progressOffset}
          style={{ transition: "stroke-dashoffset 800ms ease-out" }}
          fill="none"
          aria-hidden="true"
        />

        {/* Moving car icon following the path (uses roadmap-car.png in public/) */}
        {carPos && (
          <image
            href="/roadmap-car.png"
            x={carPos.x - 14}
            y={carPos.y - 12}
            width={28}
            height={24}
            aria-hidden="true"
          />
        )}
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
              status === "locked" ? "cursor-not-allowed" : "cursor-pointer hover:opacity-90"
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
            <span className="text-[0.65rem] sm:text-[0.7rem] font-semibold text-center max-w-[96px] sm:max-w-[110px] leading-snug text-white">
              {step.title === "Find Your Home" ? (
                <>
                  Find Your
                  <br />
                  Home
                </>
              ) : (
                step.title
              )}
            </span>
          </button>
        );
      })}

      {/* Full-page confetti celebration when everything is complete (portaled to body) */}
      {showConfetti &&
        createPortal(
          <div
            className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden"
            aria-hidden="true"
          >
            {Array.from({ length: 192 }).map((_, i) => (
              <div
                key={i}
                className="confetti-piece"
                style={{
                  backgroundColor: confettiColors[i % confettiColors.length],
                  animationName: confettiAnimations[i % confettiAnimations.length],
                  animationDelay: `${(i % 24) * 0.03}s`,
                }}
              />
            ))}
          </div>,
          document.body
        )}

    </div>
  );
};

export default RoadmapVisual;
