import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * PRODUCT.md claims "body text >=4.5:1 on all surfaces (verified against the
 * dark palette)". That verification had never actually been run: three text
 * roles measured 2.24-4.37:1. This test is the verification, so the claim
 * cannot drift back into being false — including when someone adjusts the wine
 * ramp for aesthetic reasons.
 */
const tokens = readFileSync(resolve(import.meta.dirname, "../../src/styles/tokens.css"), "utf8");

function tokenValue(name: string): string {
  const direct = tokens.match(new RegExp(`${name}:\\s*(#[0-9a-fA-F]{6})`));
  if (direct) return direct[1];
  const alias = tokens.match(new RegExp(`${name}:\\s*var\\((--[\\w-]+)\\)`));
  if (alias) return tokenValue(alias[1]);
  throw new Error(`token not found or unresolvable: ${name}`);
}

function relativeLuminance(hex: string): number {
  const channels = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const linear = channels.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Every surface body text can land on. */
const SURFACES = ["--bg-page", "--bg-surface", "--bg-surface-raised"] as const;

/** Every role used for type. Roles for borders, bars and glows are exempt (3:1). */
const TEXT_ROLES = [
  "--text-primary",
  "--text-secondary",
  "--text-muted",
  "--text-tertiary",
  "--text-negative",
] as const;

describe("text contrast (WCAG AA)", () => {
  for (const role of TEXT_ROLES) {
    for (const surface of SURFACES) {
      it(`${role} on ${surface} clears 4.5:1`, () => {
        const ratio = contrast(tokenValue(role), tokenValue(surface));
        expect(ratio).toBeGreaterThanOrEqual(4.5);
      });
    }
  }

  it("keeps the darker ramp steps available for borders and bars", () => {
    // These deliberately do NOT meet the text bar — 3:1 is correct for a
    // hairline or a chart bar, and the darker values carry the brand.
    expect(tokenValue("--border-emphasis")).toBe("#7a5a31");
    expect(tokenValue("--score-weak")).toBe("#c05553");
  });

  it("resolves score-band colours that are used as text through text roles", () => {
    // score-good is gold, which passes on its own; the weak band is only ever a
    // bar, with --text-negative used where the same meaning appears as words.
    expect(contrast(tokenValue("--score-good"), tokenValue("--bg-surface-raised"))).toBeGreaterThanOrEqual(4.5);
  });
});
