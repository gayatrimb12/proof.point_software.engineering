const STORAGE_KEY = "proofpointCollaborators";

export function getCollaborators(caseId) {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return saved[String(caseId)] || [];
  } catch {
    return [];
  }
}

export function saveCollaborators(caseId, collaborators) {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");

    saved[String(caseId)] = collaborators;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  } catch (error) {
    console.error("Could not save collaborators:", error);
  }
}
