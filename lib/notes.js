// Server-only note storage (private_notes table, Neon). Never import from
// client code.
import { sql, ensureSchema, iso } from "./db";

// Short plain-text preview for the sidebar list (body is stored as HTML).
function preview(html = "") {
  return html.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim().slice(0, 120);
}

const shape = (r) => r && { ...r, created_at: iso(r.created_at), updated_at: iso(r.updated_at) };
const isUuid = (id) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id || "");

export async function listNotes() {
  await ensureSchema();
  const rows = await sql`select id, title, body, created_at, updated_at from private_notes order by updated_at desc`;
  return rows.map((r) => ({ id: r.id, title: r.title || "", preview: preview(r.body), createdAt: iso(r.created_at), updatedAt: iso(r.updated_at) }));
}

export async function getNote(id) {
  if (!isUuid(id)) return null;
  await ensureSchema();
  const [row] = await sql`select * from private_notes where id = ${id}`;
  return shape(row) || null;
}

// Saves only if the note is still at `baseVersion` (the version this device
// last saw). Returns { note } on success or { conflict: serverNote } when
// another device saved in between. baseVersion null = a new note.
export async function saveNote(id, { title = "", body = "", footer = "" }, baseVersion) {
  await ensureSchema();
  if (baseVersion != null) {
    const [row] = await sql`
      update private_notes set title = ${title}, body = ${body}, footer = ${footer}, version = version + 1, updated_at = now()
      where id = ${id} and version = ${baseVersion} returning *`;
    if (row) return { note: shape(row) };
  }
  const current = await getNote(id);
  if (current) return { conflict: current };
  // New, or deleted on another device meanwhile: (re)create it. If another
  // device created it at the same moment, report that as a conflict.
  const [row] = await sql`
    insert into private_notes (id, title, body, footer, version, updated_at)
    values (${id}, ${title}, ${body}, ${footer}, 1, now())
    on conflict (id) do nothing returning *`;
  if (row) return { note: shape(row) };
  return { conflict: await getNote(id) };
}

export async function deleteNote(id) {
  if (!isUuid(id)) return;
  await ensureSchema();
  await sql`delete from private_notes where id = ${id}`;
}
