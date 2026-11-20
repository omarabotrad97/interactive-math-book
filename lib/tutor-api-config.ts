export const DEFAULT_ALLOWED_CORS_ORIGINS = [
  'https://omarabotrad97.github.io',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
] as const;

const STATIC_HOST_SUFFIXES = ['.github.io', '.pages.dev', '.netlify.app'];

export function isLocalhostHostname(hostname: string): boolean {
  const h = String(hostname || '').trim().toLowerCase();
  return h === 'localhost' || h === '127.0.0.1' || h === '[::1]';
}

export function isStaticPagesHost(hostname: string, protocol = 'https:'): boolean {
  if (String(protocol || '').toLowerCase() === 'file:') {
    return true;
  }
  const h = String(hostname || '').trim().toLowerCase();
  if (!h) return false;
  return STATIC_HOST_SUFFIXES.some((suffix) => h.endsWith(suffix));
}

export function normalizeAiApiBase(raw: unknown): string {
  const trimmed = String(raw ?? '').trim();
  if (!trimmed) return '';

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return '';
  }

  const proto = parsed.protocol.toLowerCase();
  if (proto !== 'https:' && !(proto === 'http:' && isLocalhostHostname(parsed.hostname))) {
    return '';
  }

  const cleanPath = parsed.pathname.replace(/\/+$/, '');
  return `${parsed.origin}${cleanPath}`;
}

export function resolveAiApiUrl(apiPath: string, rawApiBase?: unknown): string {
  const normalizedPath = String(apiPath || '').startsWith('/')
    ? String(apiPath)
    : `/${String(apiPath || '')}`;
  const base = normalizeAiApiBase(rawApiBase);
  if (!base) {
    return normalizedPath;
  }
  return `${base}${normalizedPath}`;
}

export function resolveLiveWsUrl(
  locationLike: { protocol?: string; host?: string },
  rawApiBase?: unknown
): string {
  const base = normalizeAiApiBase(rawApiBase);
  if (base) {
    const parsed = new URL(base);
    const wsProto = parsed.protocol === 'https:' ? 'wss:' : 'ws:';
    const cleanPath = parsed.pathname.replace(/\/+$/, '');
    return `${wsProto}//${parsed.host}${cleanPath}/ws/live`;
  }

  const wsProto = String(locationLike.protocol || '').toLowerCase() === 'https:' ? 'wss:' : 'ws:';
  const host = String(locationLike.host || 'localhost:3000').trim();
  return `${wsProto}//${host}/ws/live`;
}

export function parseAllowedOrigins(extraOriginsEnv?: string): string[] {
  const result = new Set<string>(DEFAULT_ALLOWED_CORS_ORIGINS);
  const raw = String(extraOriginsEnv || '');
  if (!raw.trim()) return Array.from(result);

  for (const part of raw.split(',')) {
    const candidate = part.trim();
    if (!candidate) continue;
    try {
      const parsed = new URL(candidate);
      if (parsed.protocol === 'https:' || (parsed.protocol === 'http:' && isLocalhostHostname(parsed.hostname))) {
        result.add(parsed.origin);
      }
    } catch {
      // Ignore malformed origin entries
    }
  }
  return Array.from(result);
}

export function isAllowedCorsOrigin(origin: string | undefined, extraOriginsEnv?: string): boolean {
  if (!origin) return false;
  let normalized: string;
  try {
    normalized = new URL(origin).origin;
  } catch {
    return false;
  }
  const allowed = parseAllowedOrigins(extraOriginsEnv);
  return allowed.includes(normalized);
}
