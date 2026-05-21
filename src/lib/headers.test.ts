import { describe, it, expect } from 'vitest'
import { analyzeHeaders, gradeFromScore } from './headers'

describe('gradeFromScore', () => {
  it('returns A for 90%+', () => expect(gradeFromScore(55, 55)).toBe('A'))
  it('returns B for 75%+', () => expect(gradeFromScore(42, 55)).toBe('B'))
  it('returns C for 60%+', () => expect(gradeFromScore(33, 55)).toBe('C'))
  it('returns D for 45%+', () => expect(gradeFromScore(25, 55)).toBe('D'))
  it('returns E for 25%+', () => expect(gradeFromScore(14, 55)).toBe('E'))
  it('returns F for <25%', () => expect(gradeFromScore(10, 55)).toBe('F'))
  it('handles 0 score', () => expect(gradeFromScore(0, 55)).toBe('F'))
})

describe('analyzeHeaders', () => {
  it('scores baseline for empty headers', () => {
    const result = analyzeHeaders({})
    expect(result.overallScore).toBe(5)
    expect(result.maxScore).toBe(55)
    expect(result.checks).toHaveLength(11)
  })

  it('scores HSTS correctly', () => {
    const result = analyzeHeaders({ 'strict-transport-security': 'max-age=63072000' })
    const hsts = result.checks.find(c => c.name === 'strict-transport-security')
    expect(hsts!.score).toBe(3)
    expect(hsts!.value).toBe('max-age=63072000')
  })

  it('scores CSP correctly', () => {
    const result = analyzeHeaders({ 'content-security-policy': "default-src 'self'" })
    const csp = result.checks.find(c => c.name === 'content-security-policy')
    expect(csp!.score).toBeGreaterThanOrEqual(2)
  })

  it('detects missing cache-control header', () => {
    const result = analyzeHeaders({})
    const cache = result.checks.find(c => c.name === 'cache-control')
    expect(cache!.score).toBe(1)
  })

  it('sums scores for all positive headers', () => {
    const headers = {
      'strict-transport-security': 'max-age=63072000; includesubdomains; preload',
      'content-security-policy': "default-src 'self'; script-src 'self'; style-src 'self'",
      'x-frame-options': 'DENY',
      'x-content-type-options': 'nosniff',
      'referrer-policy': 'strict-origin-when-cross-origin',
      'permissions-policy': 'camera=(), microphone=(), geolocation=()',
      'cross-origin-opener-policy': 'same-origin',
      'cross-origin-embedder-policy': 'require-corp',
      'cross-origin-resource-policy': 'same-origin',
      'cache-control': 'no-store',
      'set-cookie': 'session=abc; Secure; HttpOnly; SameSite=Strict',
    }
    const result = analyzeHeaders(headers)
    expect(result.overallScore).toBeGreaterThanOrEqual(30)
    expect(result.overallScore).toBeLessThanOrEqual(55)
  })
})
