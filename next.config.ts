import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Deliberately minimal in Phase 1. Security headers (Phase 3.8), image
  // domains for supplier CODE_IMAGE keys, and Sentry wiring get added
  // when those phases actually start — not before.
};

export default nextConfig;
