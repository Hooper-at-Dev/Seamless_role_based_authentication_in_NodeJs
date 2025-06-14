/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#00ffff',
          hover: '#00cccc',
        },
        secondary: {
          DEFAULT: '#ff00ff',
          hover: '#cc00cc',
        },
        accent: {
          DEFAULT: '#9333ea',
          hover: '#7e22ce',
        },
        background: {
          DEFAULT: '#0a0a0a',
          lighter: '#1a1a1a',
          card: 'rgba(26, 26, 26, 0.8)',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'cyberpunk-grid': 'linear-gradient(transparent 0%, rgba(0, 255, 255, 0.1) 1%, transparent 2%), linear-gradient(90deg, transparent 0%, rgba(0, 255, 255, 0.1) 1%, transparent 2%)',
      },
      boxShadow: {
        'neon-primary': '0 0 5px theme(colors.primary.DEFAULT), 0 0 20px theme(colors.primary.DEFAULT)',
        'neon-secondary': '0 0 5px theme(colors.secondary.DEFAULT), 0 0 20px theme(colors.secondary.DEFAULT)',
        'neon-accent': '0 0 5px theme(colors.accent.DEFAULT), 0 0 20px theme(colors.accent.DEFAULT)',
      },
      animation: {
        'gradient-x': 'gradient-x 15s ease infinite',
        'gradient-y': 'gradient-y 15s ease infinite',
        'gradient-xy': 'gradient-xy 15s ease infinite',
      },
      keyframes: {
        'gradient-y': {
          '0%, 100%': {
            'background-size': '400% 400%',
            'background-position': 'center top'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'center center'
          }
        },
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          }
        },
        'gradient-xy': {
          '0%, 100%': {
            'background-size': '400% 400%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          }
        }
      }
    },
  },
  plugins: [],
};