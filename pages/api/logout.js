import { COOKIE_NAME, cookieHeader } from "../../lib/auth";
import { deleteSession } from "../../lib/sessions";

function isHttps(req) {
  return req.headers["x-forwarded-proto"] === "https";
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  const token = req.cookies?.[COOKIE_NAME];
  if (token) await deleteSession(token);
  res.setHeader("Set-Cookie", cookieHeader(COOKIE_NAME, "", { maxAge: 0, secure: isHttps(req) }));
  res.status(200).json({ ok: true });
}
