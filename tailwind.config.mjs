/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        tibet: {
          blue: '#1a4b6e',
          red: '#c41e3a',
          gold: '#d4a84b',
          cream: '#f5f0e8'
        }
      }
    }
  },
  plugins: []
};
