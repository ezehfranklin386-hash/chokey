import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ── Brand: Coinbase Blue ─────────────────────────
        brand: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#0052FF',
          600: '#0037B3',
          700: '#002D93',
          800: '#001F66',
          900: '#001247',
        },
        // ── Gold (secondary accent, kept for dark mode) ──
        gold: {
          500: '#D4A843',
          400: '#E0BD60',
          300: '#ECD17D',
          200: '#F5E4A0',
          100: '#FDF5D6',
        },
        // ── Coinbase Orange (Bitcoin accent) ────────────
        'cb-orange': {
          500: '#F7931A',
          400: '#F9A83A',
        },
        // ── Dark theme surfaces (existing) ──────────────
        primary: {
          900: '#0A0E27',
          800: '#0F1636',
          700: '#151D45',
          600: '#1C2554',
          500: '#24306A',
          400: '#3B4A8A',
        },
        // ── Light theme surfaces ────────────────────────
        surface: {
          DEFAULT: '#FFFFFF',
          secondary: '#F8F9FB',
          tertiary: '#F0F2F5',
        },
        // ── Semantic ─────────────────────────────────────
        market: {
          green: '#16A34A',
          red: '#DC2626',
        },
        warning: '#F59E0B',
        info: '#60A5FA',
        // ── Text colors (works in both modes) ──────────
        ink: {
          DEFAULT: '#0A0B0D',
          90: '#1A1B1E',
          70: '#6B7280',
          50: '#9CA3AF',
          30: '#D1D5DB',
        },
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
        'glow-brand': '0 0 20px rgba(0, 82, 255, 0.15)',
        'card': '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 4px 12px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
        'card-dark': '0 1px 3px rgba(0, 0, 0, 0.3)',
      },
      animation: {
        'price-up': 'flashGreen 0.5s ease-out',
        'price-down': 'flashRed 0.5s ease-out',
        'shimmer': 'shimmer 2s ease-in-out infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-brand': 'pulseBrand 0.6s ease-in-out',
      },
      keyframes: {
        flashGreen: {
          '0%': { backgroundColor: 'rgba(22, 163, 74, 0.15)' },
          '100%': { backgroundColor: 'transparent' },
        },
        flashRed: {
          '0%': { backgroundColor: 'rgba(220, 38, 38, 0.15)' },
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
        pulseBrand: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(0, 82, 255, 0.4)' },
          '50%': { boxShadow: '0 0 0 10px rgba(0, 82, 255, 0)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
