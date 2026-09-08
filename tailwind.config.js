/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        sky: {
          950: '#0E2340', // azul-noite profundo (fundo/headers)
          800: '#1B3A5C', // azul principal
          600: '#2E5A85',
          100: '#EAF1F7', // fundo geral, quase branco azulado
        },
        deal: {
          DEFAULT: '#E8834B', // laranja-âmbar para promoções/quedas de preço
          dark: '#C4692F',
          light: '#FBE6D6',
        },
        ink: '#1A2332', // texto principal
        mist: '#5C6B7A', // texto secundário
        okgreen: '#2F9E62',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
