/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Pixel-art retro color scheme: deep purple/navy base, neon cyan & lime green accents
        blue: {
          50: '#0a0e27',   // almost black (deep navy)
          100: '#1a1d3a',  // dark navy
          200: '#2d1b69',  // deep purple
          300: '#3d2d7a',  // purple
          400: '#4a3a8a',  // mid purple
          500: '#5a4a9a',  // bright purple
          600: '#6b5aaa',  // bright purple
          700: '#7a6aba',  // lighter purple
          800: '#8a7aca',  // even lighter
          900: '#9a8ada'   // light purple
        },
        cyan: {
          50: '#000000',   // black (pixel borders)
          100: '#1a1a1a',  // near black
          200: '#333333',  // dark gray
          300: '#555555',  // gray
          400: '#00d9ff',  // neon cyan (bright)
          500: '#00b8d4',  // cyan
          600: '#0088aa',  // darker cyan
          700: '#005577',  // deep cyan
          800: '#003344',  // very deep cyan
          900: '#001122'   // nearly black cyan
        },
        yellow: {
          50: '#000000',   // black
          100: '#1a1a1a',  // near black
          200: '#333333',  // dark gray
          300: '#555555',  // gray
          400: '#00ff00',  // neon lime green (bright)
          500: '#00dd00',  // bright green
          600: '#00bb00',  // green
          700: '#009900',  // darker green
          800: '#006600',  // dark green
          900: '#003300'   // very dark green
        },
        green: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#00ff00',  // neon lime (accent)
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d'
        },
        purple: {
          50: '#0a0e27',   // deep navy
          100: '#1a1d3a',  // dark purple
          200: '#2d1b69',
          300: '#3d2d7a',
          400: '#4a3a8a',
          500: '#5a4a9a',
          600: '#6b5aaa',
          700: '#7a6aba',
          800: '#8a7aca',
          900: '#9a8ada'
        },
        red: {
          50: '#000000',
          100: '#1a1a1a',
          200: '#ff3333',  // bright red
          300: '#ff5555',
          400: '#ff6666',
          500: '#ff4444',
          600: '#dd0000',
          700: '#bb0000',
          800: '#990000',
          900: '#660000'
        },
        slate: {
          50: '#000000',   // black
          100: '#1a1a1a',
          200: '#333333',
          300: '#555555',
          400: '#777777',
          500: '#999999',
          600: '#aaaaaa',
          700: '#cccccc',
          800: '#dddddd',
          900: '#eeeeee'   // near white
        },
        fuchsia: {
          50: '#ff00ff',   // neon magenta
          100: '#ff33ff',
          200: '#ff55ff',
          300: '#ff77ff',
          400: '#ff99ff',
          500: '#dd00dd',
          600: '#bb00bb',
          700: '#990099',
          800: '#660066',
          900: '#330033'
        }
      }
    },
  },
  plugins: [],
};
