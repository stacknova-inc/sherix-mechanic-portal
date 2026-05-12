import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./features/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./utils/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          red: "#e4072f",
          dark: "#17191f",
          muted: "#8f96a3",
          line: "#e7e9ee",
          soft: "#f7f8fa"
        }
      },
      boxShadow: {
        auth: "0 22px 58px rgba(21, 24, 31, 0.08)",
        signin: "0 30px 100px rgba(220, 13, 48, 0.16)",
        card: "0 8px 24px rgba(24, 28, 36, 0.06)"
      }
    }
  },
  plugins: [tailwindcssAnimate]
};

export default config;
