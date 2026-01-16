/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class", // VERY IMPORTANT - enables class-based dark mode
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
