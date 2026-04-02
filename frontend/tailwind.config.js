/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        muted: "var(--muted)",
        "muted-foreground": "var(--muted-foreground)",
        border: "var(--border)",
        accent: "var(--accent)",
        pen: "var(--pen)",
        postit: "var(--postit)",
        card: "var(--card)",
        "card-foreground": "var(--card-foreground)",
      },
      fontFamily: {
        sans: ['"Patrick Hand"', "cursive"],
        display: ['"Kalam"', "cursive"],
        heading: ['"Kalam"', "cursive"],
      },
      borderRadius: {
        wobbly: "255px 15px 225px 15px / 15px 225px 15px 255px",
        wobblyMd:
          "15px 255px 15px 225px / 225px 15px 255px 15px",
        wobblySm: "28px 8px 22px 8px / 8px 22px 8px 28px",
      },
      boxShadow: {
        sketch: "4px 4px 0 0 #2d2d2d",
        sketchLg: "8px 8px 0 0 #2d2d2d",
        sketchSm: "2px 2px 0 0 #2d2d2d",
        sketchCard: "3px 3px 0 0 rgba(45, 45, 45, 0.1)",
        noneFlat: "0 0 0 0 transparent",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.5s ease-out",
        "slide-down": "slideDown 0.5s ease-out",
        "sketch-bounce": "sketchBounce 3s ease-in-out infinite",
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
        sketchBounce: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
      outlineWidth: {
        3: "3px",
      },
      outlineOffset: {
        3: "3px",
      },
      maxWidth: {
        content: "64rem",
      },
    },
  },
  plugins: [],
};
