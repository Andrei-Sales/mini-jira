/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
      },
      colors: {
        slateBrand: {
          50: '#f3f6fb',
          100: '#dfe7f4',
          200: '#c6d4eb',
          300: '#9eb6dc',
          400: '#7190ca',
          500: '#4e72b6',
          600: '#3e5b95',
          700: '#344a79',
          800: '#2f3f63',
          900: '#2b3754',
        },
        mintBrand: {
          50: '#eefcf8',
          100: '#d6f7ee',
          200: '#b2ecd8',
          300: '#7fdcbc',
          400: '#4ac59f',
          500: '#27ac86',
          600: '#1f8b6d',
          700: '#1d6f59',
          800: '#1c5948',
          900: '#1a4b3d',
        },
      },
      boxShadow: {
        card: '0 10px 30px rgba(18, 31, 53, 0.08)',
      },
    },
  },
  plugins: [],
}