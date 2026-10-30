/**
 * Formatting utilities for Kamala Beauty Parlor
 */

/**
 * Safely formats service duration to prevent duplicate 'min min'
 * Handles string with 'min', raw numbers, or multi-unit durations.
 */
export const formatDuration = (d?: string | number): string => {
  if (!d) return '30 min';
  let str = String(d).trim();
  // Strip any duplicate repetitions like 'min min' or 'min min min'
  str = str.replace(/\s*min(\s*min)+/gi, ' min');
  // If it already contains duration units (min, minutes, hr, hours, month, week)
  if (/\b(min|minutes|hr|hrs|hour|hours|month|months|week|weeks|day|days)\b/i.test(str)) {
    return str;
  }
  return `${str} min`;
};

/**
 * Parses numeric minutes from duration string or number
 */
export const parseDurationMinutes = (d?: string | number): number => {
  if (!d) return 30;
  const parsed = parseInt(String(d), 10);
  return isNaN(parsed) || parsed <= 0 ? 30 : parsed;
};
