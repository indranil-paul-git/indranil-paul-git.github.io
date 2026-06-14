/**
 * Utility functions for formatting dates.
 */

/**
 * Returns a relative time string (e.g., "today", "this week", "this month", "2 weeks ago", etc.)
 * representing the difference between the provided date and now.
 */
export function getRelativeTime(dateValue: Date | string): string {
  const d = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
  if (isNaN(d.getTime())) return "";

  const now = new Date();
  
  // Set both dates to UTC midnight to avoid timezone/day boundary issues
  const dUtc = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  const nowUtc = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const diffMs = nowUtc - dUtc;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return "soon";
  }
  if (diffDays === 0) {
    return "today";
  }
  if (diffDays < 7) {
    return "this week";
  }
  if (diffDays < 14) {
    return "2 weeks ago";
  }
  if (diffDays < 30) {
    return "this month";
  }
  if (diffDays < 60) {
    return "1 month ago";
  }
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} months ago`;
  }
  if (diffDays < 730) {
    return "last year";
  }
  const years = Math.floor(diffDays / 365);
  return `${years} years ago`;
}

/**
 * Formats a date into absolute 'dd mon yyyy' format (e.g., "12 Jun 2026").
 */
export function formatAbsoluteDate(dateValue: Date | string): string {
  const d = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
  if (isNaN(d.getTime())) return "";

  const day = String(d.getDate()).padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[d.getMonth()];
  const year = d.getFullYear();

  return `${day} ${month} ${year}`;
}
