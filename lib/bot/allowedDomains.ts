export function hostnameFromUrlLike(value?: string | null): string | null {
  if (!value) return null;
  const raw = String(value).trim();
  if (!raw) return null;

  // Accept full URLs (https://example.com/page) or origins (https://example.com)
  // and also handle bare domains (example.com, localhost:3000).
  try {
    return new URL(raw).hostname.toLowerCase();
  } catch {
    try {
      return new URL(`http://${raw}`).hostname.toLowerCase();
    } catch {
      return null;
    }
  }
}

export function normalizeAllowedDomain(value: string): string | null {
  const v = String(value || "").trim().toLowerCase();
  if (!v) return null;

  // Support entries like:
  // - example.com
  // - https://example.com
  // - *.example.com
  if (v.startsWith("*.")) {
    const base = hostnameFromUrlLike(v.slice(2));
    return base ? `*.${base}` : null;
  }

  return hostnameFromUrlLike(v);
}

export function isHostnameAllowed(hostname: string, allowedDomains: string[]) {
  const h = hostname.toLowerCase();
  return allowedDomains.some((allowedRaw) => {
    const allowed = normalizeAllowedDomain(allowedRaw);
    if (!allowed) return false;

    if (allowed.startsWith("*.")) {
      const base = allowed.slice(2);
      return h === base || h.endsWith(`.${base}`);
    }

    return h === allowed || h.endsWith(`.${allowed}`);
  });
}

export function isLocalhostHostname(hostname: string) {
  const h = String(hostname || "").trim().toLowerCase();
  if (!h) return false;
  if (h === "localhost") return true;
  if (h === "127.0.0.1") return true;
  if (h === "0.0.0.0") return true;
  if (h === "::1") return true;
  return h.endsWith(".localhost");
}

export function hasLocalhostInAllowedDomains(allowedDomains: string[]) {
  return allowedDomains.some((raw) => {
    const allowed = normalizeAllowedDomain(raw);
    return allowed === "localhost" || allowed === "*.localhost";
  });
}
