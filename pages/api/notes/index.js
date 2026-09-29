import { listNotes } from "../../../lib/notes";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ notes: await listNotes() });
  } catch (e) {
    console.error(e);
    return res.status(502).json({ error: "Couldn't load notes" });
  }
}
