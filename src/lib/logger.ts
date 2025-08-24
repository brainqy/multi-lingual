// src/lib/logger.ts
import fs from 'fs';
import path from 'path';

const logDirectory = path.join(process.cwd(), 'logs');

// Ensure the log directory exists
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory);
}

const actionLogStream = fs.createWriteStream(path.join(logDirectory, 'actions.log'), { flags: 'a' });
const errorLogStream = fs.createWriteStream(path.join(logDirectory, 'errors.log'), { flags: 'a' });

function writeLog(stream: fs.WriteStream, level: string, message: string, meta?: Record<string, any>) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    ...meta,
  };
  stream.write(`${JSON.stringify(logEntry)}\n`);
}

/**
 * Logs a user action.
 * @param message A description of the action.
 * @param meta Additional data like userId, tenantId, etc.
 */
export function logAction(message: string, meta?: Record<string, any>) {
  console.log(`[ACTION] ${message}`, meta || '');
  writeLog(actionLogStream, 'INFO', message, meta);
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
  
  console.error(`[ERROR] ${message}`, { ...meta, error: errorMessage, stack });
  writeLog(errorLogStream, 'ERROR', message, { ...meta, error: errorMessage, stack });
}
