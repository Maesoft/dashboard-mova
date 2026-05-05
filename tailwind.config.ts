import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#808000",
        dark: "#1E1E1E",
        darkSecondary: "#2A2A2A",
      },
    },
  },
  plugins: [],
};

export default config;