import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSurvey } from "@/contexts/SurveyContext";
import { SurveyInputs } from "@/types/plan";
import { ChevronLeft } from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────────

type QuestionType = "number" | "text" | "select" | "multiselect";
type Answers = Record<string, string | string[]>;

interface Question {
  key: string;
  section: number;
  sectionName: string;
  question: string;
  type: QuestionType;
  options?: string[];
  placeholder?: string;
  hint?: string;
  optional?: boolean;
  showIf?: (a: Answers) => boolean;
}

// ── Questions ─────────────────────────────────────────────────────────────────

const QUESTIONS: Question[] = [
  // Section 1 — About You
  { key: "buyer_age", section: 1, sectionName: "About You", question: "How old are you?", type: "number", placeholder: "e.g. 28" },
  { key: "buying_with", section: 1, sectionName: "About You", question: "Are you buying on your own or with someone else?", type: "select", options: ["On my own", "With someone else"] },
  { key: "cobuyer_relationship", section: 1, sectionName: "About You", question: "What's your relationship to them?", type: "select", options: ["Married", "Family member", "Other"], showIf: (a) => a.buying_with === "With someone else" },

  // Section 2 — Your Income
  { key: "annual_income", section: 2, sectionName: "Your Income", question: "What's your gross annual income?", type: "number", placeholder: "e.g. 75000", hint: "Before taxes, in dollars" },
  { key: "income_type", section: 2, sectionName: "Your Income", question: "How do you earn it?", type: "select", options: ["Salaried", "Hourly", "Commission", "Self-employed", "Combination"] },
  { key: "self_employed_2yr", section: 2, sectionName: "Your Income", question: "Have you filed taxes as self-employed for 2+ years?", type: "select", options: ["Yes", "No", "Under 2 years"], showIf: (a) => a.income_type === "Self-employed" },
  { key: "job_change_2yr", section: 2, sectionName: "Your Income", question: "Have you changed jobs or industries in the past 2 years?", type: "select", options: ["Yes", "No"] },
  { key: "other_income", section: 2, sectionName: "Your Income", question: "Any other income to report? (rental, alimony, disability, investments)", type: "number", placeholder: "e.g. 12000", hint: "Annual amount in dollars. Leave blank if none.", optional: true },
  { key: "cobuyer_income", section: 2, sectionName: "Your Income", question: "What's your co-buyer's gross annual income?", type: "number", placeholder: "e.g. 65000", hint: "Before taxes, in dollars", showIf: (a) => a.buying_with === "With someone else" },

  // Section 3 — Your Finances
  { key: "current_savings", section: 3, sectionName: "Your Finances", question: "How much do you have saved to put toward a home?", type: "number", placeholder: "e.g. 30000", hint: "Total savings available for home purchase" },
  { key: "total_assets", section: 3, sectionName: "Your Finances", question: "What are your total assets?", type: "number", placeholder: "e.g. 80000", hint: "Savings, investments, retirement accounts — rough estimate is fine. Leave blank if unsure.", optional: true },
  { key: "large_expenses", section: 3, sectionName: "Your Finances", question: "Any large expenses coming up in the next 12 months?", type: "text", placeholder: "e.g. New car, wedding, tuition...", hint: "Leave blank if none.", optional: true },

  // Section 4 — Credit & Debt
  { key: "credit_score_range", section: 4, sectionName: "Credit & Debt", question: "What's your approximate credit score?", type: "select", options: ["Below 580", "580–619", "620–659", "660–699", "700–739", "740+"] },
  { key: "cobuyer_credit_score", section: 4, sectionName: "Credit & Debt", question: "What's your co-buyer's approximate credit score?", type: "select", options: ["Below 580", "580–619", "620–659", "660–699", "700–739", "740+"], showIf: (a) => a.buying_with === "With someone else" },
  { key: "credit_dings", section: 4, sectionName: "Credit & Debt", question: "Any credit issues in the past few years?", type: "text", placeholder: "e.g. Missed payments, collections, bankruptcy...", hint: "Leave blank if none.", optional: true },
  { key: "monthly_debt", section: 4, sectionName: "Credit & Debt", question: "What are your total monthly debt payments?", type: "number", placeholder: "e.g. 500", hint: "Car loans, student loans, credit cards, etc. Put 0 if none." },

  // Section 5 — Budget & Timeline
  { key: "target_home_price", section: 5, sectionName: "Budget & Timeline", question: "What's the maximum purchase price you have in mind?", type: "number", placeholder: "e.g. 350000", hint: "We'll also calculate a recommended range based on your income and debt." },
  { key: "target_state", section: 5, sectionName: "Budget & Timeline", question: "What state are you planning to buy in?", type: "text", placeholder: "e.g. Texas" },
  { key: "purchase_timeline", section: 5, sectionName: "Budget & Timeline", question: "When are you hoping to move in?", type: "select", options: ["ASAP", "3–6 months", "6–12 months", "1–2 years", "Just exploring"] },
  { key: "life_events", section: 5, sectionName: "Budget & Timeline", question: "Any major life events on the horizon that could affect your plans?", type: "text", placeholder: "e.g. New job, baby, marriage, relocation...", hint: "Leave blank if none.", optional: true },

  // Section 6 — Your Goals
  { key: "main_motivation", section: 6, sectionName: "Your Goals", question: "What's your main motivation for buying? (select all that apply)", type: "multiselect", options: ["Build wealth", "Stop paying rent", "More space", "Stability", "Investment", "Other"] },
  { key: "equity_vs_payment", section: 6, sectionName: "Your Goals", question: "What matters more to you right now?", type: "select", options: ["Build equity as fast as possible", "Keep my monthly payment low", "Both equally"] },
  { key: "stay_length", section: 6, sectionName: "Your Goals", question: "How long do you plan to stay in this home?", type: "select", options: ["2–3 years", "3–5 years", "5–10 years", "Long-term", "Not sure"] },
  { key: "starter_vs_longterm", section: 6, sectionName: "Your Goals", question: "Are you thinking of this as a starter home or a long-term home?", type: "select", options: ["Starter home", "Long-term home", "Not sure"] },
  { key: "house_hacking", section: 6, sectionName: "Your Goals", question: "Would you consider house hacking — buying a small multi-unit, living in one unit, and renting the others to offset your mortgage?", type: "select", options: ["Yes, interested", "Maybe", "No", "What's that?"] },

  // Section 7 — The Home
  { key: "property_type", section: 7, sectionName: "The Home", question: "Do you have a property type preference?", type: "select", options: ["Single-family", "Condo", "Townhouse", "Multi-unit", "Open to anything"] },
  { key: "bedrooms", section: 7, sectionName: "The Home", question: "How many bedrooms do you need?", type: "select", options: ["1", "2", "3", "4", "5+"] },
  { key: "renovation", section: 7, sectionName: "The Home", question: "Are you willing to buy a home that needs renovation?", type: "select", options: ["Yes", "No", "Depends on how much"] },
  { key: "target_location", section: 7, sectionName: "The Home", question: "What city, area, or zip codes are you targeting?", type: "text", placeholder: "e.g. Austin TX, 78701", hint: "Enter one or more locations, or \"Open / Flexible\"" },
  { key: "geo_constraints", section: 7, sectionName: "The Home", question: "Any hard geographic constraints on where you can buy?", type: "text", placeholder: "e.g. Must be within 30 min of downtown Chicago", hint: "Job, family, school district, etc. Leave blank if flexible.", optional: true },
  { key: "school_district", section: 7, sectionName: "The Home", question: "Does school district quality matter in your decision?", type: "select", options: ["Yes", "No", "Will matter in the future"] },
  { key: "neighborhood_feel", section: 7, sectionName: "The Home", question: "What kind of neighborhood feel are you looking for?", type: "select", options: ["Urban", "Suburban", "Quiet / Rural", "Doesn't matter"] },

  // Section 8 — Mindset & Readiness
  { key: "cobuyer_alignment", section: 8, sectionName: "Mindset & Readiness", question: "How aligned is your co-buyer on this decision?", type: "select", options: ["Fully aligned", "Mostly aligned", "Still working through it"], showIf: (a) => a.buying_with === "With someone else" },
  { key: "fears", section: 8, sectionName: "Mindset & Readiness", question: "What concerns or fears do you have about buying? (select all that apply)", type: "multiselect", options: ["Overpaying for a home", "Not qualifying for a mortgage", "Picking the wrong location", "Being house-poor after buying", "The market dropping after I buy", "Not understanding the process", "Draining my savings", "None"], optional: true },
  { key: "mortgage_familiarity", section: 8, sectionName: "Mindset & Readiness", question: "How familiar are you with the mortgage process?", type: "select", options: ["1 – Totally new to this", "2", "3", "4", "5 – Very familiar"] },
  { key: "has_agent", section: 8, sectionName: "Mindset & Readiness", question: "Do you currently have a real estate agent?", type: "select", options: ["Yes", "No", "Interviewing a few"] },
  { key: "current_housing", section: 8, sectionName: "Mindset & Readiness", question: "What is your current housing situation?", type: "select", options: ["Renting", "Living with family or friends", "Already own a home", "Other"] },
  { key: "process_questions", section: 8, sectionName: "Mindset & Readiness", question: "Is there anything about the homebuying process you feel you don't understand yet?", type: "text", placeholder: "e.g. How does escrow work? What is PMI?", hint: "Leave blank if none.", optional: true },

  // Section 9 — Special Situations
  { key: "special_situations", section: 9, sectionName: "Special Situations", question: "Check anything that applies to you:", type: "multiselect", options: ["I am a veteran or active military", "I am a teacher, nurse, firefighter, first responder, or other public servant", "I would be buying in a rural area", "I have had a prior foreclosure or bankruptcy", "None of these apply"], optional: true },
];

// ── Credit score mapping ───────────────────────────────────────────────────────

const CREDIT_MAP: Record<string, number> = {
  "Below 580": 560, "580–619": 599, "620–659": 639,
  "660–699": 679, "700–739": 719, "740+": 760,
};

// ── Component ─────────────────────────────────────────────────────────────────

const SurveyPage = () => {
  const { generateError } = useSurvey();
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const navigate = useNavigate();

  const visibleQuestions = useMemo(
    () => QUESTIONS.filter((q) => !q.showIf || q.showIf(answers)),
    [answers]
  );

  const q = visibleQuestions[currentQ];
  const value = answers[q.key] ?? "";
  const isArray = Array.isArray(value);
  const progress = ((currentQ + 1) / visibleQuestions.length) * 100;
  const canAdvance = q.optional || (isArray ? (value as string[]).length > 0 : (value as string).trim() !== "");

  const handleSelect = (option: string) => {
    setAnswers((prev) => ({ ...prev, [q.key]: option }));
  };

  const handleMultiToggle = (option: string) => {
    setAnswers((prev) => {
      const current = (prev[q.key] as string[]) ?? [];
      if (current.includes(option)) {
        return { ...prev, [q.key]: current.filter((o) => o !== option) };
      }
      return { ...prev, [q.key]: [...current, option] };
    });
  };

  const handleInput = (val: string) => {
    setAnswers((prev) => ({ ...prev, [q.key]: val }));
  };

  const handleNext = async () => {
    if (currentQ < visibleQuestions.length - 1) {
      setCurrentQ(currentQ + 1);
      return;
    }
    submitSurvey();
  };

  const handleBack = () => {
    if (currentQ > 0) setCurrentQ(currentQ - 1);
  };

  const submitSurvey = () => {
    const get = (key: string) => (answers[key] as string) ?? "";
    const getNum = (key: string) => Number(answers[key] ?? 0);
    const getArr = (key: string): string[] => (answers[key] as string[]) ?? [];

    const financial = {
      annual_income:     getNum("annual_income"),
      current_savings:   getNum("current_savings"),
      target_home_price: getNum("target_home_price"),
      credit_score:      CREDIT_MAP[get("credit_score_range")] ?? 660,
      monthly_debt:      getNum("monthly_debt"),
      ...(answers.other_income  ? { other_income:  getNum("other_income")  } : {}),
      ...(answers.total_assets  ? { total_assets:  getNum("total_assets")  } : {}),
    };

    const context = {
      buyer_age:            answers.buyer_age ? getNum("buyer_age") : undefined,
      buying_with:          get("buying_with"),
      cobuyer_relationship: get("cobuyer_relationship") || undefined,
      income_type:          get("income_type"),
      self_employed_2yr:    get("self_employed_2yr") || undefined,
      job_change_2yr:       get("job_change_2yr"),
      cobuyer_income:       answers.cobuyer_income ? getNum("cobuyer_income") : undefined,
      large_expenses:       get("large_expenses") || undefined,
      cobuyer_credit_score: answers.cobuyer_credit_score ? CREDIT_MAP[get("cobuyer_credit_score")] : undefined,
      credit_dings:         get("credit_dings") || undefined,
      target_state:         get("target_state"),
      purchase_timeline:    get("purchase_timeline"),
      life_events:          get("life_events") || undefined,
      main_motivation:      getArr("main_motivation"),
      equity_vs_payment:    get("equity_vs_payment"),
      stay_length:          get("stay_length"),
      starter_vs_longterm:  get("starter_vs_longterm"),
      house_hacking:        get("house_hacking"),
      property_type:        get("property_type"),
      bedrooms:             get("bedrooms"),
      renovation:           get("renovation"),
      target_location:      get("target_location"),
      geo_constraints:      get("geo_constraints") || undefined,
      school_district:      get("school_district"),
      neighborhood_feel:    get("neighborhood_feel"),
      cobuyer_alignment:    get("cobuyer_alignment") || undefined,
      fears:                getArr("fears"),
      mortgage_familiarity: get("mortgage_familiarity"),
      has_agent:            get("has_agent"),
      current_housing:      get("current_housing"),
      process_questions:    get("process_questions") || undefined,
      special_situations:   getArr("special_situations"),
    };

    navigate("/plan-loading", { state: { financial, context } as SurveyInputs });
  };

  const selectedArr = (isArray ? value : []) as string[];

  return (
    <div className="min-h-screen flex flex-col px-6 py-6 bg-background">
      {/* Progress */}
      <div className="w-full max-w-md mx-auto mb-6">
        <div className="flex items-center justify-between mb-1">
          <button
            onClick={handleBack}
            disabled={currentQ === 0}
            className="p-1 rounded-lg hover:bg-secondary disabled:opacity-30 transition"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <span className="text-sm font-semibold text-muted-foreground">
            Section {q.section} of 9
          </span>
          <div className="w-6" />
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1 text-center">{q.sectionName}</p>
      </div>

      {/* Question */}
      <div className="flex-1 flex flex-col max-w-md mx-auto w-full animate-fade-in" key={currentQ}>
        <h2 className="text-2xl font-heading font-bold text-foreground mb-2 leading-tight">
          {q.question}
        </h2>
        {q.hint && <p className="text-sm text-muted-foreground mb-6">{q.hint}</p>}

        <div className="flex-1">
          {/* Select */}
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

          {/* Multi-select */}
          {q.type === "multiselect" && (
            <div className="flex flex-wrap gap-3">
              {q.options!.map((option) => {
                const selected = selectedArr.includes(option);
                return (
                  <button
                    key={option}
                    onClick={() => handleMultiToggle(option)}
                    className={`px-4 py-2 rounded-full border-2 font-medium text-sm transition-all duration-200 ${
                      selected
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card text-foreground hover:border-primary/40"
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          )}

          {/* Number / Text */}
          {(q.type === "number" || q.type === "text") && (
            <input
              type={q.type === "number" ? "number" : "text"}
              value={value as string}
              onChange={(e) => handleInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && canAdvance && handleNext()}
              placeholder={q.placeholder}
              className="w-full rounded-xl border-2 border-border bg-card px-5 py-4 text-lg font-medium text-foreground focus:outline-none focus:border-primary transition-colors"
              autoFocus
            />
          )}

          {/* House hacking explanation */}
          {q.key === "house_hacking" && value === "What's that?" && (
            <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-xl text-sm text-amber-900 dark:text-amber-100">
              <strong>House hacking</strong> means buying a duplex, triplex, or small multi-unit property, living in one unit, and renting out the others. The rental income helps pay your mortgage — sometimes covering it entirely. It's one of the fastest ways to build equity as a first-time buyer. Pick an answer above now that you know what it means.
            </div>
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
          {currentQ < visibleQuestions.length - 1 ? "Next" : "Build My Plan"}
        </button>
      </div>
    </div>
  );
};

export default SurveyPage;
