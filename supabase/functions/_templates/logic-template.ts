// Business logic template - separate from HTTP handling for testability
// This file contains pure business logic that can be unit tested without HTTP

// Type definitions
interface ProcessInput {
  user_email: string;
  // Add your input properties here
}

interface ProcessResult {
  success: boolean;
  // Add your result properties here
}

// Structured error for business logic
export class BusinessError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'BusinessError';
  }
}

/**
 * Main business logic function
 * Pure function that doesn't depend on HTTP request/response
 * Easy to test with unit tests
 */
export async function processRequest(input: ProcessInput): Promise<ProcessResult> {
  // 1. Validate input
  if (!input.user_email) {
    throw new BusinessError('user_email is required', 'MISSING_EMAIL', 400);
  }

  // 2. Your business logic here
  // - Database queries
  // - External API calls
  // - Data processing
  // - Business rules

  // 3. Return result
  return {
    success: true,
    // Add your result data
  };
}

/**
 * Helper functions for your business logic
 * Keep them pure and testable
 */
async function helperFunction(param: string): Promise<string> {
  // Helper logic here
  return param;
}
