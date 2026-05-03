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
        canvas: "#f4efe6",
        midnight: "#10212b",
        terracotta: "#c96f4a",
        moss: "#58715d",
        brand: {
          50: "#f7f1ea",
          100: "#f2e4d5",
          200: "#e8c9aa",
          300: "#dca175",
          400: "#cd7b53",
          500: "#bc5f3f",
          600: "#a64a31",
          700: "#863b29",
          800: "#6c3226",
          900: "#592c23"
        },
        ink: "#10212b",
        surface: "#fbf7f1"
      },
      fontFamily: {
        sans: ["Avenir Next", "Segoe UI", "Helvetica Neue", "Arial", "sans-serif"],
        display: ["Iowan Old Style", "Palatino Linotype", "Book Antiqua", "Georgia", "serif"]
      },
      spacing: {
        18: "4.5rem",
        26: "6.5rem"
      },
      boxShadow: {
        soft: "0 25px 60px -28px rgba(16, 33, 43, 0.32)",
        float: "0 30px 80px -34px rgba(16, 33, 43, 0.28)",
        glow: "0 0 20px -5px rgba(188, 95, 63, 0.4)"
      },
      animation: {
        'fade-in': 'fadeIn 0.7s ease-out',
        'slide-up': 'slideUp 0.5s ease-out forwards',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'floating 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        floating: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    }
  },
  plugins: []
};
