/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        compass: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6', // Primary Brand Teal from Pitch Deck & Screenshot
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e',
        },
        cyber: {
          bg: '#050a0f',
          surface: '#0c1520',
          card: '#111d2c',
          cardHover: '#17273a',
          border: '#1f334a',
          accent: '#10b981', // Emerald
          cyan: '#06b6d4',
          teal: '#14b8a6',
          rose: '#f43f5e',
          sky: '#38bdf8',
          glow: 'rgba(20, 184, 166, 0.25)',
        },
        render: {
          bg: '#050a0f',
          deep: '#03070b',
          surface: '#0a131e',
          card: '#0e1c2b',
          cardHover: '#13273c',
          border: '#1a334a',
          borderHover: '#254a6c',
          cyan: '#00f0b5',
          cyanGlow: 'rgba(0, 240, 181, 0.4)',
          indigo: '#6366f1',
          violet: '#8b5cf6',
          pink: '#f43f5e',
          emerald: '#10b981',
          slate: '#94a3b8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
      animation: {
        'pulse-glow': 'pulseGlow 2.5s infinite ease-in-out',
        'radar-sweep': 'radarSweep 4s linear infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.9', transform: 'scale(1.05)' },
        },
        radarSweep: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      boxShadow: {
        'glow-teal': '0 0 25px -5px rgba(20, 184, 166, 0.5)',
        'glow-cyan': '0 0 25px -5px rgba(6, 182, 212, 0.5)',
        'glow-emerald': '0 0 25px -5px rgba(16, 185, 129, 0.5)',
        'glow-compass': '0 0 35px -5px rgba(20, 184, 166, 0.4)',
        'glow-needle': '0 0 20px -3px rgba(244, 63, 94, 0.5)',
      },
    },
  },
  plugins: [],
};
