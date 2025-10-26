import crypto from "node:crypto"

export function randomToken(bytes: number) {
  return crypto.randomBytes(bytes).toString('hex')
}

export function randomUuid() {
  return crypto.randomUUID()
}

export function normalizePhone(input: string) {
  return input.replace(/\s+/g, '')
}
