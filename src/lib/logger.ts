// src/lib/logger.ts
// A simple logger for server actions. In a real production app, this would
// be replaced with a more robust logging service like Winston, Pino, or a
// cloud provider's logging solution (e.g., Google Cloud Logging).

import fs from 'fs';
import path from 'path';

const LOG_LEVEL = process.env.LOG_LEVEL || 'info'; // 'info', 'warn', 'error', 'debug'

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

const currentLogLevel = levels[LOG_LEVEL as keyof typeof levels] ?? levels.info;

function writeLog(level: keyof typeof levels, message: string, meta?: Record<string, any>) {
  if (levels[level] > currentLogLevel) {
    return;
  }
  
  const timestamp = new Date();
  const logEntry = {
    timestamp: timestamp.toISOString(),
    level: level.toUpperCase(),
    message,
    ...meta,
  };

  const logMessage = JSON.stringify(logEntry) + '\n';
  
  try {
    const logDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir);
    }
    
    const dateString = timestamp.toISOString().split('T')[0]; // YYYY-MM-DD
    const logFilePath = path.join(logDir, `${dateString}.log`);
    
    fs.appendFileSync(logFilePath, logMessage);

  } catch (error) {
    console.error("Failed to write to log file:", error);
    // Fallback to console if file logging fails
    console.error(logMessage);
  }
}

/**
 * Logs a standard user or system action.
 * @param message A description of the action.
 * @param meta Additional data like userId, tenantId, sessionId, etc.
 */
export function logAction(message: string, meta?: Record<string, any>) {
  writeLog('info', message, meta);
}

/**
 * Logs an error.
 * @param message A description of the error.
 * @param error The error object or stack trace.
 * @param meta Additional context.
 */
export function logError(message: string, error: any, meta?: Record<string, any>) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;
  
  writeLog('error', message, { ...meta, error: errorMessage, stack });
}
