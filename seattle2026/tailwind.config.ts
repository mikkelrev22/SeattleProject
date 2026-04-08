import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
      },
      colors: {
        emerald: {
          DEFAULT: '#1a5c3a',
          light: '#2d8a58',
          pale: '#e8f5ee',
        },
        gold: {
          DEFAULT: '#c9a84c',
          light: '#f0c96e',
          pale: '#fdf6e3',
        },
        slate: {
          DEFAULT: '#1c2b3a',
          mid: '#2e4057',
        },
        fog: {
          DEFAULT: '#f0f2f0',
          dark: '#dde3dd',
        },
        rain: '#4a90b8',
      },
      borderRadius: {
        card: '16px',
      },
      animation: {
        shimmer: 'shimmer 1.4s infinite',
        'fade-up': 'fadeUp 0.4s ease forwards',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
