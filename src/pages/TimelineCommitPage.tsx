import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSurvey } from "@/contexts/SurveyContext";
import { useAuth } from "@/contexts/AuthContext";
import { CalendarCheck } from "lucide-react";

const timelineOptions = [
  "Within 3 months",
  "Within 6 months",
  "Within 1 year",
  "Within 2 years",
  "I'm flexible",
];

const TimelineCommitPage = () => {
  const { committedTimeline, setCommittedTimeline } = useSurvey();
  const { setHasCompletedSurvey } = useAuth();
  const [selected, setSelected] = useState(committedTimeline || "");
  const navigate = useNavigate();

  const handleCommit = () => {
    if (!selected) return;
    setCommittedTimeline(selected);
    setHasCompletedSurvey(true);
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-6 py-10 bg-background">
      <div className="max-w-md w-full animate-fade-in text-center">
        <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
          <CalendarCheck className="w-10 h-10 text-accent" />
        </div>

        <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Commit to a Timeline</h1>
        <p className="text-muted-foreground mb-8">
          Setting a goal makes you <span className="font-bold text-foreground">3× more likely</span> to achieve it. When do you want to buy your home?
        </p>

        <div className="space-y-3 mb-10 text-left">
          {timelineOptions.map((option) => (
            <button
              key={option}
              onClick={() => setSelected(option)}
              className={`w-full px-5 py-4 rounded-xl border-2 font-medium transition-all duration-200 ${
                selected === option
                  ? "border-accent bg-accent/10 text-accent shadow-sm"
                  : "border-border bg-card text-foreground hover:border-accent/40"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  selected === option ? "border-accent" : "border-muted-foreground/40"
                }`}>
                  {selected === option && <div className="w-2.5 h-2.5 rounded-full bg-accent" />}
                </div>
                {option}
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={handleCommit}
          disabled={!selected}
          className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg shadow-lg disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-xl hover:scale-[1.02] transition-all"
        >
          I'm Committed! 🎯
        </button>
      </div>
    </div>
  );
};

export default TimelineCommitPage;
