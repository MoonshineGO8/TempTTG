/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-blue': '#3b4083',
        'brand-light': '#8f8cb8',
        'brand-cyan': '#7ab6b5',
        'brand-bg': '#f9f8ff',
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
  ],
}
