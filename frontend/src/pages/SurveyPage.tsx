import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSurvey } from "@/contexts/SurveyContext";
import { SurveyInputs } from "@/types/plan";
import { ChevronLeft } from "lucide-react";

type FieldName =
  | "annual_income" | "current_savings" | "target_home_price"
  | "credit_score" | "monthly_debt"
  | "purchase_timeline" | "target_location" | "location_familiarity"
  | "household_size" | "current_housing";

type QuestionType = "number" | "text" | "select";

interface Question {
  key: FieldName;
  question: string;
  type: QuestionType;
  options?: string[];
  placeholder?: string;
  hint?: string;
}

const questions: Question[] = [
  {
    key: "annual_income",
    question: "What is your annual household income?",
    type: "number",
    placeholder: "e.g. 85000",
    hint: "Before taxes, in dollars",
  },
  {
    key: "current_savings",
    question: "How much do you currently have saved for a down payment?",
    type: "number",
    placeholder: "e.g. 20000",
    hint: "Total savings available for home purchase",
  },
  {
    key: "target_home_price",
    question: "What home price range are you targeting?",
    type: "number",
    placeholder: "e.g. 400000",
    hint: "Your target purchase price in dollars",
  },
  {
    key: "credit_score",
    question: "What is your approximate credit score?",
    type: "number",
    placeholder: "e.g. 700",
    hint: "Ranges from 300–850. Check Credit Karma if unsure.",
  },
  {
    key: "monthly_debt",
    question: "What are your total monthly debt payments?",
    type: "number",
    placeholder: "e.g. 400",
    hint: "Car loans, student loans, credit cards, etc.",
  },
  {
    key: "purchase_timeline",
    question: "When are you hoping to buy a home?",
    type: "select",
    options: ["Within 6 months", "6–12 months", "1–2 years", "2+ years"],
  },
  {
    key: "target_location",
    question: "What city or area are you looking to buy in?",
    type: "text",
    placeholder: "e.g. Austin, TX",
    hint: "City, state, or metro area",
  },
  {
    key: "location_familiarity",
    question: "How familiar are you with your target area?",
    type: "select",
    options: ["Very familiar", "Somewhat familiar", "Still exploring"],
  },
  {
    key: "household_size",
    question: "How many people will be living in the home?",
    type: "number",
    placeholder: "e.g. 2",
    hint: "Including yourself",
  },
  {
    key: "current_housing",
    question: "What is your current housing situation?",
    type: "select",
    options: ["Renting", "Living with family or friends", "Own a home already", "Other"],
  },
];

type Answers = Partial<Record<FieldName, string>>;

const SurveyPage = () => {
  const { submitSurvey, isGenerating, generateError } = useSurvey();
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const navigate = useNavigate();

  const q = questions[currentQ];
  const value = answers[q.key] ?? "";
  const progress = ((currentQ + 1) / questions.length) * 100;
  const canAdvance = value.trim() !== "";

  const handleSelect = (option: string) => {
    setAnswers((prev) => ({ ...prev, [q.key]: option }));
  };

  const handleInput = (val: string) => {
    setAnswers((prev) => ({ ...prev, [q.key]: val }));
  };

  const handleNext = async () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
      return;
    }

    const financial = {
      annual_income:     Number(answers.annual_income),
      current_savings:   Number(answers.current_savings),
      target_home_price: Number(answers.target_home_price),
      credit_score:      Number(answers.credit_score),
      monthly_debt:      Number(answers.monthly_debt),
    };
    const context = {
      purchase_timeline:    answers.purchase_timeline ?? "",
      target_location:      answers.target_location ?? "",
      location_familiarity: answers.location_familiarity ?? "",
      household_size:       Number(answers.household_size),
      current_housing:      answers.current_housing ?? "",
    };

    try {
      await submitSurvey({ financial, context } as SurveyInputs);
      navigate("/dashboard");
    } catch {
      // generateError is set in context, displayed below
    }
  };

  const handleBack = () => {
    if (currentQ > 0) setCurrentQ(currentQ - 1);
  };

  if (isGenerating) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6">
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mb-6" />
        <h2 className="text-xl font-heading font-bold text-foreground mb-2">Building your plan...</h2>
        <p className="text-muted-foreground text-center max-w-xs">
          Our AI is analyzing your profile and creating a personalized homebuying roadmap. This takes about 10 seconds.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col px-6 py-6 bg-background">
      {/* Progress bar */}
      <div className="w-full max-w-md mx-auto mb-6">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={handleBack}
            disabled={currentQ === 0}
            className="p-1 rounded-lg hover:bg-secondary disabled:opacity-30 transition"
          >
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
        <h2 className="text-2xl font-heading font-bold text-foreground mb-2 leading-tight">{q.question}</h2>
        {q.hint && <p className="text-sm text-muted-foreground mb-6">{q.hint}</p>}

        <div className="flex-1">
          {q.type === "select" && (
            <div className="space-y-3">
              {q.options!.map((option) => (
                <button
                  key={option}
                  onClick={() => handleSelect(option)}
                  className={`w-full text-left px-5 py-4 rounded-xl border-2 font-medium transition-all duration-200 ${
                    value === option
                      ? "border-primary bg-primary/10 text-primary shadow-sm"
                      : "border-border bg-card text-foreground hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      value === option ? "border-primary" : "border-muted-foreground/40"
                    }`}>
                      {value === option && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                    </div>
                    {option}
                  </div>
                </button>
              ))}
            </div>
          )}

          {(q.type === "number" || q.type === "text") && (
            <input
              type={q.type === "number" ? "number" : "text"}
              value={value}
              onChange={(e) => handleInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && canAdvance && handleNext()}
              placeholder={q.placeholder}
              className="w-full rounded-xl border-2 border-border bg-card px-5 py-4 text-lg font-medium text-foreground focus:outline-none focus:border-primary transition-colors"
              autoFocus
            />
          )}
        </div>

        {generateError && (
          <p className="mt-4 text-sm text-destructive">{generateError}</p>
        )}

        <button
          onClick={handleNext}
          disabled={!canAdvance}
          className="mt-8 w-full py-4 rounded-xl bg-accent text-accent-foreground font-bold text-lg shadow-lg disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-xl hover:scale-[1.02] transition-all"
        >
          {currentQ < questions.length - 1 ? "Next" : "Build My Plan"}
        </button>
      </div>
    </div>
  );
};

export default SurveyPage;
