import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSurvey, SurveyAnswers } from "@/contexts/SurveyContext";
import { ChevronLeft } from "lucide-react";

interface Question {
  key: keyof SurveyAnswers;
  question: string;
  options: string[];
}

const questions: Question[] = [
  {
    key: "income",
    question: "What is your approximate annual household income (before taxes)?",
    options: ["Under $50,000", "$50,000 - $100,000", "$100,000 - $150,000", "$150,000+"],
  },
  {
    key: "savings",
    question: "How much have you saved (or expect to save) for a down payment?",
    options: ["Less than $10,000", "$10,000 - $25,000", "$25,000 - $50,000", "$50,000+"],
  },
  {
    key: "location",
    question: "Do you know where you'd like to buy a home?",
    options: [
      "Yes — I have a specific city or neighborhood in mind",
      "I have a general area in mind",
      "Not sure yet",
    ],
  },
  {
    key: "timeline",
    question: "When are you hoping to buy your first home?",
    options: ["Within the next 3 months", "3-6 months", "6-12 months", "More than a year from now"],
  },
  {
    key: "housing",
    question: "What best describes your current housing situation?",
    options: ["Renting", "Living with family or friends", "Own a home already (looking to buy again)", "Other"],
  },
];

const SurveyPage = () => {
  const { answers, setAnswers } = useSurvey();
  const [currentQ, setCurrentQ] = useState(0);
  const [localAnswers, setLocalAnswers] = useState<SurveyAnswers>({ ...answers });
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  const q = questions[currentQ];
  const selected = localAnswers[q.key];
  const progress = ((currentQ + 1) / questions.length) * 100;

  const handleSelect = (option: string) => {
    setLocalAnswers((prev) => ({ ...prev, [q.key]: option }));
  };

  const handleNext = async () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      setIsSaving(true);
      try {
        await setAnswers(localAnswers);
        navigate("/results");
      } catch (error) {
        console.error('Failed to save survey:', error);
        setIsSaving(false);
        // Still navigate even if save fails, since it's cached in localStorage
        navigate("/results");
      }
    }
  };

  const handleBack = () => {
    if (currentQ > 0) setCurrentQ(currentQ - 1);
  };

  return (
    <div className="min-h-screen flex flex-col px-6 py-6 bg-background">
      {/* Progress bar */}
      <div className="w-full max-w-md mx-auto mb-6">
        <div className="flex items-center justify-between mb-2">
          <button onClick={handleBack} disabled={currentQ === 0} className="p-1 rounded-lg hover:bg-secondary disabled:opacity-30 transition">
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <span className="text-sm font-semibold text-muted-foreground">
            {currentQ + 1} of {questions.length}
          </span>
          <div className="w-6" />
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 flex flex-col max-w-md mx-auto w-full animate-fade-in" key={currentQ}>
        <h2 className="text-2xl font-heading font-bold text-foreground mb-6 leading-tight">{q.question}</h2>

        <div className="space-y-3 flex-1">
          {q.options.map((option) => (
            <button
              key={option}
              onClick={() => handleSelect(option)}
              className={`w-full text-left px-5 py-4 rounded-xl border-2 font-medium transition-all duration-200 ${
                selected === option
                  ? "border-primary bg-primary/10 text-primary shadow-sm"
                  : "border-border bg-card text-foreground hover:border-primary/40"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  selected === option ? "border-primary" : "border-muted-foreground/40"
                }`}>
                  {selected === option && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                </div>
                {option}
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={handleNext}
          disabled={!selected || isSaving}
          className="mt-8 w-full py-4 rounded-xl bg-accent text-accent-foreground font-bold text-lg shadow-lg disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-xl hover:scale-[1.02] transition-all"
        >
          {isSaving ? "Saving..." : currentQ < questions.length - 1 ? "Next" : "Finish"}
        </button>
      </div>
    </div>
  );
};

export default SurveyPage;
