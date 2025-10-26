import type { NextFunction, Request, Response } from "express"
import { HttpError, RateLimitError } from "./errors"

export type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<unknown>

export const asyncHandler = (handler: AsyncHandler) => {
  return (req: Request, res: Response, next: NextFunction) => {
    handler(req, res, next).catch(next)
  }
}

export function sendJson(res: Response, status: number, payload: unknown) {
  res.status(status).json(payload)
}

export function handleError(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) {
    if (err instanceof RateLimitError && typeof (err as RateLimitError & { retryAfter?: number }).retryAfter === 'number') {
      res.setHeader('Retry-After', String((err as RateLimitError & { retryAfter?: number }).retryAfter))
    }

    res.status(err.status).json({
      error: err.message,
      details: err.details ?? null
    })
    return
  }

  console.error('[edge] unexpected error', err)
  res.status(500).json({ error: 'Internal server error' })
}
