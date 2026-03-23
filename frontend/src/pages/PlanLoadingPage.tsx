import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSurvey } from "@/contexts/SurveyContext";
import type { SurveyInputs } from "@/types/plan";

const funMessages = [
  "Finding your best down payment strategy…",
  "Estimating your closing costs…",
  "Turning your answers into a step-by-step roadmap…",
  "Generating tips that fit your timeline…",
  "Lining up the next 4 steps toward your keys…",
];

const PlanLoadingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { submitSurvey, generateError } = useSurvey();

  const inputs = (location.state as SurveyInputs | undefined) ?? undefined;
  const [idx, setIdx] = useState(0);

  const message = useMemo(() => funMessages[idx % funMessages.length], [idx]);

  useEffect(() => {
    if (!inputs) {
      navigate("/survey", { replace: true });
      return;
    }

    const interval = window.setInterval(() => setIdx((i) => i + 1), 1700);

    submitSurvey(inputs)
      .then(() => navigate("/results", { replace: true }))
      .catch(() => {
        // generateError is set in SurveyContext
      });

    return () => window.clearInterval(interval);
  }, [inputs, navigate, submitSurvey]);

  return (
    <div className="min-h-[calc(100dvh-4rem)] flex flex-col items-center justify-center bg-background px-6 py-6">
      <div className="w-full max-w-md text-center animate-fade-in">
        <div className="mx-auto w-14 h-14 rounded-full border-4 border-primary border-t-transparent animate-spin mb-6" />
        <h1 className="text-2xl font-heading font-bold text-foreground mb-2">
          Building your personalized plan
        </h1>
        <p className="text-muted-foreground mb-6">
          {message}
        </p>

        <div className="bg-card border border-border rounded-xl p-5 text-left">
          <p className="text-sm font-semibold text-foreground mb-1">While you wait</p>
          <p className="text-sm text-muted-foreground">
            Pro tip: gather your last 2 pay stubs, W-2s, and bank statements. You’ll need them for pre-approval.
          </p>
        </div>

        {generateError && (
          <div className="mt-6 text-left">
            <p className="text-sm text-destructive mb-3">{generateError}</p>
            <div className="flex gap-3">
              <button
                onClick={() => navigate("/survey", { replace: true })}
                className="flex-1 py-3 rounded-xl border border-border bg-background text-foreground font-semibold hover:bg-muted transition-colors"
              >
                Back to survey
              </button>
              <button
                onClick={() => navigate("/plan-loading", { replace: true, state: inputs })}
                className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
              >
                Try again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlanLoadingPage;

