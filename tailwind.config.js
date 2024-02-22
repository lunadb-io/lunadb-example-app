/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,svelte,js,ts}'],
  daisyui: {
    themes: ["cupcake"]
  },
  plugins: [require('@tailwindcss/typography'), require("daisyui")],
}

