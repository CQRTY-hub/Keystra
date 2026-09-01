import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Deliberately minimal in Phase 1. Security headers (Phase 3.8), image
  // domains for supplier CODE_IMAGE keys, and Sentry wiring get added
  // when those phases actually start — not before.

  // `next dev` otherwise auto-appends an "agent rules" block to
  // CLAUDE.md on every run (node_modules/next/dist/server/lib/
  // generate-agent-files.js) — that file is the storefront owner's own
  // rule set; nothing gets added to it that they didn't put there
  // themselves (2026-09-01).
  agentRules: false,
};

export default nextConfig;
