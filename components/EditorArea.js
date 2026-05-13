export default function EditorArea({ title, setTitle, body, setBody, titleRef, bodyRef, adjustTextareaHeight }) {
  return (
    <div className="w-full max-w-3xl px-8">
      <textarea
        className="w-full mb-14 tracking-wide text-[17px] font-bold focus:outline-none focus:ring-0 special-t placeholder:text-neutral-400 dark:placeholder:text-neutral-600 dark:bg-neutral-900"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onInput={(e) => adjustTextareaHeight(e.target)}
        style={{ overflow: "hidden", resize: "none" }}
        rows={1}
        ref={titleRef}
      />

      <textarea
        className="w-full mb-28 text-[17px] tracking-wide leading-[30px] font-medium focus:outline-none focus:ring-0 special-t placeholder:text-neutral-400 dark:placeholder:text-neutral-600 bg-white dark:bg-neutral-900"
        placeholder="Type here"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        onInput={(e) => adjustTextareaHeight(e.target)}
        style={{ overflow: "hidden", resize: "none", lineHeight: "32px" }}
        ref={bodyRef}
      />
    </div>
  );
}
