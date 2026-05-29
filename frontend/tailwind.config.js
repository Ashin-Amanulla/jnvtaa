/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        surface: "var(--surface)",
        foreground: "var(--foreground)",
        muted: "var(--muted)",
        "muted-foreground": "var(--muted-foreground)",
        border: "var(--border)",
        // Brand primary (deep navy, evolved from house-blue)
        brand: {
          DEFAULT: "var(--brand)",
          hover: "var(--brand-hover)",
          soft: "var(--brand-soft)",
          foreground: "var(--brand-foreground)",
        },
        // Supporting accent palette (the four NVS house colours, refined)
        accent: "var(--accent)",
        pen: "var(--pen)",
        "house-green": "var(--house-green)",
        "house-red": "var(--house-red)",
        "house-blue": "var(--house-blue)",
        "house-yellow": "var(--house-yellow)",
        "house-green-soft": "var(--house-green-soft)",
        "house-red-soft": "var(--house-red-soft)",
        "house-blue-soft": "var(--house-blue-soft)",
        "house-yellow-soft": "var(--house-yellow-soft)",
        postit: "var(--postit)",
        card: "var(--card)",
        "card-foreground": "var(--card-foreground)",
        // shadcn (admin) tokens
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        ring: "hsl(var(--ring))",
        input: "hsl(var(--input))",
      },
      fontFamily: {
        sans: ['"Inter"', "system-ui", "sans-serif"],
        display: ['"Outfit"', '"Inter"', "system-ui", "sans-serif"],
        heading: ['"Outfit"', '"Inter"', "system-ui", "sans-serif"],
        admin: ['"Inter"', "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.125rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(16, 24, 40, 0.04), 0 1px 3px rgba(16, 24, 40, 0.08)",
        cardHover:
          "0 10px 24px -8px rgba(16, 24, 40, 0.16), 0 4px 8px -4px rgba(16, 24, 40, 0.08)",
        elevated:
          "0 16px 40px -12px rgba(16, 24, 40, 0.2), 0 6px 12px -6px rgba(16, 24, 40, 0.1)",
        brand: "0 8px 20px -6px rgba(30, 58, 95, 0.35)",
        noneFlat: "0 0 0 0 transparent",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.5s ease-out",
        "slide-down": "slideDown 0.5s ease-out",
        float: "float 6s ease-in-out infinite",
        "blob-drift": "blobDrift 14s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-14px)" },
        },
        blobDrift: {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(12px, -10px) scale(1.05)" },
          "66%": { transform: "translate(-10px, 8px) scale(0.97)" },
        },
      },
      maxWidth: {
        content: "72rem",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
