/** @type {import('tailwindcss').Config} */
module.exports = {
   content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
 
    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
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
  plugins: [],
}
