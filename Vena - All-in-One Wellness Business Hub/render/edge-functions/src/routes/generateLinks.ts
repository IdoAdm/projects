import type { Router } from "express"
import bcrypt from "bcryptjs"
import { env } from "../config"
import { requireSupabaseUser } from "../auth"
import { supabase } from "../supabaseClient"
import { asyncHandler, sendJson } from "../http"
import { randomToken } from "../tokens"
import { ValidationError } from "../errors"

export function registerGenerateLinksRoute(router: Router) {
  router.post(
    '/generate_links',
    asyncHandler(async (req, res) => {
      const user = await requireSupabaseUser(req)

      await supabase
        .from('profiles')
        .upsert(
          { id: user.id },
          { onConflict: 'id', ignoreDuplicates: true }
        )

      const editToken = randomToken(32)
      const publicToken = randomToken(16)
      const editHash = await bcrypt.hash(editToken, 12)

      const { error } = await supabase
        .from('links')
        .upsert(
          {
            owner_id: user.id,
            edit_token_hash: editHash,
            public_token: publicToken,
            last_generated_at: new Date().toISOString()
          },
          { onConflict: 'owner_id' }
        )

      if (error) {
        throw new ValidationError('Failed to persist scheduling links', error.message)
      }

      const editUrlBase = env.OWNER_DASHBOARD_BASE_URL?.replace(/\/$/, '')
      const publicUrlBase = env.PUBLIC_BOOKING_BASE_URL?.replace(/\/$/, '')

      sendJson(res, 200, {
        ownerId: user.id,
        edit_token: editToken,
        edit_url: editUrlBase ? `${editUrlBase}/${editToken}` : editToken,
        public_token: publicToken,
        public_url: publicUrlBase ? `${publicUrlBase}/${publicToken}` : publicToken
      })
    })
  )
}
