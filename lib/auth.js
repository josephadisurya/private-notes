// Password-protection helpers with NO Node-only imports (no 'crypto', no
// Buffer), so this file is safe to import from both middleware.js (Edge
// runtime) and pages/api/*.js (Node runtime). The one thing that genuinely
// needs Node's crypto — the timing-safe password comparison — lives
// directly in pages/api/auth.js instead, the only place that needs it.
export const COOKIE_NAME = "auth";
// Rolling session: any activity refreshes both the cookie and the
// server-side lastSeen, so it's really "expires after 30 days idle" rather
// than a fixed lifetime from login.
export const SESSION_IDLE_MS = 30 * 24 * 60 * 60 * 1000;
export const MAX_AGE_SECONDS = SESSION_IDLE_MS / 1000;

// Password protection is opt-in: until APP_PASSWORD is set in the
// environment, middleware and API routes let everything through untouched
// so the app isn't accidentally locked out during setup.
export function authEnabled() {
  return !!process.env.APP_PASSWORD;
}

export function cookieHeader(name, value, { maxAge, secure } = {}) {
  const parts = [`${name}=${encodeURIComponent(value)}`, "HttpOnly", "SameSite=Lax", "Path=/"];
  if (maxAge !== undefined) parts.push(`Max-Age=${maxAge}`);
  if (secure) parts.push("Secure");
  return parts.join("; ");
}
