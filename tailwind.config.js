// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{html,ts}', // Update this path according to your project structure
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-yellow': 'linear-gradient(to right, #f59e0b, #facc15)', // yellow gradient
        // Add other gradients if needed
      },
      colors: {
        primary: '#3490dc', // Replace with your desired color value
        'custom-gray': '#F5F5F5',
        'custom-blue': '#007BFF',
        'custom-purple': '#6A1B9A',
        'custom-yellow': '#FDD835',
        'custom-orange': '#FF5722',
        'custom-light-blue': '#E3F2FD',
        'custom-sky-blue': '#81D4FA',
        'custom-dark-blue': '#0288D1',
        'custom-light-green': '#E8F5E9',
        'custom-green': '#A5D6A7',
        'custom-dark-green': '#388E3C',
      },
    },
  },
  plugins: [],
}
