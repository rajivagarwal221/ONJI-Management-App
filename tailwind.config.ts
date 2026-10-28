import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // ONJI brand — brown on cream
        brand: {
          DEFAULT: "#A4521E",
          bright: "#B4601F",
          hover: "#8E4418",
          press: "#773812",
          soft: "#F3E6D8",
          fg: "#FFFFFF",
        },
        ink: {
          DEFAULT: "#2A1D13",
          mute: "#6B5947",
        },
        paper: {
          DEFAULT: "#FBF7F0",
          soft: "#F5EEE2",
          elev: "#FFFFFF",
          55: "rgba(251, 247, 240, 0.55)",
          68: "rgba(251, 247, 240, 0.68)",
          40: "rgba(251, 247, 240, 0.40)",
        },
        line: {
          DEFAULT: "#E8DECF",
          strong: "#D9C9B0",
        },
      },
      borderRadius: {
        chip: "9999px",
        control: "10px",
        surface: "14px",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Fraunces", "Georgia", "serif"],
        mono: ["ui-monospace", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        brand: "4px 4px 0 rgba(164, 82, 30, 0.22)",
      },
    },
  },
  plugins: [],
};
export default config;
