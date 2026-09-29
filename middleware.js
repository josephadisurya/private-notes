import { NextResponse } from "next/server";
import { authEnabled, COOKIE_NAME, MAX_AGE_SECONDS, cookieHeader } from "./lib/auth";
import { getSession, touchSession } from "./lib/sessions";

const PUBLIC_PATHS = new Set(["/login", "/api/auth", "/api/logout"]);

function isHttps(request) {
  return request.headers.get("x-forwarded-proto") === "https" || request.nextUrl?.protocol === "https:";
}

function setAuthCookie(response, request, token) {
  response.headers.append("Set-Cookie", cookieHeader(COOKIE_NAME, token, { maxAge: MAX_AGE_SECONDS, secure: isHttps(request) }));
}

export default async function middleware(request) {
  // Until APP_PASSWORD is set, auth is fully bypassed — see lib/auth.js.
  if (!authEnabled()) return NextResponse.next();

  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value || null;
  const session = await getSession(token);

  // Next.js fires an internal "would this redirect?" probe for every Link
  // in the viewport, tagged with this header. It only needs the redirect
  // decision below, so it doesn't touch the session (writing there from a
  // probe can race with the real navigation's own request).
  const isPrefetch = request.headers.get("x-middleware-prefetch") === "1";

  if (session) {
    if (!isPrefetch) await touchSession(session.id);
    if (pathname === "/login") return NextResponse.redirect(new URL("/", request.url));
    const response = NextResponse.next();
    if (!isPrefetch) setAuthCookie(response, request, session.id); // rolling: refresh the 30-day idle window
    return response;
  }

  if (PUBLIC_PATHS.has(pathname)) return NextResponse.next();

  // API routes are fetched by client-side JS, not navigated to — a
  // redirect there would make fetch() silently follow to the login page's
  // HTML and fail to parse as JSON, instead of a clean auth error.
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|faviconp/|font/|favicon\\.ico|site\\.webmanifest|sw\\.js|icon-192\\.png|icon-512\\.png).*)",
  ],
};
