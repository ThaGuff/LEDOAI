import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // LEDO AI Brand Colors - inspired by goodcall.ai dark navy
        ledo: {
          50: '#f0f4ff',
          100: '#e0e9ff',
          200: '#c7d7fe',
          300: '#a5b9fc',
          400: '#8192f8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        navy: {
          50: '#f0f4ff',
          100: '#e0eaff',
          200: '#c1d5ff',
          300: '#93b4ff',
          400: '#5e89ff',
          500: '#3d61ff',
          600: '#1f3ef5',
          700: '#1730e1',
          800: '#1929b5',
          900: '#1a278f',
          950: '#111827',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-ledo': 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
        'gradient-card': 'linear-gradient(135deg, #ffffff 0%, #f8faff 100%)',
      }
    },
  },
  plugins: [require('@tailwindcss/forms')],
}
export default config
