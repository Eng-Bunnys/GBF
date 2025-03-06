import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class', 
  theme: {
    extend: {
      fontFamily: {
        indie: ["Indie Flower", "cursive"],
      },
    },
  },
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  plugins: [],
};

export default config;
