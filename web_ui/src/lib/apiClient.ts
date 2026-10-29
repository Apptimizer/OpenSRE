export async function apiFetch(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers || {});

  // Default JSON accept for our API routes
  if (!headers.has("Accept")) headers.set("Accept", "application/json");
  return fetch(path, { ...init, headers });
}



/**
 * Human-readable error from a failed response. Proxies (Envoy/Cloudflare) can
 * answer with plain text, and our routes wrap config-service JSON as a string.
 */
export async function readError(res: Response, fallback: string): Promise<string> {
  const text = await res.text().catch(() => '');
  let body: any;
  try {
    body = JSON.parse(text);
  } catch {
    return `${fallback} (HTTP ${res.status}). Please try again.`;
  }
  let msg = body?.error ?? body?.detail;
  if (typeof msg === 'string') {
    try {
      msg = JSON.parse(msg).detail ?? msg;
    } catch {
      // plain string message
    }
  }
  if (msg && typeof msg === 'object') {
    msg = [msg.message, ...(Array.isArray(msg.errors) ? msg.errors : [])].filter(Boolean).join(': ');
  }
  return typeof msg === 'string' && msg ? msg : fallback;
}
