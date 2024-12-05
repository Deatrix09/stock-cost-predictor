/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        streamDown: {
          '0%': { transform: 'translateY(-100%)', opacity: 0 },
          '50%': { opacity: 1 },
          '100%': { transform: 'translateY(100%)', opacity: 0 }
        },
        candlestick: {
          '0%, 100%': { height: '20%', opacity: 0.3 },
          '50%': { height: '80%', opacity: 0.8 }
        }
      }
    },
  },
  plugins: [],
}
