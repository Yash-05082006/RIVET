/**
 * Temporary sign-in directory until production authentication lands.
 * Credentials only identify an account; role and departments always come
 * from the user record in demo-data, never from the email or password text.
 */

export interface DemoAccount {
  email: string;
  password: string;
  userId: string;
}

export const demoAccounts: DemoAccount[] = [
  { email: "employee@rivet.com", password: "employee@123", userId: "u-emp-1" },
  { email: "manager@rivet.com", password: "manager@123", userId: "u-mgr-research" },
  { email: "admin@rivet.com", password: "admin@123", userId: "u-admin" },
  { email: "research.employee@rivet.com", password: "employee@123", userId: "u-emp-1" },
  { email: "data.employee@rivet.com", password: "employee@123", userId: "u-emp-3" },
  { email: "brand.employee@rivet.com", password: "employee@123", userId: "u-emp-5" },
  { email: "research.manager@rivet.com", password: "manager@123", userId: "u-mgr-research" },
  { email: "data.manager@rivet.com", password: "manager@123", userId: "u-mgr-data" },
  { email: "brand.manager@rivet.com", password: "manager@123", userId: "u-mgr-brand" },
];

export function authenticate(email: string, password: string): string | null {
  const e = email.toLowerCase().trim();
  return demoAccounts.find((a) => a.email === e && a.password === password)?.userId ?? null;
}
