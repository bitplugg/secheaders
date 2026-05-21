# secheaders — Python SDK

Клиент для [SecHeaders API](https://zxc-r1spclf9a-bitplugg.vercel.app).

## Установка

```bash
pip install secheaders
```

## Использование

```python
from secheaders import SecHeaders

api = SecHeaders()

# HTTP-заголовки
result = api.scan('https://example.com')
print(result.grade, result.overall_score)

# DNS
dns = api.dns('google.com', 'A,MX')
for record in dns.records['A']:
    print(record.value)

# JWT
jwt = api.jwt('eyJhbGciOiJIUzI1NiIs...')
print(jwt.payload)

# Мониторинг
monitor = api.monitor(['https://google.com', 'https://github.com'])
print(monitor.summary)
```

## Методы

| Метод | Описание |
|---|---|
| `scan(url)` | HTTP-заголовки |
| `batch(urls)` | Массовое сканирование |
| `dns(domain, types?)` | DNS-запросы |
| `ssl(url)` | SSL / HTTPS |
| `tls(url)` | TLS / HTTP2 |
| `cors(url)` | CORS |
| `cookies(url)` | Cookies |
| `csp(url)` | CSP-анализ |
| `whois(domain)` | WHOIS |
| `email(domain)` | SPF/DKIM/DMARC |
| `jwt(token)` | JWT декодирование |
| `monitor(urls)` | Мониторинг |
| `ping(url)` | Доступность |

## Кастомный URL

```python
api = SecHeaders(base_url='http://localhost:3000')
```
