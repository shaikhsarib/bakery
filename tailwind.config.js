module.exports = {
  content: ["./*.html", "./*.js"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "var(--primary)",
          dark: "var(--primary-dark)",
          light: "var(--primary-light)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          dark: "var(--accent-dark)",
          light: "var(--accent-light)",
        },
        brand: {
          bg: "var(--bg)",
          surface: "var(--surface)",
          "surface-2": "var(--surface-2)",
          foreground: "var(--foreground)",
          muted: "var(--foreground-muted)",
          subtle: "var(--foreground-subtle)",
          dark: "var(--dark)",
          border: "var(--border)",
          "border-light": "var(--border-light)",
        },
        success: "var(--success)",
        error: "var(--error)",
      },
      fontFamily: {
        sans: ["DM Sans", "sans-serif"],
        display: ["Fraunces", "serif"],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(28, 15, 0, 0.05), 0 2px 4px -1px rgba(28, 15, 0, 0.03)',
        'float': '0 20px 25px -5px rgba(28, 15, 0, 0.1), 0 10px 10px -5px rgba(28, 15, 0, 0.04)',
      }
    },
  },
  plugins: [],
};
