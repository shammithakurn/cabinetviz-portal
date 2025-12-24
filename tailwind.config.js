/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary palette
        primary: {
          50: '#2A2520',
          100: '#3D3530',
          200: '#524840',
          300: '#6B5D50',
          400: '#8B7355',
          500: '#5D4E37',
          600: '#7A6B52',
          700: '#9C8A6E',
          800: '#B8A992',
          900: '#D4CCC0',
        },
        // Dark theme - Wood-inspired colors
        cream: '#1A1816',           // Dark rich background
        'warm-white': '#121110',    // Darkest background
        charcoal: '#E8E4DD',        // Light text on dark
        'dark-surface': '#1E1C1A',  // Card/surface background
        'dark-elevated': '#252320', // Elevated surfaces
        walnut: {
          DEFAULT: '#C4A77D',       // Warm gold for accents (swapped from oak)
          light: '#D4B896',
          dark: '#5D4E37',          // Original walnut for subtle use
        },
        oak: {
          DEFAULT: '#E8D5B7',       // Light oak for highlights
          light: '#F0E4CE',
          dark: '#C4A77D',
        },
        accent: {
          DEFAULT: '#D4A72C',       // Brighter gold for dark theme
          light: '#E8BC4A',
          dark: '#B8860B',
        },
        text: {
          DEFAULT: '#E8E4DD',       // Light text for dark backgrounds
          light: '#A09890',         // Muted text
          muted: '#6B6560',         // Very muted text
        },
        border: {
          DEFAULT: '#3D3530',       // Subtle borders
          light: '#524840',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(93, 78, 55, 0.08)',
        'medium': '0 8px 40px rgba(93, 78, 55, 0.12)',
        'strong': '0 20px 60px rgba(93, 78, 55, 0.15)',
      },
      borderRadius: {
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
      },
      animation: {
        'fade-in-up': 'fadeInUp 1s ease',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(-50%) translateX(0)' },
          '50%': { transform: 'translateY(-52%) translateX(-10px)' },
        },
      },
    },
  },
  plugins: [],
}
