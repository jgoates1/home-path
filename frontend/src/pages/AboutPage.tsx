import React from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardCheck, Search, Home, TrendingUp } from "lucide-react";

const steps = [
  { icon: ClipboardCheck, title: "Take a Quick Survey", desc: "Answer a few questions about your finances and goals." },
  { icon: Search, title: "Get Personalized Steps", desc: "We'll create a custom roadmap just for you." },
  { icon: TrendingUp, title: "Track Your Progress", desc: "Check off tasks and watch your progress grow." },
  { icon: Home, title: "Buy Your Home!", desc: "Follow the steps and unlock the door to your new home." },
];

const AboutPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col px-6 py-8 bg-background">
      <div className="max-w-md mx-auto w-full animate-fade-in">
        <h1 className="text-3xl font-heading font-bold text-foreground mb-2 text-center">How It Works</h1>
        <p className="text-center text-muted-foreground mb-8">
          HomeKey guides you through every step of buying your first home.
        </p>

        <div className="space-y-4 mb-10">
          {steps.map((step, i) => (
            <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-card shadow-sm border">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <step.icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-base">{step.title}</h3>
                <p className="text-sm text-muted-foreground mt-0.5">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => navigate("/survey")}
          className="w-full py-4 rounded-xl bg-accent text-accent-foreground font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
        >
          Start Your Survey
        </button>
      </div>
    </div>
  );
};

export default AboutPage;
