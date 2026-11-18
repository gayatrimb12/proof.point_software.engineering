const API_BASE = "http://127.0.0.1:5000/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    ...options,
    headers: {
      ...(options.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.error || "Something went wrong."
    );
  }

  return data;
}

export function getCases() {
  return request("/cases");
}

export function getCaseById(caseId) {
  return request(`/cases/${caseId}`);
}

export function getCaseEvidence(caseId) {
  return request(`/cases/${caseId}/evidence`);
}

export function getCaseTimeline(caseId) {
  return request(`/cases/${caseId}/timeline`);
}

export function updateCase(caseId, updates) {
  return request(`/cases/${caseId}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
}

export function deleteCase(caseId) {
  return request(`/cases/${caseId}`, {
    method: "DELETE",
  });
}

export function uploadEvidence(caseId, formData) {
  return request(`/cases/${caseId}/evidence`, {
    method: "POST",
    body: formData,
  });
}

export function createTimelineEvent(caseId, data) {
  return request(`/cases/${caseId}/timeline`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateTimelineEvent(caseId, eventId, data) {
  return request(`/cases/${caseId}/timeline/${eventId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deleteTimelineEvent(caseId, eventId) {
  return request(`/cases/${caseId}/timeline/${eventId}`, {
    method: "DELETE",
  });
}

export function createCase(data) {
  return request("/cases", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getEvidenceById(evidenceId) {
  return request(`/evidence/${evidenceId}`);
}

export function deleteEvidence(evidenceId) {
  return request(`/evidence/${evidenceId}`, {
    method: "DELETE",
  });
}

export function updateEvidence(evidenceId, data) {
  return request(`/evidence/${evidenceId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}