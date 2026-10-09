import { createFileRoute, redirect, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import mainLogo from "../../assets/RIVET_main_logo_removebg.png";
import { useRivet } from "../lib/rivet/store";
import { isValidDemoEmail } from "../lib/rivet/demo-accounts";
import { CheckCircle2, Eye, EyeOff, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/sign-up")({
  component: SignUpPage,
});

function SignUpPage() {
  const searchParams = Route.useSearch() as any;
  const { departments } = useRivet();
  
  const [formData, setFormData] = useState({
    name: "",
    email: searchParams?.email || "",
    phone: "",
    password: "",
    departmentId: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Full Name is required.";
    if (!formData.email.trim()) newErrors.email = "Work Email is required.";
    else if (!isValidDemoEmail(formData.email)) {
      newErrors.email = "For this development phase, use an authorized demo account email (e.g. employee@rivet.com, manager@rivet.com, admin@rivet.com).";
    }
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required.";
    if (!formData.password) newErrors.password = "Password is required.";
    if (!formData.departmentId) newErrors.departmentId = "Department is required.";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setIsSuccess(true);
    }
  };

  if (isSuccess) {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center bg-surface px-4 py-12 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="absolute left-4 top-4 inline-flex items-center p-2 text-muted-foreground hover:text-foreground sm:left-6 sm:top-6"
          aria-label="Back to homepage"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="w-full max-w-md space-y-8 rounded-[20px] border border-border bg-background p-10 shadow-sm text-center">
          <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />
          <h2 className="mt-6 text-2xl font-bold tracking-tight text-foreground">
            Account Created
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Your RIVET account setup is complete. Please sign in to access your dashboard.
          </p>
          <div className="mt-8">
            <Link
              to="/sign-in"
              className="flex h-12 w-full items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary-hover"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-surface px-4 py-12 sm:px-6 lg:px-8">
      <Link
        to="/"
        className="absolute left-4 top-4 inline-flex items-center p-2 text-muted-foreground hover:text-foreground sm:left-6 sm:top-6"
        aria-label="Back to homepage"
      >
        <ArrowLeft className="h-5 w-5" />
      </Link>
      <div className="w-full max-w-md space-y-6 rounded-[20px] border border-border bg-background p-8 shadow-sm">
        <div className="flex flex-col items-center">
          <img src={mainLogo} alt="RIVET" className="h-12 w-auto object-contain" />
          <h2 className="mt-4 text-center text-xl font-bold tracking-tight text-foreground">
            Create your account
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Full Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                if (errors.name) setErrors({ ...errors, name: "" });
              }}
              className={`w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 ${errors.name ? 'border-red-500 focus:ring-red-200' : 'border-border focus:border-primary focus:ring-primary-light'}`}
            />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Work Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
                if (errors.email) setErrors({ ...errors, email: "" });
              }}
              className={`w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 ${errors.email ? 'border-red-500 focus:ring-red-200' : 'border-border focus:border-primary focus:ring-primary-light'}`}
            />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Phone *</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => {
                setFormData({ ...formData, phone: e.target.value });
                if (errors.phone) setErrors({ ...errors, phone: "" });
              }}
              className={`w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 ${errors.phone ? 'border-red-500 focus:ring-red-200' : 'border-border focus:border-primary focus:ring-primary-light'}`}
            />
            {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Password *</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                  if (errors.password) setErrors({ ...errors, password: "" });
                }}
                className={`w-full rounded-lg border bg-background px-3 py-2 pr-10 text-sm outline-none focus:ring-2 ${errors.password ? 'border-red-500 focus:ring-red-200' : 'border-border focus:border-primary focus:ring-primary-light'}`}
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
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Department *</label>
            <select
              value={formData.departmentId}
              onChange={(e) => {
                setFormData({ ...formData, departmentId: e.target.value });
                if (errors.departmentId) setErrors({ ...errors, departmentId: "" });
              }}
              className={`w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 ${errors.departmentId ? 'border-red-500 focus:ring-red-200' : 'border-border focus:border-primary focus:ring-primary-light'}`}
            >
              <option value="">Select a department...</option>
              {departments.filter(d => d.active && !d.deleted).map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            {errors.departmentId && <p className="mt-1 text-xs text-red-500">{errors.departmentId}</p>}
          </div>

          <button
            type="submit"
            className="mt-6 flex h-10 w-full items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary-hover"
          >
            Create account
          </button>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Already have an account? <Link to="/sign-in" className="font-medium text-primary hover:underline">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
