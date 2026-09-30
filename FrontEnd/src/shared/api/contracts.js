/**
 * API response fields consumed by this frontend. Fields marked optional are not
 * guaranteed by the current runtime validators, even when FastAPI emits them.
 *
 * @typedef {Object} User
 * @property {string} username
 * @property {string | null} [id]
 * @property {string | null} [full_name]
 * @property {string | null} [department]
 * @property {string | null} [created_at]
 */

/**
 * @typedef {User & {
 *   status: 'online' | 'ausente',
 *   seconds_since_last_activity: number,
 *   hostname?: string | null,
 *   process_name?: string | null,
 *   window_title?: string | null,
 *   category?: string | null,
 *   is_idle?: boolean
 * }} RealtimeEntry
 */

/**
 * @typedef {{ category: string, total_seconds: number, color?: string }} CategorySummary
 */

/**
 * @typedef {{ username: string, total_seconds: number, by_category: CategorySummary[] }} UserDailySummary
 */

/**
 * @typedef {{ date: string, users: UserDailySummary[] }} DailySummary
 */

/**
 * @typedef {{ capture_interval_seconds: number, idle_timeout_seconds: number, updated_at?: string | null }} SystemSettings
 */

/** @typedef {'client' | 'server' | 'network' | 'timeout' | 'canceled' | 'invalid-response'} ApiErrorType */

/**
 * @typedef {Object} ApiClient
 * @property {(signal?: AbortSignal) => Promise<User[]>} users
 * @property {(signal?: AbortSignal) => Promise<RealtimeEntry[]>} realtime
 * @property {(date: string, username?: string, signal?: AbortSignal) => Promise<DailySummary>} summary
 * @property {(signal?: AbortSignal) => Promise<SystemSettings>} settings
 * @property {(payload: SystemSettings, signal?: AbortSignal) => Promise<SystemSettings>} saveSettings
 * @property {(format: 'csv' | 'pdf', date: string, username?: string, signal?: AbortSignal) => Promise<Blob>} exportFile
 */

export {};
