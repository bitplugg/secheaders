import { request } from './client'
import type {
  ScanResult,
  BatchResult,
  CompareResult,
  DnsResult,
  SslResult,
  TlsResult,
  CorsResult,
  CookieResult,
  MixedContentResult,
  RedirectResult,
  GzipResult,
  CspResult,
  CspEvalResult,
  PwaResult,
  SubdomainResult,
  EmailSecurityResult,
  ServerResult,
  PageInfoResult,
  CdnResult,
  SchemaResult,
  WhoisResult,
  PreviewResult,
  SriCheckResult,
  SriGenResult,
  MethodsResult,
  ContrastResult,
  EncodeResult,
  HashResult,
  JwtResult,
  PrettyResult,
  PingResult,
} from './types'

export class SecHeaders {
  private baseUrl: string

  constructor(baseUrl = 'https://secheaders.vercel.app') {
    this.baseUrl = baseUrl.replace(/\/+$/, '')
  }

  /** Scan HTTP security headers for a URL */
  scan(url: string): Promise<ScanResult> {
    return request<ScanResult>(this.baseUrl, '/api/scan', { url })
  }

  /** Batch scan multiple URLs (max 10, comma-separated) */
  batch(urls: string[]): Promise<{ results: BatchResult[]; total: number }> {
    return request<{ results: BatchResult[]; total: number }>(this.baseUrl, '/api/batch', { urls: urls.join(',') })
  }

  /** Compare two URLs */
  compare(a: string, b: string): Promise<CompareResult> {
    return request<CompareResult>(this.baseUrl, '/api/compare', { a, b })
  }

  /** DNS lookup for a domain */
  dns(domain: string, types?: string): Promise<DnsResult> {
    return request<DnsResult>(this.baseUrl, '/api/dns', { domain, ...(types ? { types } : {}) })
  }

  /** SSL / HTTPS check */
  ssl(url: string): Promise<SslResult> {
    return request<SslResult>(this.baseUrl, '/api/ssl', { url })
  }

  /** TLS / HTTP2 / HTTP3 check */
  tls(url: string): Promise<TlsResult> {
    return request<TlsResult>(this.baseUrl, '/api/tls', { url })
  }

  /** CORS tester */
  cors(url: string): Promise<CorsResult> {
    return request<CorsResult>(this.baseUrl, '/api/cors', { url })
  }

  /** Cookie security analysis */
  cookies(url: string): Promise<CookieResult> {
    return request<CookieResult>(this.baseUrl, '/api/cookies', { url })
  }

  /** Mixed content check */
  mixed(url: string): Promise<MixedContentResult> {
    return request<MixedContentResult>(this.baseUrl, '/api/mixed', { url })
  }

  /** Redirect chain */
  redirects(url: string): Promise<RedirectResult> {
    return request<RedirectResult>(this.baseUrl, '/api/redirects', { url })
  }

  /** GZIP / Brotli compression check */
  gzip(url: string): Promise<GzipResult> {
    return request<GzipResult>(this.baseUrl, '/api/gzip', { url })
  }

  /** CSP analyzer */
  csp(url: string): Promise<CspResult> {
    return request<CspResult>(this.baseUrl, '/api/csp-dump', { url })
  }

  /** CSP evaluator */
  cspEval(url: string): Promise<CspEvalResult> {
    return request<CspEvalResult>(this.baseUrl, '/api/csp-eval', { url })
  }

  /** PWA validation */
  pwa(url: string): Promise<PwaResult> {
    return request<PwaResult>(this.baseUrl, '/api/pwa', { url })
  }

  /** Subdomain discovery */
  subdomains(domain: string): Promise<SubdomainResult> {
    return request<SubdomainResult>(this.baseUrl, '/api/subdomains', { domain })
  }

  /** Email security (SPF / DKIM / DMARC) */
  email(domain: string): Promise<EmailSecurityResult> {
    return request<EmailSecurityResult>(this.baseUrl, '/api/email-security', { domain })
  }

  /** Server info */
  server(url: string): Promise<ServerResult> {
    return request<ServerResult>(this.baseUrl, '/api/server', { url })
  }

  /** Page info */
  pageInfo(url: string): Promise<PageInfoResult> {
    return request<PageInfoResult>(this.baseUrl, '/api/page-info', { url })
  }

  /** CDN detector */
  cdn(url: string): Promise<CdnResult> {
    return request<CdnResult>(this.baseUrl, '/api/cdn', { url })
  }

  /** Schema.org / JSON-LD parser */
  schema(url: string): Promise<SchemaResult> {
    return request<SchemaResult>(this.baseUrl, '/api/schema', { url })
  }

  /** WHOIS lookup */
  whois(domain: string): Promise<WhoisResult> {
    return request<WhoisResult>(this.baseUrl, '/api/whois', { domain })
  }

  /** Link preview / Open Graph */
  preview(url: string): Promise<PreviewResult> {
    return request<PreviewResult>(this.baseUrl, '/api/preview', { url })
  }

  /** SRI checker */
  sri(url: string): Promise<SriCheckResult> {
    return request<SriCheckResult>(this.baseUrl, '/api/sri', { url })
  }

  /** SRI integrity hash generator */
  sriGen(url: string, algorithm?: string): Promise<SriGenResult> {
    return request<SriGenResult>(this.baseUrl, '/api/sri-gen', { url, ...(algorithm ? { algorithm } : {}) })
  }

  /** HTTP methods check */
  methods(url: string): Promise<MethodsResult> {
    return request<MethodsResult>(this.baseUrl, '/api/methods', { url })
  }

  /** Color contrast checker */
  contrast(foreground: string, background: string, fontSize?: number): Promise<ContrastResult> {
    return request<ContrastResult>(this.baseUrl, '/api/contrast', {
      foreground, background, ...(fontSize ? { fontSize: String(fontSize) } : {}),
    })
  }

  /** Base64 / URL encode */
  encode(input: string, type?: string): Promise<EncodeResult> {
    return request<EncodeResult>(this.baseUrl, '/api/encode', { input, action: 'encode', ...(type ? { type } : {}) })
  }

  /** Base64 / URL decode */
  decode(input: string, type?: string): Promise<EncodeResult> {
    return request<EncodeResult>(this.baseUrl, '/api/encode', { input, action: 'decode', ...(type ? { type } : {}) })
  }

  /** Hash generator */
  hash(input: string, algorithm?: string): Promise<HashResult> {
    return request<HashResult>(this.baseUrl, '/api/hash', { input, ...(algorithm ? { algorithm } : {}) })
  }

  /** JWT decoder */
  jwt(token: string): Promise<JwtResult> {
    return request<JwtResult>(this.baseUrl, '/api/jwt', { token })
  }

  /** JSON/XML pretty printer */
  pretty(input: string, type?: string): Promise<PrettyResult> {
    return request<PrettyResult>(this.baseUrl, '/api/pretty', { input, ...(type ? { type } : {}) })
  }

  /** Ping / reachability check */
  ping(url: string): Promise<PingResult> {
    return request<PingResult>(this.baseUrl, '/api/ping', { url })
  }
}
