import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSurvey } from "@/contexts/SurveyContext";
import { User } from "lucide-react";

const ProfilePage = () => {
  const { user } = useAuth();
  const { getCompletionPercent, planMetrics } = useSurvey();

  return (
    <div className="flex flex-col items-center justify-center min-h-0 h-[calc(100vh-80px)] bg-background overflow-hidden">
      <div className="max-w-md w-full mx-auto px-2 py-4 animate-fade-in">
        <h1 className="text-3xl font-heading font-bold text-center text-foreground mb-8">{user?.name || "Profile"}</h1>

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
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Overall Progress</label>
            <p className="text-lg font-semibold text-accent">{getCompletionPercent()}%</p>
          </div>
          {planMetrics && (
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Target Down Payment</label>
              <p className="text-lg font-semibold text-foreground">${Math.round(planMetrics.down_payment_amount).toLocaleString()}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
