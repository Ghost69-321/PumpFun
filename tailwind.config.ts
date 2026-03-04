import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#00d4aa',
          dark: '#00a884',
        },
        dark: {
          DEFAULT: '#0a0a0a',
          card: '#111111',
          border: '#1a1a1a',
        },
      },
    },
  },
  plugins: [],
}
export default config
