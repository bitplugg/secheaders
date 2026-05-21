#!/usr/bin/env node
import { SecHeaders } from './index.js'

const [cmd, target, ...rest] = process.argv.slice(2)

if (!cmd || !target) {
  console.log(`
SecHeaders CLI — Web Security Toolkit

Usage:
  secheaders scan    <url>              Сканировать заголовки безопасности
  secheaders dns     <domain> [types]   DNS-запрос
  secheaders ssl     <url>              SSL / HTTPS проверка
  secheaders tls     <url>              TLS / HTTP2 / HTTP3
  secheaders cors    <url>              CORS проверка
  secheaders csp     <url>              CSP-анализ
  secheaders whois   <domain>           WHOIS
  secheaders email   <domain>           SPF/DKIM/DMARC
  secheaders ping    <url>              Доступность
  secheaders hash    <string> [algo]    SHA-1/256/384/512
  secheaders jwt     <token>            Декодировать JWT
  secheaders preview <url>              Open Graph
  secheaders batch   <url1,url2,...>    Массовое сканирование
  secheaders help                       Показать справку
  `)
  process.exit(1)
}

const api = new SecHeaders()

try {
  switch (cmd) {
    case 'scan': {
      const r = await api.scan(target)
      console.log(`\n  ${r.grade}  ${r.url}`)
      console.log(`  Score: ${r.overallScore}/${r.maxScore}  Status: ${r.status}`)
      r.headers.forEach(h => console.log(`  ${h.displayName.padEnd(20)} ${h.score}/${h.maxScore}  ${h.details}`))
      break
    }
    case 'dns': {
      const r = await api.dns(target, rest[0])
      for (const [type, records] of Object.entries(r.records)) {
        console.log(`\n  ${type}:`)
        records.forEach((rec: any) => console.log(`    ${rec.value}`))
      }
      break
    }
    case 'ssl': {
      const r = await api.ssl(target)
      console.log(`  HTTPS: ${r.https ? '✓' : '✗'}  HSTS: ${r.hsts ? '✓' : '✗'}`)
      if (r.redirect) console.log(`  Redirect → ${r.redirect}`)
      break
    }
    case 'tls': {
      const r = await api.tls(target)
      console.log(`  HTTP/2: ${r.http2 ? '✓' : '✗'}  HTTP/3: ${r.http3 ? '✓' : '✗'}`)
      break
    }
    case 'cors': {
      const r = await api.cors(target)
      console.log(`  Origin: ${r.origin || 'none'}`)
      console.log(`  Methods: ${r.methods || 'none'}`)
      console.log(`  Credentials: ${r.credentials}`)
      break
    }
    case 'csp': {
      const r = await api.csp(target)
      if (r.raw) { console.log(`  ${r.raw}`) } else { console.log('  No CSP header') }
      break
    }
    case 'whois': {
      const r = await api.whois(target)
      r.events.forEach(e => console.log(`  ${e.action}: ${e.date}`))
      r.nameservers.forEach(ns => console.log(`  NS: ${ns}`))
      break
    }
    case 'email': {
      const r = await api.email(target)
      console.log(`  SPF:   ${r.spf.exists ? '✓' : '✗'} ${r.spf.record || ''}`)
      console.log(`  DKIM:  ${r.dkim.exists ? '✓' : '✗'}`)
      console.log(`  DMARC: ${r.dmarc.exists ? '✓' : '✗'} policy: ${r.dmarc.policy || 'none'}`)
      break
    }
    case 'ping': {
      const r = await api.ping(target)
      console.log(`  ${r.reachable ? '✓' : '✗'} ${r.status} ${r.ms}ms`)
      break
    }
    case 'hash': {
      const algo = rest[0] || 'sha256'
      const r = await api.hash(target, algo)
      console.log(`  ${r.algorithm}: ${r.hash}`)
      break
    }
    case 'jwt': {
      const r = await api.jwt(target)
      console.log(`  Algorithm: ${r.algorithm}`)
      console.log(`  Header:    ${JSON.stringify(r.header)}`)
      console.log(`  Payload:   ${JSON.stringify(r.payload)}`)
      break
    }
    case 'preview': {
      const r = await api.preview(target)
      console.log(`  Title:       ${r.title}`)
      console.log(`  Description: ${r.description}`)
      console.log(`  Image:       ${r.image}`)
      break
    }
    case 'batch': {
      const urls = target.split(',')
      const r = await api.batch(urls)
      r.results.forEach((res: any) => console.log(`  ${res.grade}  ${res.url}  ${res.status}`))
      break
    }
    default:
      console.log(`Unknown command: ${cmd}`)
  }
} catch (err) {
  console.error(`Error: ${err instanceof Error ? err.message : err}`)
  process.exit(1)
}
