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
 *   status: 'online' | 'ausente' | 'offline',
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

/** @typedef {{ email: string, password: string }} ManagerCredentials */

/**
 * Public manager fields returned by `ManagerOut`. The backend does not include
 * `association_code` in this schema.
 * @typedef {{ id: string, email: string, created_at: string }} Manager
 */

/** @typedef {{ access_token: string, token_type: 'bearer', expires_in: number }} ManagerToken */

/** @typedef {'client' | 'server' | 'network' | 'timeout' | 'canceled' | 'invalid-response'} ApiErrorType */

/**
 * @typedef {Object} ApiClient
 * @property {(signal?: AbortSignal) => Promise<User[]>} users
 * @property {(signal?: AbortSignal) => Promise<RealtimeEntry[]>} realtime
 * @property {(date: string, username?: string, signal?: AbortSignal) => Promise<DailySummary>} summary
 * @property {(signal?: AbortSignal) => Promise<SystemSettings>} settings
 * @property {(payload: SystemSettings, signal?: AbortSignal) => Promise<SystemSettings>} saveSettings
 * @property {(format: 'csv' | 'pdf', date: string, username?: string, signal?: AbortSignal) => Promise<Blob>} exportFile
 * @property {(credentials: ManagerCredentials, signal?: AbortSignal) => Promise<Manager>} registerManager
 * @property {(credentials: ManagerCredentials, signal?: AbortSignal) => Promise<ManagerToken>} loginManager
 * @property {(accessToken: string, signal?: AbortSignal) => Promise<Manager>} getCurrentManager
 */

export {};
