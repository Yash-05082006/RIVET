import { describe, expect, it } from "vitest";
import { formatDate, matchesEntryDateRange, parseDisplayDate } from "./formatDate";

describe("RIVET date inputs", () => {
  it("round-trips a date without applying a timezone offset", () => {
    const date = parseDisplayDate("28/11/2026");
    expect(date).toBe("2026-11-28");
    expect(formatDate(date)).toBe("28/11/2026");
  });

  it("rejects invalid calendar dates while allowing an empty optional field", () => {
    expect(parseDisplayDate("31/11/2026")).toBeNull();
    expect(parseDisplayDate("29/02/2025")).toBeNull();
    expect(parseDisplayDate("29/02/2024")).toBe("2024-02-29");
    expect(parseDisplayDate("")).toBe("");
  });

  it("retains month-only storage and matches a date within that month", () => {
    expect(parseDisplayDate("28/11/2026", true)).toBe("2026-11");
    expect(matchesEntryDateRange("2026-11", "2026-11-28", "2026-11-28")).toBe(true);
  });
});
