/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        "bg-primary": "var(--bg-primary)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "accent-yellow": "var(--accent-yellow)",
        "accent-blue": "var(--accent-blue)",
        white: "var(--white)"
      },
      fontFamily: {
        sans: ["var(--font-sans)"]
      }
    }
  },
  plugins: []
};