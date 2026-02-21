import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { api } from "../services/api";

interface User {
  id: number;
  name: string;
  email: string;
  username: string;
  archetype: string | null;
  currentSavings: number;
}

interface LoginResult {
  success: boolean;
  hasCompletedSurvey: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  hasCompletedSurvey: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  createAccount: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  setHasCompletedSurvey: (val: boolean) => void;
  loading: boolean;
  error: string | null;
  isInitialized: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [hasCompletedSurvey, setHasCompletedSurvey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem("auth_token");
    const storedUser = localStorage.getItem("auth_user");

    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }

    const surveyed = localStorage.getItem("homeapp_surveyed");
    if (surveyed === "true") setHasCompletedSurvey(true);

    // Mark as initialized to prevent premature redirects
    setIsInitialized(true);
  }, []);

  const login = async (email: string, password: string): Promise<LoginResult> => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.login(email, password);

      const userData: User = {
        id: response.user.id,
        name: response.user.username,
        email: response.user.email,
        username: response.user.username,
        archetype: response.user.archetype,
        currentSavings: response.user.currentSavings
      };

      setUser(userData);
      localStorage.setItem("auth_token", response.token);
      localStorage.setItem("auth_user", JSON.stringify(userData));

      // Check if user has survey responses
      let surveyCompleted = false;
      try {
        const responses = await api.getSurveyResponses();
        if (responses && Array.isArray(responses) && responses.length > 0) {
          surveyCompleted = true;
          setHasCompletedSurvey(true);
          localStorage.setItem("homeapp_surveyed", "true");
        }
      } catch (err) {
        console.log("No survey responses yet");
      }

      setLoading(false);
      return { success: true, hasCompletedSurvey: surveyCompleted };
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      setLoading(false);
      return { success: false, hasCompletedSurvey: false };
    }
  };

  const createAccount = async (name: string, email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.register({
        email,
        username: name,
        password,
        archetype: undefined
      });

      const userData: User = {
        id: response.user.id,
        name: response.user.username,
        email: response.user.email,
        username: response.user.username,
        archetype: response.user.archetype,
        currentSavings: response.user.currentSavings
      };

      setUser(userData);
      localStorage.setItem("auth_token", response.token);
      localStorage.setItem("auth_user", JSON.stringify(userData));

      setLoading(false);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
      setLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setHasCompletedSurvey(false);
    // Clear all user-specific data from localStorage
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    localStorage.removeItem("homeapp_surveyed");
    localStorage.removeItem("homeapp_survey");
    localStorage.removeItem("homeapp_steps");
    localStorage.removeItem("homeapp_saved");
    localStorage.removeItem("homeapp_timeline_commit");
  };

  const setSurveyed = (val: boolean) => {
    setHasCompletedSurvey(val);
    localStorage.setItem("homeapp_surveyed", val ? "true" : "false");
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoggedIn: !!user,
      hasCompletedSurvey,
      login,
      createAccount,
      logout,
      setHasCompletedSurvey: setSurveyed,
      loading,
      error,
      isInitialized
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be within AuthProvider");
  return ctx;
};
