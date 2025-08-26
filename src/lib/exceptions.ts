// src/lib/exceptions.ts

/**
 * @fileOverview Custom exception classes for the application.
 */

/**
 * Base class for all custom application errors.
 */
export class AppError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

/**
 * Error for issues related to AI model interactions.
 */
export class AIError extends AppError {
  constructor(message: string) {
    super(message);
  }
}

/**
 * Error for when required input data is missing or invalid.
 */
export class InvalidInputError extends AppError {
  constructor(message: string) {
    super(message);
  }
}

/**
 * Error for when a resource (e.g., a user, a document) is not found.
 */
export class NotFoundError extends AppError {
  constructor(resource: string, id: string) {
    super(`${resource} with ID '${id}' not found.`);
  }
}

/**
 * Error for when a user does not have permission to perform an action.
 */
export class PermissionError extends AppError {
  constructor(message: string = "You do not have permission to perform this action.") {
    super(message);
  }
}
