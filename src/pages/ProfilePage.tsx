import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSurvey } from "@/contexts/SurveyContext";
import { User } from "lucide-react";

const ProfilePage = () => {
  const { user } = useAuth();
  const { buyerType, committedTimeline, getCompletionPercent } = useSurvey();

  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="max-w-md mx-auto px-6 py-8 animate-fade-in">
        <h1 className="text-3xl font-heading font-bold text-center text-foreground mb-8">Your Profile</h1>

        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <User className="w-12 h-12 text-primary" />
          </div>
        </div>

        <div className="bg-card rounded-2xl p-6 shadow-sm border space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Name</label>
            <p className="text-lg font-semibold text-foreground">{user?.name || "—"}</p>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Email</label>
            <p className="text-lg font-semibold text-foreground">{user?.email || "—"}</p>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Buyer Type</label>
            <p className="text-lg font-semibold text-primary">{buyerType}</p>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Timeline Goal</label>
            <p className="text-lg font-semibold text-foreground">{committedTimeline || "Not set"}</p>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Overall Progress</label>
            <p className="text-lg font-semibold text-accent">{getCompletionPercent()}%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
