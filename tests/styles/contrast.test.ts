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

/** `top` composited at `alpha` over `bottom`, as a hex colour. */
function mixHex(top: string, bottom: string, alpha: number): string {
  const ch = (hex: string, i: number) => parseInt(hex.slice(i, i + 2), 16);
  return (
    "#" +
    [1, 3, 5]
      .map((i) => Math.round(ch(top, i) * alpha + ch(bottom, i) * (1 - alpha)).toString(16).padStart(2, "0"))
      .join("")
  );
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
  "--accent-patina-light",
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

  it("patina-light stays readable on the claret flip-card face and chips", () => {
    // "Tap to reveal" sits on a bg-claret face, which SURFACES does not cover.
    expect(contrast(tokenValue("--accent-patina-light"), tokenValue("--bg-chip"))).toBeGreaterThanOrEqual(4.5);
  });

  it("filter pills, the view toggle and the word card keep their type legible", () => {
    // These sit on claret (--bg-chip) or a half-strength claret wash, which
    // SURFACES does not cover — and the faded gold they used measured 2.7-4.3:1.
    const chip = tokenValue("--bg-chip");
    const halfChip = mixHex(chip, tokenValue("--bg-page"), 0.5);
    expect(contrast(tokenValue("--orato-champagne"), chip)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(tokenValue("--orato-gold"), halfChip)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(tokenValue("--orato-vellum"), mixHex(tokenValue("--orato-gold"), chip, 0.2))).toBeGreaterThanOrEqual(4.5);
  });

  it("recording-ring captions clear 4.5:1 on the page", () => {
    for (const role of ["--text-muted", "--orato-gold", "--orato-verdigris", "--orato-ochre", "--text-negative"]) {
      expect(contrast(tokenValue(role), tokenValue("--bg-page"))).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("patina button states keep their label legible", () => {
    // Rest: obsidian ink on patina. Pressed: vellum ink on patina-dark.
    expect(contrast(tokenValue("--orato-obsidian"), tokenValue("--accent-patina"))).toBeGreaterThanOrEqual(4.5);
    expect(contrast(tokenValue("--orato-vellum"), tokenValue("--accent-patina-dark"))).toBeGreaterThanOrEqual(4.5);
  });

  it("patina fills (bars, tab marker) clear the 3:1 non-text bar on the track and page", () => {
    expect(contrast(tokenValue("--accent-patina"), tokenValue("--bg-surface-raised"))).toBeGreaterThanOrEqual(3);
    expect(contrast(tokenValue("--accent-patina"), tokenValue("--bg-page"))).toBeGreaterThanOrEqual(3);
  });
});
