module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1e293b",
        accent: "#2563eb"
      },
      fontFamily: {
        sans: ["Inter", "Plus Jakarta Sans", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
}

