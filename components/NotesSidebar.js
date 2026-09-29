import { useEffect, useRef, useState } from "react";
import { onSaved } from "@/lib/noteSaver";

const focusRing = "outline-none focus-visible:ring-2 focus-visible:ring-blue-600/40";
const muted = "text-neutral-500 dark:text-neutral-400 beige:text-[#594e38]";
const rowHover = "hover:bg-neutral-100 dark:hover:bg-neutral-800 beige:hover:bg-[#efe3c8]";
const line = "border-neutral-200 dark:border-neutral-700 beige:border-[#e6d6b3]";

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: d.getFullYear() === now.getFullYear() ? undefined : "numeric" });
}

// Slide-in list of saved notes (left side), with New note, delete, and the
// signed-in devices. The current note is shown even before its first save
// reaches the server (e.g. typed offline), from the page's own state.
export default function NotesSidebar({ open, onClose, currentId, currentNote, onOpenNote, onNewNote, onDeleted }) {
  const [notes, setNotes] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const [confirmId, setConfirmId] = useState(null);
  const [sessions, setSessions] = useState(null);
  const [showDevices, setShowDevices] = useState(false);
  const panelRef = useRef(null);

  async function loadNotes() {
    try {
      const res = await fetch("/api/notes");
      if (!res.ok) throw new Error();
      setNotes((await res.json()).notes);
      setLoadError(false);
    } catch {
      setLoadError(true);
    }
  }

  async function loadSessions() {
    try {
      const res = await fetch("/api/sessions");
      if (res.ok) setSessions((await res.json()).sessions);
    } catch {}
  }

  useEffect(() => {
    if (!open) return;
    setConfirmId(null);
    loadNotes();
    panelRef.current?.focus();
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Keep the list fresh while it's open as saves land.
  useEffect(() => onSaved(() => open && loadNotes()), [open]);

  useEffect(() => {
    if (open && showDevices) loadSessions();
  }, [open, showDevices]);

  async function deleteNote(id) {
    setConfirmId(null);
    setNotes((list) => list?.filter((n) => n.id !== id));
    onDeleted(id);
  }

  async function signOutOthers() {
    await fetch("/api/sessions?all=1", { method: "DELETE" });
    loadSessions();
  }

  async function signOut() {
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/login";
  }

  // Server list, with the current note merged in (title/preview from what's
  // on screen, so the row updates as you type).
  const text = (html = "") => html.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
  const hasCurrent = currentNote && (currentNote.title.trim() || text(currentNote.body));
  let rows = notes || [];
  if (hasCurrent) {
    const cur = { id: currentId, title: currentNote.title, preview: text(currentNote.body).slice(0, 120) };
    const existing = rows.find((n) => n.id === currentId);
    rows = existing ? rows.map((n) => (n.id === currentId ? { ...n, ...cur } : n)) : [{ ...cur, updatedAt: new Date().toISOString() }, ...rows];
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/30 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        ref={panelRef}
        tabIndex={-1}
        aria-label="Notes"
        aria-hidden={!open}
        className={`fixed inset-y-0 left-0 z-50 w-[300px] max-w-[85vw] flex flex-col bg-white dark:bg-neutral-900 beige:bg-[#f8efdb] border-r ${line} shadow-2xl outline-none special-t transition-transform duration-300 ease-out ${open ? "translate-x-0" : "-translate-x-full invisible"}`}
      >
        <div className={`flex items-center justify-between gap-2 px-4 pb-3 border-b ${line}`} style={{ paddingTop: "calc(0.75rem + env(safe-area-inset-top))" }}>
          <h2 className="text-sm font-semibold">Notes</h2>
          <button onClick={onClose} aria-label="Close notes" className={`w-11 h-11 -mr-2 flex items-center justify-center rounded-lg ${muted} hover:text-black dark:hover:text-white beige:hover:text-[#463a25] ${focusRing}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-4 h-4" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="p-3">
          <button onClick={onNewNote} className={`w-full flex items-center gap-2 px-3 h-11 rounded-xl text-sm font-medium ${rowHover} transition-colors ${focusRing}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-4 h-4" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New note
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-3 flex flex-col gap-1">
          {notes === null && !loadError && <p className={`px-3 py-2 text-sm ${muted}`}>Loading…</p>}
          {loadError && (
            <p className={`px-3 py-2 text-sm ${muted}`}>
              Couldn't load notes.{" "}
              <button onClick={loadNotes} className={`underline ${focusRing}`}>Try again</button>
            </p>
          )}
          {notes !== null && rows.length === 0 && <p className={`px-3 py-2 text-sm ${muted}`}>No saved notes yet.</p>}
          {rows.map((n) => {
            const isCurrent = n.id === currentId;
            if (confirmId === n.id) {
              return (
                <div key={n.id} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 dark:bg-red-950/40 beige:bg-[#f3dcc8]">
                  <span className="flex-1 min-w-0 text-sm truncate">Delete "{n.title || "Untitled"}"?</span>
                  <button onClick={() => deleteNote(n.id)} className={`h-9 px-3 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 ${focusRing}`}>Delete</button>
                  <button onClick={() => setConfirmId(null)} className={`h-9 px-2 rounded-lg text-sm ${muted} ${focusRing}`}>Cancel</button>
                </div>
              );
            }
            return (
              <div key={n.id} className={`group flex items-stretch rounded-xl ${isCurrent ? "bg-neutral-100 dark:bg-neutral-800 beige:bg-[#efe3c8]" : rowHover} transition-colors`}>
                <button
                  onClick={() => onOpenNote(n.id)}
                  aria-current={isCurrent ? "true" : undefined}
                  className={`flex-1 min-w-0 text-left px-3 py-2.5 rounded-xl ${focusRing}`}
                >
                  <span className="flex items-baseline gap-2">
                    <span className="flex-1 min-w-0 truncate text-sm font-medium">{n.title || "Untitled"}</span>
                    <span className={`shrink-0 text-xs tabular-nums ${muted}`}>{formatDate(n.updatedAt)}</span>
                  </span>
                  {n.preview && <span className={`block truncate text-xs mt-0.5 ${muted}`}>{n.preview}</span>}
                </button>
                <button
                  onClick={() => setConfirmId(n.id)}
                  aria-label={`Delete ${n.title || "Untitled"}`}
                  className={`shrink-0 w-11 flex items-center justify-center rounded-xl ${muted} hover:text-red-600 transition-colors ${focusRing}`}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
                    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>

        <div className={`border-t ${line} p-3 flex flex-col gap-1`} style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}>
          <button
            onClick={() => setShowDevices((v) => !v)}
            aria-expanded={showDevices}
            className={`w-full flex items-center justify-between px-3 h-11 rounded-xl text-sm ${rowHover} transition-colors ${focusRing}`}
          >
            Signed-in devices
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={`w-4 h-4 transition-transform ${showDevices ? "rotate-180" : ""}`} aria-hidden="true">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          {showDevices && (
            <div className="px-3 pb-2 flex flex-col gap-2">
              {sessions === null ? (
                <p className={`text-xs ${muted}`}>Loading…</p>
              ) : (
                sessions.map((s) => (
                  <div key={s.id} className="text-xs">
                    <span className="font-medium">{s.device}</span>
                    {s.isCurrent && <span className={muted}> · this device</span>}
                    <div className={muted}>Last active {formatDate(s.lastSeen)}</div>
                  </div>
                ))
              )}
              {sessions && sessions.length > 1 && (
                <button onClick={signOutOthers} className={`self-start text-xs font-medium underline ${focusRing}`}>Sign out other devices</button>
              )}
            </div>
          )}
          <button onClick={signOut} className={`w-full text-left px-3 h-11 rounded-xl text-sm ${rowHover} transition-colors ${focusRing}`}>
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
