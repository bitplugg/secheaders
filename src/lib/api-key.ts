const API_KEYS = new Set([
  ...(process.env.API_KEYS?.split(',').map(k => k.trim()).filter(Boolean) || []),
])

export function validateApiKey(request: Request): boolean {
  const key = request.headers.get('x-api-key')
  if (!key) return false
  return API_KEYS.has(key)
}

export function requireApiKey(request: Request): boolean {
  if (API_KEYS.size === 0) return true
  return validateApiKey(request)
}
