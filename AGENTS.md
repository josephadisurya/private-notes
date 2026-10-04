# private-notes

Password-protected notes app, forked from app-writer's `main` (Sep 30, 2026). Next 13 (Pages Router) + Tailwind 3. Deploys on Vercel from `main`.

- **Auth:** same system as app-josephs-kanban: `middleware.js` gate, `/api/auth` (rate limited), `/api/logout`, `/api/sessions`. Sessions live in Supabase `notes_sessions` and expire after 3 days idle (rolling; `SESSION_IDLE_MS` in `lib/auth.js`). Auth is off until `APP_PASSWORD` is set.
- **Storage:** Supabase `private_notes` (id uuid, title, body HTML, footer, created_at, updated_at), accessed only server-side with the service-role key (`lib/supabase.js`, `lib/notes.js`). RLS is on with no policies. Schema: `supabase/migrations/001_private_notes.sql`.
- **Env (Vercel):** `APP_PASSWORD`, `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`. These belong to a **separate Supabase project just for private-notes** (decided 2026-10-04), not the shared one kanban/spending-tracker/mosaics use, so a leaked key from another app can't reach the notes. Don't copy these keys anywhere else (not the VPS, not other apps).
- **No encryption** (Joseph's decision, 2026-10-04): notes are plain text in that project, protected by the separate project, RLS, the app password and account 2FA.
- **Saving:** `lib/noteSaver.js` writes edits to localStorage (`private-notes-pending`) first, then PUTs `/api/notes/[id]` after 700ms; retries with backoff, on reconnect and on next load. An emptied note is deleted. Save pill/banner: `components/SaveStatus.js`.
- **UX rules:** every visit opens a fresh unsaved note; past notes are in `components/NotesSidebar.js` (top-left button).
- **Service worker** (`public/sw.js`) caches only static files; pages and `/api/` always go to the network.
- **Fonts:** UI and the "Sans" editor option use the Apple system stack (`-apple-system, BlinkMacSystemFont, "SF Pro Text", …`); Serif = Spectral, Dyslexic = OpenDyslexic.
- **Not in the weekly Supabase backup** (`~/backup-supabase.py` lists tables explicitly).
- **Local testing without Supabase:** point `SUPABASE_URL` at a PostgREST stand-in (a small mock was used during development).
