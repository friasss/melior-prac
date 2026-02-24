/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#eff4ff",
          100: "#dbe6fe",
          200: "#bfd3fe",
          300: "#93b4fd",
          400: "#6090fa",
          500: "#3b6cf5",
          600: "#1d4ed8",
          700: "#1a3fba",
          800: "#1b3598",
          900: "#1c3178",
          950: "#152049",
        },
        surface: {
          light: "#f8fafc",
          dark: "#0c1322",
        },
        card: {
          light: "#ffffff",
          dark: "#141d2f",
        },
      },
      fontFamily: {
        display: ["'DM Sans'", "sans-serif"],
        heading: ["'Outfit'", "sans-serif"],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
