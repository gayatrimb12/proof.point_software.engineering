
const STORAGE_KEY = "proofpointEvidence";

export function getEvidence() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function getEvidenceById(caseId, evidenceId) {
  return getEvidence().find(
    (item) =>
      String(item.caseId) === String(caseId) &&
      String(item.id) === String(evidenceId)
  );
}

export function saveEvidence(evidence) {
  const items = getEvidence();

  const newEvidence = {
    ...evidence,
    id: crypto.randomUUID(),
  };

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify([...items, newEvidence])
  );

  return newEvidence;
}

export function updateEvidence(caseId, evidenceId, updatedData) {
  const items = getEvidence();

  const updatedItems = items.map((item) => {
    if (
      String(item.caseId) === String(caseId) &&
      String(item.id) === String(evidenceId)
    ) {
      return { ...item, ...updatedData };
    }

    return item;
  });

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(updatedItems)
  );

  return updatedItems.find(
    (item) =>
      String(item.caseId) === String(caseId) &&
      String(item.id) === String(evidenceId)
  );
}
