import { expect, it } from "vitest";
import { entryDisplayId, highestEntryNumber } from "./entryId";

it("uses readable IDs without renumbering legacy entries or changing technical IDs", () => {
  const legacy = { id: "E-1055" };
  const current = { id: "a9466ca4-42ca-4727-a2c1-0f297da3bb85", displayId: "E-1056" };
  expect(entryDisplayId(legacy)).toBe("E-1055");
  expect(entryDisplayId(current)).toBe("E-1056");
  expect(highestEntryNumber([legacy, current, { id: "w-9999" }])).toBe(1056);
});
