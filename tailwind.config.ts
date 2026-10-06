import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        card: "0 8px 30px rgba(0,0,0,0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
