import httpx
from dataclasses import dataclass, field
from typing import Any, Optional


@dataclass
class ScanResult:
    url: str
    status: int
    overall_score: int
    max_score: int
    grade: str
    headers: list[dict] = field(default_factory=list)
    timestamp: int = 0


@dataclass
class DnsResult:
    domain: str
    records: dict[str, list[dict]] = field(default_factory=dict)


@dataclass
class JwtResult:
    header: dict = field(default_factory=dict)
    payload: dict = field(default_factory=dict)
    signature: str = ""
    algorithm: str = ""
    type: str = ""


@dataclass
class MonitorSummary:
    ok: int = 0
    warn: int = 0
    error: int = 0
    total: int = 0


@dataclass
class MonitorResult:
    results: list[dict] = field(default_factory=list)
    summary: MonitorSummary = field(default_factory=MonitorSummary)
    timestamp: int = 0


class SecHeaders:
    def __init__(self, base_url: str = "https://zxc-r1spclf9a-bitplugg.vercel.app"):
        self.base_url = base_url.rstrip("/")
        self.client = httpx.Client(timeout=15)

    def _get(self, path: str, params: dict[str, str] = None) -> dict:
        url = f"{self.base_url}{path}"
        r = self.client.get(url, params=params, headers={"User-Agent": "SecHeadersPython/1.0"})
        r.raise_for_status()
        data = r.json()
        if not data.get("success"):
            raise Exception(data.get("error", "Request failed"))
        return data["data"]

    def scan(self, url: str) -> ScanResult:
        data = self._get("/api/scan", {"url": url})
        return ScanResult(**data)

    def batch(self, urls: list[str]) -> dict:
        return self._get("/api/batch", {"urls": ",".join(urls)})

    def dns(self, domain: str, types: str = None) -> DnsResult:
        params = {"domain": domain}
        if types:
            params["types"] = types
        data = self._get("/api/dns", params)
        return DnsResult(**data)

    def ssl(self, url: str) -> dict:
        return self._get("/api/ssl", {"url": url})

    def tls(self, url: str) -> dict:
        return self._get("/api/tls", {"url": url})

    def cors(self, url: str) -> dict:
        return self._get("/api/cors", {"url": url})

    def cookies(self, url: str) -> dict:
        return self._get("/api/cookies", {"url": url})

    def csp(self, url: str) -> dict:
        return self._get("/api/csp-dump", {"url": url})

    def whois(self, domain: str) -> dict:
        return self._get("/api/whois", {"domain": domain})

    def email(self, domain: str) -> dict:
        return self._get("/api/email-security", {"domain": domain})

    def jwt(self, token: str) -> JwtResult:
        data = self._get("/api/jwt", {"token": token})
        return JwtResult(**data)

    def monitor(self, urls: list[str]) -> MonitorResult:
        data = self._get("/api/monitor", {"urls": ",".join(urls)})
        data["summary"] = MonitorSummary(**data["summary"])
        return MonitorResult(**data)

    def ping(self, url: str) -> dict:
        return self._get("/api/ping", {"url": url})

    def preview(self, url: str) -> dict:
        return self._get("/api/preview", {"url": url})

    def hash(self, input: str, algorithm: str = "sha256") -> dict:
        return self._get("/api/hash", {"input": input, "algorithm": algorithm})
