import { z } from "zod"

const envSchema = z.object({
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  OWNER_DASHBOARD_BASE_URL: z.string().url().optional(),
  PUBLIC_BOOKING_BASE_URL: z.string().url().optional(),
  PORT: z.coerce.number().int().positive().default(8080),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(5),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000)
})

export const env = envSchema.parse(process.env)
