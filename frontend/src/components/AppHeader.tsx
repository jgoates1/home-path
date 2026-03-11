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
    <header className="sticky top-0 z-50 flex items-center justify-between px-5 py-3 bg-surface-container border-b border-border/60 backdrop-blur-sm">
      <button
        onClick={handleHomeClick}
        className="p-2 rounded-xl hover:bg-primary/10 transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        aria-label="Go to homepage"
      >
        <Home className="w-6 h-6 text-primary" />
      </button>

      <h1 className="text-lg font-heading font-bold tracking-tight">
        <span className="text-primary">Home</span>
        <span className="text-secondary">Key</span>
      </h1>

      {isLoggedIn ? (
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-2 rounded-xl hover:bg-primary/10 transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X className="w-6 h-6 text-foreground" /> : <Menu className="w-6 h-6 text-foreground" />}
        </button>
      ) : (
        <div className="w-10" />
      )}

      {/* Slide-out menu */}
      {menuOpen && (
        <>
          <div className="fixed inset-0 bg-foreground/30 backdrop-blur-sm z-40" onClick={() => setMenuOpen(false)} />
          <nav
            className="fixed top-0 right-0 h-full w-72 bg-card shadow-2xl z-50 animate-slide-in flex flex-col p-6 pt-16"
            role="navigation"
            aria-label="Main menu"
          >
            <button
              onClick={() => setMenuOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-xl hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMenuOpen(false)}
                className={`py-3 px-4 rounded-xl text-base font-medium transition-all mb-1 focus-visible:ring-2 focus-visible:ring-primary ${
                  location.pathname === item.path
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "hover:bg-surface-container-high text-foreground"
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
                className="w-full py-3 px-4 rounded-xl text-base font-medium text-destructive hover:bg-destructive/10 transition-colors focus-visible:ring-2 focus-visible:ring-destructive"
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
