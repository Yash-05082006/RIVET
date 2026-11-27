import { describe, expect, it } from "vitest";
import { users } from "./demo-data";
import { accessibleModules, canAccessPath, canDecideEntry, canModule, canReviewEntry, canViewEntry, canEditEntry } from "./permissions";
import { logEntries } from "./demo-data";

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

describe("approval permissions and transitions", () => {
  const pendingResearch = logEntries.find((entry) => entry.id === "E-1044");
  const pendingData = logEntries.find((entry) => entry.id === "E-1045");
  const approvedData = logEntries.find((entry) => entry.id === "E-1046");
  const sharedWebinar = {
    ...pendingData!,
    moduleKey: "webinar-series-planner",
    authorId: "u-mgr-data",
    status: "approved" as const,
  };

  it("keeps managers inside their assigned departments", () => {
    expect(pendingResearch && canReviewEntry(u("u-mgr-data"), pendingResearch)).toBe(false);
    expect(pendingData && canReviewEntry(u("u-mgr-data"), pendingData)).toBe(true);
    expect(pendingResearch && canReviewEntry(u("u-admin"), pendingResearch)).toBe(true);
  });

  it("does not treat shared webinar records as personal approval submissions", () => {
    expect(canReviewEntry(u("u-mgr-data"), sharedWebinar)).toBe(false);
  });

  it("keeps private drafts visible to the owner and out of manager review", () => {
    const draft = logEntries.find((entry) => entry.id === "E-1042")!;
    expect(canViewEntry(u("u-emp-1"), draft)).toBe(true);
    expect(canViewEntry(u("u-mgr-research"), draft)).toBe(false);
    expect(canReviewEntry(u("u-mgr-research"), draft)).toBe(false);
  });

  it("allows scoped read-only webinar access and maintenance by managers", () => {
    expect(canViewEntry(u("u-emp-3"), sharedWebinar)).toBe(true);
    expect(canViewEntry(u("u-emp-1"), sharedWebinar)).toBe(false);
    expect(canEditEntry(u("u-emp-3"), sharedWebinar)).toBe(false);
    expect(canEditEntry(u("u-mgr-data"), sharedWebinar)).toBe(true);
  });

  it("allows only pending decisions and requires a rejection remark", () => {
    expect(pendingData && canDecideEntry(u("u-mgr-data"), pendingData, "approved")).toBe(true);
    expect(pendingData && canDecideEntry(u("u-mgr-data"), pendingData, "rejected", "  ")).toBe(false);
    expect(pendingData && canDecideEntry(u("u-mgr-data"), pendingData, "rejected", "Please correct counts")).toBe(true);
    expect(approvedData && canDecideEntry(u("u-mgr-data"), approvedData, "approved")).toBe(false);
  });
});
