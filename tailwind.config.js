/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: '#FF4B2F', // Logo orange-red accent
          dark: '#D63A22',
        },
        ink: '#1D1D1F', // Apple soft black
        paper: '#FFFFFF',
        canvas: {
          DEFAULT: '#F5F5F7', // Apple light gray
          dark: '#0A0A0A', // Contrast dark background
        },
        gray: {
          300: '#D2D2D7', // Hairline borders
          500: '#86868B', // Secondary text
          700: '#424245', // Body text
        },
        success: '#2E7D32',
        error: '#D62828',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'sans-serif'], // Single typeface
      },
      borderRadius: {
        DEFAULT: '12px', // Soft rounded rect
        lg: '18px',
        full: '980px', // Pill buttons
      },
      boxShadow: {
        card: '0 4px 20px rgba(0,0,0,0.06)',
        hover: '0 8px 30px rgba(0,0,0,0.10)',
      },
    },
  },
  plugins: [],
};
