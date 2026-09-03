import type { Scenario } from "@/lib/types";

/**
 * Impromptu prompts, part 2 of 2 (object drills, values, advocacy, stage games).
 * Same naming rule as scenarios-3.ts: every title carries "Impromptu" / "Stegreif".
 */
export const SCENARIOS_4: Scenario[] = [
  // ——— Two minutes on one word ———
  {
    id: "imp-object-keys",
    category: "debate",
    title: { en: "Impromptu — Two minutes on “keys”", de: "Stegreif — Zwei Minuten über „Schlüssel“" },
    prompt: {
      en: "One word, two minutes, no plan. Start literal, then follow it wherever it goes — and don't stop early.",
      de: "Ein Wort, zwei Minuten, kein Plan. Fang wörtlich an, folge dem Gedanken, wohin er führt — und hör nicht zu früh auf.",
    },
    difficulty: 1,
    targetSec: [90, 120],
  },
  {
    id: "imp-object-bridges",
    category: "debate",
    title: { en: "Impromptu — Two minutes on “bridges”", de: "Stegreif — Zwei Minuten über „Brücken“" },
    prompt: {
      en: "Talk for two minutes without preparing. Give the word a literal reading, then a human one, and connect the two.",
      de: "Sprich zwei Minuten ohne Vorbereitung. Nimm das Wort erst wörtlich, dann menschlich — und verbinde beides.",
    },
    difficulty: 1,
    targetSec: [90, 120],
  },
  {
    id: "imp-object-mirrors",
    category: "debate",
    title: { en: "Impromptu — Two minutes on “mirrors”", de: "Stegreif — Zwei Minuten über „Spiegel“" },
    prompt: {
      en: "Two minutes, one word. When you feel yourself circling, change angle instead of repeating — that's the skill being trained.",
      de: "Zwei Minuten, ein Wort. Wenn du dich im Kreis drehst, wechsle den Blickwinkel statt dich zu wiederholen — genau das wird geübt.",
    },
    difficulty: 1,
    targetSec: [90, 120],
  },
  {
    id: "imp-object-clocks",
    category: "debate",
    title: { en: "Impromptu — Two minutes on “clocks”", de: "Stegreif — Zwei Minuten über „Uhren“" },
    prompt: {
      en: "Start talking before you know where you're going. Three angles in two minutes is a good target.",
      de: "Fang an zu sprechen, bevor du weißt, wohin es geht. Drei Blickwinkel in zwei Minuten sind ein gutes Ziel.",
    },
    difficulty: 1,
    targetSec: [90, 120],
  },
  {
    id: "imp-object-doors",
    category: "debate",
    title: { en: "Impromptu — Two minutes on “doors”", de: "Stegreif — Zwei Minuten über „Türen“" },
    prompt: {
      en: "Two minutes on one ordinary word. Open with a specific one you know — a real door, in a real place.",
      de: "Zwei Minuten über ein alltägliches Wort. Beginn mit einer bestimmten Tür, die du kennst — echt, an einem echten Ort.",
    },
    difficulty: 1,
    targetSec: [90, 120],
  },
  {
    id: "imp-object-coffee",
    category: "debate",
    title: { en: "Impromptu — Two minutes on “coffee”", de: "Stegreif — Zwei Minuten über „Kaffee“" },
    prompt: {
      en: "Fill two minutes without filler. Sensory details buy you time far better than “um” does.",
      de: "Füll zwei Minuten ohne Füllwörter. Sinnliche Details kaufen dir mehr Zeit als jedes „ähm“.",
    },
    difficulty: 1,
    targetSec: [90, 120],
  },
  {
    id: "imp-object-shoes",
    category: "debate",
    title: { en: "Impromptu — Two minutes on “shoes”", de: "Stegreif — Zwei Minuten über „Schuhe“" },
    prompt: {
      en: "One word, two minutes. Try a pair you owned, a pair you wanted, and a pair you'd never wear.",
      de: "Ein Wort, zwei Minuten. Versuch es mit Schuhen, die du hattest, die du wolltest, und die du nie tragen würdest.",
    },
    difficulty: 1,
    targetSec: [90, 120],
  },
  {
    id: "imp-object-maps",
    category: "debate",
    title: { en: "Impromptu — Two minutes on “maps”", de: "Stegreif — Zwei Minuten über „Karten“" },
    prompt: {
      en: "Two minutes, no notes. Give the word a beginning, a middle and an end even though you're inventing as you go.",
      de: "Zwei Minuten, keine Notizen. Gib dem Wort Anfang, Mitte und Ende, obwohl du im Sprechen erfindest.",
    },
    difficulty: 1,
    targetSec: [90, 120],
  },
  {
    id: "imp-object-rain",
    category: "debate",
    title: { en: "Impromptu — Two minutes on “rain”", de: "Stegreif — Zwei Minuten über „Regen“" },
    prompt: {
      en: "Two minutes on one word. Resist the poem — a real memory of one wet afternoon will hold us longer.",
      de: "Zwei Minuten über ein Wort. Verzichte aufs Gedicht — eine echte Erinnerung an einen nassen Nachmittag trägt weiter.",
    },
    difficulty: 1,
    targetSec: [90, 120],
  },
  {
    id: "imp-object-fire",
    category: "debate",
    title: { en: "Impromptu — Two minutes on “fire”", de: "Stegreif — Zwei Minuten über „Feuer“" },
    prompt: {
      en: "The last of the word drills, so push it: two minutes, three angles, and land the ending on purpose.",
      de: "Die letzte der Wortübungen, also fordere dich: zwei Minuten, drei Blickwinkel — und ein bewusst gesetztes Ende.",
    },
    difficulty: 1,
    targetSec: [90, 120],
  },

  // ——— Values, growth and the interview chair ———
  {
    id: "imp-first-job",
    category: "interview",
    title: {
      en: "Impromptu — Tell us about your first job or responsibility",
      de: "Stegreif — Erzähl von deinem ersten Job oder deiner ersten Verantwortung",
    },
    prompt: {
      en: "What you were handed, what you got wrong, and what you still do today because of it.",
      de: "Was man dir übergeben hat, was du falsch gemacht hast — und was du deshalb heute noch anders machst.",
    },
    difficulty: 2,
    targetSec: [60, 120],
  },
  {
    id: "imp-what-is-success",
    category: "interview",
    title: {
      en: "Impromptu — What does success mean to you?",
      de: "Stegreif — Was bedeutet Erfolg für dich?",
    },
    prompt: {
      en: "Give your own definition, not the one you think we want. Then name one thing you'd refuse even if it worked.",
      de: "Gib deine eigene Definition, nicht die erwartete. Und nenn eine Sache, die du ablehnen würdest, selbst wenn sie funktioniert.",
    },
    difficulty: 2,
    targetSec: [60, 120],
  },
  {
    id: "imp-uncompromised-value",
    category: "interview",
    title: {
      en: "Impromptu — What's a value you'd never compromise on?",
      de: "Stegreif — Welchen Wert würdest du niemals aufgeben?",
    },
    prompt: {
      en: "A value only counts once it costs something. Name yours and tell us what holding it has cost you.",
      de: "Ein Wert zählt erst, wenn er etwas kostet. Nenn deinen und sag, was er dich gekostet hat.",
    },
    difficulty: 2,
    targetSec: [60, 120],
  },
  {
    id: "imp-role-model",
    category: "interview",
    title: {
      en: "Impromptu — Describe your role model and why they matter to you",
      de: "Stegreif — Beschreib dein Vorbild und warum es dir wichtig ist",
    },
    prompt: {
      en: "Praise the specific, not the general. One thing they did that you're still trying to copy.",
      de: "Lob das Konkrete, nicht das Allgemeine. Eine Sache, die sie getan haben und die du bis heute nachmachst.",
    },
    difficulty: 2,
    targetSec: [60, 120],
  },
  {
    id: "imp-building-habit",
    category: "interview",
    title: {
      en: "Impromptu — What's a habit you're trying to build?",
      de: "Stegreif — Welche Gewohnheit versuchst du dir gerade anzueignen?",
    },
    prompt: {
      en: "Say what it is, how long you've been at it, and where it keeps breaking. Honesty is more interesting than progress here.",
      de: "Sag, was es ist, wie lange du dranbleibst und wo es immer wieder scheitert. Ehrlichkeit ist hier spannender als Fortschritt.",
    },
    difficulty: 1,
    targetSec: [45, 90],
  },
  {
    id: "imp-stay-motivated",
    category: "interview",
    title: {
      en: "Impromptu — How do you stay motivated when things get hard?",
      de: "Stegreif — Wie bleibst du motiviert, wenn es schwer wird?",
    },
    prompt: {
      en: "Answer from a week you actually got through, not from what you'd like to be true about yourself.",
      de: "Antworte aus einer Woche, die du wirklich durchgestanden hast — nicht aus dem Bild, das du gern von dir hättest.",
    },
    difficulty: 2,
    targetSec: [60, 120],
  },
  {
    id: "imp-team-trust",
    category: "business",
    title: {
      en: "Impromptu — What does trust mean in a team?",
      de: "Stegreif — Was bedeutet Vertrauen in einem Team?",
    },
    prompt: {
      en: "Define it by what breaks it. Then say what a team does differently on the day trust is finally there.",
      de: "Definiere es darüber, was es zerstört. Und sag, was ein Team anders macht, sobald das Vertrauen da ist.",
    },
    difficulty: 2,
    targetSec: [60, 120],
  },
  {
    id: "imp-referee-coach-requires",
    category: "ted",
    title: {
      en: "Impromptu — What does being a good referee or coach actually require?",
      de: "Stegreif — Was braucht es wirklich, um ein guter Schiedsrichter oder Trainer zu sein?",
    },
    prompt: {
      en: "Go past “fairness” and “communication”. Name the thing nobody sees from the stands.",
      de: "Geh über „Fairness“ und „Kommunikation“ hinaus. Benenne das, was von der Tribüne aus niemand sieht.",
    },
    difficulty: 2,
    targetSec: [60, 120],
  },
  {
    id: "imp-integrity-daily",
    category: "ted",
    title: {
      en: "Impromptu — What does “integrity” look like in daily life?",
      de: "Stegreif — Wie sieht Integrität im Alltag aus?",
    },
    prompt: {
      en: "Big word, small examples. Three ordinary moments where it shows up or doesn't — that's the whole speech.",
      de: "Großes Wort, kleine Beispiele. Drei alltägliche Momente, in denen sie sichtbar wird oder fehlt — das ist die ganze Rede.",
    },
    difficulty: 3,
    targetSec: [60, 120],
  },
  {
    id: "imp-hardest-feedback",
    category: "difficult",
    title: {
      en: "Impromptu — What's the hardest kind of feedback to hear?",
      de: "Stegreif — Welche Art von Feedback ist am schwersten zu hören?",
    },
    prompt: {
      en: "Name the kind, then the last time you got it. Say what you did in the first hour after — that's the honest part.",
      de: "Nenn die Art und dann das letzte Mal, als du sie bekommen hast. Sag, was du in der ersten Stunde danach getan hast.",
    },
    difficulty: 2,
    targetSec: [60, 120],
  },
  {
    id: "imp-everyday-diplomacy",
    category: "difficult",
    title: {
      en: "Impromptu — Why does diplomacy matter in everyday disagreements?",
      de: "Stegreif — Warum ist Diplomatie bei alltäglichen Streitfällen wichtig?",
    },
    prompt: {
      en: "Argue it from an argument you lost by winning. Diplomacy is easiest to explain from its absence.",
      de: "Begründe es an einem Streit, den du durch Gewinnen verloren hast. Diplomatie erklärt sich am besten aus ihrem Fehlen.",
    },
    difficulty: 3,
    targetSec: [60, 120],
  },
  {
    id: "imp-respectful-disagreement",
    category: "difficult",
    title: {
      en: "Impromptu — How do you handle disagreement with someone you respect?",
      de: "Stegreif — Wie gehst du mit Widerspruch von jemandem um, den du respektierst?",
    },
    prompt: {
      en: "Walk us through your actual method: what you say first, what you never say, and how you leave the room.",
      de: "Zeig uns dein echtes Vorgehen: was du zuerst sagst, was du nie sagst und wie du den Raum verlässt.",
    },
    difficulty: 3,
    targetSec: [60, 120],
  },
  {
    id: "imp-respond-criticism",
    category: "difficult",
    title: {
      en: "Impromptu — How should someone respond to criticism?",
      de: "Stegreif — Wie sollte man auf Kritik reagieren?",
    },
    prompt: {
      en: "Separate the two jobs: what you do in the moment, and what you do a day later. Most people only prepare for one.",
      de: "Trenne die zwei Aufgaben: was du im Moment tust und was einen Tag später. Die meisten bereiten nur eine davon vor.",
    },
    difficulty: 2,
    targetSec: [60, 120],
  },
  {
    id: "imp-really-listen",
    category: "difficult",
    title: {
      en: "Impromptu — What does it mean to really listen to someone?",
      de: "Stegreif — Was heißt es, jemandem wirklich zuzuhören?",
    },
    prompt: {
      en: "Show us the difference between waiting to speak and listening, using a conversation you were in.",
      de: "Zeig den Unterschied zwischen Abwarten und Zuhören anhand eines Gesprächs, in dem du selbst warst.",
    },
    difficulty: 2,
    targetSec: [60, 120],
  },

  // ——— Advocacy and community ———
  {
    id: "imp-local-community",
    category: "persuasion",
    title: {
      en: "Impromptu — Why should young people get involved in local community work?",
      de: "Stegreif — Warum sollten junge Menschen sich in ihrer Gemeinde engagieren?",
    },
    prompt: {
      en: "You're speaking to a room of sixteen-year-olds who'd rather be elsewhere. Win them in the first fifteen seconds.",
      de: "Du sprichst zu Sechzehnjährigen, die lieber woanders wären. Gewinn sie in den ersten fünfzehn Sekunden.",
    },
    difficulty: 2,
    targetSec: [60, 120],
  },
  {
    id: "imp-youth-sports-change",
    category: "persuasion",
    title: {
      en: "Impromptu — What's one change you'd make to how youth sports are run?",
      de: "Stegreif — Was würdest du am Jugendsport ändern?",
    },
    prompt: {
      en: "One change, argued to the people who'd have to make it. Say what it costs them and why it's worth it anyway.",
      de: "Eine Änderung, vorgetragen vor denen, die sie umsetzen müssten. Sag, was sie kostet — und warum sie sich trotzdem lohnt.",
    },
    difficulty: 3,
    targetSec: [60, 120],
  },
  {
    id: "imp-why-volunteer",
    category: "persuasion",
    title: {
      en: "Impromptu — Why does volunteering matter?",
      de: "Stegreif — Warum ist Ehrenamt wichtig?",
    },
    prompt: {
      en: "Avoid the word “giving back”. Make the case from something you've seen a volunteer actually change.",
      de: "Vermeide das Wort „zurückgeben“. Begründe es an etwas, das du ein Ehrenamt wirklich hast verändern sehen.",
    },
    difficulty: 2,
    targetSec: [60, 120],
  },
  {
    id: "imp-support-young-people",
    category: "persuasion",
    title: {
      en: "Impromptu — How can communities better support young people?",
      de: "Stegreif — Wie können Gemeinden junge Menschen besser unterstützen?",
    },
    prompt: {
      en: "Speak to a council, not a camera. Two proposals, each with the first practical step named.",
      de: "Sprich zu einem Gemeinderat, nicht in eine Kamera. Zwei Vorschläge, jeder mit dem ersten konkreten Schritt.",
    },
    difficulty: 3,
    targetSec: [60, 120],
  },
  {
    id: "imp-why-mentorship",
    category: "persuasion",
    title: {
      en: "Impromptu — Why is mentorship important?",
      de: "Stegreif — Warum ist Mentoring wichtig?",
    },
    prompt: {
      en: "Argue it from both chairs — what the mentee gets, and the harder case for what the mentor gets.",
      de: "Argumentiere von beiden Seiten — was der Mentee bekommt und, schwieriger, was der Mentor davon hat.",
    },
    difficulty: 2,
    targetSec: [60, 120],
  },
  {
    id: "imp-community-ambassador",
    category: "ted",
    title: {
      en: "Impromptu — What makes someone a good ambassador for their community?",
      de: "Stegreif — Was macht jemanden zu einem guten Botschafter seiner Gemeinschaft?",
    },
    prompt: {
      en: "Not the polished version — the person who represents well on a bad day. Describe them.",
      de: "Nicht die geschliffene Version — die Person, die auch an einem schlechten Tag gut vertritt. Beschreib sie.",
    },
    difficulty: 3,
    targetSec: [60, 120],
  },
  {
    id: "imp-sport-builds-character",
    category: "ted",
    title: {
      en: "Impromptu — How can sport build character beyond the game itself?",
      de: "Stegreif — Wie formt Sport den Charakter über das Spiel hinaus?",
    },
    prompt: {
      en: "Everyone claims this. Prove it with one habit from training that shows up somewhere sport can't reach.",
      de: "Das behaupten alle. Beweis es mit einer Gewohnheit aus dem Training, die dort auftaucht, wo Sport nicht hinreicht.",
    },
    difficulty: 2,
    targetSec: [60, 120],
  },
  {
    id: "imp-leading-by-example",
    category: "ted",
    title: {
      en: "Impromptu — What does “leading by example” really mean?",
      de: "Stegreif — Was heißt „mit gutem Beispiel vorangehen“ wirklich?",
    },
    prompt: {
      en: "Take the cliché apart. Name a moment where someone led by example and it cost them something.",
      de: "Zerleg die Floskel. Nenn einen Moment, in dem jemand vorangegangen ist und es ihn etwas gekostet hat.",
    },
    difficulty: 2,
    targetSec: [60, 120],
  },
  {
    id: "imp-meaningful-life",
    category: "ted",
    title: {
      en: "Impromptu — What does it mean to live a meaningful life?",
      de: "Stegreif — Was heißt es, ein sinnvolles Leben zu führen?",
    },
    prompt: {
      en: "The biggest question in the set. Answer it small: one person, one week, one thing worth doing.",
      de: "Die größte Frage der Sammlung. Antworte klein: eine Person, eine Woche, eine Sache, die es wert ist.",
    },
    difficulty: 3,
    targetSec: [60, 120],
  },
  {
    id: "imp-leadership-unwatched",
    category: "ted",
    title: {
      en: "Impromptu — What does “leadership” mean when no one's watching?",
      de: "Stegreif — Was bedeutet Führung, wenn niemand hinsieht?",
    },
    prompt: {
      en: "Strip out the audience and see what's left. Give us one unwitnessed decision that says everything.",
      de: "Nimm das Publikum weg und schau, was bleibt. Gib uns eine unbeobachtete Entscheidung, die alles sagt.",
    },
    difficulty: 3,
    targetSec: [60, 120],
  },
  {
    id: "imp-invent-a-sport",
    category: "ted",
    title: {
      en: "Impromptu — Explain a made-up sport in one minute",
      de: "Stegreif — Erklär eine erfundene Sportart in einer Minute",
    },
    prompt: {
      en: "Invent it as you speak: the object, the rules, the one way to cheat. Keep it coherent to the last word.",
      de: "Erfinde sie beim Sprechen: Ziel, Regeln, die eine Möglichkeit zu schummeln. Bleib bis zum letzten Wort stimmig.",
    },
    difficulty: 1,
    targetSec: [50, 70],
  },

  // ——— On your feet, in front of a room ———
  {
    id: "imp-sixty-second-pitch",
    category: "business",
    title: {
      en: "Impromptu — Pitch us a business idea in 60 seconds",
      de: "Stegreif — Pitch uns eine Geschäftsidee in 60 Sekunden",
    },
    prompt: {
      en: "Invent it now. Problem, product, who pays — and finish inside the minute, because that's the exercise.",
      de: "Erfinde sie jetzt. Problem, Produkt, wer zahlt — und bleib in der Minute, denn genau das ist die Übung.",
    },
    difficulty: 2,
    targetSec: [50, 70],
  },
  {
    id: "imp-sell-useless-product",
    category: "business",
    title: {
      en: "Impromptu — Sell us a completely useless product",
      de: "Stegreif — Verkauf uns ein völlig nutzloses Produkt",
    },
    prompt: {
      en: "Total conviction, no wink. The joke only works if you never once admit it's a joke.",
      de: "Volle Überzeugung, kein Augenzwinkern. Der Witz funktioniert nur, wenn du ihn nie als Witz zugibst.",
    },
    difficulty: 2,
    targetSec: [45, 90],
  },
  {
    id: "imp-birthday-toast",
    category: "occasions",
    title: {
      en: "Impromptu — Give a toast for a friend's birthday, on the spot",
      de: "Stegreif — Halt aus dem Stegreif einen Geburtstagstoast für einen Freund",
    },
    prompt: {
      en: "Glass up, room waiting. One story, one line about who they are, and a clean landing on the raised glass.",
      de: "Glas erhoben, Raum wartet. Eine Geschichte, ein Satz darüber, wer sie sind, und ein sauberer Schluss aufs Glas.",
    },
    difficulty: 2,
    targetSec: [40, 70],
  },
  {
    id: "imp-pep-talk",
    category: "occasions",
    title: {
      en: "Impromptu — Give a “you can do it” pep talk to a nervous teammate",
      de: "Stegreif — Sprich einem nervösen Teamkollegen Mut zu",
    },
    prompt: {
      en: "One person, right before they go on. Short sentences, their name, and something true rather than something loud.",
      de: "Eine Person, kurz vor dem Auftritt. Kurze Sätze, ihr Name — und etwas Wahres statt etwas Lautem.",
    },
    difficulty: 1,
    targetSec: [45, 90],
  },
  {
    id: "imp-game-show-host",
    category: "occasions",
    title: {
      en: "Impromptu — Introduce yourself as if you were a game show host",
      de: "Stegreif — Stell dich vor, als wärst du ein Showmaster",
    },
    prompt: {
      en: "Big energy, tight structure. Your name, the show, tonight's prize — and hold the persona to the end.",
      de: "Große Energie, klare Struktur. Dein Name, die Show, der Preis des Abends — und halte die Rolle bis zum Schluss.",
    },
    difficulty: 1,
    targetSec: [45, 90],
  },
  {
    id: "imp-one-minute-inspire",
    category: "occasions",
    title: {
      en: "Impromptu — If you had one minute to inspire a room of strangers, what would you say?",
      de: "Stegreif — Was sagst du, wenn du eine Minute hast, um Fremde zu begeistern?",
    },
    prompt: {
      en: "The hardest one in the set. No warm-up, no context, one idea — and an ending they'd repeat on the way out.",
      de: "Die schwerste Aufgabe der Sammlung. Kein Warmlaufen, kein Kontext, eine Idee — und ein Schluss, den man draußen weitererzählt.",
    },
    difficulty: 3,
    targetSec: [50, 70],
  },
];
