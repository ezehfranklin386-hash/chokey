import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          900: '#0A0E27',
          800: '#0F1636',
          700: '#151D45',
          600: '#1C2554',
          500: '#24306A',
          400: '#3B4A8A',
        },
        gold: {
          500: '#D4A843',
          400: '#E0BD60',
          300: '#ECD17D',
          200: '#F5E4A0',
          100: '#FDF5D6',
        },
        market: {
          green: '#22C55E',
          red: '#EF4444',
        },
        warning: '#F59E0B',
        info: '#60A5FA',
        white: {
          DEFAULT: '#FFFFFF',
          90: '#E5E6EB',
          70: '#B3B5C2',
          50: '#808394',
          30: '#4D5168',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
        display: ['Playfair Display', 'Georgia', 'serif'],
      },
      fontSize: {
        'crypto-xs': ['11px', { lineHeight: '16px', fontFamily: 'JetBrains Mono' }],
        'crypto-sm': ['13px', { lineHeight: '18px', fontFamily: 'JetBrains Mono' }],
        'crypto-base': ['16px', { lineHeight: '24px', fontFamily: 'JetBrains Mono' }],
        'crypto-lg': ['24px', { lineHeight: '32px', fontFamily: 'JetBrains Mono' }],
        'crypto-xl': ['36px', { lineHeight: '44px', fontFamily: 'JetBrains Mono' }],
      },
      borderRadius: {
        micro: '4px',
        DEFAULT: '8px',
        card: '12px',
        modal: '16px',
        pill: '24px',
      },
      boxShadow: {
        'glow-gold': '0 0 20px rgba(212, 168, 67, 0.15)',
        'glow-gold-md': '0 0 30px rgba(212, 168, 67, 0.1)',
      },
      animation: {
        'price-up': 'flashGreen 0.5s ease-out',
        'price-down': 'flashRed 0.5s ease-out',
        'shimmer': 'shimmer 2s ease-in-out infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-gold': 'pulseGold 0.6s ease-in-out',
      },
      keyframes: {
        flashGreen: {
          '0%': { backgroundColor: 'rgba(34, 197, 94, 0.2)' },
          '100%': { backgroundColor: 'transparent' },
        },
        flashRed: {
          '0%': { backgroundColor: 'rgba(239, 68, 68, 0.2)' },
          '100%': { backgroundColor: 'transparent' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(212, 168, 67, 0.4)' },
          '50%': { boxShadow: '0 0 0 10px rgba(212, 168, 67, 0)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
