import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useRivet, DEMO_USER_BY_ROLE } from "../lib/rivet/store";
import { useEffect, useState } from "react";
import mainLogo from "../../assets/RIVET_main_logo_removebg.png";

export const Route = createFileRoute("/sign-in")({
  beforeLoad: () => {
    // Basic route protection via localStorage since real backend/cookies aren't wired yet.
    // We check typeof window to prevent SSR crashes.
    if (typeof window !== "undefined") {
      const storedId = window.localStorage.getItem("rivet.session.userId");
      if (storedId) {
        throw redirect({ to: "/app/dashboard" });
      }
    }
  },
  component: SignInPage,
});

function GoogleIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59A14.5 14.5 0 0 1 9.77 24c0-1.6.28-3.14.76-4.59l-7.98-6.19A23.94 23.94 0 0 0 0 24c0 3.88.93 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.9-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.17 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

function SignInPage() {
  const { signIn, ready, user } = useRivet();
  const navigate = useNavigate();
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Fallback protection if beforeLoad is skipped during some hydration edge-cases
  useEffect(() => {
    if (ready && user) {
      navigate({ to: "/app/dashboard", replace: true });
    }
  }, [ready, user, navigate]);

  const handleGoogleSignIn = () => {
    setIsAuthenticating(true);
    
    // Simulate network delay for OAuth redirect & callback
    setTimeout(() => {
      // TEMPORARY: Sign in as employee for development testing.
      // This will be replaced with real Google OAuth validation.
      signIn(DEMO_USER_BY_ROLE["employee"]);
      navigate({ to: "/app/dashboard" });
    }, 800);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-[20px] border border-border bg-background p-10 shadow-sm">
        <div className="flex flex-col items-center">
          <img src={mainLogo} alt="RIVET" className="h-16 w-auto object-contain" />
          <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-foreground">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Welcome back to your workspace.
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <button
            onClick={handleGoogleSignIn}
            disabled={isAuthenticating}
            className="flex h-12 w-full items-center justify-center gap-3 rounded-lg border border-border bg-background px-6 text-sm font-semibold text-foreground transition-all hover:border-foreground/25 hover:bg-surface hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAuthenticating ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></span>
                Authenticating...
              </span>
            ) : (
              <>
                <GoogleIcon className="h-5 w-5" />
                Continue with Google
              </>
            )}
          </button>

          <div className="text-center">
            <p className="text-xs text-muted-foreground bg-primary-light/50 border border-primary/20 rounded-md p-3 text-left">
              <strong className="block text-primary mb-1">Development Mode</strong>
              Real Google OAuth is not currently connected. Clicking this button will securely simulate a successful authentication and sign you in to the application.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
