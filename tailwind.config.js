/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        crema: {
          DEFAULT: "#FAF8F5",
          50: "#FDFCFA",
          100: "#FAF8F5",
          200: "#F5F0E8",
        },
        oro: {
          50: "#fdf9ef",
          100: "#f9f0d5",
          200: "#f2dda8",
          300: "#e9c572",
          400: "#e0ab42",
          500: "#d4af37",
          600: "#c5a059",
          700: "#a47d2f",
          800: "#86642b",
          900: "#6f5226",
          950: "#3f2c12",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        display: ["Playfair Display", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};
