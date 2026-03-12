import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-nunito)', 'Nunito', 'sans-serif'],
      },
      colors: {
        coral: '#FF6B6B',
        teal: '#4ECDC4',
        yellow: '#FFE66D',
        'warm-white': '#FAF9F7',
      },
    },
  },
  plugins: [],
}

export default config
