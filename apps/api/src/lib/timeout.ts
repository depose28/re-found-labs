import { createLogger } from './logger';

const log = createLogger('lib:timeout');

/**
 * Wraps a promise with a timeout. If the promise doesn't resolve within the
 * specified time, returns the default value instead.
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  defaultValue: T,
  label: string
): Promise<T> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      log.warn({ label, timeoutMs }, 'Operation timed out');
      resolve(defaultValue);
    }, timeoutMs);

    promise
      .then((result) => {
        clearTimeout(timer);
        resolve(result);
      })
      .catch((error) => {
        clearTimeout(timer);
        log.warn({ label, error: error.message }, 'Operation failed');
        resolve(defaultValue);
      });
  });
}

/**
 * Creates an AbortController with automatic timeout
 */
export function createTimeoutController(timeoutMs: number): {
  controller: AbortController;
  clear: () => void;
} {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  return {
    controller,
    clear: () => clearTimeout(timeoutId),
  };
}
