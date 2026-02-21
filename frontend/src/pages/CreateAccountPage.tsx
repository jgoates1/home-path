import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff } from "lucide-react";

const CreateAccountPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [localError, setLocalError] = useState("");
  const { createAccount, loading, error: authError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");

    if (password !== confirmPassword) {
      setLocalError("Passwords don't match");
      return;
    }

    const success = await createAccount(name, email, password);
    if (success) {
      navigate("/about");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-background">
      <div className="w-full max-w-sm animate-fade-in">
        <h1 className="text-3xl font-heading font-bold text-center text-foreground mb-2">Create Account</h1>
        <p className="text-center text-muted-foreground mb-8">Start your home buying journey</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {(localError || authError) && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive text-destructive text-sm">
              {localError || authError}
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">Full Name</label>
            <input
              type="text" value={name} onChange={(e) => setName(e.target.value)} required
              disabled={loading}
              className="w-full px-4 py-3 rounded-xl border bg-card text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none transition disabled:opacity-50"
              placeholder="Jane Smith"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">Email</label>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              disabled={loading}
              className="w-full px-4 py-3 rounded-xl border bg-card text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none transition disabled:opacity-50"
              placeholder="you@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required
                disabled={loading}
                className="w-full px-4 py-3 rounded-xl border bg-card text-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none transition pr-12 disabled:opacity-50"
                placeholder="••••••••"
              />
              <button type="button" onClick={() => setShowPw(!showPw)} disabled={loading} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">Confirm Password</label>
            <input
              type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required
              disabled={loading}
              className="w-full px-4 py-3 rounded-xl border bg-card text-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none transition disabled:opacity-50"
              placeholder="••••••••"
            />
          </div>
          <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl bg-accent text-accent-foreground font-bold text-base shadow-md hover:shadow-lg hover:scale-[1.01] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center mt-6 text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-semibold hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default CreateAccountPage;
