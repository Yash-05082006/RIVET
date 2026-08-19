import { createFileRoute } from "@tanstack/react-router";
import { useCurrentUser } from "../../lib/rivet/store";
import { EmployeeDashboard } from "../../components/dashboard/EmployeeDashboard";
import { ManagerDashboard } from "../../components/dashboard/ManagerDashboard";
import { AdminDashboard } from "../../components/dashboard/AdminDashboard";

export const Route = createFileRoute("/app/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const user = useCurrentUser();

  switch (user.role) {
    case "admin":
      return <AdminDashboard />;
    case "manager":
      return <ManagerDashboard />;
    case "employee":
    default:
      return <EmployeeDashboard />;
  }
}
