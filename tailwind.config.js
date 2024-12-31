/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./about.html", "./src/**/*.{ts,tsx}"],
  theme: {
    screens: {
      sm: "302px",
      // => @media (min-width: 302px) { ... }
      md: "512px",
      // => @media (min-width: 512px) { ... }
    },
    extend: {},
  },
  plugins: [],
};
