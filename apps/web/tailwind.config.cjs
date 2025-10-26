const colors = require('tailwindcss/colors');

module.exports = {
  darkMode: 'class',
  content: ['index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: colors.sky,
        secondary: colors.emerald,
      },
    },
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')],
};
