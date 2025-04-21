/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        purple: {
          500: '#6E00FF',
          600: '#5B00D6',
          700: '#4A00AD',
          800: '#390084',
          900: '#28005B',
        },
        cyan: {
          400: '#00D1FF',
          500: '#00B8E0',
          600: '#009FC4',
          700: '#0086A8',
        },
        pink: {
          500: '#FF0099',
          600: '#D6007F',
          700: '#AD0066',
          800: '#84004D',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};