// Server-only note storage (Supabase private_notes table), via the
// service-role client in ./supabase. Never import from client code.
import { sbSelect, sbInsert, sbPatch, sbDelete } from "./supabase";

const TABLE = "private_notes";

// Short plain-text preview for the sidebar list (body is stored as HTML).
function preview(html = "") {
  return html.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim().slice(0, 120);
}

export async function listNotes() {
  const rows = await sbSelect(TABLE, { select: "id,title,body,created_at,updated_at", order: "updated_at.desc" });
  return rows.map((r) => ({ id: r.id, title: r.title || "", preview: preview(r.body), createdAt: r.created_at, updatedAt: r.updated_at }));
}

export async function getNote(id) {
  const rows = await sbSelect(TABLE, { id: `eq.${id}` });
  return rows[0] || null;
}

// Saves only if the note is still at `baseVersion` (the version this device
// last saw). Returns { note } on success or { conflict: serverNote } when
// another device saved in between. baseVersion null = a new note.
export async function saveNote(id, { title = "", body = "", footer = "" }, baseVersion) {
  const now = new Date().toISOString();
  if (baseVersion != null) {
    const [row] = await sbPatch(TABLE, { id: `eq.${id}`, version: `eq.${baseVersion}` }, { title, body, footer, version: baseVersion + 1, updated_at: now });
    if (row) return { note: row };
  }
  const current = await getNote(id);
  if (current) return { conflict: current };
  // New, or deleted on another device meanwhile: (re)create it.
  const [row] = await sbInsert(TABLE, [{ id, title, body, footer, version: 1, updated_at: now }]);
  return { note: row };
}

export async function deleteNote(id) {
  await sbDelete(TABLE, "id", id);
}
