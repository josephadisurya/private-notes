// Server-only note storage (Supabase private_notes table), via the
// service-role client in ./supabase. Never import from client code.
import { sbSelect, sbUpsert, sbDelete } from "./supabase";

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

export async function saveNote(id, { title = "", body = "", footer = "" }) {
  const [row] = await sbUpsert(TABLE, [{ id, title, body, footer, updated_at: new Date().toISOString() }], "id");
  return row;
}

export async function deleteNote(id) {
  await sbDelete(TABLE, "id", id);
}
