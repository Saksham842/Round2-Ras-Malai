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
          500: '#14b8a6', // Primary Brand Teal
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e',
        },
        mongo: {
          bg: '#001e2b',
          deep: '#01121d',
          card: '#0a1d28',
          cardHover: '#0f2939',
          border: '#133549',
          green: '#00ED64',
          mint: '#71F79F',
          spruce: '#023430',
        },
        render: {
          cyan: '#00F5FF',
          indigo: '#6366F1',
          violet: '#A855F7',
          pink: '#EC4899',
          dark: '#070913',
          card: '#0c1024',
          border: '#1c2242',
        },
        cyber: {
          bg: '#020611',
          surface: '#070d18',
          card: '#0b1626',
          cardHover: '#102038',
          border: '#1a2e48',
          accent: '#00ED64',
          cyan: '#00F5FF',
          glow: 'rgba(0, 237, 100, 0.25)',
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
        'glow-teal': '0 0 25px -5px rgba(20, 184, 166, 0.4)',
        'glow-cyan': '0 0 25px -5px rgba(6, 182, 212, 0.4)',
        'glow-emerald': '0 0 25px -5px rgba(16, 185, 129, 0.4)',
        'glow-mongo': '0 0 35px -5px rgba(0, 237, 100, 0.4)',
        'glow-render': '0 0 35px -5px rgba(0, 245, 255, 0.35)',
        'glow-neon': '0 0 45px -5px rgba(0, 237, 100, 0.25), 0 0 20px -2px rgba(0, 245, 255, 0.2)',
      },
    },
  },
  plugins: [],
};
