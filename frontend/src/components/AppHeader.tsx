import React, { useState } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Home, Menu, X, Sun, Moon } from "lucide-react";

const AppHeader = () => {
  const { isLoggedIn, hasCompletedSurvey, logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
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
    ...(user?.adminFlag ? [{ label: "Admin Insights", path: "/admin-insights" }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between min-h-[64px] px-6 md:px-8 py-4 bg-background border-b border-border backdrop-blur-sm">
      <button
        onClick={handleHomeClick}
        className="p-3 -m-1 rounded-md hover:bg-muted/50 transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
        aria-label="Go to homepage"
      >
        <Home className="w-6 h-6 md:w-7 md:h-7 text-primary" />
      </button>

      <h1 className="text-xl md:text-2xl font-heading font-bold tracking-tight">
        <span className="text-primary">Home</span>
        <span className="text-secondary">Key</span>
      </h1>

      <div className="flex items-center gap-1">
        <button
          onClick={toggleTheme}
          className="p-3 -m-1 rounded-md hover:bg-muted/50 transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-foreground"
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? <Sun className="w-5 h-5 md:w-6 md:h-6" /> : <Moon className="w-5 h-5 md:w-6 md:h-6" />}
        </button>
        {isLoggedIn ? (
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-3 -m-1 rounded-md hover:bg-muted/50 transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="w-6 h-6 md:w-7 md:h-7 text-foreground" /> : <Menu className="w-6 h-6 md:w-7 md:h-7 text-foreground" />}
          </button>
        ) : (
          <div className="min-w-[44px] min-h-[44px]" aria-hidden="true" />
        )}
      </div>

      {/* Slide-out menu — portaled to body so it overlays full viewport */}
      {menuOpen &&
        createPortal(
          <>
            <div
              className="fixed inset-0 bg-foreground/50 backdrop-blur-sm z-[100]"
              onClick={() => setMenuOpen(false)}
              aria-hidden="true"
            />
            <nav
              className="fixed top-0 right-0 h-full w-72 sm:w-80 bg-card border-l border-border shadow-2xl z-[101] flex flex-col overflow-y-auto animate-slide-in"
              role="navigation"
              aria-label="Main menu"
            >
              <div className="flex items-center justify-between p-4 border-b border-border shrink-0 bg-surface-container">
                <span className="font-semibold text-foreground">Menu</span>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="p-2 rounded-md hover:bg-muted text-foreground focus-visible:ring-2 focus-visible:ring-primary"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 p-4 space-y-1 bg-card">
                {menuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMenuOpen(false)}
                    className={`block w-full py-3 px-4 rounded-md text-base font-medium transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                      location.pathname === item.path
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-surface-container-high text-foreground"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
              <div className="p-4 border-t border-border shrink-0 bg-surface-container">
                <button
                  onClick={() => {
                    logout();
                    setMenuOpen(false);
                    navigate("/");
                  }}
                  className="w-full py-3 px-4 rounded-md text-base font-medium text-destructive hover:bg-destructive/10 transition-colors focus-visible:ring-2 focus-visible:ring-destructive"
                >
                  Logout
                </button>
              </div>
            </nav>
          </>,
          document.body
        )}
    </header>
  );
};

export default AppHeader;
