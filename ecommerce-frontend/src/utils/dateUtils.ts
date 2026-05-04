/**
 * Parses any date value from the backend safely.
 *
 * Spring Boot's LocalDateTime WITHOUT jackson config serializes to an array:
 *   [2026, 5, 4, 14, 30, 22]  ← year, month, day, hour, min, sec
 * With our fix in application.properties it will now be an ISO string:
 *   "2026-05-04T14:30:22"
 * This utility handles BOTH formats + null/undefined/invalid.
 */
function parseDate(value: string | number | number[] | null | undefined): Date | null {
  if (!value && value !== 0) return null;

  // Handle array format: [2026, 5, 4, 14, 30, 22]
  if (Array.isArray(value)) {
    const [year, month, day, hour = 0, min = 0, sec = 0] = value;
    const d = new Date(year, month - 1, day, hour, min, sec); // month is 0-indexed in JS
    return Number.isNaN(d.getTime()) ? null : d;
  }

  const d = new Date(value as string | number);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatDate(value: string | number | number[] | null | undefined): string {
  const d = parseDate(value);
  if (!d) return "—";
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(value: string | number | number[] | null | undefined): string {
  const d = parseDate(value);
  if (!d) return "—";
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatTime(value: string | number | number[] | null | undefined): string {
  const d = parseDate(value);
  if (!d) return "—";
  return d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}
