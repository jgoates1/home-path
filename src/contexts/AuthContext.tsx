import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  hasCompletedSurvey: boolean;
  login: (email: string, password: string) => boolean;
  createAccount: (name: string, email: string, password: string) => boolean;
  logout: () => void;
  setHasCompletedSurvey: (val: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [hasCompletedSurvey, setHasCompletedSurvey] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("homeapp_user");
    if (stored) {
      setUser(JSON.parse(stored));
    }
    const surveyed = localStorage.getItem("homeapp_surveyed");
    if (surveyed === "true") setHasCompletedSurvey(true);
  }, []);

  const login = (email: string, _password: string): boolean => {
    const storedAccounts = JSON.parse(localStorage.getItem("homeapp_accounts") || "[]");
    const found = storedAccounts.find((a: any) => a.email === email);
    const u = found ? { name: found.name, email } : { name: email.split("@")[0], email };
    setUser(u);
    localStorage.setItem("homeapp_user", JSON.stringify(u));
    const surveyed = localStorage.getItem("homeapp_surveyed");
    if (surveyed === "true") setHasCompletedSurvey(true);
    return true;
  };

  const createAccount = (name: string, email: string, _password: string): boolean => {
    const storedAccounts = JSON.parse(localStorage.getItem("homeapp_accounts") || "[]");
    storedAccounts.push({ name, email });
    localStorage.setItem("homeapp_accounts", JSON.stringify(storedAccounts));
    const u = { name, email };
    setUser(u);
    localStorage.setItem("homeapp_user", JSON.stringify(u));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("homeapp_user");
  };

  const setSurveyed = (val: boolean) => {
    setHasCompletedSurvey(val);
    localStorage.setItem("homeapp_surveyed", val ? "true" : "false");
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, hasCompletedSurvey, login, createAccount, logout, setHasCompletedSurvey: setSurveyed }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be within AuthProvider");
  return ctx;
};
