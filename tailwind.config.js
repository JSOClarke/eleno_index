/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
        serif: ['"Newsreader"', "Georgia", "serif"],
      },
      colors: {
        ink: "#111111",
        lime: "#B8FF01",
        paper: "#FFFFFF",
        subtle: "#F4F4F2",
        hairline: "#E2E2DF",
      },
    },
  },
  plugins: [],
};
