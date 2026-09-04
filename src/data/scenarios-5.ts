import type { Scenario } from "@/lib/types";

/**
 * Scenarios converted from the former fixed 66-day challenge path, part 1 of
 * 2 (originally days 1–33, Acts I–III: Foundations, Structure, Story). The
 * path itself is gone — every day now draws randomly from the scenario
 * library (see src/lib/daily.ts) — but the authored prompts were too good to
 * drop, so they were reshaped into ordinary Scenario entries and folded into
 * the browsable library. A handful of titles/prompts that assumed a fixed
 * day-by-day sequence ("Act II finale", "same facts as day one") were lightly
 * edited to stand alone, since a scenario in this library can now be anyone's
 * first pick. The `focus` field the originals carried ("what the coach is
 * listening for") was dropped rather than folded into the prompt — it was a
 * second, coach-directed register the rest of the library doesn't use.
 */
export const SCENARIOS_5: Scenario[] = [
  {
    id: "sml-introduce-yourself",
    category: "smalltalk",
    title: { en: "Introduce yourself", de: "Stell dich vor" },
    prompt: {
      en: "Introduce yourself to a room of strangers — your name, what you do, and one thing you genuinely care about. No résumé recital: make them remember one thing.",
      de: "Stell dich einem Raum voller Fremder vor — dein Name, was du tust und eine Sache, die dir wirklich wichtig ist. Kein Lebenslauf-Vortrag: Sorg dafür, dass sie sich an eine Sache erinnern.",
    },
    difficulty: 1,
    targetSec: [45, 90],
  },
  {
    id: "story-yesterday-out-loud",
    category: "storytelling",
    title: { en: "Your yesterday, out loud", de: "Dein gestriger Tag, laut" },
    prompt: {
      en: "Describe your day yesterday as if telling a friend — but give it a beginning, a turn, and an ending. Find the one moment worth telling.",
      de: "Beschreibe deinen gestrigen Tag, als würdest du einem Freund erzählen — aber gib ihm Anfang, Wendung und Ende. Finde den einen erzählenswerten Moment.",
    },
    difficulty: 1,
    targetSec: [60, 90],
  },
  {
    id: "ted-explain-your-craft",
    category: "ted",
    title: { en: "Explain your craft", de: "Erklär dein Handwerk" },
    prompt: {
      en: "Explain what you do for work (or study) to a curious twelve-year-old. No jargon survives. Use one concrete comparison from everyday life.",
      de: "Erkläre einem neugierigen Zwölfjährigen, was du beruflich machst (oder studierst). Kein Fachwort überlebt. Nutze einen konkreten Vergleich aus dem Alltag.",
    },
    difficulty: 1,
    targetSec: [60, 100],
  },
  {
    id: "story-room-you-know-best",
    category: "storytelling",
    title: { en: "The room you know best", de: "Der Raum, den du am besten kennst" },
    prompt: {
      en: "Describe a room you know by heart so vividly that a listener could sketch it. Lead their eye deliberately: pick a path through the space, don't inventory it.",
      de: "Beschreibe einen Raum, den du auswendig kennst, so lebendig, dass ein Zuhörer ihn zeichnen könnte. Führe den Blick bewusst: Wähle einen Weg durch den Raum, statt ihn aufzuzählen.",
    },
    difficulty: 1,
    targetSec: [60, 100],
  },
  {
    id: "occ-thirty-seconds-gratitude",
    category: "occasions",
    title: { en: "Thirty seconds of gratitude", de: "Dreißig Sekunden Dankbarkeit" },
    prompt: {
      en: "Thank one specific person for one specific thing, as if they were standing in front of you. Name what they did, what it changed, and what you want them to know.",
      de: "Danke einer bestimmten Person für eine bestimmte Sache, als stünde sie vor dir. Benenne, was sie getan hat, was es verändert hat und was sie wissen soll.",
    },
    difficulty: 1,
    targetSec: [30, 60],
  },
  {
    id: "ted-teach-a-tiny-skill",
    category: "ted",
    title: { en: "Teach a tiny skill", de: "Bring eine Mini-Fähigkeit bei" },
    prompt: {
      en: "Teach the listener something you can do that takes under a minute — folding a shirt, brewing better coffee, a keyboard shortcut. Steps in order, no backtracking.",
      de: "Bring dem Zuhörer etwas bei, das du kannst und das unter einer Minute dauert — ein Hemd falten, besseren Kaffee brühen, ein Tastenkürzel. Schritte in Reihenfolge, kein Zurückspringen.",
    },
    difficulty: 1,
    targetSec: [60, 90],
  },
  {
    id: "story-object-with-history",
    category: "storytelling",
    title: { en: "An object with a history", de: "Ein Gegenstand mit Geschichte" },
    prompt: {
      en: "Pick an object within arm's reach and tell its story: where it came from, what it has seen, why it's still here. Give a thing a voice without being cute.",
      de: "Wähle einen Gegenstand in Reichweite und erzähle seine Geschichte: woher er kommt, was er erlebt hat, warum er noch da ist. Gib einem Ding eine Stimme, ohne niedlich zu werden.",
    },
    difficulty: 1,
    targetSec: [60, 100],
  },
  {
    id: "deb-opinion-in-one-minute",
    category: "debate",
    title: { en: "Your opinion, in one minute", de: "Deine Meinung, in einer Minute" },
    prompt: {
      en: "State an opinion you actually hold — about food, cities, work, anything — and back it with two reasons and one example. Claim, reasons, example, restate. Done.",
      de: "Vertritt eine Meinung, die du wirklich hast — über Essen, Städte, Arbeit, egal — mit zwei Gründen und einem Beispiel. These, Gründe, Beispiel, Schlusssatz. Fertig.",
    },
    difficulty: 1,
    targetSec: [50, 80],
  },
  {
    id: "story-person-you-admire",
    category: "storytelling",
    title: { en: "Describe a person you admire", de: "Beschreibe einen Menschen, den du bewunderst" },
    prompt: {
      en: "Make a listener see someone you admire — not their achievements, their manner. How they enter a room, how they listen, one moment that shows who they are.",
      de: "Lass den Zuhörer einen Menschen sehen, den du bewunderst — nicht seine Erfolge, sein Wesen. Wie er einen Raum betritt, wie er zuhört, ein Moment, der zeigt, wer er ist.",
    },
    difficulty: 1,
    targetSec: [60, 110],
  },
  {
    id: "ted-weather-report-of-life",
    category: "ted",
    title: { en: "The weather report of your life", de: "Der Wetterbericht deines Lebens" },
    prompt: {
      en: "Deliver the current state of your life as a weather forecast — fronts moving in, clear skies ahead, scattered chaos. Sustain the metaphor for the full minute without breaking it.",
      de: "Präsentiere den aktuellen Stand deines Lebens als Wetterbericht — aufziehende Fronten, klare Aussichten, vereinzeltes Chaos. Halte die Metapher eine volle Minute durch, ohne sie zu brechen.",
    },
    difficulty: 1,
    targetSec: [60, 90],
  },
  {
    id: "sml-foundations-condensed",
    category: "smalltalk",
    title: { en: "Foundations, condensed", de: "Fundament, verdichtet" },
    prompt: {
      en: "Introduce yourself as the speaker you intend to become: what you do, why it matters, where you're headed. Sharper and more deliberate than a first attempt would be.",
      de: "Stell dich vor als der Redner, der du werden willst: was du tust, warum es zählt, wohin du willst. Schärfer und bewusster, als ein erster Versuch es wäre.",
    },
    difficulty: 1,
    targetSec: [45, 90],
  },
  {
    id: "ted-the-cold-open",
    category: "ted",
    title: { en: "The cold open", de: "Der kalte Einstieg" },
    prompt: {
      en: "Open a talk about anything you know well — but the first sentence must be a hook: a question, a bold claim, or a scene. Banned: 'Today I want to talk about…'",
      de: "Eröffne einen Vortrag über etwas, das du gut kennst — aber der erste Satz muss ein Haken sein: eine Frage, eine steile These oder eine Szene. Verboten: „Heute möchte ich über … sprechen.“",
    },
    difficulty: 1,
    targetSec: [45, 80],
  },
  {
    id: "deb-three-points-three-fingers",
    category: "debate",
    title: { en: "Three points, three fingers", de: "Drei Punkte, drei Finger" },
    prompt: {
      en: "Argue anything using the rule of three: 'There are three reasons…' — then deliver exactly three, clearly numbered, each one sentence longer than the last.",
      de: "Argumentiere beliebig mit der Dreierregel: „Dafür gibt es drei Gründe …“ — und liefere genau drei, klar nummeriert, jeder einen Satz länger als der vorige.",
    },
    difficulty: 1,
    targetSec: [60, 100],
  },
  {
    id: "ted-the-landing",
    category: "ted",
    title: { en: "The landing", de: "Die Landung" },
    prompt: {
      en: "Talk about a hobby or interest for a minute — the real test is the ending. Land on a sentence you could carve in stone. No 'yeah, so… that's it.'",
      de: "Sprich eine Minute über ein Hobby oder Interesse — der echte Test ist das Ende. Lande auf einem Satz, den man in Stein meißeln könnte. Kein „ja, also … das war's.“",
    },
    difficulty: 1,
    targetSec: [60, 90],
  },
  {
    id: "ted-signposting",
    category: "ted",
    title: { en: "Signposting", de: "Wegweiser setzen" },
    prompt: {
      en: "Explain a process with at least four steps — a recipe, a routine, a workflow — using spoken signposts: 'First… Now here's where it gets tricky… Finally…' Guide, don't just list.",
      de: "Erkläre einen Prozess mit mindestens vier Schritten — ein Rezept, eine Routine, einen Ablauf — mit gesprochenen Wegweisern: „Zuerst … Jetzt wird es knifflig … Zum Schluss …“ Führe, statt nur aufzuzählen.",
    },
    difficulty: 1,
    targetSec: [70, 110],
  },
  {
    id: "biz-one-minute-one-message",
    category: "business",
    title: { en: "One minute, one message", de: "Eine Minute, eine Botschaft" },
    prompt: {
      en: "Pick a message that matters to you and make every sentence serve it. If a sentence doesn't feed the message, it doesn't get said. Sixty seconds of pure signal.",
      de: "Wähle eine Botschaft, die dir wichtig ist, und stelle jeden Satz in ihren Dienst. Wenn ein Satz die Botschaft nicht trägt, wird er nicht gesagt. Sechzig Sekunden reines Signal.",
    },
    difficulty: 1,
    targetSec: [50, 70],
  },
  {
    id: "ted-the-pause",
    category: "ted",
    title: { en: "The pause", de: "Die Pause" },
    prompt: {
      en: "Tell any story or make any argument — but place three deliberate silences of at least two seconds, right before your most important lines. Let the silence do the underlining.",
      de: "Erzähle irgendeine Geschichte oder führe ein Argument — aber setze drei bewusste Pausen von mindestens zwei Sekunden, direkt vor deine wichtigsten Sätze. Lass die Stille unterstreichen.",
    },
    difficulty: 1,
    targetSec: [60, 100],
  },
  {
    id: "deb-compare-and-choose",
    category: "debate",
    title: { en: "Compare and choose", de: "Vergleichen und entscheiden" },
    prompt: {
      en: "Compare two options you know well — two cities, two tools, two ways of living — then commit to a verdict. Structure: criteria first, then the comparison, then the call.",
      de: "Vergleiche zwei Optionen, die du gut kennst — zwei Städte, zwei Werkzeuge, zwei Lebensweisen — und fälle dann ein Urteil. Struktur: erst Kriterien, dann Vergleich, dann Entscheidung.",
    },
    difficulty: 1,
    targetSec: [70, 110],
  },
  {
    id: "ted-explain-the-invisible",
    category: "ted",
    title: { en: "Explain the invisible", de: "Erklär das Unsichtbare" },
    prompt: {
      en: "Explain something invisible — inflation, an algorithm, trust, Wi-Fi — using only things a listener can picture. Every abstraction must be traded for an image.",
      de: "Erkläre etwas Unsichtbares — Inflation, einen Algorithmus, Vertrauen, WLAN — nur mit Dingen, die ein Zuhörer sich vorstellen kann. Jede Abstraktion wird gegen ein Bild getauscht.",
    },
    difficulty: 2,
    targetSec: [70, 110],
  },
  {
    id: "biz-ninety-second-briefing",
    category: "business",
    title: { en: "The 90-second briefing", de: "Das 90-Sekunden-Briefing" },
    prompt: {
      en: "Brief a busy executive on a topic you follow — news, a market, a fandom, a sport. Bottom line first, then the three things worth knowing, then what to watch next.",
      de: "Briefe eine vielbeschäftigte Führungskraft zu einem Thema, das du verfolgst — Nachrichten, ein Markt, eine Szene, ein Sport. Fazit zuerst, dann die drei wichtigsten Punkte, dann der Ausblick.",
    },
    difficulty: 2,
    targetSec: [75, 100],
  },
  {
    id: "ted-callbacks",
    category: "ted",
    title: { en: "Callbacks", de: "Rückgriffe" },
    prompt: {
      en: "Give a short talk that plants an image in the first sentence and returns to it — changed — in the last. Open with the seed, close with the harvest.",
      de: "Halte einen kurzen Vortrag, der im ersten Satz ein Bild pflanzt und im letzten — verwandelt — dorthin zurückkehrt. Beginne mit der Saat, ende mit der Ernte.",
    },
    difficulty: 2,
    targetSec: [70, 110],
  },
  {
    id: "deb-structure-under-pressure",
    category: "debate",
    title: { en: "Structure under pressure", de: "Struktur unter Druck" },
    prompt: {
      en: "Pick any object you can see and give a structured mini-talk about it right now — hook, three points, landing. No preparation beyond reading this prompt.",
      de: "Wähle ein sichtbares Objekt und halte sofort einen strukturierten Mini-Vortrag darüber — Haken, drei Punkte, Landung. Keine Vorbereitung über das Lesen hinaus.",
    },
    difficulty: 2,
    targetSec: [60, 100],
  },
  {
    id: "story-the-first-time",
    category: "storytelling",
    title: { en: "The first time", de: "Das erste Mal" },
    prompt: {
      en: "Tell the story of a first time — first job, first flight, first failure. Start inside the moment, not with background. 'The door was already open when…' beats 'So, a few years ago…'",
      de: "Erzähle die Geschichte eines ersten Mals — erster Job, erster Flug, erster Fehlschlag. Beginn mitten im Moment, nicht mit Vorgeschichte. „Die Tür stand schon offen, als …“ schlägt „Also, vor ein paar Jahren …“.",
    },
    difficulty: 2,
    targetSec: [80, 130],
  },
  {
    id: "story-five-senses",
    category: "storytelling",
    title: { en: "Five senses", de: "Fünf Sinne" },
    prompt: {
      en: "Take the listener to a place from your memory using all five senses — the sound before the sight, the smell before the explanation. No opinions, only perception.",
      de: "Nimm den Zuhörer mit an einen Ort deiner Erinnerung — mit allen fünf Sinnen. Das Geräusch vor dem Bild, der Geruch vor der Erklärung. Keine Meinungen, nur Wahrnehmung.",
    },
    difficulty: 2,
    targetSec: [70, 110],
  },
  {
    id: "story-the-turning-point",
    category: "storytelling",
    title: { en: "The turning point", de: "Der Wendepunkt" },
    prompt: {
      en: "Tell a true story built around one turning point: the moment before, the moment itself, and who you were after. Make the listener feel the hinge swing.",
      de: "Erzähle eine wahre Geschichte um einen Wendepunkt: der Moment davor, der Moment selbst, und wer du danach warst. Lass den Zuhörer das Scharnier schwingen spüren.",
    },
    difficulty: 2,
    targetSec: [90, 140],
  },
  {
    id: "story-someone-elses-shoes",
    category: "storytelling",
    title: { en: "Someone else's shoes", de: "In fremden Schuhen" },
    prompt: {
      en: "Tell a story from your life — but from another participant's point of view. Your boss, your friend, the stranger at the counter. What did they see that day?",
      de: "Erzähle eine Geschichte aus deinem Leben — aber aus der Sicht eines anderen Beteiligten. Dein Chef, deine Freundin, der Fremde am Schalter. Was hat er an dem Tag gesehen?",
    },
    difficulty: 2,
    targetSec: [80, 130],
  },
  {
    id: "story-the-embarrassing-story",
    category: "storytelling",
    title: { en: "The embarrassing story", de: "Die peinliche Geschichte" },
    prompt: {
      en: "Tell a story where you look bad — and tell it with relish. Self-deprecation with a straight spine: no fishing for reassurance, no over-apologizing. Own the disaster.",
      de: "Erzähle eine Geschichte, in der du schlecht aussiehst — und erzähle sie mit Genuss. Selbstironie mit geradem Rücken: kein Betteln um Zuspruch, kein Über-Entschuldigen. Steh zum Desaster.",
    },
    difficulty: 2,
    targetSec: [80, 130],
  },
  {
    id: "story-dialogue",
    category: "storytelling",
    title: { en: "Dialogue", de: "Dialog" },
    prompt: {
      en: "Tell a story that contains at least three lines of spoken dialogue, performed — shift your voice slightly for each speaker. Quotation marks should be audible.",
      de: "Erzähle eine Geschichte mit mindestens drei Zeilen wörtlicher Rede, gespielt — verändere deine Stimme leicht pro Figur. Anführungszeichen müssen hörbar sein.",
    },
    difficulty: 2,
    targetSec: [80, 130],
  },
  {
    id: "story-the-family-legend",
    category: "storytelling",
    title: { en: "The family legend", de: "Die Familienlegende" },
    prompt: {
      en: "Retell a story your family tells — the one that comes out at every gathering. Honor it, shape it, and end with why it survived all these retellings.",
      de: "Erzähle eine Geschichte nach, die in deiner Familie erzählt wird — die bei jedem Fest auf den Tisch kommt. Ehre sie, forme sie und ende damit, warum sie all die Wiederholungen überlebt hat.",
    },
    difficulty: 2,
    targetSec: [90, 140],
  },
  {
    id: "story-suspense",
    category: "storytelling",
    title: { en: "Suspense", de: "Spannung" },
    prompt: {
      en: "Tell a story where you delay the reveal as long as you dare. Feed the listener questions, not answers, until the final two sentences.",
      de: "Erzähle eine Geschichte, in der du die Auflösung so lange hinauszögerst, wie du dich traust. Gib dem Zuhörer Fragen statt Antworten — bis zu den letzten zwei Sätzen.",
    },
    difficulty: 2,
    targetSec: [90, 150],
  },
  {
    id: "story-the-object-lesson",
    category: "storytelling",
    title: { en: "The object lesson", de: "Die Parabel" },
    prompt: {
      en: "Tell a personal story that carries a lesson — but never state the lesson. Trust the story to say it. If you're tempted to add 'and the moral is…', end earlier.",
      de: "Erzähle eine persönliche Geschichte mit einer Lehre — aber sprich die Lehre nie aus. Vertrau der Geschichte. Wenn du „und die Moral ist …“ sagen willst, hör früher auf.",
    },
    difficulty: 2,
    targetSec: [90, 140],
  },
  {
    id: "story-two-minutes-one-life",
    category: "storytelling",
    title: { en: "Two minutes, one life", de: "Zwei Minuten, ein Leben" },
    prompt: {
      en: "Tell the story of someone's whole life — a grandparent, a mentor, a historical figure you love — in two minutes. Choose three scenes that stand for everything else.",
      de: "Erzähle ein ganzes Leben — Großeltern, Mentor, eine historische Figur, die du liebst — in zwei Minuten. Wähle drei Szenen, die für alles andere stehen.",
    },
    difficulty: 2,
    targetSec: [100, 140],
  },
  {
    id: "story-origin-story",
    category: "storytelling",
    title: { en: "Your origin story", de: "Deine Ursprungsgeschichte" },
    prompt: {
      en: "Every leader has an origin story. Tell yours: the moment or period that made you who you are. Scene, turn, consequence — and one line you'd want quoted back.",
      de: "Jede Führungspersönlichkeit hat eine Ursprungsgeschichte. Erzähle deine: der Moment oder die Zeit, die dich geprägt hat. Szene, Wendung, Folge — und ein Satz, den man dich zitieren soll.",
    },
    difficulty: 2,
    targetSec: [100, 160],
  },
];
