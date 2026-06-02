/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        saffron: {
          light: '#F8B589',
          DEFAULT: '#F4A261',
          dark: '#E76F51',
        },
        sage: {
          light: '#84A59D',
          DEFAULT: '#52796F',
          dark: '#354F52',
        },
        cream: {
          light: '#FFFDF0',
          DEFAULT: '#FEFAE0',
          dark: '#E9E5C9',
        },
        herbal: {
          light: '#2D6A4F',
          DEFAULT: '#1B4332',
          dark: '#081C15',
        },
        gold: {
          DEFAULT: '#D4AF37',
          dark: '#AA8811',
        },
        earth: {
          DEFAULT: '#3D2B1F',
          dark: '#261A13',
        }
      },
      fontFamily: {
        playfair: ['"Playfair Display"', 'serif'],
        sans: ['"Inter"', 'sans-serif'],
      }
    },
  },
  plugins: [
    // We will import it dynamically if using ES Modules
  ],
}
