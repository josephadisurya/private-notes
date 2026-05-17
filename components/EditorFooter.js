function countWords(title, body) {
  const combinedText = `${title} ${body.replace(/<[^>]+>/g, " ")}`.trim();
  const words = combinedText.split(/\s+/);
  return words.length === 1 && words[0] === "" ? 0 : words.length;
}

export default function EditorFooter({ iconsVisible, footer, title, body }) {
  const words = countWords(title, body);

  return (
    <div className={`fixed bottom-0 w-full pointer-events-none transition-opacity duration-500 ${iconsVisible ? "opacity-100" : "opacity-0"}`}>
      {/* gradient fade */}
      <div className="w-full h-20 bg-gradient-to-t from-white dark:from-neutral-900 to-transparent" />
      {/* solid background with text */}
      <div className="bg-white dark:bg-neutral-900 flex justify-between items-end px-8 pb-5 pt-1">
        <div className="text-xs dark:text-neutral-400 text-neutral-500 max-w-[240px] pointer-events-auto">
          {footer || "Only you can see what you write. Content is stored locally."}
        </div>
        <div className="text-xs dark:text-neutral-400 text-neutral-500 shrink-0 pl-4 pointer-events-auto">
          {words} {words === 1 ? "word" : "words"}
        </div>
      </div>
    </div>
  );
}
