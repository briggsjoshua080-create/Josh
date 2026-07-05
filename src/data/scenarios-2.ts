import type { Scenario } from "@/lib/types";

/** Scenario library, part 2: debate, persuasion, smalltalk, crisis, ted. */
export const SCENARIOS_2: Scenario[] = [
  // ——— Debate & Impromptu ———
  {
    id: "deb-cities-cars",
    category: "debate",
    title: { en: "Cars out of city centers?", de: "Autos raus aus der Innenstadt?" },
    prompt: {
      en: "Take a side — car-free city centers, yes or no — and argue it for ninety seconds: one principle, two concrete effects, one concession to the other side.",
      de: "Bezieh Stellung — autofreie Innenstädte, ja oder nein — und argumentiere neunzig Sekunden: ein Prinzip, zwei konkrete Folgen, ein Zugeständnis an die Gegenseite.",
    },
    difficulty: 2,
    targetSec: [75, 100],
  },
  {
    id: "deb-four-day-week",
    category: "debate",
    title: { en: "The four-day week", de: "Die Vier-Tage-Woche" },
    prompt: {
      en: "Defend or attack the four-day work week in front of a skeptical board. Economics first, people second, proof third.",
      de: "Verteidige oder verwirf die Vier-Tage-Woche vor einem skeptischen Vorstand. Erst die Wirtschaftlichkeit, dann die Menschen, dann die Belege.",
    },
    difficulty: 3,
    targetSec: [80, 120],
  },
  {
    id: "deb-devil-advocate",
    category: "debate",
    title: { en: "Devil's advocate", de: "Advocatus Diaboli" },
    prompt: {
      en: "Pick an opinion you hold firmly — then argue the opposite for one minute, at full strength. Your job is to worry yourself.",
      de: "Wähle eine Meinung, die du fest vertrittst — und argumentiere eine Minute mit voller Kraft dagegen. Deine Aufgabe: dich selbst ins Grübeln bringen.",
    },
    difficulty: 3,
    targetSec: [60, 90],
  },
  {
    id: "deb-random-defend",
    category: "debate",
    title: { en: "Defend the random object", de: "Verteidige den Zufallsgegenstand" },
    prompt: {
      en: "Grab the nearest object. You have zero seconds of prep to argue it deserves a national holiday. Commit completely; logic optional, structure mandatory.",
      de: "Greif den nächstbesten Gegenstand. Null Sekunden Vorbereitung, um zu begründen, warum er einen Feiertag verdient. Volles Commitment; Logik optional, Struktur Pflicht.",
    },
    difficulty: 2,
    targetSec: [45, 80],
  },
  {
    id: "deb-rebuttal-drill",
    category: "debate",
    title: { en: "The two-minute rebuttal", de: "Die Zwei-Minuten-Erwiderung" },
    prompt: {
      en: "Your position was just called 'expensive, naive, and impossible to implement'. Rebut all three labels in order, ending stronger than you started.",
      de: "Deine Position wurde gerade „teuer, naiv und nicht umsetzbar“ genannt. Widerlege alle drei Etiketten der Reihe nach — und ende stärker, als du begonnen hast.",
    },
    difficulty: 3,
    targetSec: [90, 130],
  },
  {
    id: "deb-panel-disagree",
    category: "debate",
    title: { en: "Disagreeing on the panel", de: "Widerspruch auf dem Podium" },
    prompt: {
      en: "On a panel, the previous speaker just said something you find wrong. Disagree on air: credit what's right, isolate the flaw, offer the better view — collegially.",
      de: "Auf einem Podium hat die Vorrednerin gerade etwas gesagt, das du für falsch hältst. Widersprich live: Würdige das Richtige, isoliere den Fehler, biete die bessere Sicht — kollegial.",
    },
    difficulty: 3,
    targetSec: [60, 100],
  },
  {
    id: "deb-one-minute-topics",
    category: "debate",
    title: { en: "Sixty seconds, surprise topic", de: "Sechzig Sekunden, Überraschungsthema" },
    prompt: {
      en: "Impromptu drill: speak for one structured minute on 'queues'. Yes, queues. Hook, two points, landing — go.",
      de: "Stegreif-Übung: Sprich eine strukturierte Minute über „Warteschlangen“. Ja, Warteschlangen. Haken, zwei Punkte, Landung — los.",
    },
    difficulty: 2,
    targetSec: [55, 75],
  },

  // ——— Persuasion ———
  {
    id: "per-convince-visit",
    category: "persuasion",
    title: { en: "Sell your city", de: "Verkauf deine Stadt" },
    prompt: {
      en: "Convince a friend abroad to visit your city — not with sights, but with moments: the bakery at seven, the river at dusk. Make them book the flight.",
      de: "Überzeuge einen Freund im Ausland, deine Stadt zu besuchen — nicht mit Sehenswürdigkeiten, sondern mit Momenten: die Bäckerei um sieben, der Fluss in der Dämmerung. Bring ihn zum Buchen.",
    },
    difficulty: 1,
    targetSec: [60, 100],
  },
  {
    id: "per-habit-change",
    category: "persuasion",
    title: { en: "The habit pitch", de: "Der Gewohnheits-Pitch" },
    prompt: {
      en: "Persuade a specific person you know to adopt one habit that changed your life. Anticipate their exact excuse — you know it — and dissolve it.",
      de: "Überzeuge eine konkrete Person aus deinem Leben von einer Gewohnheit, die deins verändert hat. Nimm ihre exakte Ausrede vorweg — du kennst sie — und löse sie auf.",
    },
    difficulty: 2,
    targetSec: [60, 100],
  },
  {
    id: "per-donate",
    category: "persuasion",
    title: { en: "The fundraising ask", de: "Der Spendenaufruf" },
    prompt: {
      en: "Raise money for a cause you believe in: one human story, one number that shocks, one concrete gift amount and what exactly it buys.",
      de: "Sammle Geld für eine Sache, an die du glaubst: eine menschliche Geschichte, eine Zahl, die aufrüttelt, ein konkreter Betrag und was genau er bewirkt.",
    },
    difficulty: 3,
    targetSec: [70, 110],
  },
  {
    id: "per-vote",
    category: "persuasion",
    title: { en: "Get out the vote", de: "Geh wählen" },
    prompt: {
      en: "Convince a cynical non-voter that their single vote matters — without statistics-shaming or moralizing. Meet the cynicism head-on and turn it.",
      de: "Überzeuge einen zynischen Nichtwähler, dass seine eine Stimme zählt — ohne Statistik-Keule und ohne Moralpredigt. Nimm den Zynismus ernst und dreh ihn um.",
    },
    difficulty: 3,
    targetSec: [70, 110],
  },
  {
    id: "per-change-mind-boss",
    category: "persuasion",
    title: { en: "Overturn the decision", de: "Kipp die Entscheidung" },
    prompt: {
      en: "Your manager decided against your proposal last week. New information arrived. Reopen the case without making them feel wrong for the first call.",
      de: "Deine Chefin hat letzte Woche gegen deinen Vorschlag entschieden. Neue Informationen sind da. Rolle den Fall neu auf, ohne ihr die erste Entscheidung vorzuwerfen.",
    },
    difficulty: 3,
    targetSec: [70, 110],
  },
  {
    id: "per-recruit",
    category: "persuasion",
    title: { en: "Recruit the reluctant star", de: "Wirb das zögernde Talent" },
    prompt: {
      en: "Persuade a talented person to join your team, project, or club — someone with better-paying options. Sell the mission and be honest about the costs.",
      de: "Überzeuge ein Talent, deinem Team, Projekt oder Verein beizutreten — jemanden mit besser bezahlten Alternativen. Verkauf die Mission und sei ehrlich bei den Kosten.",
    },
    difficulty: 3,
    targetSec: [70, 110],
  },
  {
    id: "per-unpopular-truth",
    category: "persuasion",
    title: { en: "The unpopular truth", de: "Die unbequeme Wahrheit" },
    prompt: {
      en: "Persuade your audience to accept a truth they'd rather not hear — about their habits, their industry, their city. Respect first, evidence second, hope last.",
      de: "Überzeuge dein Publikum von einer Wahrheit, die es lieber nicht hören will — über seine Gewohnheiten, seine Branche, seine Stadt. Erst Respekt, dann Belege, zuletzt Hoffnung.",
    },
    difficulty: 3,
    targetSec: [80, 130],
  },

  // ——— Small Talk ———
  {
    id: "sml-conference-opener",
    category: "smalltalk",
    title: { en: "The conference coffee line", de: "Die Kaffeeschlange auf der Konferenz" },
    prompt: {
      en: "You're in the coffee line next to someone you'd love to know. Open a conversation without 'So, what do you do?' — and have two follow-ups ready.",
      de: "Du stehst in der Kaffeeschlange neben jemandem, den du gern kennenlernen würdest. Eröffne ein Gespräch ohne „Und, was machen Sie so?“ — mit zwei Anschlussfragen in petto.",
    },
    difficulty: 1,
    targetSec: [30, 60],
  },
  {
    id: "sml-introduce-two",
    category: "smalltalk",
    title: { en: "Introduce two strangers", de: "Stell zwei Fremde einander vor" },
    prompt: {
      en: "Introduce two friends who've never met — at a party, in fifteen seconds each: name, one vivid thing about them, and the thread that connects the two.",
      de: "Stell zwei Freunde einander vor, die sich nicht kennen — auf einer Feier, je fünfzehn Sekunden: Name, eine plastische Sache über sie und der Faden, der beide verbindet.",
    },
    difficulty: 1,
    targetSec: [30, 50],
  },
  {
    id: "sml-graceful-exit",
    category: "smalltalk",
    title: { en: "The graceful exit", de: "Der elegante Abgang" },
    prompt: {
      en: "You've been cornered at an event by a talker. Exit the conversation warmly in under thirty seconds — closing it, not fleeing it.",
      de: "Du bist auf einer Veranstaltung an einen Dauerredner geraten. Verlasse das Gespräch herzlich in unter dreißig Sekunden — beende es, statt zu fliehen.",
    },
    difficulty: 2,
    targetSec: [20, 40],
  },
  {
    id: "sml-elevator-neighbor",
    category: "smalltalk",
    title: { en: "Beyond the weather", de: "Jenseits des Wetters" },
    prompt: {
      en: "Turn a routine encounter with a neighbor — hallway, elevator, mailbox — into a real conversation with one genuinely curious question about their life.",
      de: "Verwandle eine Routinebegegnung mit einem Nachbarn — Flur, Aufzug, Briefkasten — in ein echtes Gespräch: mit einer aufrichtig neugierigen Frage zu seinem Leben.",
    },
    difficulty: 1,
    targetSec: [30, 60],
  },
  {
    id: "sml-dinner-host",
    category: "smalltalk",
    title: { en: "Host the table", de: "Führe die Tafel" },
    prompt: {
      en: "You're hosting a dinner where half the guests don't know each other. Deliver the welcome: seat the mood, spark one shared topic, and hand the table a question to run with.",
      de: "Du gibst ein Abendessen, bei dem sich die Hälfte der Gäste nicht kennt. Halte die Begrüßung: Stimmung setzen, ein gemeinsames Thema zünden und der Runde eine Frage mitgeben, die trägt.",
    },
    difficulty: 2,
    targetSec: [45, 80],
  },
  {
    id: "sml-awkward-recover",
    category: "smalltalk",
    title: { en: "Recover the blunder", de: "Rette den Fauxpas" },
    prompt: {
      en: "You just said something awkward — wrong name, wrong assumption, joke that died. Recover out loud with grace and humor, without over-apologizing.",
      de: "Du hast gerade etwas Ungeschicktes gesagt — falscher Name, falsche Annahme, verstorbener Witz. Fang es hörbar auf, mit Anmut und Humor, ohne dich zu Tode zu entschuldigen.",
    },
    difficulty: 2,
    targetSec: [20, 45],
  },
  {
    id: "sml-taxi-driver",
    category: "smalltalk",
    title: { en: "The twenty-minute ride", de: "Die zwanzig Minuten Fahrt" },
    prompt: {
      en: "A long taxi ride, a chatty driver, a topic you know nothing about. Practice the art of interested ignorance: ask, reflect, connect — carry your half with questions.",
      de: "Eine lange Taxifahrt, ein gesprächiger Fahrer, ein Thema, von dem du nichts verstehst. Übe die Kunst des interessierten Nichtwissens: fragen, spiegeln, verbinden — trag deine Hälfte mit Fragen.",
    },
    difficulty: 2,
    targetSec: [45, 80],
  },

  // ——— Crisis Communication ———
  {
    id: "cri-outage",
    category: "crisis",
    title: { en: "The outage statement", de: "Das Ausfall-Statement" },
    prompt: {
      en: "Your service went down for six hours and customers are furious. Record the public statement: what happened, impact, what you're doing, when you'll update next.",
      de: "Dein Dienst war sechs Stunden down, die Kunden toben. Nimm das öffentliche Statement auf: was passiert ist, die Auswirkungen, was ihr tut, wann das nächste Update kommt.",
    },
    difficulty: 3,
    targetSec: [50, 80],
  },
  {
    id: "cri-recall",
    category: "crisis",
    title: { en: "The recall announcement", de: "Die Rückruf-Ankündigung" },
    prompt: {
      en: "Your company must recall a product. Announce it: the risk in plain words, who's affected, exactly what customers should do, and the promise you're making.",
      de: "Deine Firma muss ein Produkt zurückrufen. Verkünde es: das Risiko in einfachen Worten, wer betroffen ist, was Kunden genau tun sollen und welches Versprechen ihr gebt.",
    },
    difficulty: 3,
    targetSec: [60, 100],
  },
  {
    id: "cri-rumor",
    category: "crisis",
    title: { en: "Kill the rumor", de: "Stopp das Gerücht" },
    prompt: {
      en: "A damaging rumor about your team is spreading internally. Address it head-on in a team meeting: the facts, what you can't share yet and why, and where questions go.",
      de: "Ein schädliches Gerücht über dein Team macht intern die Runde. Sprich es im Meeting frontal an: die Fakten, was du noch nicht teilen kannst und warum, und wohin Fragen gehören.",
    },
    difficulty: 3,
    targetSec: [60, 100],
  },
  {
    id: "cri-press-doorstep",
    category: "crisis",
    title: { en: "Doorstepped by a reporter", de: "Vom Reporter abgepasst" },
    prompt: {
      en: "A journalist ambushes you outside the office about a sensitive issue. Give the sixty-second holding response: calm, honest about limits, on the record, no 'no comment'.",
      de: "Eine Journalistin passt dich vor dem Büro zu einem heiklen Thema ab. Gib die sechzig Sekunden Übergangsantwort: ruhig, ehrlich über Grenzen, zitierfähig, kein „kein Kommentar“.",
    },
    difficulty: 3,
    targetSec: [45, 75],
  },
  {
    id: "cri-internal-layoffs",
    category: "crisis",
    title: { en: "Announcing hard cuts", de: "Harte Einschnitte verkünden" },
    prompt: {
      en: "You must tell your team that layoffs are coming. No euphemisms, no corporate fog: the decision, the reasons, the timeline, and how people will be treated.",
      de: "Du musst deinem Team mitteilen, dass Stellen wegfallen. Keine Euphemismen, kein Konzernnebel: die Entscheidung, die Gründe, der Zeitplan und wie mit den Menschen umgegangen wird.",
    },
    difficulty: 3,
    targetSec: [80, 120],
  },
  {
    id: "cri-own-mistake",
    category: "crisis",
    title: { en: "It was our fault", de: "Es war unser Fehler" },
    prompt: {
      en: "The crisis was caused by your own team's mistake. Deliver the accountability statement: what went wrong, why your safeguards failed, what changes — no scapegoats.",
      de: "Die Krise entstand durch einen Fehler deines eigenen Teams. Gib das Verantwortungs-Statement: was schieflief, warum die Sicherungen versagten, was sich ändert — ohne Sündenböcke.",
    },
    difficulty: 3,
    targetSec: [60, 100],
  },
  {
    id: "cri-reassure-panic",
    category: "crisis",
    title: { en: "Calm the panic", de: "Beruhige die Panik" },
    prompt: {
      en: "Bad industry news has your team fearing for their jobs — but your company is actually fine. Reassure them credibly: acknowledge the fear, show the numbers, name the plan.",
      de: "Schlechte Branchennachrichten lassen dein Team um die Jobs fürchten — dabei steht eure Firma solide da. Beruhige glaubwürdig: Angst anerkennen, Zahlen zeigen, Plan benennen.",
    },
    difficulty: 3,
    targetSec: [70, 110],
  },

  // ——— TED-Style Talks ———
  {
    id: "ted-idea-open",
    category: "ted",
    title: { en: "The idea worth spreading", de: "Die Idee, die es wert ist" },
    prompt: {
      en: "Deliver the first ninety seconds of your TED talk: cold open, why you of all people, and your idea in one tweetable sentence.",
      de: "Halte die ersten neunzig Sekunden deines TED-Talks: kalter Einstieg, warum ausgerechnet du, und deine Idee in einem Satz, den man posten kann.",
    },
    difficulty: 3,
    targetSec: [80, 100],
  },
  {
    id: "ted-myth-bust",
    category: "ted",
    title: { en: "Everything you know is wrong", de: "Alles, was ihr wisst, ist falsch" },
    prompt: {
      en: "Pick a common belief in a field you know and dismantle it TED-style: state the myth, show the crack, reveal the better model, land the implication.",
      de: "Nimm eine verbreitete Überzeugung aus deinem Feld und zerlege sie im TED-Stil: Mythos benennen, den Riss zeigen, das bessere Modell enthüllen, die Konsequenz landen.",
    },
    difficulty: 3,
    targetSec: [90, 140],
  },
  {
    id: "ted-personal-universal",
    category: "ted",
    title: { en: "From personal to universal", de: "Vom Persönlichen zum Allgemeinen" },
    prompt: {
      en: "Start with a small personal moment and zoom out to a universal truth — the TED signature move. The pivot sentence is everything; make it seamless.",
      de: "Beginne mit einem kleinen persönlichen Moment und zoome hinaus zu einer allgemeinen Wahrheit — die TED-Signatur. Der Übergangssatz ist alles; mach ihn nahtlos.",
    },
    difficulty: 3,
    targetSec: [90, 140],
  },
  {
    id: "ted-demo-imaginary",
    category: "ted",
    title: { en: "The invisible demo", de: "Die unsichtbare Demo" },
    prompt: {
      en: "Present a breakthrough — real or invented — with an on-stage 'demo' the audience can only see through your words. Narrate the demo like a magician's reveal.",
      de: "Präsentiere einen Durchbruch — echt oder erfunden — mit einer Bühnen-„Demo“, die das Publikum nur durch deine Worte sieht. Erzähle die Demo wie den Trick eines Magiers.",
    },
    difficulty: 3,
    targetSec: [90, 130],
  },
  {
    id: "ted-question-talk",
    category: "ted",
    title: { en: "The talk built on one question", de: "Der Talk aus einer Frage" },
    prompt: {
      en: "Build ninety seconds around a single question you keep returning to in life. Ask it three times during the talk — each time it should sound different.",
      de: "Baue neunzig Sekunden um eine einzige Frage, zu der du im Leben immer wieder zurückkehrst. Stelle sie dreimal im Talk — jedes Mal soll sie anders klingen.",
    },
    difficulty: 3,
    targetSec: [80, 110],
  },
  {
    id: "ted-future-back",
    category: "ted",
    title: { en: "Reporting from 2040", de: "Bericht aus dem Jahr 2040" },
    prompt: {
      en: "Speak as a visitor from 2040 explaining to today's audience how we solved a problem we currently think is unsolvable. Concrete milestones, no magic.",
      de: "Sprich als Besucher aus dem Jahr 2040, der dem heutigen Publikum erklärt, wie wir ein Problem gelöst haben, das wir aktuell für unlösbar halten. Konkrete Meilensteine, keine Magie.",
    },
    difficulty: 3,
    targetSec: [90, 140],
  },
  {
    id: "ted-close-strong",
    category: "ted",
    title: { en: "The standing-ovation close", de: "Das Standing-Ovation-Finale" },
    prompt: {
      en: "Deliver only the final ninety seconds of a talk: the callback, the lifted stakes, the last line you'd want quoted in every summary. Build to it audibly.",
      de: "Halte nur die letzten neunzig Sekunden eines Talks: der Rückgriff, die gehobene Fallhöhe, der Schlusssatz, der in jeder Zusammenfassung zitiert werden soll. Steigere hörbar darauf zu.",
    },
    difficulty: 3,
    targetSec: [80, 100],
  },
];
