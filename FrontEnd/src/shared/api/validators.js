import { isIsoDate } from '../lib/dashboard';

function optionalText(value) {
  return value == null || typeof value === 'string';
}

function uniqueUsers(value) {
  return (
    Array.isArray(value) &&
    value.every((user) => user && typeof user.username === 'string' && user.username.length > 0) &&
    new Set(value.map((user) => user.username)).size === value.length
  );
}

export function validUsers(value) {
  return (
    uniqueUsers(value) &&
    value.every((user) => optionalText(user.full_name) && optionalText(user.department))
  );
}

export function validRealtime(value) {
  return (
    uniqueUsers(value) &&
    value.every(
      (entry) =>
        ['online', 'ausente'].includes(entry.status) &&
        Number.isSafeInteger(entry.seconds_since_last_activity) &&
        entry.seconds_since_last_activity >= 0 &&
        optionalText(entry.process_name) &&
        optionalText(entry.window_title) &&
        optionalText(entry.hostname) &&
        optionalText(entry.category),
    )
  );
}

export function validSummary(value) {
  return (
    value &&
    isIsoDate(value.date) &&
    uniqueUsers(value.users) &&
    value.users.every(
      (user) =>
        Number.isSafeInteger(user.total_seconds) &&
        user.total_seconds >= 0 &&
        Array.isArray(user.by_category) &&
        user.by_category.every(
          (category) =>
            category &&
            typeof category.category === 'string' &&
            Number.isSafeInteger(category.total_seconds) &&
            category.total_seconds >= 0,
        ),
    )
  );
}

export function validSettings(value) {
  return (
    Number.isSafeInteger(value?.capture_interval_seconds) &&
    value.capture_interval_seconds > 0 &&
    Number.isSafeInteger(value?.idle_timeout_seconds) &&
    value.idle_timeout_seconds > 0
  );
}
