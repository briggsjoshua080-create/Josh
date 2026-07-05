import type { Challenge } from "@/lib/types";

/**
 * Days 34–66 of the core program.
 * Act IV (34–44) Persuasion · Act V (45–55) Pressure · Act VI (56–66) Mastery.
 */
export const CHALLENGES_2: Challenge[] = [
  {
    day: 34,
    title: { en: "Sell what you love", de: "Verkauf, was du liebst" },
    prompt: {
      en: "Pitch something you genuinely love — a book, an app, a place — to someone who's skeptical. Name their doubt out loud before you answer it.",
      de: "Pitche etwas, das du wirklich liebst — ein Buch, eine App, einen Ort — an einen Skeptiker. Sprich seinen Zweifel laut aus, bevor du ihn entkräftest.",
    },
    focus: {
      en: "Naming the objection first disarms it. Dodging it feeds it.",
      de: "Den Einwand zuerst benennen entwaffnet ihn. Ausweichen füttert ihn.",
    },
    difficulty: 3,
    targetSec: [70, 110],
  },
  {
    day: 35,
    title: { en: "The ask", de: "Die Bitte" },
    prompt: {
      en: "Ask for something concrete — a raise, a favor, an investment, a yes. State what you want in the first two sentences, justify it in the middle, repeat it at the end.",
      de: "Bitte um etwas Konkretes — eine Gehaltserhöhung, einen Gefallen, ein Investment, ein Ja. Sag in den ersten zwei Sätzen, was du willst, begründe es in der Mitte, wiederhole es am Ende.",
    },
    focus: {
      en: "Most asks fail because they were never clearly made.",
      de: "Die meisten Bitten scheitern, weil sie nie klar ausgesprochen wurden.",
    },
    difficulty: 3,
    targetSec: [60, 100],
  },
  {
    day: 36,
    title: { en: "Because", de: "Weil" },
    prompt: {
      en: "Make a case where every claim is immediately followed by a reason: claim, because, evidence — three times in a row, on a topic of your choice. Audit yourself as you speak.",
      de: "Argumentiere so, dass auf jede Behauptung sofort ein Grund folgt: These, weil, Beleg — dreimal hintereinander, Thema frei. Kontrolliere dich beim Sprechen selbst.",
    },
    focus: {
      en: "'Because' is the most persuasive word in the language. Use it audibly.",
      de: "„Weil“ ist das überzeugendste Wort der Sprache. Nutze es hörbar.",
    },
    difficulty: 3,
    targetSec: [70, 110],
  },
  {
    day: 37,
    title: { en: "Numbers that breathe", de: "Zahlen, die atmen" },
    prompt: {
      en: "Persuade with one statistic — real or plausible — and make it felt: translate it into everyday scale. 'That's one in every classroom.' 'That's every seat in this stadium, twice.'",
      de: "Überzeuge mit einer Statistik — echt oder plausibel — und mach sie fühlbar: Übersetze sie in Alltagsmaßstäbe. „Das ist eines pro Schulklasse.“ „Das ist dieses Stadion, zweimal voll.“",
    },
    focus: {
      en: "A number nobody can picture is a number nobody remembers.",
      de: "Eine Zahl, die sich niemand vorstellen kann, merkt sich niemand.",
    },
    difficulty: 3,
    targetSec: [60, 100],
  },
  {
    day: 38,
    title: { en: "Change my mind", de: "Stimm mich um" },
    prompt: {
      en: "Pick something most people around you believe and argue the opposite — courteously. Acknowledge the common view, find its weakest beam, and press there.",
      de: "Nimm etwas, das die meisten um dich herum glauben, und argumentiere höflich dagegen. Erkenne die gängige Sicht an, finde ihren schwächsten Balken und drücke genau dort.",
    },
    focus: {
      en: "Contrarianism with manners. Heat convinces no one; leverage does.",
      de: "Widerspruch mit Manieren. Hitze überzeugt niemanden; Hebelwirkung schon.",
    },
    difficulty: 4,
    targetSec: [80, 130],
  },
  {
    day: 39,
    title: { en: "The vision", de: "Die Vision" },
    prompt: {
      en: "Describe a future you want — for your team, your city, your field — five years out. Paint it in present tense, as if walking through it: 'It's 2031, and…'",
      de: "Beschreibe eine Zukunft, die du willst — für dein Team, deine Stadt, dein Fach — in fünf Jahren. Male sie im Präsens, als gingest du hindurch: „Es ist 2031, und …“",
    },
    focus: {
      en: "Leaders speak the future in present tense. It's a grammar of confidence.",
      de: "Führung spricht Zukunft im Präsens. Das ist die Grammatik der Zuversicht.",
    },
    difficulty: 4,
    targetSec: [90, 140],
  },
  {
    day: 40,
    title: { en: "Rebuttal", de: "Die Erwiderung" },
    prompt: {
      en: "Imagine someone just publicly dismissed an idea you care about as 'naive and unrealistic'. Respond: steady voice, no defensiveness, two counterpoints, and reclaim the room.",
      de: "Stell dir vor, jemand hat eine Idee, die dir wichtig ist, öffentlich als „naiv und unrealistisch“ abgetan. Antworte: ruhige Stimme, keine Rechtfertigung, zwei Gegenargumente, und hol dir den Raum zurück.",
    },
    focus: {
      en: "Composure is the rebuttal before the rebuttal.",
      de: "Gelassenheit ist die Erwiderung vor der Erwiderung.",
    },
    difficulty: 4,
    targetSec: [70, 110],
  },
  {
    day: 41,
    title: { en: "The call to action", de: "Der Aufruf" },
    prompt: {
      en: "End a persuasive talk the right way: give the listener exactly one thing to do, today, that costs less than ten minutes. Build the last thirty seconds entirely around that action.",
      de: "Beende eine überzeugende Rede richtig: Gib dem Zuhörer genau eine Sache, die er heute tun soll und die keine zehn Minuten kostet. Baue die letzten dreißig Sekunden ganz um diese Handlung.",
    },
    focus: {
      en: "Persuasion without a next step is entertainment.",
      de: "Überzeugung ohne nächsten Schritt ist Unterhaltung.",
    },
    difficulty: 4,
    targetSec: [80, 120],
  },
  {
    day: 42,
    title: { en: "Both sides, then yours", de: "Beide Seiten, dann deine" },
    prompt: {
      en: "Take a genuinely contested question and present both sides so fairly that a partisan of either would nod — then declare and defend your own position in the final third.",
      de: "Nimm eine wirklich umstrittene Frage und stelle beide Seiten so fair dar, dass Anhänger beider nicken würden — und beziehe im letzten Drittel klar Stellung.",
    },
    focus: {
      en: "Earned authority: fairness first buys you the right to conclude.",
      de: "Verdiente Autorität: Fairness zuerst kauft dir das Recht auf ein Fazit.",
    },
    difficulty: 4,
    targetSec: [100, 150],
  },
  {
    day: 43,
    title: { en: "Sell the boring thing", de: "Verkauf das Langweilige" },
    prompt: {
      en: "Make a passionate, specific case for something utterly mundane — spreadsheets, fire drills, dental floss, standing meetings. Full sincerity; irony is the easy way out.",
      de: "Halte ein leidenschaftliches, konkretes Plädoyer für etwas völlig Banales — Tabellen, Feuerübungen, Zahnseide, Stehungen. Voller Ernst; Ironie wäre der leichte Ausweg.",
    },
    focus: {
      en: "If you can make floss compelling, budget season will be easy.",
      de: "Wer Zahnseide fesselnd machen kann, übersteht jede Budgetrunde.",
    },
    difficulty: 4,
    targetSec: [70, 110],
  },
  {
    day: 44,
    title: { en: "Act IV finale: the pitch", de: "Finale Akt IV: der Pitch" },
    prompt: {
      en: "Deliver a complete two-minute pitch for an idea you'd actually pursue: hook, problem, solution, proof, ask. Every act of this program so far is in this speech.",
      de: "Halte einen kompletten Zwei-Minuten-Pitch für eine Idee, die du wirklich verfolgen würdest: Haken, Problem, Lösung, Beleg, Bitte. Jeder Akt dieses Programms steckt in dieser Rede.",
    },
    focus: {
      en: "Integration test. Structure, story, and persuasion in one take.",
      de: "Integrationstest. Struktur, Story und Überzeugung in einem Take.",
    },
    difficulty: 4,
    targetSec: [100, 140],
  },
  {
    day: 45,
    title: { en: "No notes, no mercy", de: "Ohne Netz" },
    prompt: {
      en: "Impromptu: speak for ninety seconds on the last object you bought. No preparation time — press record and go. Structure must appear as you speak.",
      de: "Stegreif: Sprich neunzig Sekunden über den letzten Gegenstand, den du gekauft hast. Keine Vorbereitungszeit — Aufnahme starten und los. Struktur muss beim Sprechen entstehen.",
    },
    focus: {
      en: "Act V begins: pressure. Default structure under fire: past, present, future.",
      de: "Akt V beginnt: Druck. Notfall-Struktur unter Beschuss: Früher, heute, morgen.",
    },
    difficulty: 4,
    targetSec: [80, 100],
  },
  {
    day: 46,
    title: { en: "The hostile question", de: "Die feindselige Frage" },
    prompt: {
      en: "You've just finished a presentation and someone asks, coldly: 'Why should anyone trust you on this?' Answer them — bridge from the attack back to your message without flinching.",
      de: "Du bist mit einer Präsentation fertig, und jemand fragt kühl: „Warum sollte Ihnen hier irgendjemand vertrauen?“ Antworte — und baue eine Brücke vom Angriff zurück zu deiner Botschaft, ohne zu zucken.",
    },
    focus: {
      en: "Acknowledge, bridge, message. Never repeat the accusation's framing.",
      de: "Anerkennen, überbrücken, Botschaft. Nie den Rahmen des Vorwurfs wiederholen.",
    },
    difficulty: 4,
    targetSec: [60, 100],
  },
  {
    day: 47,
    title: { en: "Thirty seconds only", de: "Nur dreißig Sekunden" },
    prompt: {
      en: "You have exactly thirty seconds to convince a decision-maker to keep funding something you care about. One argument only — your best. Choose fast, land clean.",
      de: "Du hast genau dreißig Sekunden, um eine Entscheiderin zu überzeugen, etwas weiter zu finanzieren, das dir wichtig ist. Nur ein Argument — dein bestes. Schnell wählen, sauber landen.",
    },
    focus: {
      en: "Constraint reveals judgment: choosing the argument IS the skill.",
      de: "Begrenzung zeigt Urteilskraft: Das Argument zu wählen IST die Fähigkeit.",
    },
    difficulty: 4,
    targetSec: [25, 40],
  },
  {
    day: 48,
    title: { en: "The apology", de: "Die Entschuldigung" },
    prompt: {
      en: "Something went wrong on your watch — real or imagined. Apologize like a professional: what happened, your part in it, what changes now. No 'sorry if anyone felt…'",
      de: "Etwas ist unter deiner Verantwortung schiefgelaufen — echt oder ausgedacht. Entschuldige dich professionell: was passiert ist, dein Anteil, was sich jetzt ändert. Kein „tut mir leid, falls sich jemand …“.",
    },
    focus: {
      en: "Ownership without groveling. Passive voice is where apologies go to hide.",
      de: "Verantwortung ohne Kriechen. Im Passiv verstecken sich schlechte Entschuldigungen.",
    },
    difficulty: 4,
    targetSec: [60, 100],
  },
  {
    day: 49,
    title: { en: "Deliver bad news", de: "Schlechte Nachrichten überbringen" },
    prompt: {
      en: "Tell a team something they don't want to hear — a project cancelled, a deadline moved, a budget cut. Truth first, context second, path forward third. No sugar, no cruelty.",
      de: "Sag einem Team etwas, das es nicht hören will — Projekt gestrichen, Deadline verschoben, Budget gekürzt. Erst die Wahrheit, dann der Kontext, dann der Weg nach vorn. Kein Zucker, keine Härte.",
    },
    focus: {
      en: "Clarity is kindness. Vagueness makes people invent worse news.",
      de: "Klarheit ist Freundlichkeit. Vagheit lässt Menschen Schlimmeres erfinden.",
    },
    difficulty: 4,
    targetSec: [80, 120],
  },
  {
    day: 50,
    title: { en: "The crisis statement", de: "Das Krisen-Statement" },
    prompt: {
      en: "A crisis just hit your organization and cameras are waiting. Deliver a sixty-second statement: what you know, what you don't, what you're doing, when you'll speak again.",
      de: "Eine Krise trifft deine Organisation, die Kameras warten. Gib ein Sechzig-Sekunden-Statement: was du weißt, was nicht, was du tust, wann du wieder informierst.",
    },
    focus: {
      en: "The four-part crisis frame. Speculation is the enemy; cadence builds trust.",
      de: "Der vierteilige Krisenrahmen. Spekulation ist der Feind; Rhythmus schafft Vertrauen.",
    },
    difficulty: 5,
    targetSec: [50, 75],
  },
  {
    day: 51,
    title: { en: "Defend an unpopular decision", de: "Verteidige eine unpopuläre Entscheidung" },
    prompt: {
      en: "You made a call people hate. Defend it to the people affected: the reasoning, the alternatives you rejected and why, and what you'll watch to know if you were wrong.",
      de: "Du hast eine Entscheidung getroffen, die viele ablehnen. Verteidige sie vor den Betroffenen: die Gründe, die verworfenen Alternativen und warum, und woran du erkennen wirst, ob du falsch lagst.",
    },
    focus: {
      en: "Showing your error criteria is the most disarming move in leadership speech.",
      de: "Die eigenen Irrtumskriterien zu nennen ist der entwaffnendste Zug einer Führungsrede.",
    },
    difficulty: 5,
    targetSec: [90, 140],
  },
  {
    day: 52,
    title: { en: "Interview under fire", de: "Interview unter Beschuss" },
    prompt: {
      en: "Answer the classic interview grenade — 'What's your greatest weakness?' — with substance: a real weakness, its real cost, and the system you built around it. No humblebrags.",
      de: "Beantworte die klassische Interview-Granate — „Was ist Ihre größte Schwäche?“ — mit Substanz: eine echte Schwäche, ihre echten Kosten und das System, das du darum gebaut hast. Kein verstecktes Eigenlob.",
    },
    focus: {
      en: "Honesty with architecture beats polish with nothing inside.",
      de: "Ehrlichkeit mit Struktur schlägt Politur ohne Inhalt.",
    },
    difficulty: 4,
    targetSec: [60, 100],
  },
  {
    day: 53,
    title: { en: "One take, zero fillers", de: "Ein Take, null Füllwörter" },
    prompt: {
      en: "Speak for one minute on any topic with a single goal: not one filler word. Slow down as much as you need. Silence is allowed; 'um' is not.",
      de: "Sprich eine Minute über ein beliebiges Thema mit einem einzigen Ziel: kein einziges Füllwort. Werde so langsam, wie du musst. Stille ist erlaubt; „ähm“ nicht.",
    },
    focus: {
      en: "Precision drill. Watch the filler count on your scorecard.",
      de: "Präzisionsübung. Beobachte die Füllwort-Zahl auf deiner Auswertung.",
    },
    difficulty: 5,
    targetSec: [55, 70],
  },
  {
    day: 54,
    title: { en: "The moderator", de: "Die Moderation" },
    prompt: {
      en: "Two colleagues are arguing in circles in a meeting. Step in as the voice of order: summarize both positions fairly in one sentence each, name the actual disagreement, propose the next step.",
      de: "Zwei Kollegen streiten im Meeting im Kreis. Greif als ordnende Stimme ein: Fasse beide Positionen fair in je einem Satz zusammen, benenne den eigentlichen Dissens, schlage den nächsten Schritt vor.",
    },
    focus: {
      en: "The person who can compress a conflict usually ends up leading the room.",
      de: "Wer einen Konflikt verdichten kann, führt am Ende meistens den Raum.",
    },
    difficulty: 5,
    targetSec: [60, 100],
  },
  {
    day: 55,
    title: { en: "Act V finale: the gauntlet", de: "Finale Akt V: der Spießrutenlauf" },
    prompt: {
      en: "Three prompts, one take: pitch an idea in twenty seconds, answer one hostile question about it, then close with a call to action. Simulate all three voices yourself.",
      de: "Drei Aufgaben, ein Take: Pitche eine Idee in zwanzig Sekunden, beantworte eine feindselige Frage dazu, und schließe mit einem Aufruf. Simuliere alle drei Stimmen selbst.",
    },
    focus: {
      en: "Mode-switching under pressure — the daily reality of every public figure.",
      de: "Moduswechsel unter Druck — der Alltag jeder öffentlichen Person.",
    },
    difficulty: 5,
    targetSec: [90, 130],
  },
  {
    day: 56,
    title: { en: "The eulogy", de: "Die Trauerrede" },
    prompt: {
      en: "Act VI: mastery. Deliver a eulogy for a fictional mentor who shaped you. Dignity, one specific story, one laugh through tears, one line of farewell. The hardest form there is.",
      de: "Akt VI: Meisterschaft. Halte eine Trauerrede für einen fiktiven Mentor, der dich geprägt hat. Würde, eine konkrete Geschichte, ein Lachen unter Tränen, ein Abschiedssatz. Die schwerste Form überhaupt.",
    },
    focus: {
      en: "Emotional register control: moved, not performative; warm, not saccharine.",
      de: "Kontrolle des Gefühlsregisters: berührt, nicht theatralisch; warm, nicht süßlich.",
    },
    difficulty: 5,
    targetSec: [100, 160],
  },
  {
    day: 57,
    title: { en: "The toast", de: "Der Trinkspruch" },
    prompt: {
      en: "Give the toast at your best friend's milestone — wedding, big birthday, farewell. One story only, told beautifully, then raise the glass. Ninety seconds, not a second more.",
      de: "Halte den Trinkspruch beim großen Moment deines besten Freundes — Hochzeit, runder Geburtstag, Abschied. Nur eine Geschichte, schön erzählt, dann das Glas heben. Neunzig Sekunden, keine mehr.",
    },
    focus: {
      en: "The discipline of occasion speaking: it's about them, timed to the second.",
      de: "Die Disziplin der Anlassrede: Es geht um die anderen, auf die Sekunde getimt.",
    },
    difficulty: 5,
    targetSec: [75, 95],
  },
  {
    day: 58,
    title: { en: "TED opening", de: "TED-Eröffnung" },
    prompt: {
      en: "Deliver the first ninety seconds of a TED talk on an idea you'd defend on any stage. Cold open, personal stake, and the idea in one sentence the audience could tweet.",
      de: "Halte die ersten neunzig Sekunden eines TED-Talks über eine Idee, die du auf jeder Bühne verteidigen würdest. Kalter Einstieg, persönlicher Einsatz und die Idee in einem Satz, den das Publikum posten könnte.",
    },
    focus: {
      en: "The idea sentence. If it doesn't fit in one breath, it isn't sharpened yet.",
      de: "Der Ideensatz. Passt er nicht in einen Atemzug, ist er noch nicht geschärft.",
    },
    difficulty: 5,
    targetSec: [80, 100],
  },
  {
    day: 59,
    title: { en: "Rally the troops", de: "Die Mannschaft aufrichten" },
    prompt: {
      en: "Your team just lost — the deal, the match, the launch. Speak to them the morning after: honor the effort, name the lesson, and relight the fire. No empty hype.",
      de: "Dein Team hat gerade verloren — den Deal, das Spiel, den Launch. Sprich am Morgen danach zu ihnen: Würdige den Einsatz, benenne die Lehre, entfache das Feuer neu. Kein leeres Pathos.",
    },
    focus: {
      en: "Morale speech: honest about the loss, specific about tomorrow.",
      de: "Moralrede: ehrlich über die Niederlage, konkret über morgen.",
    },
    difficulty: 5,
    targetSec: [90, 140],
  },
  {
    day: 60,
    title: { en: "The policy speech", de: "Die Grundsatzrede" },
    prompt: {
      en: "You're addressing your city council on an issue you'd actually fight for. Two minutes: the problem in human terms, your proposal in one sentence, the cost of doing nothing.",
      de: "Du sprichst vor deinem Stadtrat zu einem Thema, für das du wirklich kämpfen würdest. Zwei Minuten: das Problem in menschlichen Begriffen, dein Vorschlag in einem Satz, der Preis des Nichtstuns.",
    },
    focus: {
      en: "Political speech 101: people first, proposal second, urgency third.",
      de: "Politische Rede, Grundkurs: erst Menschen, dann Vorschlag, dann Dringlichkeit.",
    },
    difficulty: 5,
    targetSec: [100, 140],
  },
  {
    day: 61,
    title: { en: "Improvised metaphor", de: "Improvisierte Metapher" },
    prompt: {
      en: "Explain leadership, love, or learning — pick one — entirely through an extended metaphor drawn from the first physical object you see right now. Commit for the full minute.",
      de: "Erkläre Führung, Liebe oder Lernen — wähle eines — vollständig über eine ausgedehnte Metapher, gezogen aus dem ersten Gegenstand, den du jetzt siehst. Halte die volle Minute durch.",
    },
    focus: {
      en: "Mastery check on day 10's skill: metaphor, now without preparation.",
      de: "Meisterprüfung der Fähigkeit von Tag 10: Metapher, jetzt ohne Vorbereitung.",
    },
    difficulty: 5,
    targetSec: [60, 100],
  },
  {
    day: 62,
    title: { en: "Speak to the doubters", de: "Sprich zu den Zweiflern" },
    prompt: {
      en: "An audience is convinced you'll fail — at your project, your venture, your change of path. Address them directly. Concede what's uncertain, then make them feel your certainty where it counts.",
      de: "Ein Publikum ist überzeugt, dass du scheitern wirst — mit deinem Projekt, deinem Vorhaben, deinem neuen Weg. Sprich es direkt an. Räum das Ungewisse ein — und lass sie deine Gewissheit spüren, wo es zählt.",
    },
    focus: {
      en: "Conviction is transferable only when it has admitted its limits.",
      de: "Überzeugung überträgt sich nur, wenn sie ihre Grenzen kennt.",
    },
    difficulty: 5,
    targetSec: [90, 140],
  },
  {
    day: 63,
    title: { en: "The commencement address", de: "Die Abschlussrede" },
    prompt: {
      en: "Two minutes of a commencement speech to people entering your field. One hard truth they need, one genuine encouragement, and a closing line worth printing on the program.",
      de: "Zwei Minuten Abschlussrede an Menschen, die in dein Feld eintreten. Eine harte Wahrheit, die sie brauchen, eine echte Ermutigung und ein Schlusssatz, der aufs Programmheft gehört.",
    },
    focus: {
      en: "Wisdom without preaching. You're handing over a compass, not a map.",
      de: "Weisheit ohne Predigt. Du übergibst einen Kompass, keine Landkarte.",
    },
    difficulty: 5,
    targetSec: [100, 140],
  },
  {
    day: 64,
    title: { en: "Defend the indefensible", de: "Verteidige das Unhaltbare" },
    prompt: {
      en: "Argue convincingly for a harmless opinion you personally reject — pineapple on pizza, open offices, early mornings. Steelman it so well nobody could tell you disagree.",
      de: "Argumentiere überzeugend für eine harmlose Meinung, die du ablehnst — Ananas auf Pizza, Großraumbüros, frühes Aufstehen. Steelmanne sie so gut, dass niemand deinen Dissens bemerkt.",
    },
    focus: {
      en: "Total commitment. Any wink to the audience breaks the spell.",
      de: "Volles Commitment. Jedes Augenzwinkern bricht den Zauber.",
    },
    difficulty: 5,
    targetSec: [80, 130],
  },
  {
    day: 65,
    title: { en: "Your platform", de: "Dein Programm" },
    prompt: {
      en: "You're running for office — any office, real or invented. Deliver your stump speech: who you are, what's broken, your three commitments, and why you, why now.",
      de: "Du kandidierst — für irgendein Amt, echt oder erfunden. Halte deine Wahlkampfrede: wer du bist, was kaputt ist, deine drei Zusagen, und warum du, warum jetzt.",
    },
    focus: {
      en: "The full politician's toolkit in one speech: story, structure, vision, ask.",
      de: "Der komplette Werkzeugkasten in einer Rede: Story, Struktur, Vision, Aufruf.",
    },
    difficulty: 5,
    targetSec: [110, 160],
  },
  {
    day: 66,
    title: { en: "Day 66: the keynote", de: "Tag 66: die Keynote" },
    prompt: {
      en: "The graduation stage is yours. Deliver the opening of a keynote on the one idea these 66 days have proven to you — about speaking, discipline, or becoming. Open cold, story in the middle, land on stone.",
      de: "Die Bühne gehört dir. Halte die Eröffnung einer Keynote über die eine Idee, die dir diese 66 Tage bewiesen haben — über das Reden, die Disziplin oder das Werden. Kalter Einstieg, Geschichte in der Mitte, Landung in Stein.",
    },
    focus: {
      en: "Graduation day. Then the path continues — mastery has no final day.",
      de: "Abschlusstag. Danach geht der Weg weiter — Meisterschaft hat keinen letzten Tag.",
    },
    difficulty: 5,
    targetSec: [110, 170],
  },
];

/** Days 67+ cycle deterministically through these, day number carried forward. */
export const ADVANCED_ROTATION: Omit<Challenge, "day">[] = [
  {
    title: { en: "The second keynote", de: "Die zweite Keynote" },
    prompt: {
      en: "Open a keynote for an audience that heard you speak a year ago. What has changed in your thinking since? Contrast then and now without disowning who you were.",
      de: "Eröffne eine Keynote vor einem Publikum, das dich vor einem Jahr gehört hat. Was hat sich in deinem Denken verändert? Kontrastiere damals und heute, ohne zu verleugnen, wer du warst.",
    },
    focus: {
      en: "Evolution as narrative: growth reads as authority.",
      de: "Entwicklung als Erzählung: Wachstum wirkt wie Autorität.",
    },
    difficulty: 5,
    targetSec: [100, 160],
  },
  {
    title: { en: "Testify", de: "Die Anhörung" },
    prompt: {
      en: "You're testifying before a parliamentary committee on a subject you know deeply. Ninety seconds of opening statement: credentials in one line, the stakes, three findings, one recommendation.",
      de: "Du sagst vor einem Ausschuss zu einem Thema aus, das du tief kennst. Neunzig Sekunden Eröffnungsstatement: Qualifikation in einem Satz, die Tragweite, drei Befunde, eine Empfehlung.",
    },
    focus: {
      en: "Institutional register: precise, sourced, immune to being quoted out of context.",
      de: "Institutionelles Register: präzise, belegt, immun gegen verzerrende Zitate.",
    },
    difficulty: 5,
    targetSec: [80, 100],
  },
  {
    title: { en: "The negotiation opener", de: "Die Verhandlungseröffnung" },
    prompt: {
      en: "Open a high-stakes negotiation: state shared interests first, your position second, and your walk-away point never. Warmth in the voice, iron in the structure.",
      de: "Eröffne eine wichtige Verhandlung: erst die gemeinsamen Interessen, dann deine Position, und deine Schmerzgrenze nie. Wärme in der Stimme, Eisen in der Struktur.",
    },
    focus: {
      en: "Strategic disclosure — what you say first shapes everything after.",
      de: "Strategische Offenlegung — was du zuerst sagst, prägt alles danach.",
    },
    difficulty: 5,
    targetSec: [70, 110],
  },
  {
    title: { en: "Eulogy for an idea", de: "Nachruf auf eine Idee" },
    prompt: {
      en: "Deliver a eulogy for an idea whose time has passed — the fax machine, a belief you outgrew, an era. Affection and honesty in equal measure; end facing forward.",
      de: "Halte einen Nachruf auf eine Idee, deren Zeit vorbei ist — das Faxgerät, ein abgelegter Glaube, eine Ära. Zuneigung und Ehrlichkeit zu gleichen Teilen; ende nach vorn gewandt.",
    },
    focus: {
      en: "Tone blending: elegy and comedy in one register without whiplash.",
      de: "Tonmischung: Elegie und Komik in einem Register, ohne Bruch.",
    },
    difficulty: 5,
    targetSec: [90, 140],
  },
  {
    title: { en: "Sixty seconds of silence broken", de: "Sechzig Sekunden gebrochene Stille" },
    prompt: {
      en: "A moderator turns to you unexpectedly: 'You've been quiet — what do you think?' Deliver the considered, structured answer of someone who was listening, on a debate topic of your choosing.",
      de: "Eine Moderatorin wendet sich unerwartet an dich: „Sie waren still — was denken Sie?“ Gib die durchdachte, strukturierte Antwort von jemandem, der zugehört hat — Thema frei.",
    },
    focus: {
      en: "The late entrance: synthesize the room, then add the missing angle.",
      de: "Der späte Auftritt: Fasse den Raum zusammen, dann ergänze den fehlenden Blickwinkel.",
    },
    difficulty: 5,
    targetSec: [55, 80],
  },
  {
    title: { en: "The founder's letter, spoken", de: "Der Gründerbrief, gesprochen" },
    prompt: {
      en: "Deliver the annual letter of an organization you'd love to lead — spoken, not read. One honest failure, one real bet for next year, one thank-you that names names.",
      de: "Trage den Jahresbrief einer Organisation vor, die du gern führen würdest — gesprochen, nicht abgelesen. Ein ehrliches Scheitern, eine echte Wette fürs nächste Jahr, ein Dank mit Namen.",
    },
    focus: {
      en: "Leadership candor: the confident admission is the most quoted line.",
      de: "Führungs-Offenheit: Das souveräne Eingeständnis wird am meisten zitiert.",
    },
    difficulty: 5,
    targetSec: [100, 150],
  },
  {
    title: { en: "Explain it three ways", de: "Erklär es dreifach" },
    prompt: {
      en: "Take one concept you know cold and explain it three times in one take: to a child, to a peer, to a skeptic. Ten breaths each. Feel your register shift gears.",
      de: "Nimm ein Konzept, das du blind beherrschst, und erkläre es dreimal in einem Take: einem Kind, einem Kollegen, einem Skeptiker. Je zehn Atemzüge. Spür, wie dein Register schaltet.",
    },
    focus: {
      en: "Register agility — the mark of a speaker who owns the material.",
      de: "Register-Beweglichkeit — das Zeichen eines Redners, dem der Stoff gehört.",
    },
    difficulty: 5,
    targetSec: [90, 130],
  },
  {
    title: { en: "The impossible question", de: "Die unmögliche Frage" },
    prompt: {
      en: "Live interview. The question: 'If your project fails, whose fault will it be?' Answer without throwing anyone in front of the bus — including yourself — and without dodging.",
      de: "Live-Interview. Die Frage: „Wenn Ihr Projekt scheitert, wessen Schuld ist es dann?“ Antworte, ohne jemanden vor den Bus zu werfen — auch dich nicht — und ohne auszuweichen.",
    },
    focus: {
      en: "The narrow path between deflection and self-immolation.",
      de: "Der schmale Grat zwischen Ausweichen und Selbstzerfleischung.",
    },
    difficulty: 5,
    targetSec: [50, 90],
  },
  {
    title: { en: "History will ask", de: "Die Geschichte wird fragen" },
    prompt: {
      en: "Speak as if to an audience twenty years from now about a choice your generation is making today. What will you tell them you did — and what will you have to explain?",
      de: "Sprich wie zu einem Publikum in zwanzig Jahren über eine Entscheidung, die deine Generation heute trifft. Was wirst du ihnen sagen, dass ihr getan habt — und was wirst du erklären müssen?",
    },
    focus: {
      en: "The statesman's time horizon: speaking to listeners who aren't born yet.",
      de: "Der Zeithorizont der Staatskunst: zu Zuhörern sprechen, die noch nicht geboren sind.",
    },
    difficulty: 5,
    targetSec: [100, 150],
  },
  {
    title: { en: "One minute, no adjectives", de: "Eine Minute ohne Adjektive" },
    prompt: {
      en: "Describe something you love for one minute using no adjectives at all. Verbs and nouns must carry every ounce of the feeling.",
      de: "Beschreibe eine Minute lang etwas, das du liebst — ganz ohne Adjektive. Verben und Substantive müssen das ganze Gefühl tragen.",
    },
    focus: {
      en: "Muscle isolation for language: strong verbs are eloquence's engine.",
      de: "Muskelisolation für Sprache: Starke Verben sind der Motor der Eloquenz.",
    },
    difficulty: 5,
    targetSec: [55, 75],
  },
  {
    title: { en: "The handover", de: "Die Übergabe" },
    prompt: {
      en: "You're stepping down from something you built — a team, a club, a role. Pass the torch: what it was, what it must remain, and your blessing for it to change everything else.",
      de: "Du gibst etwas ab, das du aufgebaut hast — ein Team, einen Verein, eine Rolle. Übergib die Fackel: was es war, was es bleiben muss, und dein Segen, alles andere zu verändern.",
    },
    focus: {
      en: "Legacy speech: generosity is the final proof of ownership.",
      de: "Vermächtnisrede: Großzügigkeit ist der letzte Beweis von Urheberschaft.",
    },
    difficulty: 5,
    targetSec: [90, 140],
  },
  {
    title: { en: "Make them see it", de: "Lass sie es sehen" },
    prompt: {
      en: "Pick tomorrow's most ordinary moment — the commute, the first coffee — and narrate it like a nature documentary: majestic, precise, and quietly funny. Full commitment to the bit.",
      de: "Nimm den gewöhnlichsten Moment von morgen — den Arbeitsweg, den ersten Kaffee — und kommentiere ihn wie eine Naturdoku: erhaben, präzise und leise komisch. Volles Commitment.",
    },
    focus: {
      en: "Play is a skill. Speakers who can be funny on purpose can be serious on purpose.",
      de: "Spiel ist Können. Wer absichtlich komisch sein kann, kann absichtlich ernst sein.",
    },
    difficulty: 5,
    targetSec: [70, 110],
  },
];
