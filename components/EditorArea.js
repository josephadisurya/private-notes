import { useState, useEffect, useRef } from "react";

export default function EditorArea({ title, setTitle, body, setBody, titleRef, bodyRef, adjustTextareaHeight, keyboardHeight }) {
  const [showToolbar, setShowToolbar] = useState(false);
  const [toolbarPos, setToolbarPos] = useState(null);
  const [activeFormats, setActiveFormats] = useState({ bold: false, italic: false, underline: false, strikeThrough: false });
  const [isBodyEmpty, setIsBodyEmpty] = useState(true);
  const isMobileRef = useRef(false);
  const loadedRef = useRef(false);

  useEffect(() => {
    const check = () => { isMobileRef.current = window.innerWidth < 1024; };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Initialize contenteditable from localStorage load, or clear when body is reset
  useEffect(() => {
    if (body === "" && bodyRef.current) {
      bodyRef.current.innerHTML = "";
      loadedRef.current = false;
      setIsBodyEmpty(true);
    } else if (!loadedRef.current && body && bodyRef.current) {
      bodyRef.current.innerHTML = body;
      loadedRef.current = true;
      setIsBodyEmpty(bodyRef.current.textContent.trim() === "");
    }
  }, [body]);

  // Show toolbar when text is selected inside the body
  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      const selectedText = selection?.toString().trim();

      if (!selectedText || !bodyRef.current?.contains(selection.anchorNode)) {
        setShowToolbar(false);
        return;
      }

      setShowToolbar(true);
      setActiveFormats({
        bold: document.queryCommandState("bold"),
        italic: document.queryCommandState("italic"),
        underline: document.queryCommandState("underline"),
        strikeThrough: document.queryCommandState("strikeThrough"),
      });

      if (!isMobileRef.current && selection.rangeCount > 0) {
        const rect = selection.getRangeAt(0).getBoundingClientRect();
        setToolbarPos({ top: rect.bottom + 8, left: rect.left + rect.width / 2 });
      } else {
        setToolbarPos(null);
      }
    };

    document.addEventListener("selectionchange", handleSelection);
    return () => document.removeEventListener("selectionchange", handleSelection);
  }, []);

  const applyFormat = (command) => {
    document.execCommand(command, false, null);
    setBody(bodyRef.current.innerHTML);
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

  return (
    <>
      <div className="w-full max-w-3xl px-8">
        <textarea
          className="w-full mb-14 tracking-wide text-[17px] font-bold focus:outline-none focus:ring-0 special-t placeholder:text-neutral-400 dark:placeholder:text-neutral-500 dark:bg-neutral-900"
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
              setBody(e.currentTarget.innerHTML);
              setIsBodyEmpty(e.currentTarget.textContent.trim() === "");
            }}
            onPaste={(e) => {
              e.preventDefault();
              document.execCommand("insertText", false, e.clipboardData.getData("text/plain"));
            }}
            className="w-full mb-28 text-[17px] tracking-wide font-medium focus:outline-none focus:ring-0 special-t bg-white dark:bg-neutral-900 min-h-[60vh]"
            style={{ lineHeight: "32px", wordBreak: "break-word" }}
          />
          {isBodyEmpty && (
            <div
              className="absolute top-0 left-0 pointer-events-none select-none text-neutral-400 dark:text-neutral-500 text-[17px] tracking-wide font-medium"
              style={{ lineHeight: "32px" }}
            >
              <div className="">You can start typing here, you can also...</div>
              <div className="flex gap-2"><span>•</span><span>Select words to style it.</span></div>
              <div className="flex gap-2"><span>•</span><span>Download it into a file.</span></div>
              <div className="flex gap-2"><span>•</span><span>Clear all and start over.</span></div>
            </div>
          )}
        </div>
      </div>

      {showToolbar && (
        <div
          className={`fixed z-50 special-t ${toolbarPos === null ? "left-1/2 -translate-x-1/2" : ""}`}
          style={toolbarPos
            ? { top: toolbarPos.top, left: toolbarPos.left, transform: "translateX(-50%)" }
            : { bottom: Math.max(144, keyboardHeight + 16), transition: "bottom 0.2s ease" }
          }
        >
          <div className="bg-white dark:bg-neutral-800 shadow-[0_4px_24px_rgba(0,0,0,0.12)] rounded-2xl p-1 flex flex-row gap-1">
            {buttons.map(({ label, command, activeKey, className }) => (
              <button
                key={command}
                onMouseDown={(e) => { e.preventDefault(); applyFormat(command); }}
                className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm transition-colors duration-200 ${className} ${activeFormats[activeKey] ? "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400" : "hover:bg-neutral-100 dark:hover:bg-neutral-700"}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
