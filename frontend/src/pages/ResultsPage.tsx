import React from "react";
import { useNavigate } from "react-router-dom";
import { useSurvey } from "@/contexts/SurveyContext";
import { Search, Zap, Clock, Compass } from "lucide-react";

const typeConfig: Record<string, { icon: React.ElementType; color: string; tagline: string; tips: string[] }> = {
  "Ready Buyer": {
    icon: Zap,
    color: "text-accent",
    tagline: "You're ready to start looking for a home!",
    tips: [
      "Look for assumable loan opportunities (potentially lower interest rates)",
      "Picking a good Realtor is important. Choose one that you trust — and like!",
      "Consider getting pre-approved ASAP to strengthen your offers",
    ],
  },
  Searcher: {
    icon: Search,
    color: "text-primary",
    tagline: "You're in a great position to start your search!",
    tips: [
      "Start researching neighborhoods that fit your lifestyle",
      "Consider changing your spending habits to save more for a down payment",
      "You need to like your Realtor! Choose someone you feel comfortable with and can trust",
    ],
  },
  Planner: {
    icon: Clock,
    color: "text-warning",
    tagline: "You have time to plan and prepare!",
    tips: [
      "Focus on boosting your credit score over the next few months",
      "Set up automatic savings transfers for your down payment fund",
      "Start exploring loan options and understand what you can afford",
    ],
  },
  Explorer: {
    icon: Compass,
    color: "text-muted-foreground",
    tagline: "Let's start building your path to homeownership!",
    tips: [
      "Begin by understanding your finances and what you can afford",
      "Explore different neighborhoods and housing types",
      "Talk to friends and family who've bought homes for advice",
    ],
  },
};

const ResultsPage = () => {
  const { buyerType } = useSurvey();
  const navigate = useNavigate();
  const config = typeConfig[buyerType] || typeConfig["Explorer"];
  const Icon = config.icon;

  return (
    <div className="min-h-screen flex flex-col items-center px-6 py-10 bg-background">
      <div className="max-w-md w-full animate-fade-in text-center">
        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <Icon className={`w-12 h-12 ${config.color}`} />
        </div>

        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-1">You are a</p>
        <h1 className="text-4xl font-heading font-extrabold text-foreground mb-3">{buyerType.toUpperCase()}</h1>
        <p className="text-lg text-muted-foreground mb-8">{config.tagline}</p>

        <div className="bg-card rounded-2xl p-6 shadow-sm border text-left mb-8">
          <h3 className="font-bold text-foreground mb-4">Personalized tips for you:</h3>
          <ul className="space-y-3">
            {config.tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                <span className="text-sm text-foreground leading-relaxed">{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        <button
          onClick={() => navigate("/timeline")}
          className="w-full py-4 rounded-xl bg-accent text-accent-foreground font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
        >
          Commit to Your Timeline
        </button>
      </div>
    </div>
  );
};

export default ResultsPage;
