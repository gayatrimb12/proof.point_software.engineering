import { test, expect } from "vitest";
import { sortEvidence } from "../utils/evidenceSorting";

// Test 4: Check that evidence sorts by date correctly
test("sorts evidence from newest to oldest", () => {
  const evidence = [
    { name: "Older Photo", date: "2026-10-20" },
    { name: "Newer Photo", date: "2026-10-29" },
  ];

  const sorted = sortEvidence(evidence, "Newest First");

  expect(sorted[0].name).toBe("Newer Photo");
  expect(sorted[1].name).toBe("Older Photo");
});

// Test 5: Check that evidence sorts by date correctly
test("sorts evidence from oldest to newest", () => {
  const evidence = [
    { name: "Older Photo", date: "2026-10-20" },
    { name: "Newer Photo", date: "2026-10-29" },
  ];

  const sorted = sortEvidence(evidence, "Oldest First");

  expect(sorted[0].name).toBe("Older Photo");
  expect(sorted[1].name).toBe("Newer Photo");
});
