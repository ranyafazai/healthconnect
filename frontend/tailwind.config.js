const colors = require('tailwindcss/colors')

module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#008CBA',
        'primary-dark': '#007BA3',
        success: '#4CAF50',
        'success-dark': '#45A049',
        background: {
          DEFAULT: '#F8FCFF',
          white: '#FFFFFF',
          blue: '#E8F4FD',
        },
        card: '#FFFFFF',
        'card-foreground': '#333333',
        border: '#E5E5E5',
        'text-primary': '#333333',
        'text-secondary': '#666666',
        'text-muted': '#999999',
      },
      fontFamily: {
        sans: ['Open Sans', 'system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'],
        roboto: ['Roboto', 'Arial', 'Helvetica', 'sans-serif'],
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  variants: {
    extend: {
      borderColor: ['focus-visible'],
      opacity: ['disabled'],
    }
  },
  plugins: [],
}