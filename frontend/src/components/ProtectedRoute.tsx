import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn, isInitialized } = useAuth();

  // Wait for auth to initialize before redirecting
  if (!isInitialized) {
    return null; // or a loading spinner
  }

  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

export default ProtectedRoute;
