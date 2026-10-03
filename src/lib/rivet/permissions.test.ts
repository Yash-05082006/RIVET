import { describe, expect, it } from "vitest";
import { users } from "./demo-data";
import { accessibleModules, canAccessPath, canModule } from "./permissions";

const u = (id: string) => users.find((x) => x.id === id)!;

describe("module access by department", () => {
  it("research employee sees only the Daily Activity Log", () => {
    expect(accessibleModules(u("u-emp-1")).map((m) => m.key)).toEqual(["daily-activity-log"]);
  });
  it("data management employee sees only Data Management modules", () => {
    expect(accessibleModules(u("u-emp-3")).every((m) => m.departmentId === "data-management")).toBe(true);
  });
  it("brand employee cannot open a research module by URL", () => {
    expect(canAccessPath(u("u-emp-5"), "/app/modules/daily-activity-log")).toBe(false);
  });
  it("manager spanning two departments sees both", () => {
    const depts = new Set(accessibleModules(u("u-mgr-data")).map((m) => m.departmentId));
    expect([...depts].sort()).toEqual(["brand-marketing", "data-management"]);
  });
  it("employee cannot create in webinar planner", () => {
    expect(canModule(u("u-emp-3"), "create", "webinar-series-planner")).toBe(false);
  });
});

describe("role-gated areas", () => {
  it("employee is blocked from approvals and admin", () => {
    expect(canAccessPath(u("u-emp-1"), "/app/approvals")).toBe(false);
    expect(canAccessPath(u("u-emp-1"), "/app/admin/users")).toBe(false);
  });
  it("manager can review but not administer", () => {
    expect(canAccessPath(u("u-mgr-research"), "/app/approvals")).toBe(true);
    expect(canAccessPath(u("u-mgr-research"), "/app/admin/users")).toBe(false);
  });
  it("admin reaches every module", () => {
    expect(canAccessPath(u("u-admin"), "/app/admin/audit")).toBe(true);
    expect(canModule(u("u-admin"), "view", "call-log")).toBe(true);
  });
});
