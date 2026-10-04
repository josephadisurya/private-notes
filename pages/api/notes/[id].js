export const config = { api: { bodyParser: { sizeLimit: "2mb" } } };

import { getNote, saveNote, deleteNote } from "../../../lib/notes";
import { TITLE_MAX, TEXT_MAX, HTML_MAX, textLength } from "../../../lib/noteLimits";

// Client-generated UUIDs only, so nothing odd reaches the PostgREST filter.
const ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function handler(req, res) {
  const { id } = req.query;
  if (!ID.test(id || "")) return res.status(400).json({ error: "Bad note id" });
  res.setHeader("Cache-Control", "no-store");

  try {
    if (req.method === "GET") {
      const note = await getNote(id);
      if (!note) return res.status(404).json({ error: "Not found" });
      return res.status(200).json({ note });
    }
    if (req.method === "PUT") {
      const { title = "", body = "", footer = "", baseVersion = null } = req.body || {};
      if ([title, body, footer].some((v) => typeof v !== "string") || footer.length > 500 || (baseVersion != null && !Number.isInteger(baseVersion))) {
        return res.status(400).json({ error: "Bad note" });
      }
      if (title.length > TITLE_MAX || body.length > HTML_MAX || textLength(body) > TEXT_MAX) {
        return res.status(413).json({ error: "too_big" });
      }
      const result = await saveNote(id, { title, body, footer }, baseVersion);
      if (result.conflict) return res.status(409).json({ note: result.conflict });
      return res.status(200).json({ version: result.note.version, updatedAt: result.note.updated_at });
    }
    if (req.method === "DELETE") {
      await deleteNote(id);
      return res.status(200).json({ ok: true });
    }
  } catch (e) {
    console.error(e);
    return res.status(502).json({ error: "Storage error" });
  }
  res.setHeader("Allow", "GET, PUT, DELETE");
  return res.status(405).json({ error: "Method not allowed" });
}
