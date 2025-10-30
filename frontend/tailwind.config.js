/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Re-map common color names to the new cream/white/silver + neon accents palette
        blue: {
          50: '#fffdf9',
          100: '#fff8ef',
          200: '#fbf2e6',
          300: '#f3e9df',
          400: '#e8e2da',
          500: '#d9d3cd',
          600: '#bfb7aa',
          700: '#9e9891',
          800: '#7f7874',
          900: '#5f5854'
        },
        cyan: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a'
        },
        yellow: {
          50: '#fff4ff',
          100: '#fee2ff',
          200: '#fec8ff',
          300: '#fda4ff',
          400: '#f472b6',
          500: '#d946ef',
          600: '#be185d',
          700: '#9d174d',
          800: '#831843',
          900: '#5b0f2e'
        },
        green: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d'
        },
        purple: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#4c1375'
        },
        red: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337'
        },
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a'
        },
        fuchsia: {
          50: '#fff1f7',
          100: '#fed7f3',
          200: '#fbcfe8',
          300: '#f0abfc',
          400: '#f472b6',
          500: '#d946ef',
          600: '#c026d3',
          700: '#a21caf',
          800: '#86198f',
          900: '#701a75'
        }
      }
    },
  },
  plugins: [],
};
