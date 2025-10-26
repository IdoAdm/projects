import type { Request } from "express"
import { supabase } from "./supabaseClient"
import { UnauthorizedError } from "./errors"

export interface AuthenticatedUser {
  id: string
  email?: string | null
}

export async function requireSupabaseUser(req: Request): Promise<AuthenticatedUser> {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing bearer token')
  }

  const token = authHeader.replace('Bearer ', '').trim()
  if (!token) {
    throw new UnauthorizedError('Missing bearer token')
  }

  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data.user) {
    throw new UnauthorizedError('Invalid or expired token')
  }

  return {
    id: data.user.id,
    email: data.user.email
  }
}
