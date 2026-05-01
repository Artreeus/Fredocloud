/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "../../packages/types/**/*.{js,jsx}",
    "../../packages/utils/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f5f8ff",
          100: "#e8efff",
          200: "#cad8ff",
          300: "#9fb7ff",
          400: "#6f8dff",
          500: "#4766ff",
          600: "#2745f2",
          700: "#1d35c4",
          800: "#1d3098",
          900: "#1e3178"
        },
        ink: "#0f172a",
        surface: "#f8fafc"
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "sans-serif"]
      },
      spacing: {
        18: "4.5rem",
        26: "6.5rem"
      },
      boxShadow: {
        soft: "0 20px 45px -25px rgba(15, 23, 42, 0.35)"
      }
    }
  },
  plugins: []
};
