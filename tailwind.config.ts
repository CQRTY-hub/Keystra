import type { Config } from "tailwindcss";

// Theme tokens live in src/app/globals.css's @theme block now (Tailwind
// v4's CSS-first config), sourced from Design/keystra_terminal_design_system_design.md
// — not here. This file only keeps the content globs; don't add a
// `theme` block that could drift out of sync with the one source of truth.
const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
};

export default config;
