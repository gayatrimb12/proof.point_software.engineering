export function sortEvidence(items, sortOrder) {
  return [...items].sort((a, b) =>
    sortOrder === "Newest First"
      ? (b.date || "").localeCompare(a.date || "")
      : (a.date || "").localeCompare(b.date || "")
  );
}