import type { Bilingual } from "@/lib/types";

/**
 * General communication tips for the Today screen. Three show per day,
 * rotating with the calendar so a daily visitor keeps seeing fresh ones.
 * Curated to cover distinct aspects: delivery, structure, mindset, engagement.
 */
export interface Tip {
  title: Bilingual;
  body: Bilingual;
}

export const TIPS: Tip[] = [
  {
    title: { en: "Pause instead of “um”", de: "Pause statt „äh“" },
    body: {
      en: "A silent beat reads as confidence; a filler reads as doubt. Trade every “um” for one breath.",
      de: "Eine stille Sekunde wirkt souverän, ein Füllwort unsicher. Tausche jedes „äh“ gegen einen Atemzug.",
    },
  },
  {
    title: { en: "Lead with the point", de: "Mit dem Punkt beginnen" },
    body: {
      en: "Say your conclusion first, then explain. Audiences forgive missing detail, never a missing point.",
      de: "Sag zuerst dein Fazit, dann die Begründung. Fehlende Details verzeiht dein Publikum — einen fehlenden Punkt nie.",
    },
  },
  {
    title: { en: "Nerves are fuel", de: "Nervosität ist Treibstoff" },
    body: {
      en: "A racing heart before speaking is arousal, not weakness — relabel it as readiness and it sharpens you.",
      de: "Herzklopfen vor dem Sprechen ist Energie, keine Schwäche — deute es als Bereitschaft, und es schärft dich.",
    },
  },
  {
    title: { en: "The rule of three", de: "Die Dreierfigur" },
    body: {
      en: "Ideas grouped in threes are easier to say, follow, and remember. Structure your next point as a triple.",
      de: "Gedanken in Dreiergruppen lassen sich leichter sagen, verfolgen und merken. Baue deinen nächsten Punkt als Trio.",
    },
  },
  {
    title: { en: "End sentences downward", de: "Sätze nach unten beenden" },
    body: {
      en: "Let your pitch fall at the period. Rising endings sound like questions and quietly drain your authority.",
      de: "Lass die Stimme am Satzende sinken. Steigende Enden klingen nach Fragen und kosten leise Autorität.",
    },
  },
  {
    title: { en: "One idea per sentence", de: "Ein Gedanke pro Satz" },
    body: {
      en: "Short sentences keep you fluent and your listener oriented. If you need a breath mid-sentence, split it.",
      de: "Kurze Sätze halten dich flüssig und dein Publikum orientiert. Brauchst du mitten im Satz Luft, teile ihn.",
    },
  },
  {
    title: { en: "Talk to one person", de: "Sprich mit einer Person" },
    body: {
      en: "Address one imagined listener, not “everyone”. Your tone warms up and your phrasing gets concrete.",
      de: "Sprich zu einem vorgestellten Zuhörer, nicht zu „allen“. Dein Ton wird wärmer, deine Sprache konkreter.",
    },
  },
  {
    title: { en: "Silence lands the punch", de: "Stille lässt Pointen landen" },
    body: {
      en: "Pause for a full second after your most important line. The gap is where the audience does the thinking.",
      de: "Halte nach deiner wichtigsten Zeile eine volle Sekunde inne. In der Lücke denkt dein Publikum mit.",
    },
  },
  {
    title: { en: "Rehearse out loud", de: "Laut proben" },
    body: {
      en: "Reading silently is not practice — your mouth needs the reps. Even one spoken run-through transforms delivery.",
      de: "Stilles Lesen ist keine Probe — dein Mund braucht die Wiederholungen. Schon ein lauter Durchlauf verändert den Vortrag.",
    },
  },
];

/** The three tips for a given calendar day — a rotating, non-overlapping window. */
export function tipsForToday(date = new Date()): Tip[] {
  const start = new Date(date.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((date.getTime() - start.getTime()) / 86_400_000);
  const offset = (dayOfYear * 3) % TIPS.length;
  return [0, 1, 2].map((i) => TIPS[(offset + i) % TIPS.length]);
}
