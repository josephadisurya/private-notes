import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { subscribe, getStatus } from "../lib/noteSaver";

function useSaveStatus() {
  return useSyncExternalStore(subscribe, getStatus, () => "saved");
}

function useOnline() {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine !== false);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);
  return online;
}

// Small pill in the header. Hidden while everything is saved, except for a
// brief "Saved" confirmation right after a pending change goes through.
export function SaveStatusPill({ mutedClass, subtleBgClass }) {
  const status = useSaveStatus();
  const [justSaved, setJustSaved] = useState(false);
  const prev = useRef(status);

  useEffect(() => {
    if (status === "saved" && prev.current !== "saved") {
      setJustSaved(true);
      const t = setTimeout(() => setJustSaved(false), 2000);
      prev.current = status;
      return () => clearTimeout(t);
    }
    prev.current = status;
  }, [status]);

  let label, cls;
  if (status === "saving") {
    label = "Saving…";
    cls = `${subtleBgClass} ${mutedClass}`;
  } else if (status === "offline") {
    label = "Offline · not saved";
    cls = "bg-amber-400 text-neutral-900";
  } else if (status === "error") {
    label = "Not saved · retrying";
    cls = "bg-red-500 text-white";
  } else if (status === "unauthorized") {
    label = "Signed out · not saved";
    cls = "bg-red-500 text-white";
  } else if (justSaved) {
    label = "Saved";
    cls = `${subtleBgClass} ${mutedClass}`;
  } else {
    return null;
  }

  return (
    <span role="status" aria-live="polite" data-save-status={status}
      className={`text-xs font-medium px-2 py-1 rounded-lg whitespace-nowrap transition-colors ${cls}`}>
      {label}
    </span>
  );
}

// Full-width explanation under the header when something needs attention.
export function SaveStatusBanner({ className = "" }) {
  const status = useSaveStatus();
  const online = useOnline();

  let text, cls;
  if (status === "unauthorized") {
    cls = "bg-red-500 text-white";
    text = (
      <>
        Your session expired, so recent changes aren&apos;t saved yet.{" "}
        <a href="/login" target="_blank" rel="noopener" className="underline font-semibold">Log in again</a>
        {" "}in a new tab. They&apos;ll save automatically after that. Don&apos;t close this tab.
      </>
    );
  } else if (status === "offline" || (!online && status !== "saved")) {
    cls = "bg-amber-400 text-neutral-900";
    text = "You're offline. Your changes are kept on this device and will save when the connection is back. Don't close this tab.";
  } else if (!online) {
    cls = "bg-amber-400 text-neutral-900";
    text = "You're offline. Changes you make will save when the connection is back.";
  } else if (status === "error") {
    cls = "bg-red-500 text-white";
    text = "Couldn't save your latest changes. Retrying automatically. Don't close this tab.";
  } else {
    return null;
  }

  return (
    <div role="alert" data-save-banner={status}
      className={`px-4 py-2.5 text-xs font-medium leading-relaxed rounded-xl ${cls} ${className}`}>
      {text}
    </div>
  );
}
