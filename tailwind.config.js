const plugin = require("tailwindcss/plugin");

/** @type {import('tailwindcss').Config} */
module.exports = {
   content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",

    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // 'class' instead of the default 'media' so the theme picker can force a
  // specific theme regardless of the OS's prefers-color-scheme setting.
  darkMode: "class",
  theme: {
    extend: {
      screens: {
        sm: "414px",
      },
      colors: {
        
      },
      fontFamily: {
        courierprime: ['Courier Prime', 'monospace'],
        noto: ['Noto Sans Mono', 'monospace'],
      },
    },
  },
  plugins: [
    // beige:bg-... etc. — activates when a 'beige' class is on an ancestor
    // (<html>), same mechanism as Tailwind's own class-based dark: variant.
    plugin(function ({ addVariant }) {
      addVariant("beige", ".beige &");
    }),
  ],
}
