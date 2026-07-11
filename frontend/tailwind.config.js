/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        cloud: "#EAF7F5",
        dawn: "#BFE6EC",
        blush: "#F6CBD4",
        coral: "#EF8FA8",
        teal: "#204E57",
        ink: "#33474A",
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        body: ["Manrope", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      boxShadow: {
        cloud: "0 10px 40px -12px rgba(32, 78, 87, 0.18)",
      },
      keyframes: {
        drift: {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(3%, 4%) scale(1.08)" },
          "66%": { transform: "translate(-3%, 2%) scale(0.96)" },
        },
        floatUp: {
          "0%": { opacity: 0, transform: "translateY(14px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      },
      animation: {
        drift: "drift 18s ease-in-out infinite",
        floatUp: "floatUp 0.6s ease forwards",
      },
    },
  },
  plugins: [],
};
