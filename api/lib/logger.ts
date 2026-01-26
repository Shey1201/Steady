// Simple structured logger
export enum LogLevel {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  error?: any;
}

function formatError(error: any): any {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      ...(error as any),
    };
  }
  return error;
}

export const logger = {
  log(level: LogLevel, message: string, context?: Record<string, any>, error?: any) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error: error ? formatError(error) : undefined,
    };

    // In a real production environment, this might send logs to Datadog, Sentry, or Logtail.
    // For Vercel Serverless, console.log/error are captured in the Vercel dashboard.
    const logString = JSON.stringify(entry);
    
    if (level === LogLevel.ERROR) {
      console.error(logString);
    } else if (level === LogLevel.WARN) {
      console.warn(logString);
    } else {
      console.log(logString);
    }
  },

  info(message: string, context?: Record<string, any>) {
    this.log(LogLevel.INFO, message, context);
  },

  warn(message: string, context?: Record<string, any>, error?: any) {
    this.log(LogLevel.WARN, message, context, error);
  },

  error(message: string, error?: any, context?: Record<string, any>) {
    this.log(LogLevel.ERROR, message, context, error);
  }
};
