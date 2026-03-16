import React from "react";
import { useNavigate } from "react-router-dom";

const ResultsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-10 bg-background">
      <div className="max-w-md w-full animate-fade-in text-center">
        <h1 className="text-3xl font-heading font-bold text-foreground mb-4">Plan Generated!</h1>
        <p className="text-muted-foreground mb-8">Your personalized homebuying plan is ready.</p>
        <button
          onClick={() => navigate("/dashboard")}
          className="w-full py-4 rounded-xl bg-accent text-accent-foreground font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
        >
          View My Dashboard
        </button>
      </div>
    </div>
  );
};

export default ResultsPage;
