/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./app/index.html', './app/scripts/**/*.js'],
  theme: {
    extend: {
      colors: {
        glass: {
          light: 'rgba(255, 255, 255, 0.45)',
          dark: 'rgba(20, 20, 20, 0.65)',
          border: 'rgba(255, 255, 255, 0.2)',
          borderDark: 'rgba(255, 255, 255, 0.08)',
        },
      },
      boxShadow: {
        liquid: '0 8px 32px 0 rgba(0, 0, 0, 0.15)',
        glow: '0 0 15px rgba(59, 130, 246, 0.5)',
      },
    },
  },
};
