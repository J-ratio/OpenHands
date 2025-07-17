export function formatDateTime(dateString: string) {
  if (!dateString) return "";
  // If the string does not contain a timezone, treat it as UTC by appending 'Z'
  const normalized = /[zZ]|[+-]\d{2}:?\d{2}$/.test(dateString)
    ? dateString
    : dateString + "Z";
  const date = new Date(normalized);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}
