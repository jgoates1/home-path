import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Home, Menu, X } from "lucide-react";

const AppHeader = () => {
  const { isLoggedIn, hasCompletedSurvey, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleHomeClick = () => {
    if (isLoggedIn && hasCompletedSurvey) {
      navigate("/dashboard");
    } else {
      navigate("/");
    }
  };

  const menuItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "My Profile", path: "/profile" },
    { label: "Survey Insights", path: "/survey-insights" },
  ];

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 bg-card shadow-sm border-b">
      <button onClick={handleHomeClick} className="p-2 rounded-lg hover:bg-secondary transition-colors" aria-label="Home">
        <Home className="w-6 h-6 text-primary" />
      </button>

      <h1 className="text-lg font-heading font-bold text-primary">HomeKey</h1>

      {isLoggedIn && hasCompletedSurvey ? (
        <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 rounded-lg hover:bg-secondary transition-colors" aria-label="Menu">
          {menuOpen ? <X className="w-6 h-6 text-foreground" /> : <Menu className="w-6 h-6 text-foreground" />}
        </button>
      ) : (
        <div className="w-10" />
      )}

      {/* Slide-out menu */}
      {menuOpen && (
        <>
          <div className="fixed inset-0 bg-foreground/20 z-40" onClick={() => setMenuOpen(false)} />
          <nav className="fixed top-0 right-0 h-full w-64 bg-card shadow-xl z-50 animate-slide-in flex flex-col p-6 pt-16">
            <button onClick={() => setMenuOpen(false)} className="absolute top-4 right-4 p-2 rounded-lg hover:bg-secondary">
              <X className="w-5 h-5" />
            </button>
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMenuOpen(false)}
                className={`py-3 px-4 rounded-lg text-base font-medium transition-colors mb-1 ${
                  location.pathname === item.path ? "bg-primary text-primary-foreground" : "hover:bg-secondary text-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-auto">
              <button
                onClick={() => {
                  logout();
                  setMenuOpen(false);
                  navigate("/");
                }}
                className="w-full py-3 px-4 rounded-lg text-base font-medium text-destructive hover:bg-destructive/10 transition-colors"
              >
                Logout
              </button>
            </div>
          </nav>
        </>
      )}
    </header>
  );
};

export default AppHeader;
