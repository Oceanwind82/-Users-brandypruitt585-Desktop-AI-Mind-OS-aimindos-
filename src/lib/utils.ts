/**
 * Retry utility function with exponential backoff
 * Useful for handling transient failures in API calls, database operations, etc.
 */
export async function retry<T>(fn: () => Promise<T>, n = 3, delay = 500): Promise<T> {
  let err: unknown;
  for (let i = 0; i < n; i++) {
    try {
      return await fn();
    } catch (e) {
      err = e;
      if (i < n - 1) { // Don't delay on the last attempt
        await new Promise(r => setTimeout(r, delay * (i + 1)));
      }
    }
  }
  throw err;
}

/**
 * Sleep utility function
 * @param ms - milliseconds to sleep
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Format time duration in a human-readable format
 * @param seconds - duration in seconds
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}min`;
  return `${Math.round(seconds / 3600)}h`;
}

/**
 * Sanitize string for use in notifications (remove special characters that might break formatting)
 */
export function sanitizeForNotification(text: string): string {
  return text.replace(/[_*[\]()~`>#+=|{}.!-]/g, '\\$&');
}
