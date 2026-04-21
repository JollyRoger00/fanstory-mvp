export class AppError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(message: string, code: string, status = 500) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = status;
  }
}

export class ResourceNotFoundError extends AppError {
  constructor(message: string) {
    super(message, "RESOURCE_NOT_FOUND", 404);
    this.name = "ResourceNotFoundError";
  }
}

export class FeatureDisabledError extends AppError {
  constructor(message: string) {
    super(message, "FEATURE_DISABLED", 403);
    this.name = "FeatureDisabledError";
  }
}

export function isResourceNotFoundError(
  error: unknown,
): error is ResourceNotFoundError {
  return error instanceof ResourceNotFoundError;
}
