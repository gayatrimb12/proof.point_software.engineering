
import { test, expect, vi } from "vitest";
import {
  saveEvidence,
  getEvidenceById,
  updateEvidence,
} from "../utils/evidenceStorage";

// Test 1: Check that evidence saves correctly
test("saves evidence information correctly", () => {
  const storage = {};

  vi.stubGlobal("localStorage", {
    getItem: (key) => storage[key] ?? null,
    setItem: (key, value) => {
      storage[key] = value;
    },
  });

  try {
    const evidence = saveEvidence({
      caseId: "1",
      name: "Test Photo",
      type: "Photo",
      date: "2026-10-29",
      description: "Photo showing apartment damage",
    });

    expect(evidence.name).toBe("Test Photo");
    expect(evidence.type).toBe("Photo");
    expect(evidence.id).toBeDefined();

    const savedItems = JSON.parse(storage.proofpointEvidence);
    expect(savedItems).toHaveLength(1);
  } finally {
    vi.unstubAllGlobals();
  }
});

// Test 2: Check that saved evidence can be found by ID
test("finds saved evidence using its ID", () => {
  const storage = {};

  vi.stubGlobal("localStorage", {
    getItem: (key) => storage[key] ?? null,
    setItem: (key, value) => {
      storage[key] = value;
    },
  });

  try {
    const evidence = saveEvidence({
      caseId: "1",
      name: "Damage Photo",
      type: "Photo",
      date: "2026-10-29",
      description: "Apartment damage",
    });

    const foundEvidence = getEvidenceById("1", evidence.id);

    expect(foundEvidence).toEqual(evidence);
    expect(getEvidenceById("2", evidence.id)).toBeUndefined();
  } finally {
    vi.unstubAllGlobals();
  }
});

// Test 3: Check that evidence editing works correctly
test("updates evidence information correctly", () => {
  const storage = {};

  vi.stubGlobal("localStorage", {
    getItem: (key) => storage[key] ?? null,
    setItem: (key, value) => {
      storage[key] = value;
    },
  });

  try {
    const evidence = saveEvidence({
      caseId: "1",
      name: "Original Photo",
      type: "Photo",
      description: "Original description",
    });

    updateEvidence("1", evidence.id, {
      name: "Updated Photo",
      description: "Updated description",
    });

    const updated = getEvidenceById("1", evidence.id);

    expect(updated.name).toBe("Updated Photo");
    expect(updated.description).toBe("Updated description");
  } finally {
    vi.unstubAllGlobals();
  }
});
