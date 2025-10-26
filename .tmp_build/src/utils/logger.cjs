"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const env = typeof process !== 'undefined' && process.env ? process.env : {};
// Enable debug logs if DEBUG_LOGS is explicitly set to '1' or 'true'.
const isEnabled = () => env.DEBUG_LOGS === '1' || env.DEBUG_LOGS === 'true';
const levelPriority = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
};
// If running tests (NODE_ENV === 'test') default to error-only logging
// unless LOG_LEVEL is explicitly provided. This keeps test output cleaner.
const defaultLevel = (env.NODE_ENV === 'test' && !env.LOG_LEVEL) ? 'error' : (isEnabled() ? 'debug' : 'warn');
const currentLevel = env.LOG_LEVEL || defaultLevel;
function shouldLog(level) {
    return levelPriority[level] <= levelPriority[currentLevel];
}
exports.logger = {
    error: (...args) => {
        if (shouldLog('error')) {
            // eslint-disable-next-line no-console
            console.error('[ERROR]', ...args);
        }
    },
    warn: (...args) => {
        if (shouldLog('warn')) {
            // eslint-disable-next-line no-console
            console.warn('[WARN]', ...args);
        }
    },
    info: (...args) => {
        if (shouldLog('info')) {
            // eslint-disable-next-line no-console
            console.info('[INFO]', ...args);
        }
    },
    debug: (...args) => {
        if (isEnabled() && shouldLog('debug')) {
            // eslint-disable-next-line no-console
            console.log('[DEBUG]', ...args);
        }
    }
};
