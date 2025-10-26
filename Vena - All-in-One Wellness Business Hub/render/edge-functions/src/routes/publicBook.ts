import type { Request, Router } from "express"
import { z } from "zod"
import { supabase } from "../supabaseClient"
import { asyncHandler, sendJson } from "../http"
import { ValidationError } from "../errors"
import { assertRateLimit } from "../rateLimiter"
import { normalizePhone, randomUuid } from "../tokens"

const requestSchema = z.object({
  publicToken: z.string().min(8),
  serviceId: z.string().uuid(),
  slotId: z.string().uuid(),
  fullName: z.string().min(2).max(120),
  phone: z.string().regex(/^\+[1-9][0-9]{4,14}$/, 'Phone must be in E.164 format'),
  idempotencyKey: z.string().uuid().optional()
})

function clientIp(req: Request) {
  const forwarded = req.headers['x-forwarded-for']
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0]!.trim()
  }
  if (Array.isArray(forwarded) && forwarded.length > 0) {
    return forwarded[0]!.trim()
  }
  return req.ip ?? 'unknown'
}

export function registerPublicBookRoute(router: Router) {
  router.post(
    '/public_book',
    asyncHandler(async (req, res) => {
      const headerIdempotency = (() => {
        const raw = req.headers['idempotency-key']
        if (!raw) return undefined
        if (Array.isArray(raw)) return raw[0]
        return raw
      })()

      const sanitizedPhone = typeof req.body?.phone === 'string'
        ? req.body.phone.replace(/\s+/g, '')
        : req.body?.phone

      const parsed = requestSchema.parse({
        ...req.body,
        phone: sanitizedPhone,
        idempotencyKey: req.body?.idempotencyKey ?? headerIdempotency
      })

      const ip = clientIp(req)
      assertRateLimit(`${parsed.publicToken}:${ip}`)

      const idempotencyKey = parsed.idempotencyKey ?? randomUuid()

      const rpc = await supabase.rpc('public_book_slot', {
        p_public_token: parsed.publicToken,
        p_service_id: parsed.serviceId,
        p_slot_id: parsed.slotId,
        p_full_name: parsed.fullName.trim(),
        p_phone: normalizePhone(parsed.phone),
        p_idempotency_key: idempotencyKey
      })

      if (rpc.error) {
        throw new ValidationError('Unable to confirm booking', rpc.error.message)
      }

      if (!rpc.data) {
        throw new ValidationError('Booking could not be created')
      }

      res.setHeader('Idempotency-Key', idempotencyKey)

      sendJson(res, 201, {
        bookingId: rpc.data.id,
        serviceId: rpc.data.service_id,
        slotId: rpc.data.slot_id,
        status: rpc.data.status,
        startTimeUtc: rpc.data.start_time,
        endTimeUtc: rpc.data.end_time,
        confirmationCode: rpc.data.confirmation_code,
        idempotencyKey
      })
    })
  )
}
