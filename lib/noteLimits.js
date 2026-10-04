// Size limits for one note, shared by the editor and the API.
export const TITLE_MAX = 200;
export const TEXT_MAX = 100_000; // characters of plain text in the body
export const HTML_MAX = 1_000_000; // stored body HTML, formatting included (server safety net)

export function textLength(html = "") {
  return html.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/&[a-z#0-9]+;/gi, "x").length;
}
