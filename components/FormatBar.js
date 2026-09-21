const buttons = [
  { label: "B", command: "bold", activeKey: "bold", className: "font-bold" },
  { label: "i", command: "italic", activeKey: "italic", className: "italic" },
  { label: "U", command: "underline", activeKey: "underline", className: "underline" },
  { label: "S", command: "strikeThrough", activeKey: "strikeThrough", className: "line-through" },
];

export default function FormatBar({ show, toolbarPos, keyboardHeight, activeFormats, onFormat }) {
  if (!show) return null;

  return (
    <div
      className={`fixed z-50 special-t ${toolbarPos === null ? "left-1/2 -translate-x-1/2" : ""}`}
      style={toolbarPos
        ? { top: toolbarPos.top, left: toolbarPos.left, transform: "translateX(-50%)" }
        : { bottom: keyboardHeight + 16, transition: "bottom 0.2s ease" }
      }
    >
      <div className="bg-white dark:bg-neutral-800 shadow-[0_4px_24px_rgba(0,0,0,0.12)] rounded-2xl p-1 flex flex-row gap-1">
        {buttons.map(({ label, command, activeKey, className }) => (
          <button
            key={command}
            onMouseDown={(e) => { e.preventDefault(); onFormat(command); }}
            className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm transition-colors duration-200 ${className} ${activeFormats[activeKey] ? "bg-blue-100 dark:bg-blue-900/40 beige:bg-[#e8d3a0] text-blue-600 dark:text-blue-400 beige:text-[#463a25]" : "hover:bg-neutral-100 dark:hover:bg-neutral-700 beige:hover:bg-[#f0e2be]"}`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
