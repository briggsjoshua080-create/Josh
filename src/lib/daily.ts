import type { Challenge, WordEntry, Lang } from "./types";
import { CHALLENGES, ADVANCED_ROTATION } from "@/data/challenges";
import { WORDS_EN, WORDS_DE } from "@/data/words";

/**
 * The core program is 66 days; the path continues indefinitely afterwards.
 * Days 67+ draw deterministically from an advanced rotation with an
 * escalating framing, so "Day 67, 68, …" always resolves to real content.
 */
export function challengeForDay(day: number): Challenge {
  if (day <= CHALLENGES.length) return CHALLENGES[day - 1];
  const idx = (day - CHALLENGES.length - 1) % ADVANCED_ROTATION.length;
  const base = ADVANCED_ROTATION[idx];
  return { ...base, day };
}

export function wordForDay(day: number, lang: Lang): WordEntry {
  const list = lang === "de" ? WORDS_DE : WORDS_EN;
  return list[(day - 1) % list.length];
}

export function isBeyondCore(day: number): boolean {
  return day > CHALLENGES.length;
}
