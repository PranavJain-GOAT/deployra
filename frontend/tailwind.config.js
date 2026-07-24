/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background:  '#09090B',
        secondary:   '#111113',
        card:        '#18181B',
        border:      '#27272A',
        success:     '#22C55E',
        warning:     '#F59E0B',
        danger:      '#EF4444',
        blue:        '#3B82F6',
        purple:      '#8B5CF6',
        foreground:  '#FAFAFA',
        muted:       '#A1A1AA',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        lg: '0.625rem',
        md: '0.5rem',
        sm: '0.375rem',
      },
      boxShadow: {
        card:  '0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)',
        soft:  '0 4px 6px -1px rgba(0,0,0,0.4), 0 2px 4px -2px rgba(0,0,0,0.3)',
        glow:  '0 0 0 1px rgba(59,130,246,0.4)',
      },
      keyframes: {
        'fade-in':    { from: { opacity: '0', transform: 'translateY(4px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        'slide-in':   { from: { transform: 'translateX(-100%)' }, to: { transform: 'translateX(0)' } },
        'pulse-dot':  { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.4' } },
        'tick':       { from: { opacity: '0.6' }, to: { opacity: '1' } },
      },
      animation: {
        'fade-in':   'fade-in 0.2s ease-out',
        'slide-in':  'slide-in 0.3s ease-out',
        'pulse-dot': 'pulse-dot 2s ease-in-out infinite',
        'tick':      'tick 1s ease-in-out infinite alternate',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
