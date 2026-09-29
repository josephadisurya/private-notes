import { authEnabled, COOKIE_NAME } from "../../lib/auth";
import { listSessions, deleteSession, deleteOtherSessions } from "../../lib/sessions";

export default async function handler(req, res) {
  if (!authEnabled()) {
    if (req.method === "GET") return res.status(200).json({ disabled: true, sessions: [] });
    return res.status(200).json({ ok: true });
  }

  const currentId = req.cookies?.[COOKIE_NAME] || null;

  if (req.method === "GET") {
    const sessions = (await listSessions()).map((s) => ({
      id: s.id,
      device: s.device,
      ip: s.ip,
      createdAt: s.createdAt,
      lastSeen: s.lastSeen,
      isCurrent: s.id === currentId,
    }));
    return res.status(200).json({ disabled: false, sessions });
  }

  if (req.method === "DELETE") {
    const { id, all } = req.query;
    if (all === "1") {
      await deleteOtherSessions(currentId);
      return res.status(200).json({ ok: true });
    }
    if (!id) return res.status(400).json({ error: "Session id required" });
    await deleteSession(id);
    return res.status(200).json({ ok: true });
  }

  res.setHeader("Allow", "GET, DELETE");
  return res.status(405).json({ error: "Method not allowed" });
}
