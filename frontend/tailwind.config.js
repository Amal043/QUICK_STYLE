/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Lux Noir Zevana Color Palette
        "surface-container-high": "#2a2a2a",
        "on-secondary": "#2f3131",
        "inverse-surface": "#e5e2e1",
        "surface-dim": "#131313",
        "secondary": "#c6c6c7",
        "on-error": "#690005",
        "on-secondary-fixed-variant": "#454747",
        "surface-container": "#201f1f",
        "tertiary-fixed": "#fedeb2",
        "on-tertiary-fixed-variant": "#584323",
        "surface-container-highest": "#353534",
        "outline": "#988e90",
        "surface-bright": "#393939",
        "on-surface-variant": "#cfc4c5",
        "primary-fixed": "#e2e2e2",
        "error": "#ffb4ab",
        "surface-variant": "#353534",
        "tertiary-container": "#000000",
        "surface-container-low": "#1c1b1b",
        "on-primary-container": "#757575",
        "on-primary-fixed-variant": "#474747",
        "secondary-fixed-dim": "#c6c6c7",
        "surface-tint": "#c6c6c6",
        "on-secondary-fixed": "#1a1c1c",
        "on-primary-fixed": "#1b1b1b",
        "tertiary-fixed-dim": "#e0c298",
        "primary": "#c6c6c6",
        "surface": "#131313",
        "primary-container": "#000000",
        "background": "#131313", // using #131313, but body is overridden to #000000 in index.css
        "outline-variant": "#4c4546",
        "inverse-on-surface": "#313030",
        "primary-fixed-dim": "#c6c6c6",
        "on-surface": "#e5e2e1",
        "on-tertiary-container": "#8a714d",
        "on-tertiary-fixed": "#281800",
        "on-secondary-container": "#b4b5b5",
        "on-tertiary": "#402d0f",
        "secondary-fixed": "#e2e2e2",
        "surface-container-lowest": "#0e0e0e",
        "secondary-container": "#454747",
        "inverse-primary": "#5e5e5e",
        "on-primary": "#303030",
        "error-container": "#93000a",
        "on-error-container": "#ffdad6",
        "tertiary": "#e0c298",
        "on-background": "#e5e2e1",
        
        // Legacy colors kept for compatibility with existing components (e.g. Map, Profile)
        midnight: '#FAF8F5',       
        obsidian: '#FFFFFF',       
        panelBorder: '#E8E2D9',    
        coral: {
          DEFAULT: '#5C1324',      
          hover: '#430E1A',
          glow: 'rgba(92, 19, 36, 0.12)'
        },
        lavender: {
          DEFAULT: '#C5A880',      
          light: '#F7F4EB',        
          brand: '#C5A880',        
          dark: '#FAF8F5',         
          deep: '#F5F1E8',         
          accent: '#C5A880',       
          bgHover: '#EFEBE0'
        },
        emerald: {
          DEFAULT: '#10B981',
          dark: '#064E3B',
          light: '#D1FAE5'
        }
      },
      borderRadius: {
        "DEFAULT": "0.125rem",
        "lg": "0.25rem",
        "xl": "0.5rem",
        "full": "0.75rem",
        '2xl': '16px',
        '3xl': '24px',
      },
      spacing: {
        "margin-desktop": "48px",
        "section-py-lg": "128px",
        "unit": "4px",
        "section-py-md": "96px",
        "margin-mobile": "16px",
        "gutter": "24px"
      },
      fontFamily: {
        "display-md": ["Playfair Display"],
        "body-bold": ["Outfit"],
        "headline-md": ["Playfair Display"],
        "display-lg-mobile": ["Playfair Display"],
        "display-lg": ["Playfair Display"],
        "body-base": ["Outfit"],
        "label-caps": ["Outfit"],
        "label-caps-xs": ["Outfit"],
        "sans": ["Outfit", "Inter", "sans-serif"],
      },
      fontSize: {
        "display-md": ["36px", { "lineHeight": "44px", "letterSpacing": "-0.01em", "fontWeight": "600" }],
        "body-bold": ["16px", { "lineHeight": "24px", "fontWeight": "600" }],
        "headline-md": ["24px", { "lineHeight": "32px", "fontWeight": "600" }],
        "display-lg-mobile": ["32px", { "lineHeight": "40px", "letterSpacing": "-0.01em", "fontWeight": "700" }],
        "display-lg": ["48px", { "lineHeight": "56px", "letterSpacing": "-0.02em", "fontWeight": "700" }],
        "body-base": ["16px", { "lineHeight": "24px", "fontWeight": "400" }],
        "label-caps": ["11px", { "lineHeight": "16px", "letterSpacing": "0.15em", "fontWeight": "700" }],
        "label-caps-xs": ["9px", { "lineHeight": "12px", "letterSpacing": "0.15em", "fontWeight": "800" }]
      },
      animation: {
        'marquee_20s_linear_infinite': 'marquee 20s linear infinite',
        'pulse-subtle': 'pulseSubtle 2s infinite ease-in-out',
        'bounce-slow': 'bounce 1.5s infinite',
        'shimmer': 'shimmer 2.5s infinite linear',
        'float': 'float 3s ease-in-out infinite',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in': 'fadeIn 0.3s ease-out forwards',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
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
  plugins: [
    require('@tailwindcss/container-queries'),
    require('@tailwindcss/forms'),
  ],
}
