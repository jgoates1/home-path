import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import dreamHome from "@/assets/dream-home.png";

const HomePage = () => {
  const navigate = useNavigate();
  const { isLoggedIn, hasCompletedSurvey } = useAuth();

  const handleGetStarted = () => {
    if (isLoggedIn && hasCompletedSurvey) {
      navigate("/dashboard");
    } else if (isLoggedIn) {
      navigate("/about");
    } else {
      navigate("/create-account");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-background">
      <div className="animate-fade-in flex flex-col items-center text-center max-w-md">
        <img src={dreamHome} alt="Your dream home" className="w-64 h-64 object-contain mb-8 drop-shadow-lg" />

        <h1 className="text-4xl font-heading font-extrabold text-foreground mb-3">
          Welcome to <span className="text-primary">HomeKey</span>
        </h1>

        <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
          Are you ready to start the journey to buy your dream home?
        </p>

        <button
          onClick={handleGetStarted}
          className="w-full py-4 rounded-xl bg-accent text-accent-foreground font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
        >
          Get Started
        </button>

        {!isLoggedIn && (
          <button
            onClick={() => navigate("/login")}
            className="mt-4 text-primary font-semibold hover:underline transition-colors"
          >
            Already have an account? Log in
          </button>
        )}
      </div>
    </div>
  );
};

export default HomePage;
