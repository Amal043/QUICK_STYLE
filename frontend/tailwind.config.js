/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        midnight: '#FAF8F5',       /* Light ivory base background */
        obsidian: '#FFFFFF',       /* Card background (pure white) */
        panelBorder: '#E8E2D9',    /* Exquisite gold-dust sand border */
        coral: {
          DEFAULT: '#5C1324',      /* Imperial Velvet Burgundy */
          hover: '#430E1A',
          glow: 'rgba(92, 19, 36, 0.12)'
        },
        lavender: {
          DEFAULT: '#C5A880',      /* Default Champagne Gold */
          light: '#F7F4EB',        /* Soft cream background */
          brand: '#C5A880',        /* Champagne Gold / Muted Sand */
          dark: '#FAF8F5',         /* Cream/Ivory light container */
          deep: '#F5F1E8',         /* Warm beige accent */
          accent: '#C5A880',       /* Champagne Gold highlight */
          bgHover: '#EFEBE0'
        },
        emerald: {
          DEFAULT: '#10B981',
          dark: '#064E3B',
          light: '#D1FAE5'
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
      animation: {
        'pulse-subtle': 'pulseSubtle 2s infinite ease-in-out',
        'bounce-slow': 'bounce 1.5s infinite',
        'shimmer': 'shimmer 2.5s infinite linear',
        'float': 'float 3s ease-in-out infinite',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in': 'fadeIn 0.3s ease-out forwards',
      },
      keyframes: {
        pulseSubtle: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.02)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(5px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
