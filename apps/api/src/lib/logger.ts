import pino from 'pino';

function createRootLogger() {
  const isDev = process.env.NODE_ENV !== 'production';
  const baseOptions: pino.LoggerOptions = {
    level: process.env.LOG_LEVEL || 'info',
  };

  // Only use pino-pretty in local development (not in Trigger.dev or Vercel)
  if (isDev && !process.env.TRIGGER_SECRET_KEY) {
    try {
      return pino({
        ...baseOptions,
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss',
            ignore: 'pid,hostname',
          },
        },
      });
    } catch {
      // pino-pretty not available, use plain pino
    }
  }

  return pino(baseOptions);
}

export const rootLogger = createRootLogger();

export function createLogger(name: string) {
  return rootLogger.child({ name });
}
