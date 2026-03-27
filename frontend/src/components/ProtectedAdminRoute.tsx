import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const ProtectedAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn, isInitialized, user } = useAuth();

  if (!isInitialized) {
    return null;
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (!user?.adminFlag) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedAdminRoute;
