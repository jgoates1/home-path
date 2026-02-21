import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { api } from "@/services/api";

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
  setAnswers: (a: SurveyAnswers) => Promise<void>;
  buyerType: string;
  savedAmount: number;
  setSavedAmount: (n: number) => void;
  goalAmount: number;
  steps: StepData[];
  toggleTodo: (stepId: number, todoId: string) => Promise<void>;
  committedTimeline: string;
  setCommittedTimeline: (t: string) => void;
  getCompletionPercent: () => number;
  currentStep: number;
  reloadUserData: () => Promise<void>;
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
    const token = localStorage.getItem('auth_token');

    if (token) {
      // If user is authenticated, load from database (source of truth)
      loadResponsesFromDatabase();
      loadTodosFromDatabase();

      // Load saved amount and timeline from localStorage (not in database yet)
      const sv = localStorage.getItem("homeapp_saved");
      if (sv) setSavedAmountState(Number(sv));
      const ct = localStorage.getItem("homeapp_timeline_commit");
      if (ct) setCommittedTimelineState(ct);
    } else {
      // If not authenticated, load from localStorage as fallback
      const sa = localStorage.getItem("homeapp_survey");
      if (sa) setAnswersState(JSON.parse(sa));
      const st = localStorage.getItem("homeapp_steps");
      if (st) setSteps(JSON.parse(st));
      const sv = localStorage.getItem("homeapp_saved");
      if (sv) setSavedAmountState(Number(sv));
      const ct = localStorage.getItem("homeapp_timeline_commit");
      if (ct) setCommittedTimelineState(ct);
    }
  }, []);

  const loadResponsesFromDatabase = async () => {
    try {
      const responses = await api.getSurveyResponses();
      if (responses && Array.isArray(responses) && responses.length > 0) {
        // Map database responses to SurveyAnswers format
        // question_id 1 = income, 2 = savings, 3 = location, 4 = timeline, 5 = housing
        const mappedAnswers: SurveyAnswers = { ...defaultAnswers };

        responses.forEach((r: any) => {
          const answerKey = getAnswerKeyFromQuestionId(r.questionId);
          if (answerKey) {
            mappedAnswers[answerKey] = r.response;
          }
        });

        setAnswersState(mappedAnswers);
        localStorage.setItem("homeapp_survey", JSON.stringify(mappedAnswers));
      }
    } catch (error) {
      console.error('Failed to load survey responses from database:', error);
      // Keep using localStorage data as fallback
    }
  };

  const getAnswerKeyFromQuestionId = (questionId: number): keyof SurveyAnswers | null => {
    const mapping: Record<number, keyof SurveyAnswers> = {
      1: 'income',
      2: 'savings',
      3: 'location',
      4: 'timeline',
      5: 'housing'
    };
    return mapping[questionId] || null;
  };

  const getQuestionIdFromAnswerKey = (key: keyof SurveyAnswers): number => {
    const mapping: Record<keyof SurveyAnswers, number> = {
      income: 1,
      savings: 2,
      location: 3,
      timeline: 4,
      housing: 5
    };
    return mapping[key];
  };

  // Map frontend todo IDs to database todo_ids
  const getTodoIdFromFrontendId = (frontendId: string): number => {
    const mapping: Record<string, number> = {
      '1a': 3,  // Check your credit score
      '1b': 6,  // Create a savings plan
      '1c': 7,  // Pay down high-interest debt
      '1d': 8,  // Set up a dedicated home savings account
      '2a': 9,  // Research mortgage lenders
      '2b': 10, // Gather financial documents
      '2c': 4,  // Get pre-approved for a mortgage
      '2d': 11, // Compare loan offers
      '3a': 1,  // Find a good realtor
      '3b': 12, // Identify your needs vs. nice-to-haves
      '3c': 13, // Research areas you might like to live
      '3d': 14, // Tour at least 5 homes
      '3e': 5,  // Make an offer on a home
      '4a': 15, // Schedule home inspection
      '4b': 16, // Review and understand closing costs
      '4c': 17, // Set up homeowner's insurance
      '4d': 18, // Final walk-through
      '4e': 19, // Sign closing documents
    };
    return mapping[frontendId] || 0;
  };

  const loadTodosFromDatabase = async () => {
    try {
      const userTodos = await api.getUserTodos();
      if (userTodos && Array.isArray(userTodos)) {
        // Create a map of todo_id to completion status
        const todoStatusMap: Record<number, boolean> = {};
        userTodos.forEach((ut: any) => {
          todoStatusMap[ut.todoId] = ut.status === 'Completed';
        });

        // Update the steps with database completion status
        setSteps((prev) => {
          const updated = prev.map((step) => ({
            ...step,
            todos: step.todos.map((todo) => {
              const dbTodoId = getTodoIdFromFrontendId(todo.id);
              const isCompleted = todoStatusMap[dbTodoId] || false;
              return { ...todo, completed: isCompleted };
            })
          }));
          localStorage.setItem("homeapp_steps", JSON.stringify(updated));
          return updated;
        });
      }
    } catch (error) {
      console.error('Failed to load todos from database:', error);
      // Keep using localStorage data as fallback
    }
  };

  const setAnswers = async (a: SurveyAnswers) => {
    setAnswersState(a);
    localStorage.setItem("homeapp_survey", JSON.stringify(a));

    // Save to database if user is authenticated
    const token = localStorage.getItem('auth_token');
    if (token) {
      try {
        // Convert SurveyAnswers to database format
        const responses = Object.entries(a)
          .filter(([_, value]) => value && value.trim() !== '') // Only send answered questions
          .map(([key, value]) => ({
            questionId: getQuestionIdFromAnswerKey(key as keyof SurveyAnswers),
            response: value
          }));

        if (responses.length > 0) {
          await api.submitSurveyResponsesBatch(responses);
          console.log('Survey responses saved to database');
        }
      } catch (error) {
        console.error('Failed to save survey responses to database:', error);
        // Still keep in localStorage even if database save fails
      }
    }
  };

  const setSavedAmount = (n: number) => {
    setSavedAmountState(n);
    localStorage.setItem("homeapp_saved", String(n));
  };

  const setCommittedTimeline = (t: string) => {
    setCommittedTimelineState(t);
    localStorage.setItem("homeapp_timeline_commit", t);
  };

  const reloadUserData = async () => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      // Reset to defaults first
      setAnswersState(defaultAnswers);
      setSteps(defaultSteps);
      setSavedAmountState(0);
      setCommittedTimelineState("");

      // Load fresh data from database
      await Promise.all([
        loadResponsesFromDatabase(),
        loadTodosFromDatabase()
      ]);

      // Load saved amount and timeline from localStorage
      const sv = localStorage.getItem("homeapp_saved");
      if (sv) setSavedAmountState(Number(sv));
      const ct = localStorage.getItem("homeapp_timeline_commit");
      if (ct) setCommittedTimelineState(ct);
    }
  };

  const toggleTodo = async (stepId: number, todoId: string) => {
    // Find the current todo to get its completion status
    const currentStep = steps.find((s) => s.id === stepId);
    const currentTodo = currentStep?.todos.find((t) => t.id === todoId);
    if (!currentTodo) return;

    const newCompletedStatus = !currentTodo.completed;

    // Update local state first for immediate UI feedback
    setSteps((prev) => {
      const next = prev.map((s) =>
        s.id === stepId
          ? { ...s, todos: s.todos.map((t) => (t.id === todoId ? { ...t, completed: newCompletedStatus } : t)) }
          : s
      );
      localStorage.setItem("homeapp_steps", JSON.stringify(next));
      return next;
    });

    // Save to database if user is authenticated
    const token = localStorage.getItem('auth_token');
    if (token) {
      try {
        const dbTodoId = getTodoIdFromFrontendId(todoId);
        if (dbTodoId === 0) {
          console.warn(`No database mapping for todo ${todoId}`);
          return;
        }

        // Check if user_todo exists, if not create it, then update status
        try {
          await api.updateTodo(dbTodoId, {
            status: newCompletedStatus ? 'Completed' : 'Pending'
          });
          console.log(`Todo ${todoId} status updated in database`);
        } catch (updateError: any) {
          // If todo doesn't exist for user, create it first
          if (updateError.message.includes('not found') || updateError.message.includes('404')) {
            await api.addTodo({
              todoId: dbTodoId,
              stepId: stepId,
              status: newCompletedStatus ? 'Completed' : 'Pending'
            });
            console.log(`Todo ${todoId} created and status set in database`);
          } else {
            throw updateError;
          }
        }
      } catch (error) {
        console.error('Failed to update todo in database:', error);
        // Todo will still be updated in localStorage
      }
    }
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
      value={{ answers, setAnswers, buyerType, savedAmount, setSavedAmount, goalAmount, steps, toggleTodo, committedTimeline, setCommittedTimeline, getCompletionPercent, currentStep, reloadUserData }}
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
