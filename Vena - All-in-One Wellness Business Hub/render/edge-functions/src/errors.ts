export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly details?: unknown
  ) {
    super(message)
    this.name = this.constructor.name
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message = 'Unauthorized') {
    super(401, message)
  }
}

export class RateLimitError extends HttpError {
  constructor(message = 'Too many requests') {
    super(429, message)
  }
}

export class ValidationError extends HttpError {
  constructor(message: string, details?: unknown) {
    super(400, message, details)
  }
}

export class NotFoundError extends HttpError {
  constructor(message = 'Not found') {
    super(404, message)
  }
}
