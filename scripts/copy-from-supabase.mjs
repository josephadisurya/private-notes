// One-off: copy private_notes + notes_sessions from Supabase into the Neon
// database in DATABASE_URL (rows already there are updated), then check
// every row matches. Reads Supabase only (never writes there).
//
//   SUPABASE_URL=… SUPABASE_SERVICE_KEY=… DATABASE_URL=… node scripts/copy-from-supabase.mjs [--dry-run]
import { neon } from "@neondatabase/serverless";

const { SUPABASE_URL, SUPABASE_SERVICE_KEY, DATABASE_URL } = process.env;
const dryRun = process.argv.includes("--dry-run");
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !DATABASE_URL) {
  console.error("Set SUPABASE_URL, SUPABASE_SERVICE_KEY and DATABASE_URL.");
  process.exit(1);
}

async function fetchAll(table) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*&order=id.asc`, {
    headers: { apikey: SUPABASE_SERVICE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_KEY}` },
  });
  if (!r.ok) throw new Error(`${table}: ${r.status} ${await r.text()}`);
  return r.json();
}

// The app creates the tables on first use; create them here too in case the
// copy runs before the first deploy.
const { ensureSchema } = await import("../lib/db.js").catch(() => ({}));
const sql = neon(DATABASE_URL);
const ms = (v) => (v ? new Date(v).getTime() : v);
let failed = false;

if (ensureSchema) await ensureSchema();
const notes = await fetchAll("private_notes");
const sessions = await fetchAll("notes_sessions");
console.log(`Supabase: ${notes.length} notes, ${sessions.length} sessions`);
if (!dryRun) {
  for (const n of notes) {
    await sql`insert into private_notes (id, title, body, footer, version, created_at, updated_at)
      values (${n.id}, ${n.title}, ${n.body}, ${n.footer}, ${n.version}, ${n.created_at}, ${n.updated_at})
      on conflict (id) do update set title = excluded.title, body = excluded.body, footer = excluded.footer,
        version = excluded.version, created_at = excluded.created_at, updated_at = excluded.updated_at`;
  }
  for (const s of sessions) {
    await sql`insert into notes_sessions (id, ip, device, created_at, last_seen)
      values (${s.id}, ${s.ip}, ${s.device}, ${s.created_at}, ${s.last_seen}) on conflict (id) do nothing`;
  }
  const copied = new Map((await sql`select * from private_notes`).map((r) => [r.id, r]));
  const bad = notes.filter((n) => {
    const c = copied.get(n.id);
    return !c || c.title !== n.title || c.body !== n.body || c.footer !== n.footer || c.version !== n.version || ms(c.updated_at) !== ms(n.updated_at);
  });
  failed = bad.length > 0;
  console.log(`Neon: ${copied.size} notes; mismatched ${bad.length} ${failed ? "✗" : "✓"}`);
}
process.exit(failed ? 1 : 0);
