import type { Router } from "express"
import { z } from "zod"
import { requireSupabaseUser } from "../auth"
import { supabase } from "../supabaseClient"
import { asyncHandler, sendJson } from "../http"
import { ValidationError } from "../errors"

const requestSchema = z.object({
  daysAhead: z.number().int().min(1).max(90).default(30),
  serviceId: z.string().uuid().optional()
})

export function registerGenerateSlotsRoute(router: Router) {
  router.post(
    '/generate_slots',
    asyncHandler(async (req, res) => {
      const user = await requireSupabaseUser(req)
      const payload = requestSchema.parse(req.body ?? {})

      const rpc = await supabase.rpc('generate_slots_for_owner', {
        p_owner: user.id,
        p_days_ahead: payload.daysAhead,
        p_service_id: payload.serviceId ?? null
      })

      if (rpc.error) {
        throw new ValidationError('Failed to generate slots', rpc.error.message)
      }

      const cleanup = await supabase.rpc('release_expired_holds')
      if (cleanup.error) {
        console.warn('[edge] release_expired_holds failed', cleanup.error)
      }

      sendJson(res, 200, {
        ownerId: user.id,
        result: rpc.data ?? null
      })
    })
  )
}
