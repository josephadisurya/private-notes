// Client-side save queue for notes. Every edit is written to localStorage
// first (so nothing is lost if the tab closes offline), then sent to the API
// after a short pause. Failed saves retry with backoff and on reconnect;
// leftovers from a previous visit are sent on the next page load.
//
// Status (for the save pill/banner): "saved" | "saving" | "offline" |
// "error" | "unauthorized".

const STORAGE_KEY = "private-notes-pending";
const DEBOUNCE_MS = 700;
const RETRY_MS = [2000, 5000, 10000, 30000];

let status = "saved";
let pending = {}; // id -> { title, body, footer } | { deleted: true }, plus v (version)
let timer = null;
let retryTimer = null;
let retryCount = 0;
let flushing = false;
let version = 0;
const listeners = new Set();
const savedListeners = new Set();

function setStatus(next) {
  if (next === status) return;
  status = next;
  listeners.forEach((l) => l());
}

function persist() {
  try {
    if (Object.keys(pending).length) localStorage.setItem(STORAGE_KEY, JSON.stringify(pending));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
export const getStatus = () => status;
export const hasPending = () => Object.keys(pending).length > 0;

// Called after a note is written or deleted on the server, e.g. to refresh
// the sidebar list.
export function onSaved(listener) {
  savedListeners.add(listener);
  return () => savedListeners.delete(listener);
}

function isEmpty({ title = "", body = "" }) {
  return !title.trim() && !body.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").trim();
}

export function queueSave(id, note) {
  // A note emptied completely is removed instead of kept as a blank entry.
  pending[id] = isEmpty(note) ? { deleted: true, v: ++version } : { title: note.title || "", body: note.body || "", footer: note.footer || "", v: ++version };
  persist();
  setStatus(navigator.onLine === false ? "offline" : "saving");
  clearTimeout(timer);
  timer = setTimeout(flush, DEBOUNCE_MS);
}

export function queueDelete(id) {
  pending[id] = { deleted: true, v: ++version };
  persist();
  setStatus("saving");
  clearTimeout(timer);
  flush();
}

function scheduleRetry() {
  clearTimeout(retryTimer);
  const wait = RETRY_MS[Math.min(retryCount, RETRY_MS.length - 1)];
  retryCount += 1;
  retryTimer = setTimeout(flush, wait);
}

export async function flush() {
  if (flushing) return;
  const ids = Object.keys(pending);
  if (!ids.length) {
    setStatus("saved");
    return;
  }
  if (navigator.onLine === false) {
    setStatus("offline");
    return;
  }
  flushing = true;
  setStatus("saving");
  try {
    for (const id of ids) {
      const item = pending[id];
      if (!item) continue;
      const { v, deleted, ...note } = item;
      const res = await fetch(`/api/notes/${id}`, deleted
        ? { method: "DELETE" }
        : { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(note) });
      if (res.status === 401) {
        setStatus("unauthorized");
        scheduleRetry();
        return;
      }
      if (!res.ok) throw new Error(`Save failed: ${res.status}`);
      // Only clear it if nothing newer was typed while the request ran.
      if (pending[id]?.v === v) delete pending[id];
      persist();
      savedListeners.forEach((l) => l(id, deleted ? "deleted" : "saved"));
    }
    retryCount = 0;
    setStatus(hasPending() ? "saving" : "saved");
    if (hasPending()) timer = setTimeout(flush, DEBOUNCE_MS);
  } catch {
    setStatus(navigator.onLine === false ? "offline" : "error");
    scheduleRetry();
  } finally {
    flushing = false;
  }
}

// The most recent unsent copy of a note, if any (used when opening a note
// whose latest edits haven't reached the server yet).
export function pendingNote(id) {
  const item = pending[id];
  if (!item || item.deleted) return null;
  const { v, ...note } = item;
  return note;
}

let started = false;
export function startSaver() {
  if (started || typeof window === "undefined") return;
  started = true;
  try {
    pending = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") || {};
  } catch {
    pending = {};
  }
  window.addEventListener("online", () => {
    retryCount = 0;
    flush();
  });
  window.addEventListener("offline", () => {
    if (hasPending()) setStatus("offline");
  });
  window.addEventListener("beforeunload", (e) => {
    if (hasPending()) {
      e.preventDefault();
      e.returnValue = "";
    }
  });
  if (hasPending()) flush();
}
