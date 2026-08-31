/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        heat: {
          low: '#10B981',
          mod: '#F59E0B',
          high: '#F97316',
          extreme: '#EF4444',
        }
      }
    },
  },
  plugins: [],
}
