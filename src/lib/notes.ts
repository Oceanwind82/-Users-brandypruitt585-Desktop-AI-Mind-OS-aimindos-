/**
 * Robustly parse JSON arrays from AI output that may include
 * stray text before/after the JSON block.
 */
export function parseNotesJson(raw: string): string[] {
  if (!raw) return [];
  const start = raw.indexOf('[');
  const end = raw.lastIndexOf(']');
  if (start === -1 || end === -1 || end < start) return [];
  const slice = raw.slice(start, end + 1);
  try {
    const parsed = JSON.parse(slice);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}
