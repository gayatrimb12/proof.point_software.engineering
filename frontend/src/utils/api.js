const API_BASE = "http://localhost:5000/api";

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
