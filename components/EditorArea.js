import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

export default function EditorArea({ title, setTitle, body, setBody, titleRef, bodyRef, adjustTextareaHeight, toolbarSlot, font }) {
  const [activeFormats, setActiveFormats] = useState({ bold: false, italic: false, underline: false, strikeThrough: false });
  const [isBodyEmpty, setIsBodyEmpty] = useState(true);
  const loadedRef = useRef(false);

  // Custom undo/redo — the browser's native contentEditable undo groups
  // keystrokes unpredictably (a single Ctrl+Z can erase an entire sentence
  // typed at normal speed, confirmed via testing), so we track our own
  // history instead of relying on execCommand('undo'). Typing debounces
  // into one history entry per pause (~500ms); formatting/paste commit
  // immediately as their own step.
  const historyRef = useRef({ stack: [], index: -1 });
  const historyTimerRef = useRef(null);
  // Distinguishes "body became '' because undo walked back to the start"
  // from "body became '' because Clear All reset it" — both look identical
  // to the load/reset effect below via the body prop alone, but only the
  // latter should wipe and reseed history.
  const isApplyingHistoryRef = useRef(false);

  const seedHistory = (html) => {
    historyRef.current = { stack: [html], index: 0 };
  };

  const pushHistory = (html) => {
    const h = historyRef.current;
    if (h.stack[h.index] === html) return;
    const truncated = h.stack.slice(0, h.index + 1);
    truncated.push(html);
    // Cap so this can't grow unbounded over a long writing session.
    const MAX = 100;
    const overflow = truncated.length - MAX;
    h.stack = overflow > 0 ? truncated.slice(overflow) : truncated;
    h.index = h.stack.length - 1;
  };

  const commitHistoryNow = (html) => {
    clearTimeout(historyTimerRef.current);
    pushHistory(html);
  };

  const scheduleHistoryPush = (html) => {
    clearTimeout(historyTimerRef.current);
    historyTimerRef.current = setTimeout(() => pushHistory(html), 500);
  };

  const applyHistorySnapshot = (html) => {
    if (!bodyRef.current) return;
    isApplyingHistoryRef.current = true;
    bodyRef.current.innerHTML = html;
    setBody(html);
    setIsBodyEmpty(bodyRef.current.textContent.trim() === "");
    // Best-effort cursor placement at the end — precise position tracking
    // across undo steps isn't worth the complexity for this app.
    bodyRef.current.focus();
    const range = document.createRange();
    range.selectNodeContents(bodyRef.current);
    range.collapse(false);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  };

  const undo = () => {
    clearTimeout(historyTimerRef.current);
    const h = historyRef.current;
    if (h.index <= 0) return;
    h.index -= 1;
    applyHistorySnapshot(h.stack[h.index]);
  };

  const redo = () => {
    clearTimeout(historyTimerRef.current);
    const h = historyRef.current;
    if (h.index >= h.stack.length - 1) return;
    h.index += 1;
    applyHistorySnapshot(h.stack[h.index]);
  };

  const handleBodyKeyDown = (e) => {
    const mod = e.metaKey || e.ctrlKey;
    if (!mod || e.key.toLowerCase() !== "z") return;
    e.preventDefault();
    if (e.shiftKey) redo();
    else undo();
  };

  // Initialize contenteditable from localStorage load, or clear when body is reset
  useEffect(() => {
    if (isApplyingHistoryRef.current) {
      // This body change came from our own undo()/redo() — the DOM and
      // history stack are already correct, so skip the reseed below
      // (otherwise undoing all the way back to "" would wipe the redo
      // stack, indistinguishable here from an external Clear All).
      isApplyingHistoryRef.current = false;
      return;
    }
    if (body === "" && bodyRef.current) {
      bodyRef.current.innerHTML = "";
      loadedRef.current = false;
      setIsBodyEmpty(true);
      seedHistory("");
    } else if (!loadedRef.current && body && bodyRef.current) {
      bodyRef.current.innerHTML = body;
      loadedRef.current = true;
      setIsBodyEmpty(bodyRef.current.textContent.trim() === "");
      seedHistory(body);
    }
  }, [body]);

  // The toolbar is always visible and always stays fixed at the bottom —
  // it doesn't move to follow the selection, only its button states
  // (bold/italic/etc active highlight) update to reflect the cursor.
  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      const inBody = !!(selection && bodyRef.current?.contains(selection.anchorNode));
      if (!inBody) return;

      setActiveFormats({
        bold: document.queryCommandState("bold"),
        italic: document.queryCommandState("italic"),
        underline: document.queryCommandState("underline"),
        strikeThrough: document.queryCommandState("strikeThrough"),
      });
    };

    document.addEventListener("selectionchange", handleSelection);
    handleSelection();
    return () => document.removeEventListener("selectionchange", handleSelection);
  }, []);

  const applyFormat = (command) => {
    document.execCommand(command, false, null);
    const html = bodyRef.current.innerHTML;
    setBody(html);
    commitHistoryNow(html);
    setActiveFormats({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
      strikeThrough: document.queryCommandState("strikeThrough"),
    });
  };

  const buttons = [
    { label: "B", command: "bold", activeKey: "bold", className: "font-bold" },
    { label: "i", command: "italic", activeKey: "italic", className: "italic" },
    { label: "U", command: "underline", activeKey: "underline", className: "underline" },
    { label: "S", command: "strikeThrough", activeKey: "strikeThrough", className: "line-through" },
  ];

  const fontClass = font === "serif" ? "serif-t" : font === "dyslexic" ? "dyslexic-t" : "special-t";

  return (
    <>
      <div className="w-full max-w-3xl px-8">
        <textarea
          className={`w-full mb-14 tracking-wide text-[17px] font-bold focus:outline-none focus:ring-0 ${fontClass} placeholder:text-neutral-400 dark:placeholder:text-neutral-500 beige:placeholder:text-[#594e38] bg-transparent dark:bg-neutral-900`}
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onInput={(e) => adjustTextareaHeight(e.target)}
          style={{ overflow: "hidden", resize: "none" }}
          rows={1}
          ref={titleRef}
        />

        <div className="relative">
          <div
            ref={bodyRef}
            contentEditable
            suppressContentEditableWarning
            onInput={(e) => {
              loadedRef.current = true;
              const html = e.currentTarget.innerHTML;
              setBody(html);
              setIsBodyEmpty(e.currentTarget.textContent.trim() === "");
              scheduleHistoryPush(html);
            }}
            onPaste={(e) => {
              e.preventDefault();
              document.execCommand("insertText", false, e.clipboardData.getData("text/plain"));
              commitHistoryNow(bodyRef.current.innerHTML);
            }}
            onKeyDown={handleBodyKeyDown}
            onBlur={(e) => commitHistoryNow(e.currentTarget.innerHTML)}
            className={`w-full mb-28 text-[17px] tracking-wide font-medium focus:outline-none focus:ring-0 ${fontClass} bg-white dark:bg-neutral-900 beige:bg-[#f8efdb] min-h-[60vh]`}
            style={{ lineHeight: "32px", wordBreak: "break-word" }}
          />
          {isBodyEmpty && (
            <div
              className={`absolute top-0 left-0 pointer-events-none select-none text-neutral-400 dark:text-neutral-500 beige:text-[#594e38] text-[17px] tracking-wide font-medium ${fontClass}`}
              style={{ lineHeight: "32px" }}
            >
              <div className="">You can start typing here, you can also...</div>
              <div className="flex gap-2"><span>•</span><span>Use the toolbar to style your text.</span></div>
              <div className="flex gap-2"><span>•</span><span>Download it into a file.</span></div>
              <div className="flex gap-2"><span>•</span><span>Choose the font style.</span></div>
              <div className="flex gap-2"><span>•</span><span>Clear all and start over.</span></div>
            </div>
          )}
        </div>
      </div>

      {toolbarSlot && createPortal(
        <div className="special-t bg-white dark:bg-neutral-800 beige:bg-[#fbf6e9] shadow-[0_2px_8px_rgba(0,0,0,0.1)] rounded-2xl p-1 flex flex-row gap-1">
          {buttons.map(({ label, command, activeKey, className }) => (
            <button
              key={command}
              onMouseDown={(e) => { e.preventDefault(); applyFormat(command); }}
              className={`w-11 h-11 lg:w-9 lg:h-9 flex items-center justify-center rounded-xl text-sm transition-colors duration-200 ${className} ${activeFormats[activeKey] ? "bg-blue-100 dark:bg-blue-900/40 beige:bg-[#e8d3a0] text-blue-600 dark:text-blue-400 beige:text-[#463a25]" : "hover:bg-neutral-100 dark:hover:bg-neutral-700 beige:hover:bg-[#f0e2be]"}`}
            >
              {label}
            </button>
          ))}
        </div>,
        toolbarSlot
      )}
    </>
  );
}
