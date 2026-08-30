/**
 * "Donkere abstracte artwork" behind the hero headline — code-generated,
 * not a stock photo (PRODUCT.md has no image asset library, and the brand
 * brief's anti-references rule out stock photography anyway). Two soft
 * color fields plus a faint diagonal hairline grid, all derived from
 * existing DESIGN.md tokens via color-mix() rather than new hex literals —
 * nothing here is a color that isn't already Primary, Secondary, or
 * On Surface at a lower opacity.
 *
 * Deliberately its own layer, not painted onto whatever holds the text —
 * see DESIGN.md "Ambient background layer". `z-0` here + `z-10` on the
 * content wrapper at every call site is the seam Phase 2 (PLAN.md,
 * "Animated banners") animates against later: transform/opacity/
 * background-position on this component, never anything that would
 * reflow the text sitting in front of it. Fully static today — no
 * animation, no animation library.
 */
export function HomeHeroArt() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 z-0 bg-container-lowest"
      style={{
        backgroundImage: [
          "radial-gradient(circle at 12% 18%, color-mix(in srgb, var(--color-primary) 14%, transparent), transparent 42%)",
          "radial-gradient(circle at 88% 82%, color-mix(in srgb, var(--color-secondary) 22%, transparent), transparent 48%)",
          "repeating-linear-gradient(115deg, color-mix(in srgb, var(--color-on-surface) 4%, transparent) 0px, color-mix(in srgb, var(--color-on-surface) 4%, transparent) 1px, transparent 1px, transparent 64px)",
        ].join(", "),
      }}
    />
  );
}
