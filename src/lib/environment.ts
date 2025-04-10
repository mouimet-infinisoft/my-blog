/**
 * Utility functions for environment detection
 */

/**
 * Checks if the application is running in production mode
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Checks if the application is running in development mode
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * Checks if the application is running on localhost
 */
export function isLocalhost(): boolean {
  if (typeof window === 'undefined') {
    return false; // Server-side rendering
  }
  return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
}

/**
 * Checks if the application is running in development mode and on localhost
 */
export function isLocalDevelopment(): boolean {
  return isDevelopment() && isLocalhost();
}
