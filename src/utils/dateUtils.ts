/**
 * Clean, unified journal-style date & time formatting utilities.
 * Ensures consistent local timezone display across creation, history, and timeline.
 */

/**
 * Format local date in journal style, e.g.: "06 September 2026"
 */
export function formatLocalDate(dateInput?: string | Date): string {
  const d = !dateInput ? new Date() : typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return '';
  const day = String(d.getDate()).padStart(2, '0');
  const month = d.toLocaleDateString('en-US', { month: 'long' });
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

/**
 * Format local time in 12-hour journal style, e.g.: "01:42 PM"
 */
export function formatLocalTime(dateInput?: string | Date): string {
  const d = !dateInput ? new Date() : typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Format combined local date and time in journal style:
 * e.g.: "06 September 2026 · 01:42 PM"
 */
export function formatJournalDateTime(dateInput?: string | Date): string {
  const d = !dateInput ? new Date() : typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return '';
  const datePart = formatLocalDate(d);
  const timePart = formatLocalTime(d);
  return `${datePart} · ${timePart}`;
}

/**
 * Get display timestamp from a journal entry, using explicit saved fields if present,
 * or falling back to the saved ISO createdAt timestamp.
 */
export function getEntryDisplayTimestamp(entry: {
  createdAt: string;
  entryDate?: string;
  entryTime?: string;
}): string {
  if (entry.entryDate && entry.entryTime) {
    return `${entry.entryDate} · ${entry.entryTime}`;
  }
  return formatJournalDateTime(entry.createdAt);
}
