import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { api } from "@/services/api";
import { PlanMetrics, AiPlanStep, SurveyInputs } from "@/types/plan";

export interface TodoItem {
  id: number;
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
  hasPlan: boolean;
  isGenerating: boolean;
  generateError: string | null;
  planMetrics: PlanMetrics | null;
  steps: StepData[];
  savedAmount: number;
  targetSavings: number;
  setSavedAmount: (n: number) => Promise<void>;
  submitSurvey: (inputs: SurveyInputs) => Promise<void>;
  toggleTodo: (stepId: number, todoId: number) => Promise<void>;
  getCompletionPercent: () => number;
  reloadUserData: () => Promise<void>;
}

const stepDescriptions = [
  "Build a solid financial foundation before house hunting.",
  "Secure a mortgage pre-approval to know your budget.",
  "Search, tour, and identify the right home for you.",
  "Navigate inspections, appraisals, and closing day!",
];

function buildStepsFromPlan(planSteps: AiPlanStep[]): StepData[] {
  return planSteps.map((s) => ({
    id: s.step_order,
    title: s.step_name,
    description: stepDescriptions[s.step_order - 1] ?? "",
    tips: s.tips,
    todos: s.todos,
  }));
}

const SurveyContext = createContext<SurveyContextType | undefined>(undefined);

export const SurveyProvider = ({ children }: { children: ReactNode }) => {
  const [hasPlan, setHasPlan] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [planMetrics, setPlanMetrics] = useState<PlanMetrics | null>(null);
  const [steps, setSteps] = useState<StepData[]>([]);
  const [savedAmount, setSavedAmountState] = useState(0);
  const [targetSavings, setTargetSavings] = useState(50000);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) return;

    // Load current_savings and target_savings from the user profile
    api.getProfile().then((profile: any) => {
      if (profile.currentSavings != null) setSavedAmountState(Number(profile.currentSavings));
      if (profile.targetSavings != null) setTargetSavings(Number(profile.targetSavings));
    }).catch(() => {});

    loadPlanFromDatabase();
  }, []);

  const loadPlanFromDatabase = async () => {
    try {
      const plan = await api.getPlan() as any;
      applyPlan(plan);
    } catch {
      // 404 = no plan yet, that's fine
    }
  };

  const applyPlan = (plan: any) => {
    setPlanMetrics(plan.financial_metrics);
    setSteps(buildStepsFromPlan(plan.steps));
    setHasPlan(true);

    // Sync completion state from DB into steps
    setSteps(buildStepsFromPlan(plan.steps));
  };

  const submitSurvey = async (inputs: SurveyInputs) => {
    setIsGenerating(true);
    setGenerateError(null);
    try {
      const plan = await api.generatePlan(inputs) as any;
      applyPlan(plan);
      // Reload profile manually to get updated savings fields
      const profile = await api.getProfile() as any;
      if (profile.currentSavings != null) setSavedAmountState(Number(profile.currentSavings));
      if (profile.targetSavings != null) setTargetSavings(Number(profile.targetSavings));
    } catch (err: any) {
      setGenerateError(err.message ?? "Failed to generate plan");
      throw err;
    } finally {
      setIsGenerating(false);
    }
  };

  const setSavedAmount = async (n: number) => {
    setSavedAmountState(n);
    try {
      await api.updateProfile({ currentSavings: n });
    } catch {
      // keep local value even if API fails
    }
  };

  const toggleTodo = async (stepId: number, todoId: number) => {
    const step = steps.find((s) => s.id === stepId);
    const todo = step?.todos.find((t) => t.id === todoId);
    if (!todo) return;

    const newCompleted = !todo.completed;

    setSteps((prev) =>
      prev.map((s) =>
        s.id === stepId
          ? { ...s, todos: s.todos.map((t) => (t.id === todoId ? { ...t, completed: newCompleted } : t)) }
          : s
      )
    );

    try {
      await api.toggleAiTodo(todoId, newCompleted);
    } catch (err) {
      // revert on failure
      setSteps((prev) =>
        prev.map((s) =>
          s.id === stepId
            ? { ...s, todos: s.todos.map((t) => (t.id === todoId ? { ...t, completed: !newCompleted } : t)) }
            : s
        )
      );
    }
  };

  const getCompletionPercent = () => {
    const all = steps.flatMap((s) => s.todos);
    if (all.length === 0) return 0;
    return Math.round((all.filter((t) => t.completed).length / all.length) * 100);
  };

  const reloadUserData = async () => {
    setHasPlan(false);
    setPlanMetrics(null);
    setSteps([]);
    try {
      const profile = await api.getProfile() as any;
      if (profile.currentSavings != null) setSavedAmountState(Number(profile.currentSavings));
      if (profile.targetSavings != null) setTargetSavings(Number(profile.targetSavings));
    } catch {}
    await loadPlanFromDatabase();
  };

  return (
    <SurveyContext.Provider
      value={{
        hasPlan, isGenerating, generateError,
        planMetrics, steps,
        savedAmount, targetSavings, setSavedAmount,
        submitSurvey, toggleTodo,
        getCompletionPercent, reloadUserData,
      }}
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
