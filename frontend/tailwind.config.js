/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "sans-serif",
        ],
        display: [
          '"Plus Jakarta Sans"',
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
      },
      colors: {
        brand: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
        },
      },
      boxShadow: {
        card:
          "0 1px 0 rgba(9, 9, 11, 0.04), 0 8px 24px -4px rgba(9, 9, 11, 0.08), 0 20px 48px -12px rgba(9, 9, 11, 0.06)",
        "card-sm":
          "0 1px 2px rgba(9, 9, 11, 0.04), 0 4px 12px -2px rgba(9, 9, 11, 0.06)",
        glow: "0 0 0 1px rgba(79, 70, 229, 0.08), 0 12px 40px -8px rgba(79, 70, 229, 0.35)",
      },
      letterSpacing: {
        tightest: "-0.02em",
        label: "0.08em",
      },
      borderRadius: {
        "4xl": "2rem",
      },
    },
  },
  plugins: [],
};
