import type { Config } from "tailwindcss";

// Deliberately empty theme. Phase 1 is unstyled on purpose (see PLAN.md,
// "Visual design in this phase: deliberately none"). The design pass in
// Phase 1.5 (Impeccable) is what fills this in — don't add colours,
// fonts or spacing scales here before that.
const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
};

export default config;
