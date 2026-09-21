// Three themes: 'light' and 'dark' reuse all the existing Tailwind dark:
// classes throughout the app (now toggled by a class instead of OS
// preference); 'beige' is a new light-beige/black-text reading theme, using
// a parallel beige: variant (see tailwind.config.js) added alongside the
// existing dark: ones on the same elements.
export const THEMES = ["light", "dark", "beige"];
const STORAGE_KEY = "app-writer-theme";

// No saved preference yet -> mirror the OS setting (matches the previous
// auto dark-mode behavior before this became a manual picker). Beige is
// never auto-selected, only chosen explicitly.
export function getInitialTheme() {
  if (typeof window === "undefined") return "light";
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (THEMES.includes(saved)) return saved;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function applyTheme(theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.classList.toggle("beige", theme === "beige");
}

export function saveTheme(theme) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, theme);
}
