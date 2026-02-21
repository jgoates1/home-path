import React from "react";
import { useNavigate } from "react-router-dom";
import { useSurvey, SurveyAnswers } from "@/contexts/SurveyContext";
import { ChevronLeft, Edit3 } from "lucide-react";

const labels: Record<keyof SurveyAnswers, string> = {
  income: "Annual household income",
  savings: "Saved for down payment",
  location: "Location preference",
  timeline: "Home buying timeline",
  housing: "Current housing situation",
};

const SurveyInsightsPage = () => {
  const { answers } = useSurvey();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="max-w-md mx-auto px-6 py-6 animate-fade-in">
        <button onClick={() => navigate("/dashboard")} className="flex items-center gap-1 text-primary font-semibold mb-6 hover:underline">
          <ChevronLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Survey Insights</h1>
        <p className="text-muted-foreground mb-8">Review and update your survey answers to adjust your roadmap.</p>

        <div className="space-y-4 mb-8">
          {(Object.keys(labels) as (keyof SurveyAnswers)[]).map((key) => (
            <div key={key} className="bg-card rounded-xl p-4 shadow-sm border">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{labels[key]}</label>
              <p className="text-base font-semibold text-foreground mt-1">{answers[key] || "Not answered"}</p>
            </div>
          ))}
        </div>

        <button
          onClick={() => navigate("/survey")}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-primary text-primary-foreground font-bold text-base shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
        >
          <Edit3 className="w-5 h-5" />
          Retake Survey
        </button>
      </div>
    </div>
  );
};

export default SurveyInsightsPage;
