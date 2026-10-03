import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useRivet } from "../lib/rivet/store";
import { authenticate } from "../lib/rivet/demo-accounts";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import mainLogo from "../../assets/RIVET_main_logo_removebg.png";


export const Route = createFileRoute("/sign-in")({
  component: SignInPage,
});

function SignInPage() {
  const { signIn } = useRivet();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setIsAuthenticating(true);
    setError("");

    // Simulate network delay
    setTimeout(() => {
      const e = email.toLowerCase().trim();
      const p = password;

      const userId = authenticate(e, p);


      if (userId) {


        signIn(userId);


        navigate({ to: "/app/dashboard" });


      } else {
        setError("Invalid credentials.");
        setIsAuthenticating(false);
      }
    }, 600);
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

        <form onSubmit={handleSignIn} className="mt-8 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError("");
              }}
              className={`w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 ${error ? 'border-red-500 focus:ring-red-200' : 'border-border focus:border-primary focus:ring-primary-light'}`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError("");
                }}
                className={`w-full rounded-lg border bg-background px-3 py-2 pr-10 text-sm outline-none focus:ring-2 ${error ? 'border-red-500 focus:ring-red-200' : 'border-border focus:border-primary focus:ring-primary-light'}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[0.6rem] text-muted-foreground hover:text-foreground focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={isAuthenticating}
            className="flex h-12 w-full items-center justify-center gap-3 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary-hover hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed mt-6"
          >
            {isAuthenticating ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white"></span>
                Signing in...
              </span>
            ) : (
              "Sign in"
            )}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-xs text-muted-foreground">
            Don't have an account? <Link to="/sign-up" className="font-medium text-primary hover:underline">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
