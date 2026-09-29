import crypto from "crypto";
import { authEnabled, COOKIE_NAME, MAX_AGE_SECONDS, cookieHeader } from "../../lib/auth";
import { createSession } from "../../lib/sessions";

// In-memory rate limiter: max 10 attempts per IP per 15 minutes. Resets on
// server restart — fine for a single-VPS personal app.
const attempts = new Map();
const MAX_ATTEMPTS = 10;
const WINDOW_MS = 15 * 60 * 1000;

function getRateLimit(ip) {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now - entry.windowStart > WINDOW_MS) return { count: 0, windowStart: now };
  return entry;
}

// Password comparison needs Node's crypto (timingSafeEqual), which is why
// this lives here rather than in lib/auth.js — this file only ever runs in
// the Node.js runtime (Pages API routes default there), unlike
// middleware.js which runs on the Edge runtime.
function checkPassword(input) {
  const expected = process.env.APP_PASSWORD || "";
  const a = Buffer.from(String(input || ""));
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function isHttps(req) {
  return req.headers["x-forwarded-proto"] === "https";
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (!authEnabled()) {
    return res.status(503).json({ error: "Password protection is not enabled yet" });
  }

  const ip = (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || req.socket?.remoteAddress || "unknown";
  const limit = getRateLimit(ip);
  if (limit.count >= MAX_ATTEMPTS) {
    const retryAfter = Math.ceil((WINDOW_MS - (Date.now() - limit.windowStart)) / 1000);
    res.setHeader("Retry-After", String(retryAfter));
    return res.status(429).json({ error: "Too many attempts. Try again later." });
  }

  const { password } = req.body || {};
  if (!checkPassword(password)) {
    attempts.set(ip, { count: limit.count + 1, windowStart: limit.windowStart });
    return res.status(401).json({ error: "Wrong password" });
  }

  attempts.delete(ip);
  const id = crypto.randomUUID();
  await createSession(id, ip, req.headers["user-agent"] || "");
  res.setHeader("Set-Cookie", cookieHeader(COOKIE_NAME, id, { maxAge: MAX_AGE_SECONDS, secure: isHttps(req) }));
  res.status(200).json({ ok: true });
}
