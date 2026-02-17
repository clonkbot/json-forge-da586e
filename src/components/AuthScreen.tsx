import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";

export function AuthScreen() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    try {
      await signIn("password", formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAnonymous = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await signIn("anonymous");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to continue as guest");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-background">
        <div className="bg-shape shape-1"></div>
        <div className="bg-shape shape-2"></div>
        <div className="bg-shape shape-3"></div>
        <div className="grid-overlay"></div>
      </div>

      <div className="auth-container">
        <div className="auth-hero">
          <div className="hero-icon">
            <svg viewBox="0 0 64 64" fill="none">
              <rect x="8" y="4" width="48" height="56" rx="4" stroke="currentColor" strokeWidth="3"/>
              <path d="M20 20h24M20 32h24M20 44h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="48" cy="48" r="12" fill="currentColor"/>
              <path d="M44 48h8M48 44v8" stroke="#0a0a0f" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <h1 className="hero-title">JSON Forge</h1>
          <p className="hero-subtitle">Craft perfect JSON files for your iPhone apps</p>
          <div className="hero-features">
            <div className="feature-item">
              <span className="feature-icon">⚡</span>
              <span>AI-Powered Generation</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📱</span>
              <span>iPhone Optimized</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🔄</span>
              <span>Real-time Sync</span>
            </div>
          </div>
        </div>

        <div className="auth-card">
          <div className="auth-tabs">
            <button
              className={`auth-tab ${flow === "signIn" ? "active" : ""}`}
              onClick={() => setFlow("signIn")}
            >
              Sign In
            </button>
            <button
              className={`auth-tab ${flow === "signUp" ? "active" : ""}`}
              onClick={() => setFlow("signUp")}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="input-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>
            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                autoComplete={flow === "signIn" ? "current-password" : "new-password"}
              />
            </div>
            <input name="flow" type="hidden" value={flow} />

            {error && <div className="auth-error">{error}</div>}

            <button type="submit" className="auth-submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="btn-loading">Processing...</span>
              ) : (
                flow === "signIn" ? "Sign In" : "Create Account"
              )}
            </button>
          </form>

          <div className="auth-divider">
            <span>or</span>
          </div>

          <button
            onClick={handleAnonymous}
            className="guest-btn"
            disabled={isSubmitting}
          >
            Continue as Guest
          </button>
        </div>
      </div>

      <footer className="auth-footer">
        <p>Requested by @stringer_kade · Built by @clonkbot</p>
      </footer>
    </div>
  );
}
