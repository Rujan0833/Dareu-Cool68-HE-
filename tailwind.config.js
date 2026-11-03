/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        atk: {
          bg: '#09090b',
          surface: '#111115',
          card: '#16161c',
          border: '#23232b',
          'border-light': '#2f2f3a',
          hover: '#1e1e26',
          orange: '#ff5c00',
          'orange-hover': '#ff7324',
          'orange-glow': 'rgba(255, 92, 0, 0.35)',
          amber: '#f59e0b',
          cyan: '#06b6d4',
          subtext: '#8a8a98',
          text: '#f4f4f6',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      boxShadow: {
        'atk-glow': '0 0 20px -3px rgba(255, 92, 0, 0.4)',
        'atk-card': '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
      }
    },
  },
  plugins: [],
}
