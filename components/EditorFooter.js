function countWords(title, body) {
  const combinedText = `${title} ${body.replace(/<[^>]+>/g, " ")}`.trim();
  const words = combinedText.split(/\s+/);
  return words.length === 1 && words[0] === "" ? 0 : words.length;
}

import { TEXT_MAX, textLength } from "@/lib/noteLimits";

export default function EditorFooter({ iconsVisible, footer, title, body, toolbarSlotRef }) {
  const words = countWords(title, body);
  const chars = textLength(body);
  const nearLimit = chars >= TEXT_MAX * 0.9;

  return (
    <div className={`fixed bottom-0 w-full pointer-events-none transition-opacity duration-500 ${iconsVisible ? "opacity-100" : "opacity-0"}`}>
      {/* gradient fade */}
      <div className="w-full h-20 bg-gradient-to-t from-white dark:from-neutral-900 beige:from-[#f8efdb] to-transparent" />
      {/* solid background with text + toolbar, all anchored as one bottom block.
          On wide screens the toolbar sits inline between the two text items;
          on narrow screens it wraps to its own line directly above them
          (order-1 + basis-full forces it onto the first row). */}
      <div className="bg-white dark:bg-neutral-900 beige:bg-[#f8efdb] flex flex-wrap justify-between items-end gap-x-4 gap-y-2 px-8 pb-5 pt-1">
        <div
          ref={toolbarSlotRef}
          className="order-1 lg:order-2 w-full lg:w-auto flex justify-center lg:justify-start pointer-events-auto"
        />
        <div className="order-2 lg:order-1 text-xs dark:text-neutral-400 text-neutral-500 beige:text-[#594e38] max-w-[240px] pointer-events-auto">
          {footer || "Only you can see what you write."}
        </div>
        <div className="order-3 text-xs dark:text-neutral-400 text-neutral-500 beige:text-[#594e38] shrink-0 pl-4 pointer-events-auto">
          {words} {words === 1 ? "word" : "words"}
          {nearLimit && (
            <span className={chars >= TEXT_MAX ? "text-red-600" : ""}> · {chars.toLocaleString("en")} / {TEXT_MAX.toLocaleString("en")} characters</span>
          )}
        </div>
      </div>
    </div>
  );
}
