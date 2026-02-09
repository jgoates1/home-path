import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface SurveyAnswers {
  income: string;
  savings: string;
  location: string;
  timeline: string;
  housing: string;
}

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface StepData {
  id: number;
  title: string;
  description: string;
  tips: string[];
  todos: TodoItem[];
}

interface SurveyContextType {
  answers: SurveyAnswers;
  setAnswers: (a: SurveyAnswers) => void;
  buyerType: string;
  savedAmount: number;
  setSavedAmount: (n: number) => void;
  goalAmount: number;
  steps: StepData[];
  toggleTodo: (stepId: number, todoId: string) => void;
  committedTimeline: string;
  setCommittedTimeline: (t: string) => void;
  getCompletionPercent: () => number;
  currentStep: number;
}

const defaultAnswers: SurveyAnswers = { income: "", savings: "", location: "", timeline: "", housing: "" };

const defaultSteps: StepData[] = [
  {
    id: 1,
    title: "Get Your Finances Ready",
    description: "Build a solid financial foundation before house hunting.",
    tips: [
      "Check and boost your credit score — aim for 620+",
      "Pay down existing debts to improve your debt-to-income ratio",
      "Start saving aggressively for your down payment",
      "Create a monthly budget that accounts for future mortgage payments",
    ],
    todos: [
      { id: "1a", text: "Check your credit score", completed: false },
      { id: "1b", text: "Create a savings plan", completed: false },
      { id: "1c", text: "Pay down high-interest debt", completed: false },
      { id: "1d", text: "Set up a dedicated home savings account", completed: false },
    ],
  },
  {
    id: 2,
    title: "Get Pre-Approved",
    description: "Secure a mortgage pre-approval to know your budget.",
    tips: [
      "Shop around — compare rates from at least 3 lenders",
      "Gather documents: pay stubs, tax returns, bank statements",
      "Understand the difference between pre-qualification and pre-approval",
      "Don't open new credit cards or make large purchases during this time",
    ],
    todos: [
      { id: "2a", text: "Research mortgage lenders", completed: false },
      { id: "2b", text: "Gather financial documents", completed: false },
      { id: "2c", text: "Apply for pre-approval", completed: false },
      { id: "2d", text: "Compare loan offers", completed: false },
    ],
  },
  {
    id: 3,
    title: "Find Your Home",
    description: "Search, tour, and identify the right home for you.",
    tips: [
      "Find a good Realtor — choose someone you trust and like!",
      "Think about proximity vs costs when choosing a neighborhood",
      "Make a list of needs vs nice-to-haves",
      "Research areas you might like to live in",
    ],
    todos: [
      { id: "3a", text: "Find a good realtor", completed: false },
      { id: "3b", text: "Identify your needs vs. nice-to-haves", completed: false },
      { id: "3c", text: "Research areas you might like to live", completed: false },
      { id: "3d", text: "Tour at least 5 homes", completed: false },
      { id: "3e", text: "Make an offer", completed: false },
    ],
  },
  {
    id: 4,
    title: "Close the Deal",
    description: "Navigate inspections, appraisals, and closing day!",
    tips: [
      "Get a home inspection — don't skip this!",
      "Review closing costs carefully before signing",
      "Get homeowner's insurance set up before closing",
      "Do a final walk-through of the property",
    ],
    todos: [
      { id: "4a", text: "Schedule home inspection", completed: false },
      { id: "4b", text: "Review and understand closing costs", completed: false },
      { id: "4c", text: "Set up homeowner's insurance", completed: false },
      { id: "4d", text: "Final walk-through", completed: false },
      { id: "4e", text: "Sign closing documents", completed: false },
    ],
  },
];

const SurveyContext = createContext<SurveyContextType | undefined>(undefined);

function getBuyerType(answers: SurveyAnswers): string {
  if (!answers.timeline) return "Explorer";
  if (answers.timeline === "Within the next 3 months") return "Ready Buyer";
  if (answers.timeline === "3-6 months") return "Searcher";
  if (answers.timeline === "6-12 months") return "Planner";
  return "Explorer";
}

function getGoalFromIncome(income: string): number {
  if (income === "Under $50,000") return 50000;
  if (income === "$50,000 - $100,000") return 80000;
  if (income === "$100,000 - $150,000") return 100000;
  return 120000;
}

export const SurveyProvider = ({ children }: { children: ReactNode }) => {
  const [answers, setAnswersState] = useState<SurveyAnswers>(defaultAnswers);
  const [steps, setSteps] = useState<StepData[]>(defaultSteps);
  const [savedAmount, setSavedAmountState] = useState(0);
  const [committedTimeline, setCommittedTimelineState] = useState("");

  useEffect(() => {
    const sa = localStorage.getItem("homeapp_survey");
    if (sa) setAnswersState(JSON.parse(sa));
    const st = localStorage.getItem("homeapp_steps");
    if (st) setSteps(JSON.parse(st));
    const sv = localStorage.getItem("homeapp_saved");
    if (sv) setSavedAmountState(Number(sv));
    const ct = localStorage.getItem("homeapp_timeline_commit");
    if (ct) setCommittedTimelineState(ct);
  }, []);

  const setAnswers = (a: SurveyAnswers) => {
    setAnswersState(a);
    localStorage.setItem("homeapp_survey", JSON.stringify(a));
  };

  const setSavedAmount = (n: number) => {
    setSavedAmountState(n);
    localStorage.setItem("homeapp_saved", String(n));
  };

  const setCommittedTimeline = (t: string) => {
    setCommittedTimelineState(t);
    localStorage.setItem("homeapp_timeline_commit", t);
  };

  const toggleTodo = (stepId: number, todoId: string) => {
    setSteps((prev) => {
      const next = prev.map((s) =>
        s.id === stepId
          ? { ...s, todos: s.todos.map((t) => (t.id === todoId ? { ...t, completed: !t.completed } : t)) }
          : s
      );
      localStorage.setItem("homeapp_steps", JSON.stringify(next));
      return next;
    });
  };

  const getCompletionPercent = () => {
    const allTodos = steps.flatMap((s) => s.todos);
    if (allTodos.length === 0) return 0;
    return Math.round((allTodos.filter((t) => t.completed).length / allTodos.length) * 100);
  };

  const currentStep = steps.findIndex((s) => s.todos.some((t) => !t.completed)) + 1 || steps.length;
  const buyerType = getBuyerType(answers);
  const goalAmount = getGoalFromIncome(answers.income);

  return (
    <SurveyContext.Provider
      value={{ answers, setAnswers, buyerType, savedAmount, setSavedAmount, goalAmount, steps, toggleTodo, committedTimeline, setCommittedTimeline, getCompletionPercent, currentStep }}
    >
      {children}
    </SurveyContext.Provider>
  );
};

export const useSurvey = () => {
  const ctx = useContext(SurveyContext);
  if (!ctx) throw new Error("useSurvey must be within SurveyProvider");
  return ctx;
};
