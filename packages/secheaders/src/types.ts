/** Header check result */
export interface HeaderCheck {
  name: string
  displayName: string
  description: string
  value: string | null
  score: number
  maxScore: number
  details: string
}

/** Single URL scan result */
export interface ScanResult {
  url: string
  status: number
  headers: HeaderCheck[]
  overallScore: number
  maxScore: number
  grade: string
  timestamp: number
}

/** Batch scan result item */
export interface BatchResult {
  url: string
  status: number
  overallScore: number
  maxScore: number
  grade: string
  timestamp: number
  error?: string
}

/** DNS record */
export interface DnsRecord {
  name: string
  type: number
  ttl: number
  value: string
  error?: string
  note?: string
}

/** DNS lookup result */
export interface DnsResult {
  domain: string
  records: Record<string, DnsRecord[]>
}

/** SSL/TLS info */
export interface SslResult {
  https: boolean
  hsts: boolean
  redirect: string | null
  note: string
}

/** TLS info */
export interface TlsResult {
  http2: boolean
  http3: boolean
  altSvc: string | null
  altSvcProtocols: string[]
  upgrade: boolean
  note: string
}

/** CORS info */
export interface CorsResult {
  origin: string | null
  methods: string | null
  headers: string | null
  credentials: boolean
  maxAge: number | null
  exposeHeaders: string | null
  note: string
}

/** Cookie info */
export interface CookieResult {
  cookies: Array<{
    name: string
    value: string
    secure: boolean
    httpOnly: boolean
    sameSite: string | null
    domain: string | null
    path: string | null
    maxAge: string | null
  }>
  total: number
  secure: number
  httpOnly: number
}

/** Mixed content info */
export interface MixedContentResult {
  url: string
  mixed: boolean
  resources: string[]
  count: number
  note: string
}

/** Redirect chain */
export interface RedirectResult {
  url: string
  chain: Array<{ url: string; status: number }>
  count: number
  finalUrl: string
  note: string
}

/** GZIP check */
export interface GzipResult {
  url: string
  gzip: boolean
  brotli: boolean
  encoding: string | null
  originalSize: number | null
  compressedSize: number | null
  savings: number | null
}

/** CSP info */
export interface CspResult {
  url: string
  directives: Record<string, string[]>
  reportOnly: boolean
  raw: string | null
}

/** CSP evaluation */
export interface CspEvalResult {
  url: string
  score: number
  maxScore: number
  grade: string
  issues: Array<{ directive: string; severity: string; message: string }>
}

/** PWA validation */
export interface PwaResult {
  manifest: boolean
  serviceWorker: boolean
  https: boolean
  viewport: boolean
  icons: number
  display: string | null
  name: string | null
  score: number
}

/** Subdomain info */
export interface SubdomainResult {
  domain: string
  subdomains: string[]
  total: number
}

/** Email security info */
export interface EmailSecurityResult {
  domain: string
  spf: { exists: boolean; record: string | null; valid: boolean }
  dkim: { exists: boolean; records: string[] }
  dmarc: { exists: boolean; record: string | null; policy: string | null }
}

/** Server info */
export interface ServerResult {
  url: string
  server: string | null
  poweredBy: string | null
  via: string | null
  cfRay: string | null
  age: string | null
}

/** Page info */
export interface PageInfoResult {
  url: string
  title: string | null
  charset: string | null
  lang: string | null
  viewport: string | null
  contentType: string | null
  links: number
  scripts: number
  images: number
  size: number
}

/** CDN info */
export interface CdnResult {
  url: string
  cdn: string | null
  detected: boolean
  headers: Record<string, string>
}

/** Schema.org info */
export interface SchemaResult {
  url: string
  schemas: Record<string, any>[]
  total: number
  types: string[]
}

/** WHOIS info */
export interface WhoisResult {
  domain: string
  events: Array<{ date: string; action: string }>
  entities: string[]
  nameservers: string[]
  raw: string | null
}

/** Preview / Open Graph info */
export interface PreviewResult {
  url: string
  title: string | null
  description: string | null
  image: string | null
  siteName: string | null
  icon: string | null
}

/** SRI check result */
export interface SriCheckResult {
  url: string
  scripts: Array<{ src: string; integrity: string | null; crossorigin: string | null }>
  total: number
  withIntegrity: number
}

/** SRI generation result */
export interface SriGenResult {
  url: string
  algorithm: string
  hash: string
  base64Integrity: string
  size: number
}

/** Methods result */
export interface MethodsResult {
  url: string
  methods: string[]
  unsafe: string[]
}

/** Compare result */
export interface CompareResult {
  a: ScanResult
  b: ScanResult
}

/** Contrast result */
export interface ContrastResult {
  foreground: string
  background: string
  contrastRatio: number
  aa: boolean
  aaa: boolean
  isLargeText: boolean
  fontSize: number
}

/** Encode result */
export interface EncodeResult {
  input: string
  result: string
  action: string
  type: string
}

/** Hash result */
export interface HashResult {
  input: string
  algorithm: string
  hash: string
}

/** JWT decode result */
export interface JwtResult {
  header: Record<string, any>
  payload: Record<string, any>
  signature: string
  algorithm: string
  type: string
}

/** Pretty print result */
export interface PrettyResult {
  input: string
  pretty: string
  minified: string
  length: number
}

/** Ping result */
export interface PingResult {
  url: string
  reachable: boolean
  status: number
  ms: number
}

/** Generic API response wrapper */
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}
