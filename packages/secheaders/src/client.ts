import type { ApiResponse } from './types'

export function buildUrl(base: string, path: string, params?: Record<string, string>): string {
  const url = new URL(path, base)
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  return url.toString()
}

export async function request<T>(baseUrl: string, path: string, params?: Record<string, string>): Promise<T> {
  const url = buildUrl(baseUrl, path, params)
  const res = await fetch(url, { headers: { 'User-Agent': 'SecHeadersSDK/1.0' } })
  const json: ApiResponse<T> = await res.json()
  if (!json.success) throw new Error(json.error || 'Request failed')
  return json.data as T
}
