/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'flash': 'flash 0.3s ease-in-out',
      },
      keyframes: {
        flash: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)', boxShadow: '0 8px 16px rgba(139, 92, 246, 0.5)' },
          '100%': { transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}

