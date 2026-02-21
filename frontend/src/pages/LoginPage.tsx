import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSurvey } from "@/contexts/SurveyContext";
import { Eye, EyeOff } from "lucide-react";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const { login, hasCompletedSurvey, loading, error } = useAuth();
  const { reloadUserData } = useSurvey();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result.success) {
      // Reload user-specific data from database
      await reloadUserData();
      navigate(result.hasCompletedSurvey ? "/dashboard" : "/about");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-background">
      <div className="w-full max-w-sm animate-fade-in">
        <h1 className="text-3xl font-heading font-bold text-center text-foreground mb-2">Welcome back!</h1>
        <p className="text-center text-muted-foreground mb-8">Log in to continue your journey</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive text-destructive text-sm">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="w-full px-4 py-3 rounded-xl border bg-card text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none transition disabled:opacity-50"
              placeholder="you@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="w-full px-4 py-3 rounded-xl border bg-card text-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none transition pr-12 disabled:opacity-50"
                placeholder="••••••••"
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" disabled={loading}>
                {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-base shadow-md hover:shadow-lg hover:scale-[1.01] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <p className="text-center mt-6 text-muted-foreground">
          Don't have an account?{" "}
          <Link to="/create-account" className="text-primary font-semibold hover:underline">
            Get started here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
