import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { SurveyInputs } from "@/types/plan";

type QuestionType = "number" | "text" | "select" | "textarea" | "multiselect";
type Answers = Record<string, string | string[]>;

interface QuestionDef {
  id: string;
  label: string;
  type: QuestionType;
  options?: string[];
  required?: boolean;
  placeholder?: string;
  hint?: string;
  condition?: (answers: Answers) => boolean;
}

interface SectionDef {
  id: string;
  title: string;
  description: string;
  questions: QuestionDef[];
}

const sections: SectionDef[] = [
  {
    id: "about-you",
    title: "About You",
    description: "Start with your household basics and buying setup.",
    questions: [
      {
        id: "age_range",
        label: "How old are you?",
        type: "select",
        required: true,
        options: ["18-24", "25-34", "35-44", "45-54", "55+"],
      },
      {
        id: "buying_with",
        label: "Are you buying on your own or with someone else?",
        type: "select",
        required: true,
        options: ["On my own", "With someone else"],
      },
      {
        id: "co_buyer_relationship",
        label: "What is your relationship to your co-buyer?",
        type: "select",
        required: true,
        options: ["Married", "Family member", "Other"],
        condition: (a) => a.buying_with === "With someone else",
      },
      {
        // Required by the current backend payload, even though it's not explicitly listed in buyersurvey.md.
        id: "current_housing",
        label: "What is your current housing situation?",
        type: "select",
        required: true,
        options: ["Renting", "Living with family or friends", "Own a home already", "Other"],
      },
    ],
  },
  {
    id: "income",
    title: "Your Income",
    description: "Income type and stability help shape your financing path.",
    questions: [
      {
        id: "annual_income",
        label: "What is your gross annual income?",
        type: "number",
        required: true,
        placeholder: "e.g. 85000",
        hint: "Before taxes, in dollars",
      },
      {
        id: "income_type",
        label: "How do you earn it?",
        type: "select",
        required: true,
        options: ["Salaried", "Hourly", "Commission", "Self-employed", "Combination"],
      },
      {
        id: "income_combination_details",
        label: "If Combination: how much comes from each source?",
        type: "text",
        placeholder: "e.g. 60k salary + 15k commissions",
        condition: (a) => a.income_type === "Combination",
      },
      {
        id: "self_employed_taxes",
        label: "If Self-employed: have you filed taxes as self-employed for 2+ years?",
        type: "select",
        required: false,
        options: ["Yes", "No", "Under 2 years"],
        condition: (a) => a.income_type === "Self-employed",
      },
      {
        id: "job_changes_recently",
        label: "Have you changed jobs or industries in the past 2 years?",
        type: "select",
        required: true,
        options: ["Yes", "No"],
      },
      {
        id: "other_income",
        label: "Any other income to report? If yes, include amount.",
        type: "text",
        placeholder: "e.g. Rental income $600/mo, investments $200/mo",
      },
      {
        id: "co_buyer_income",
        label: "If co-buyer: co-buyer gross annual income and income type",
        type: "text",
        placeholder: "e.g. 72000, salaried",
        condition: (a) => a.buying_with === "With someone else",
      },
    ],
  },
  {
    id: "finances",
    title: "Your Finances",
    description: "Cash and reserves define your flexibility and runway.",
    questions: [
      {
        id: "current_savings",
        label: "How much do you have saved to put toward a home?",
        type: "number",
        required: true,
        placeholder: "e.g. 20000",
      },
      {
        id: "total_assets",
        label: "What are your total assets?",
        type: "number",
        required: false,
        placeholder: "e.g. 55000",
        hint: "Rough estimate is fine (savings, investments, retirement accounts).",
      },
      {
        id: "large_upcoming_expenses",
        label: "Any large expenses coming up in the next 12 months that would reduce your savings?",
        type: "text",
        placeholder: "Optional details",
      },
    ],
  },
  {
    id: "credit-debt",
    title: "Credit & Debt",
    description: "Credit profile and monthly obligations impact affordability.",
    questions: [
      {
        id: "credit_score_range",
        label: "What's your approximate credit score range?",
        type: "select",
        required: true,
        options: ["Below 580", "580-619", "620-659", "660-699", "700-739", "740+"],
      },
      {
        id: "co_buyer_credit_score_range",
        label: "If co-buyer: what's your co-buyer credit score range?",
        type: "select",
        required: false,
        options: ["Below 580", "580-619", "620-659", "660-699", "700-739", "740+"],
        condition: (a) => a.buying_with === "With someone else",
      },
      {
        id: "credit_dings",
        label: "Any credit dings in the past few years? If yes, brief details.",
        type: "textarea",
        placeholder: "Optional details",
      },
      {
        id: "monthly_debt",
        label: "What are your total monthly debt payments across all loans and cards?",
        type: "number",
        required: true,
        placeholder: "e.g. 650",
      },
    ],
  },
  {
    id: "budget-timeline",
    title: "Budget & Timeline",
    description: "Your budget and timeline guide strategy and recommendations.",
    questions: [
      {
        id: "target_home_price",
        label: "What's the maximum purchase price you have in mind?",
        type: "number",
        required: true,
        placeholder: "e.g. 420000",
        hint: "We'll also calculate a recommended range based on your income and debt.",
      },
      {
        id: "state_to_buy",
        label: "What state are you planning to buy in?",
        type: "text",
        required: true,
        placeholder: "e.g. Texas",
      },
      {
        id: "purchase_timeline",
        label: "When are you hoping to move in?",
        type: "select",
        required: true,
        options: ["ASAP", "3-6 months", "6-12 months", "1-2 years", "Just exploring"],
      },
      {
        id: "major_life_events",
        label: "Any major life events on the horizon that could affect your plans? If yes, brief details.",
        type: "text",
        placeholder: "e.g. New job, baby, relocation",
      },
    ],
  },
  {
    id: "goals",
    title: "Your Goals",
    description: "Clarify goals so your plan reflects what matters most.",
    questions: [
      {
        id: "main_motivation",
        label: "What's your main motivation for buying?",
        type: "multiselect",
        required: true,
        options: ["Build wealth", "Stop paying rent", "More space", "Stability", "Investment", "Other"],
      },
      {
        id: "equity_vs_payment",
        label: "What matters more right now?",
        type: "select",
        required: true,
        options: ["Equity", "Low payment", "Both equally"],
      },
      {
        id: "stay_length",
        label: "How long do you plan to stay in this home?",
        type: "select",
        required: true,
        options: ["2-3 years", "3-5 years", "5-10 years", "Long-term", "Not sure"],
      },
      {
        id: "starter_vs_long_term",
        label: "Are you thinking of this as a starter home or a long-term home?",
        type: "select",
        required: true,
        options: ["Starter", "Long-term", "Not sure"],
      },
      {
        id: "house_hacking_interest",
        label: "Would you consider house hacking (duplex/small multi-unit, rent others)?",
        type: "select",
        required: true,
        options: ["Yes, interested", "Maybe", "No", "What's that?"],
      },
    ],
  },
  {
    id: "home-preferences",
    title: "The Home",
    description: "Capture must-haves and flexibility in location and property type.",
    questions: [
      {
        id: "property_type_preference",
        label: "Do you have a property type preference, or are you open to anything?",
        type: "select",
        required: true,
        options: ["Single-family", "Condo", "Townhouse", "Multi-unit", "Open to anything"],
      },
      {
        id: "bed_bath_needs",
        label: "How many bedrooms do you need? How many bathrooms?",
        type: "text",
        required: true,
        placeholder: "e.g. 3 bed, 2 bath",
      },
      {
        id: "renovation_willingness",
        label: "Are you willing to buy a home that needs renovation?",
        type: "select",
        required: true,
        options: ["Yes", "No", "Depends on how much"],
      },
      {
        id: "target_areas",
        label: "Do you have target areas in mind, or are you flexible? (city/state pairs or zip codes, or Open/Flexible)",
        type: "text",
        required: true,
        placeholder: "e.g. Dallas, TX; Plano, TX OR Open/Flexible",
      },
      {
        id: "geo_constraints",
        label: "Any hard geographic constraints? If yes, brief details.",
        type: "text",
        placeholder: "Optional details",
      },
      {
        id: "school_district_importance",
        label: "Does school district quality matter in your decision?",
        type: "select",
        required: true,
        options: ["Yes", "No", "Will matter in the future"],
      },
      {
        id: "neighborhood_feel",
        label: "What kind of neighborhood feel are you looking for?",
        type: "select",
        required: true,
        options: ["Urban", "Suburban", "Quiet-rural", "Doesn't matter"],
      },
    ],
  },
  {
    id: "mindset",
    title: "Mindset & Readiness",
    description: "Understand confidence, concerns, and support.",
    questions: [
      {
        id: "co_buyer_alignment",
        label: "If co-buyer: how aligned is your co-buyer on this decision?",
        type: "select",
        required: false,
        options: ["Fully aligned", "Mostly aligned", "Still working through it"],
        condition: (a) => a.buying_with === "With someone else",
      },
      {
        id: "buying_fears",
        label: "What concerns or fears do you have about buying?",
        type: "multiselect",
        required: true,
        options: [
          "Overpaying for a home",
          "Not qualifying for a mortgage",
          "Picking the wrong location",
          "Being house-poor after buying",
          "The market dropping after I buy",
          "Not understanding the process",
          "Draining my savings",
          "Other",
        ],
      },
      {
        id: "mortgage_process_familiarity",
        label: "How familiar are you with the mortgage process? (1 = totally new, 5 = very familiar)",
        type: "select",
        required: true,
        options: ["1", "2", "3", "4", "5"],
      },
      {
        id: "has_agent",
        label: "Do you currently have a real estate agent?",
        type: "select",
        required: true,
        options: ["Yes", "No", "Interviewing a few"],
      },
      {
        id: "process_unknowns",
        label: "Is there anything specific about the homebuying process you feel like you don't understand yet?",
        type: "textarea",
        required: false,
        placeholder: "Optional free text",
      },
    ],
  },
  {
    id: "special",
    title: "Special Situations",
    description: "Check anything that applies to you — these may open up special loan programs or resources.",
    questions: [
      {
        id: "special_situations",
        label: "Check anything that applies to you:",
        type: "multiselect",
        required: true,
        options: [
          "I am a veteran or active military",
          "I am a teacher, nurse, firefighter, first responder, or other public servant",
          "I would be buying in a rural area",
          "I have had a prior foreclosure or bankruptcy",
          "None of these apply",
        ],
      },
    ],
  },
];

const creditScoreRangeMap: Record<string, number> = {
  "Below 580": 560,
  "580-619": 600,
  "620-659": 640,
  "660-699": 680,
  "700-739": 720,
  "740+": 760,
};

const deriveLocationFamiliarity = (purchaseTimeline: string): string => {
  const t = (purchaseTimeline || "").toLowerCase();
  if (!t) return "Somewhat familiar";
  if (t.includes("just exploring")) return "Still exploring";
  if (t.includes("asap") || t.includes("3-6")) return "Very familiar";
  if (t.includes("6-12") || t.includes("1-2")) return "Somewhat familiar";
  return "Somewhat familiar";
};

const deriveHouseholdSize = (buyingWith: string): number => {
  return buyingWith === "With someone else" ? 2 : 1;
};

const SurveyPage = () => {
  const navigate = useNavigate();
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});

  const visibleQuestions = useMemo(() => {
    return sections.flatMap((section) =>
      section.questions
        .filter((question) => !question.condition || question.condition(answers))
        .map((question) => ({
          ...question,
          sectionTitle: section.title,
        }))
    );
  }, [answers]);

  useEffect(() => {
    if (currentQ > visibleQuestions.length - 1) {
      setCurrentQ(Math.max(visibleQuestions.length - 1, 0));
    }
  }, [currentQ, visibleQuestions.length]);

  const q = visibleQuestions[currentQ];
  const value = q ? answers[q.id] : "";
  const progress = visibleQuestions.length > 0 ? ((currentQ + 1) / visibleQuestions.length) * 100 : 0;

  const canAdvance = useMemo(() => {
    if (!q) return false;
    const required = q.required ?? false;
    if (!required) return true;

    if (q.type === "multiselect") {
      const arr = Array.isArray(value) ? value : [];
      return arr.length > 0;
    }

    const str = typeof value === "string" ? value : "";
    if (!str.trim()) return false;

    if (q.type === "number") {
      const n = Number(str);
      return !Number.isNaN(n);
    }

    return true;
  }, [q, value]);

  const handleSelect = (option: string) => {
    if (!q) return;
    setAnswers((prev) => ({ ...prev, [q.id]: option }));
  };

  const handleMultiSelect = (option: string) => {
    if (!q || q.type !== "multiselect") return;
    const current = Array.isArray(value) ? value : [];
    const next = current.includes(option) ? current.filter((v) => v !== option) : [...current, option];
    setAnswers((prev) => ({ ...prev, [q.id]: next }));
  };

  const handleInput = (val: string) => {
    if (!q) return;
    setAnswers((prev) => ({ ...prev, [q.id]: val }));
  };

  const handleNext = () => {
    if (!q) return;
    if (currentQ < visibleQuestions.length - 1) {
      setCurrentQ(currentQ + 1);
      return;
    }

    const creditScoreRange = String(answers.credit_score_range ?? "");
    const creditScore = creditScoreRangeMap[creditScoreRange] ?? 0;

    const financial = {
      annual_income: Number(answers.annual_income ?? 0),
      current_savings: Number(answers.current_savings ?? 0),
      target_home_price: Number(answers.target_home_price ?? 0),
      credit_score: creditScore,
      monthly_debt: Number(answers.monthly_debt ?? 0),
    };

    const purchaseTimeline = String(answers.purchase_timeline ?? "");
    const context = {
      purchase_timeline: purchaseTimeline,
      target_location: String(answers.state_to_buy ?? ""),
      location_familiarity: deriveLocationFamiliarity(purchaseTimeline),
      household_size: deriveHouseholdSize(String(answers.buying_with ?? "")),
      current_housing: String(answers.current_housing ?? ""),
    };

    navigate("/plan-loading", { state: { financial, context } as SurveyInputs });
  };

  const handleBack = () => {
    if (currentQ > 0) setCurrentQ(currentQ - 1);
  };

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
            {Math.min(currentQ + 1, visibleQuestions.length)} of {visibleQuestions.length}
          </span>
          <div className="w-6" />
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 flex flex-col max-w-md mx-auto w-full animate-fade-in" key={q?.id ?? "survey"}>
        <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-2">{q?.sectionTitle}</p>
        <h2 className="text-2xl font-heading font-bold text-foreground mb-2 leading-tight">{q?.label}</h2>
        {q?.hint && <p className="text-sm text-muted-foreground mb-6">{q.hint}</p>}

        <div className="flex-1">
          {q?.type === "select" && (
            <div className="space-y-3">
              {q.options?.map((option) => (
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
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        value === option ? "border-primary" : "border-muted-foreground/40"
                      }`}
                    >
                      {value === option && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                    </div>
                    {option}
                  </div>
                </button>
              ))}
            </div>
          )}

          {q?.type === "multiselect" && (
            <div className="flex flex-wrap gap-2">
              {q.options?.map((option) => {
                const selected = Array.isArray(value) && value.includes(option);
                return (
                  <button
                    key={option}
                    onClick={() => handleMultiSelect(option)}
                    className={`px-4 py-2 rounded-full border text-sm font-medium transition ${
                      selected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-foreground hover:border-primary/50"
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          )}

          {(q?.type === "number" || q?.type === "text") && (
            <input
              type={q.type === "number" ? "number" : "text"}
              value={typeof value === "string" ? value : ""}
              onChange={(e) => handleInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && canAdvance && handleNext()}
              placeholder={q.placeholder}
              className="w-full rounded-xl border-2 border-border bg-card px-5 py-4 text-lg font-medium text-foreground focus:outline-none focus:border-primary transition-colors"
              autoFocus
            />
          )}

          {q?.type === "textarea" && (
            <textarea
              value={typeof value === "string" ? value : ""}
              onChange={(e) => handleInput(e.target.value)}
              placeholder={q.placeholder}
              className="w-full rounded-xl border-2 border-border bg-card px-5 py-4 text-base font-medium text-foreground focus:outline-none focus:border-primary transition-colors min-h-28"
              autoFocus
            />
          )}
        </div>

        <button
          onClick={handleNext}
          disabled={!canAdvance}
          className="mt-8 w-full py-4 rounded-xl bg-accent text-accent-foreground font-bold text-lg shadow-lg disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-xl hover:scale-[1.02] transition-all"
        >
          {currentQ < visibleQuestions.length - 1 ? "Next" : "Build My Plan"}
        </button>
      </div>
    </div>
  );
};

export default SurveyPage;
