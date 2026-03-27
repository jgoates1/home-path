import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from "react";
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
  buyerType: string;
  planMetrics: PlanMetrics | null;
  steps: StepData[];
  /** Highest step order the user may open (1 = only step 1; advances when prior step's todos are done). Drives roadmap path + locks. */
  currentStep: number;
  committedTimeline: string;
  setCommittedTimeline: (t: string) => void;
  savedAmount: number;
  targetSavings: number | null;
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

/** Step 1 always unlocked; step k+1 unlocks when all todos on step k are complete. Drives RoadmapVisual locks and path progress. */
export function computeRoadmapCurrentStep(steps: StepData[]): number {
  if (steps.length === 0) return 0;
  const ordered = [...steps].sort((a, b) => a.id - b.id);
  const maxStepId = Math.max(...ordered.map((s) => s.id));
  let n = 1;
  for (const step of ordered) {
    const stepComplete =
      step.todos.length > 0 && step.todos.every((t) => t.completed);
    if (step.id <= n && stepComplete) {
      n = Math.min(step.id + 1, maxStepId);
    }
  }
  return n;
}

function getBuyerTypeFromTimeline(purchaseTimeline: string): string {
  const t = (purchaseTimeline || "").toLowerCase();
  if (!t) return "Explorer";
  if (t.includes("asap")) return "Ready Buyer";
  if (t.includes("3") && t.includes("6")) return "Searcher";
  if (t.includes("6") && t.includes("12")) return "Planner";
  if (t.includes("1") && t.includes("2")) return "Planner";
  if (t.includes("exploring")) return "Explorer";
  return "Explorer";
}

const SurveyContext = createContext<SurveyContextType | undefined>(undefined);

export const SurveyProvider = ({ children }: { children: ReactNode }) => {
  const [hasPlan, setHasPlan] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [buyerType, setBuyerType] = useState("Explorer");
  const [planMetrics, setPlanMetrics] = useState<PlanMetrics | null>(null);
  const [steps, setSteps] = useState<StepData[]>([]);
  const [committedTimeline, setCommittedTimelineState] = useState("");
  const [savedAmount, setSavedAmountState] = useState(0);
  const [targetSavings, setTargetSavings] = useState<number | null>(null);

  const currentStep = useMemo(() => computeRoadmapCurrentStep(steps), [steps]);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) return;

    const ct = localStorage.getItem("homeapp_timeline_commit");
    if (ct) setCommittedTimelineState(ct);

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

    // Load savings data from plan response
    if (plan.current_savings != null) setSavedAmountState(Number(plan.current_savings));
    if (plan.financial_metrics?.total_cash_needed != null) setTargetSavings(Number(plan.financial_metrics.total_cash_needed));
  };

  const submitSurvey = async (inputs: SurveyInputs) => {
    setIsGenerating(true);
    setGenerateError(null);
    try {
      setBuyerType(getBuyerTypeFromTimeline(inputs.context?.purchase_timeline ?? ""));
      const plan = await api.generatePlan(inputs) as any;
      applyPlan(plan);
    } catch (err: any) {
      setGenerateError(err.message ?? "Failed to generate plan");
      throw err;
    } finally {
      setIsGenerating(false);
    }
  };

  const setCommittedTimeline = (t: string) => {
    setCommittedTimelineState(t);
    localStorage.setItem("homeapp_timeline_commit", t);
  };

  const setSavedAmount = async (n: number) => {
    setSavedAmountState(n);
    try {
      await api.updateSavings(n);
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
    setSavedAmountState(0);
    setTargetSavings(null);
    await loadPlanFromDatabase();
  };

  return (
    <SurveyContext.Provider
      value={{
        hasPlan, isGenerating, generateError,
        buyerType,
        planMetrics, steps, currentStep,
        committedTimeline, setCommittedTimeline,
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
