import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSurvey } from "@/contexts/SurveyContext";
import { SurveyInputs } from "@/types/plan";
import { Send } from "lucide-react";

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
  optional?: boolean;
  showIf?: (a: Answers) => boolean;
}

interface ChatMessage {
  id: number;
  type: "bot" | "user";
  text: string;
}

// ── Questions ─────────────────────────────────────────────────────────────────

const QUESTIONS: Question[] = [
  // Section 1 — About You
  { key: "buyer_age", section: 1, sectionName: "About You", question: "How old are you?", type: "number", placeholder: "e.g. 28" },
  { key: "buying_with", section: 1, sectionName: "About You", question: "Are you buying on your own or with someone else?", type: "select", options: ["On my own", "With someone else"] },
  { key: "cobuyer_relationship", section: 1, sectionName: "About You", question: "What's your relationship to them?", type: "select", options: ["Married", "Family member", "Other"], showIf: (a) => a.buying_with === "With someone else" },

  // Section 2 — Your Income
  { key: "annual_income", section: 2, sectionName: "Your Income", question: "What's your gross annual income? (before taxes, in dollars)", type: "number", placeholder: "e.g. 75000" },
  { key: "income_type", section: 2, sectionName: "Your Income", question: "How do you earn it?", type: "select", options: ["Salaried", "Hourly", "Commission", "Self-employed", "Combination"] },
  { key: "self_employed_2yr", section: 2, sectionName: "Your Income", question: "Have you filed taxes as self-employed for 2+ years?", type: "select", options: ["Yes", "No", "Under 2 years"], showIf: (a) => a.income_type === "Self-employed" },
  { key: "job_change_2yr", section: 2, sectionName: "Your Income", question: "Have you changed jobs or industries in the past 2 years?", type: "select", options: ["Yes", "No"] },
  { key: "other_income", section: 2, sectionName: "Your Income", question: "Any other income? (rental, alimony, disability, investments) — annual amount in dollars, or skip if none.", type: "number", placeholder: "e.g. 12000", optional: true },
  { key: "cobuyer_income", section: 2, sectionName: "Your Income", question: "What's your co-buyer's gross annual income? (before taxes)", type: "number", placeholder: "e.g. 65000", showIf: (a) => a.buying_with === "With someone else" },

  // Section 3 — Your Finances
  { key: "current_savings", section: 3, sectionName: "Your Finances", question: "How much do you have saved to put toward a home?", type: "number", placeholder: "e.g. 30000" },
  { key: "total_assets", section: 3, sectionName: "Your Finances", question: "What are your total assets? (savings + investments + retirement accounts — rough estimate is fine, or skip)", type: "number", placeholder: "e.g. 80000", optional: true },
  { key: "large_expenses", section: 3, sectionName: "Your Finances", question: "Any large expenses coming up in the next 12 months? (e.g. new car, wedding, tuition) — or skip if none.", type: "text", placeholder: "e.g. New car in spring", optional: true },

  // Section 4 — Credit & Debt
  { key: "credit_score_range", section: 4, sectionName: "Credit & Debt", question: "What's your approximate credit score?", type: "select", options: ["Below 580", "580–619", "620–659", "660–699", "700–739", "740+"] },
  { key: "cobuyer_credit_score", section: 4, sectionName: "Credit & Debt", question: "What's your co-buyer's approximate credit score?", type: "select", options: ["Below 580", "580–619", "620–659", "660–699", "700–739", "740+"], showIf: (a) => a.buying_with === "With someone else" },
  { key: "credit_dings", section: 4, sectionName: "Credit & Debt", question: "Any credit issues in the past few years? (missed payments, collections, bankruptcy) — or skip if none.", type: "text", placeholder: "e.g. One late payment in 2022", optional: true },
  { key: "monthly_debt", section: 4, sectionName: "Credit & Debt", question: "What are your total monthly debt payments? (car, student loans, credit cards — put 0 if none)", type: "number", placeholder: "e.g. 500" },

  // Section 5 — Budget & Timeline
  { key: "target_home_price", section: 5, sectionName: "Budget & Timeline", question: "What's the maximum purchase price you have in mind?", type: "number", placeholder: "e.g. 350000" },
  { key: "target_state", section: 5, sectionName: "Budget & Timeline", question: "What state are you planning to buy in?", type: "text", placeholder: "e.g. Texas" },
  { key: "purchase_timeline", section: 5, sectionName: "Budget & Timeline", question: "When are you hoping to move in?", type: "select", options: ["ASAP", "3–6 months", "6–12 months", "1–2 years", "Just exploring"] },
  { key: "life_events", section: 5, sectionName: "Budget & Timeline", question: "Any major life events on the horizon that could affect your plans? (new job, baby, relocation) — or skip.", type: "text", placeholder: "e.g. Starting a new job in July", optional: true },

  // Section 6 — Your Goals
  { key: "main_motivation", section: 6, sectionName: "Your Goals", question: "What's your main motivation for buying? Pick all that apply.", type: "multiselect", options: ["Build wealth", "Stop paying rent", "More space", "Stability", "Investment", "Other"] },
  { key: "equity_vs_payment", section: 6, sectionName: "Your Goals", question: "What matters more to you right now?", type: "select", options: ["Build equity as fast as possible", "Keep my monthly payment low", "Both equally"] },
  { key: "stay_length", section: 6, sectionName: "Your Goals", question: "How long do you plan to stay in this home?", type: "select", options: ["2–3 years", "3–5 years", "5–10 years", "Long-term", "Not sure"] },
  { key: "starter_vs_longterm", section: 6, sectionName: "Your Goals", question: "Starter home or long-term home?", type: "select", options: ["Starter home", "Long-term home", "Not sure"] },
  { key: "house_hacking", section: 6, sectionName: "Your Goals", question: "Would you consider house hacking?", type: "select", options: ["Yes, interested", "Maybe", "No"] },

  // Section 7 — The Home
  { key: "property_type", section: 7, sectionName: "The Home", question: "Do you have a property type preference?", type: "select", options: ["Single-family", "Condo", "Townhouse", "Multi-unit", "Open to anything"] },
  { key: "bedrooms", section: 7, sectionName: "The Home", question: "How many bedrooms do you need?", type: "select", options: ["1", "2", "3", "4", "5+"] },
  { key: "renovation", section: 7, sectionName: "The Home", question: "Are you willing to buy a home that needs renovation?", type: "select", options: ["Yes", "No", "Depends on how much"] },
  { key: "target_location", section: 7, sectionName: "The Home", question: "What city, area, or zip codes are you targeting?", type: "text", placeholder: "e.g. Austin TX, or Open / Flexible" },
  { key: "geo_constraints", section: 7, sectionName: "The Home", question: "Any hard geographic constraints? (job, family, school district) — or skip if flexible.", type: "text", placeholder: "e.g. Must be within 30 min of downtown", optional: true },
  { key: "school_district", section: 7, sectionName: "The Home", question: "Does school district quality matter in your decision?", type: "select", options: ["Yes", "No", "Will matter in the future"] },
  { key: "neighborhood_feel", section: 7, sectionName: "The Home", question: "What kind of neighborhood feel are you looking for?", type: "select", options: ["Urban", "Suburban", "Quiet / Rural", "Doesn't matter"] },

  // Section 8 — Mindset & Readiness
  { key: "cobuyer_alignment", section: 8, sectionName: "Mindset & Readiness", question: "How aligned is your co-buyer on this decision?", type: "select", options: ["Fully aligned", "Mostly aligned", "Still working through it"], showIf: (a) => a.buying_with === "With someone else" },
  { key: "fears", section: 8, sectionName: "Mindset & Readiness", question: "What concerns or fears do you have about buying? Select all that apply, or skip.", type: "multiselect", options: ["Overpaying for a home", "Not qualifying for a mortgage", "Picking the wrong location", "Being house-poor after buying", "The market dropping after I buy", "Not understanding the process", "Draining my savings"], optional: true },
  { key: "mortgage_familiarity", section: 8, sectionName: "Mindset & Readiness", question: "How familiar are you with the mortgage process?", type: "select", options: ["1 – Totally new to this", "2", "3", "4", "5 – Very familiar"] },
  { key: "has_agent", section: 8, sectionName: "Mindset & Readiness", question: "Do you currently have a real estate agent?", type: "select", options: ["Yes", "No", "Interviewing a few"] },
  { key: "current_housing", section: 8, sectionName: "Mindset & Readiness", question: "What's your current housing situation?", type: "select", options: ["Renting", "Living with family or friends", "Already own a home", "Other"] },
  { key: "process_questions", section: 8, sectionName: "Mindset & Readiness", question: "Anything about the homebuying process you feel you don't understand yet? — or skip.", type: "text", placeholder: "e.g. How does escrow work?", optional: true },

  // Section 9 — Special Situations
  { key: "special_situations", section: 9, sectionName: "Special Situations", question: "Last one — check anything that applies to you.", type: "multiselect", options: ["I am a veteran or active military", "I am a teacher, nurse, firefighter, first responder, or other public servant", "I would be buying in a rural area", "I have had a prior foreclosure or bankruptcy"], optional: true },
];

// ── Credit score mapping ───────────────────────────────────────────────────────

const CREDIT_MAP: Record<string, number> = {
  "Below 580": 560, "580–619": 599, "620–659": 639,
  "660–699": 679, "700–739": 719, "740+": 760,
};

// ── Bot pre-message for specific questions ────────────────────────────────────

const PRE_MESSAGES: Record<string, string> = {
  house_hacking: "Quick context: house hacking means buying a small multi-unit property (duplex, triplex), living in one unit, and renting the others. The rental income offsets — sometimes covers — your mortgage entirely.",
  special_situations: "Almost done! A few situations can unlock special loan programs or assistance.",
};

// ── Component ─────────────────────────────────────────────────────────────────

const SurveyPage = () => {
  const { generateError } = useSurvey();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [isTyping, setIsTyping] = useState(false);
  const [pendingMulti, setPendingMulti] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [done, setDone] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(0);
  const nextId = () => ++idRef.current;

  const visibleQuestions = useMemo(
    () => QUESTIONS.filter((q) => !q.showIf || q.showIf(answers)),
    [answers]
  );

  const q = !done ? visibleQuestions[currentQ] : null;
  const progress = done ? 100 : (currentQ / visibleQuestions.length) * 100;

  // Init
  useEffect(() => {
    const first = QUESTIONS[0];
    setMessages([
      { id: nextId(), type: "bot", text: "Hey! Let's build your personalized homebuying plan. I'll ask you a series of questions — takes about 3–4 minutes." },
      { id: nextId(), type: "bot", text: first.question },
    ]);
  }, []);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const pushNextQuestion = (newAnswers: Answers, answeredIndex: number) => {
    const nextVisible = QUESTIONS.filter((qn) => !qn.showIf || qn.showIf(newAnswers));
    const nextIndex = answeredIndex + 1;

    if (nextIndex >= nextVisible.length) {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        { id: nextId(), type: "bot", text: "That's everything I need. Let's build your personalized plan!" },
      ]);
      setDone(true);
      return;
    }

    const nextQ = nextVisible[nextIndex];
    const pre = PRE_MESSAGES[nextQ.key];

    setIsTyping(false);
    setCurrentQ(nextIndex);
    setMessages((prev) => [
      ...prev,
      ...(pre ? [{ id: nextId(), type: "bot" as const, text: pre }] : []),
      { id: nextId(), type: "bot", text: nextQ.question },
    ]);
  };

  const handleAnswer = (value: string | string[]) => {
    const display = Array.isArray(value)
      ? value.length > 0 ? value.join(", ") : "None"
      : value.trim() || "Skipped";

    const newAnswers = { ...answers, [q!.key]: value };
    setAnswers(newAnswers);
    setPendingMulti([]);
    setInputValue("");

    setMessages((prev) => [...prev, { id: nextId(), type: "user", text: display }]);
    setIsTyping(true);

    setTimeout(() => pushNextQuestion(newAnswers, currentQ), 650);
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
      ...(answers.other_income ? { other_income: getNum("other_income") } : {}),
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

  return (
    <div className="h-screen flex flex-col bg-background md:h-auto md:min-h-screen md:items-center md:px-6 md:py-8">
      <div className="flex-1 flex flex-col w-full md:flex-none md:max-w-md md:h-[75vh] md:border md:rounded-2xl md:shadow-lg md:overflow-hidden md:bg-card">

      {/* Progress bar */}
      <div className="w-full h-1 bg-muted shrink-0">
        <div
          className="h-full bg-primary transition-all duration-700"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[82%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.type === "user"
                  ? "bg-primary text-primary-foreground rounded-br-none"
                  : "bg-muted text-foreground rounded-bl-none"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-muted px-4 py-3 rounded-2xl rounded-bl-none">
              <div className="flex gap-1 items-center h-4">
                {[0, 160, 320].map((delay) => (
                  <span
                    key={delay}
                    className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"
                    style={{ animationDelay: `${delay}ms` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      {!isTyping && !done && q && (
        <div className="border-t bg-background px-4 pt-3 pb-6 shrink-0 space-y-2">
          {/* Select */}
          {q.type === "select" && (
            <div className="flex flex-wrap gap-2">
              {q.options!.map((option) => (
                <button
                  key={option}
                  onClick={() => handleAnswer(option)}
                  className="px-4 py-2 rounded-full border-2 border-border bg-card text-foreground text-sm font-medium hover:border-primary hover:text-primary transition-all active:scale-95"
                >
                  {option}
                </button>
              ))}
            </div>
          )}

          {/* Multiselect */}
          {q.type === "multiselect" && (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {q.options!.map((option) => (
                  <button
                    key={option}
                    onClick={() =>
                      setPendingMulti((prev) =>
                        prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option]
                      )
                    }
                    className={`px-4 py-2 rounded-full border-2 text-sm font-medium transition-all active:scale-95 ${
                      pendingMulti.includes(option)
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card text-foreground hover:border-primary/40"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
              <button
                onClick={() => handleAnswer(pendingMulti)}
                disabled={!q.optional && pendingMulti.length === 0}
                className="w-full py-3 rounded-xl bg-accent text-accent-foreground font-bold text-sm disabled:opacity-40 transition-all"
              >
                {pendingMulti.length > 0 ? `Confirm (${pendingMulti.length} selected)` : q.optional ? "Skip" : "Confirm"}
              </button>
            </div>
          )}

          {/* Text / Number */}
          {(q.type === "number" || q.type === "text") && (
            <>
              <div className="flex gap-2">
                <input
                  key={q.key}
                  type={q.type === "number" ? "number" : "text"}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (inputValue.trim() || q.optional)) {
                      handleAnswer(inputValue);
                    }
                  }}
                  placeholder={q.placeholder ?? "Type your answer..."}
                  className="flex-1 rounded-xl border-2 border-border bg-card px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                  autoFocus
                />
                <button
                  onClick={() => handleAnswer(inputValue)}
                  disabled={!inputValue.trim() && !q.optional}
                  className="px-4 py-3 rounded-xl bg-primary text-primary-foreground disabled:opacity-40 transition-all active:scale-95"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              {q.optional && (
                <button
                  onClick={() => handleAnswer("")}
                  className="text-xs text-muted-foreground underline pl-1"
                >
                  Skip
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* Done */}
      {done && (
        <div className="border-t bg-background px-4 pt-3 pb-6 shrink-0">
          {generateError && <p className="text-sm text-destructive mb-2">{generateError}</p>}
          <button
            onClick={submitSurvey}
            className="w-full py-4 rounded-xl bg-accent text-accent-foreground font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
          >
            Build My Plan
          </button>
        </div>
      )}

      </div>
    </div>
  );
};

export default SurveyPage;
