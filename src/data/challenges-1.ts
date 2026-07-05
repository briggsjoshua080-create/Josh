import type { Challenge } from "@/lib/types";

/**
 * Days 1–33 of the core program.
 * Act I (1–11) Foundations · Act II (12–22) Structure · Act III (23–33) Story.
 */
export const CHALLENGES_1: Challenge[] = [
  {
    day: 1,
    title: { en: "Introduce yourself", de: "Stell dich vor" },
    prompt: {
      en: "Introduce yourself to a room of strangers — your name, what you do, and one thing you genuinely care about. No résumé recital: make them remember one thing.",
      de: "Stell dich einem Raum voller Fremder vor — dein Name, was du tust und eine Sache, die dir wirklich wichtig ist. Kein Lebenslauf-Vortrag: Sorg dafür, dass sie sich an eine Sache erinnern.",
    },
    focus: {
      en: "One clear thread. End on a full sentence, not a trail-off.",
      de: "Ein roter Faden. Ende mit einem ganzen Satz, nicht im Verlaufen.",
    },
    difficulty: 1,
    targetSec: [45, 90],
  },
  {
    day: 2,
    title: { en: "Your yesterday, out loud", de: "Dein gestriger Tag, laut" },
    prompt: {
      en: "Describe your day yesterday as if telling a friend — but give it a beginning, a turn, and an ending. Find the one moment worth telling.",
      de: "Beschreibe deinen gestrigen Tag, als würdest du einem Freund erzählen — aber gib ihm Anfang, Wendung und Ende. Finde den einen erzählenswerten Moment.",
    },
    focus: {
      en: "Structure over chronology. Skip the boring parts on purpose.",
      de: "Struktur statt Chronologie. Lass Langweiliges bewusst weg.",
    },
    difficulty: 1,
    targetSec: [60, 90],
  },
  {
    day: 3,
    title: { en: "Explain your craft", de: "Erklär dein Handwerk" },
    prompt: {
      en: "Explain what you do for work (or study) to a curious twelve-year-old. No jargon survives. Use one concrete comparison from everyday life.",
      de: "Erkläre einem neugierigen Zwölfjährigen, was du beruflich machst (oder studierst). Kein Fachwort überlebt. Nutze einen konkreten Vergleich aus dem Alltag.",
    },
    focus: {
      en: "Simplicity is a skill. One analogy carries the whole talk.",
      de: "Einfachheit ist Können. Eine Analogie trägt die ganze Rede.",
    },
    difficulty: 1,
    targetSec: [60, 100],
  },
  {
    day: 4,
    title: { en: "The room you know best", de: "Der Raum, den du am besten kennst" },
    prompt: {
      en: "Describe a room you know by heart so vividly that a listener could sketch it. Lead their eye deliberately: pick a path through the space, don't inventory it.",
      de: "Beschreibe einen Raum, den du auswendig kennst, so lebendig, dass ein Zuhörer ihn zeichnen könnte. Führe den Blick bewusst: Wähle einen Weg durch den Raum, statt ihn aufzuzählen.",
    },
    focus: {
      en: "Precision of nouns. 'A chipped blue mug' beats 'some stuff'.",
      de: "Präzise Substantive. „Eine angeschlagene blaue Tasse“ schlägt „ein paar Sachen“.",
    },
    difficulty: 1,
    targetSec: [60, 100],
  },
  {
    day: 5,
    title: { en: "Thirty seconds of gratitude", de: "Dreißig Sekunden Dankbarkeit" },
    prompt: {
      en: "Thank one specific person for one specific thing, as if they were standing in front of you. Name what they did, what it changed, and what you want them to know.",
      de: "Danke einer bestimmten Person für eine bestimmte Sache, als stünde sie vor dir. Benenne, was sie getan hat, was es verändert hat und was sie wissen soll.",
    },
    focus: {
      en: "Sincerity without rambling. Three beats, then stop.",
      de: "Aufrichtigkeit ohne Ausschweifen. Drei Schläge, dann Schluss.",
    },
    difficulty: 1,
    targetSec: [30, 60],
  },
  {
    day: 6,
    title: { en: "Teach a tiny skill", de: "Bring eine Mini-Fähigkeit bei" },
    prompt: {
      en: "Teach the listener something you can do that takes under a minute — folding a shirt, brewing better coffee, a keyboard shortcut. Steps in order, no backtracking.",
      de: "Bring dem Zuhörer etwas bei, das du kannst und das unter einer Minute dauert — ein Hemd falten, besseren Kaffee brühen, ein Tastenkürzel. Schritte in Reihenfolge, kein Zurückspringen.",
    },
    focus: {
      en: "Sequence discipline: first, then, finally — never 'oh wait, before that'.",
      de: "Reihenfolge-Disziplin: erstens, dann, zuletzt — nie „ach, vorher noch“.",
    },
    difficulty: 1,
    targetSec: [60, 90],
  },
  {
    day: 7,
    title: { en: "An object with a history", de: "Ein Gegenstand mit Geschichte" },
    prompt: {
      en: "Pick an object within arm's reach and tell its story: where it came from, what it has seen, why it's still here. Give a thing a voice without being cute.",
      de: "Wähle einen Gegenstand in Reichweite und erzähle seine Geschichte: woher er kommt, was er erlebt hat, warum er noch da ist. Gib einem Ding eine Stimme, ohne niedlich zu werden.",
    },
    focus: {
      en: "Warm-up for storytelling: even small things earn a beginning and an end.",
      de: "Aufwärmen fürs Erzählen: Auch kleine Dinge verdienen Anfang und Ende.",
    },
    difficulty: 1,
    targetSec: [60, 100],
  },
  {
    day: 8,
    title: { en: "Your opinion, in one minute", de: "Deine Meinung, in einer Minute" },
    prompt: {
      en: "State an opinion you actually hold — about food, cities, work, anything — and back it with two reasons and one example. Claim, reasons, example, restate. Done.",
      de: "Vertritt eine Meinung, die du wirklich hast — über Essen, Städte, Arbeit, egal — mit zwei Gründen und einem Beispiel. These, Gründe, Beispiel, Schlusssatz. Fertig.",
    },
    focus: {
      en: "Commit to the claim in the first sentence. No 'I kind of think maybe'.",
      de: "Steh zur These im ersten Satz. Kein „ich glaube irgendwie vielleicht“.",
    },
    difficulty: 2,
    targetSec: [50, 80],
  },
  {
    day: 9,
    title: { en: "Describe a person you admire", de: "Beschreibe einen Menschen, den du bewunderst" },
    prompt: {
      en: "Make a listener see someone you admire — not their achievements, their manner. How they enter a room, how they listen, one moment that shows who they are.",
      de: "Lass den Zuhörer einen Menschen sehen, den du bewunderst — nicht seine Erfolge, sein Wesen. Wie er einen Raum betritt, wie er zuhört, ein Moment, der zeigt, wer er ist.",
    },
    focus: {
      en: "Show, don't label. Replace every adjective you can with a scene.",
      de: "Zeigen statt Etikettieren. Ersetze jedes mögliche Adjektiv durch eine Szene.",
    },
    difficulty: 2,
    targetSec: [60, 110],
  },
  {
    day: 10,
    title: { en: "The weather report of your life", de: "Der Wetterbericht deines Lebens" },
    prompt: {
      en: "Deliver the current state of your life as a weather forecast — fronts moving in, clear skies ahead, scattered chaos. Sustain the metaphor for the full minute without breaking it.",
      de: "Präsentiere den aktuellen Stand deines Lebens als Wetterbericht — aufziehende Fronten, klare Aussichten, vereinzeltes Chaos. Halte die Metapher eine volle Minute durch, ohne sie zu brechen.",
    },
    focus: {
      en: "Metaphor stamina. One image, fully committed, is rhetoric's cheapest trick — and its best.",
      de: "Metaphern-Ausdauer. Ein Bild, voll durchgezogen, ist der günstigste Trick der Rhetorik — und der beste.",
    },
    difficulty: 2,
    targetSec: [60, 90],
  },
  {
    day: 11,
    title: { en: "Foundations, condensed", de: "Fundament, verdichtet" },
    prompt: {
      en: "Re-introduce yourself — but this time as the speaker you intend to become. Same facts as day one, sharper cut: what you do, why it matters, where you're headed.",
      de: "Stell dich noch einmal vor — diesmal als der Redner, der du werden willst. Dieselben Fakten wie an Tag eins, schärfer geschnitten: was du tust, warum es zählt, wohin du willst.",
    },
    focus: {
      en: "Act I finale. Compare with day 1 in your history — hear the difference.",
      de: "Finale von Akt I. Vergleich mit Tag 1 im Verlauf — hör den Unterschied.",
    },
    difficulty: 2,
    targetSec: [45, 90],
  },
  {
    day: 12,
    title: { en: "The cold open", de: "Der kalte Einstieg" },
    prompt: {
      en: "Open a talk about anything you know well — but the first sentence must be a hook: a question, a bold claim, or a scene. Banned: 'Today I want to talk about…'",
      de: "Eröffne einen Vortrag über etwas, das du gut kennst — aber der erste Satz muss ein Haken sein: eine Frage, eine steile These oder eine Szene. Verboten: „Heute möchte ich über … sprechen.“",
    },
    focus: {
      en: "The first ten seconds decide whether anyone leans in.",
      de: "Die ersten zehn Sekunden entscheiden, ob jemand sich vorbeugt.",
    },
    difficulty: 2,
    targetSec: [45, 80],
  },
  {
    day: 13,
    title: { en: "Three points, three fingers", de: "Drei Punkte, drei Finger" },
    prompt: {
      en: "Argue anything using the rule of three: 'There are three reasons…' — then deliver exactly three, clearly numbered, each one sentence longer than the last.",
      de: "Argumentiere beliebig mit der Dreierregel: „Dafür gibt es drei Gründe …“ — und liefere genau drei, klar nummeriert, jeder einen Satz länger als der vorige.",
    },
    focus: {
      en: "Numbered structure keeps the speaker honest and the listener oriented.",
      de: "Nummerierte Struktur hält den Redner ehrlich und den Zuhörer orientiert.",
    },
    difficulty: 2,
    targetSec: [60, 100],
  },
  {
    day: 14,
    title: { en: "The landing", de: "Die Landung" },
    prompt: {
      en: "Talk about a hobby or interest for a minute — the real test is the ending. Land on a sentence you could carve in stone. No 'yeah, so… that's it.'",
      de: "Sprich eine Minute über ein Hobby oder Interesse — der echte Test ist das Ende. Lande auf einem Satz, den man in Stein meißeln könnte. Kein „ja, also … das war's.“",
    },
    focus: {
      en: "Endings are remembered longest. Plan the last sentence first.",
      de: "Das Ende bleibt am längsten. Plane den letzten Satz zuerst.",
    },
    difficulty: 2,
    targetSec: [60, 90],
  },
  {
    day: 15,
    title: { en: "Signposting", de: "Wegweiser setzen" },
    prompt: {
      en: "Explain a process with at least four steps — a recipe, a routine, a workflow — using spoken signposts: 'First… Now here's where it gets tricky… Finally…' Guide, don't just list.",
      de: "Erkläre einen Prozess mit mindestens vier Schritten — ein Rezept, eine Routine, einen Ablauf — mit gesprochenen Wegweisern: „Zuerst … Jetzt wird es knifflig … Zum Schluss …“ Führe, statt nur aufzuzählen.",
    },
    focus: {
      en: "Transitions are the handrails of a talk.",
      de: "Übergänge sind das Geländer eines Vortrags.",
    },
    difficulty: 2,
    targetSec: [70, 110],
  },
  {
    day: 16,
    title: { en: "One minute, one message", de: "Eine Minute, eine Botschaft" },
    prompt: {
      en: "Pick a message that matters to you and make every sentence serve it. If a sentence doesn't feed the message, it doesn't get said. Sixty seconds of pure signal.",
      de: "Wähle eine Botschaft, die dir wichtig ist, und stelle jeden Satz in ihren Dienst. Wenn ein Satz die Botschaft nicht trägt, wird er nicht gesagt. Sechzig Sekunden reines Signal.",
    },
    focus: {
      en: "Ruthless relevance. Tangents are where attention goes to die.",
      de: "Gnadenlose Relevanz. In Abschweifungen stirbt die Aufmerksamkeit.",
    },
    difficulty: 2,
    targetSec: [50, 70],
  },
  {
    day: 17,
    title: { en: "The pause", de: "Die Pause" },
    prompt: {
      en: "Tell any story or make any argument — but place three deliberate silences of at least two seconds, right before your most important lines. Let the silence do the underlining.",
      de: "Erzähle irgendeine Geschichte oder führe ein Argument — aber setze drei bewusste Pausen von mindestens zwei Sekunden, direkt vor deine wichtigsten Sätze. Lass die Stille unterstreichen.",
    },
    focus: {
      en: "Silence is not absence — it's emphasis you don't have to shout.",
      de: "Stille ist kein Fehlen — sie ist Betonung, die du nicht schreien musst.",
    },
    difficulty: 2,
    targetSec: [60, 100],
  },
  {
    day: 18,
    title: { en: "Compare and choose", de: "Vergleichen und entscheiden" },
    prompt: {
      en: "Compare two options you know well — two cities, two tools, two ways of living — then commit to a verdict. Structure: criteria first, then the comparison, then the call.",
      de: "Vergleiche zwei Optionen, die du gut kennst — zwei Städte, zwei Werkzeuge, zwei Lebensweisen — und fälle dann ein Urteil. Struktur: erst Kriterien, dann Vergleich, dann Entscheidung.",
    },
    focus: {
      en: "A comparison without a verdict is a shrug with extra steps.",
      de: "Ein Vergleich ohne Urteil ist ein Achselzucken mit Umwegen.",
    },
    difficulty: 2,
    targetSec: [70, 110],
  },
  {
    day: 19,
    title: { en: "Explain the invisible", de: "Erklär das Unsichtbare" },
    prompt: {
      en: "Explain something invisible — inflation, an algorithm, trust, Wi-Fi — using only things a listener can picture. Every abstraction must be traded for an image.",
      de: "Erkläre etwas Unsichtbares — Inflation, einen Algorithmus, Vertrauen, WLAN — nur mit Dingen, die ein Zuhörer sich vorstellen kann. Jede Abstraktion wird gegen ein Bild getauscht.",
    },
    focus: {
      en: "Concreteness is a courtesy. Abstract speech makes the listener do your work.",
      de: "Konkretheit ist Höflichkeit. Abstraktes Reden lädt deine Arbeit beim Zuhörer ab.",
    },
    difficulty: 3,
    targetSec: [70, 110],
  },
  {
    day: 20,
    title: { en: "The 90-second briefing", de: "Das 90-Sekunden-Briefing" },
    prompt: {
      en: "Brief a busy executive on a topic you follow — news, a market, a fandom, a sport. Bottom line first, then the three things worth knowing, then what to watch next.",
      de: "Briefe eine vielbeschäftigte Führungskraft zu einem Thema, das du verfolgst — Nachrichten, ein Markt, eine Szene, ein Sport. Fazit zuerst, dann die drei wichtigsten Punkte, dann der Ausblick.",
    },
    focus: {
      en: "BLUF: bottom line up front. Respect for time reads as competence.",
      de: "Das Wichtigste zuerst. Respekt vor Zeit wirkt wie Kompetenz.",
    },
    difficulty: 3,
    targetSec: [75, 100],
  },
  {
    day: 21,
    title: { en: "Callbacks", de: "Rückgriffe" },
    prompt: {
      en: "Give a short talk that plants an image in the first sentence and returns to it — changed — in the last. Open with the seed, close with the harvest.",
      de: "Halte einen kurzen Vortrag, der im ersten Satz ein Bild pflanzt und im letzten — verwandelt — dorthin zurückkehrt. Beginne mit der Saat, ende mit der Ernte.",
    },
    focus: {
      en: "A callback makes a talk feel designed instead of assembled.",
      de: "Ein Rückgriff lässt eine Rede entworfen wirken statt zusammengesetzt.",
    },
    difficulty: 3,
    targetSec: [70, 110],
  },
  {
    day: 22,
    title: { en: "Structure under pressure", de: "Struktur unter Druck" },
    prompt: {
      en: "Act II finale: pick any object you can see and give a structured mini-talk about it right now — hook, three points, landing. No preparation beyond reading this prompt.",
      de: "Finale von Akt II: Wähle ein sichtbares Objekt und halte sofort einen strukturierten Mini-Vortrag darüber — Haken, drei Punkte, Landung. Keine Vorbereitung über das Lesen hinaus.",
    },
    focus: {
      en: "Structure must survive spontaneity. That's when it becomes yours.",
      de: "Struktur muss Spontaneität überleben. Dann erst gehört sie dir.",
    },
    difficulty: 3,
    targetSec: [60, 100],
  },
  {
    day: 23,
    title: { en: "The first time", de: "Das erste Mal" },
    prompt: {
      en: "Tell the story of a first time — first job, first flight, first failure. Start inside the moment, not with background. 'The door was already open when…' beats 'So, a few years ago…'",
      de: "Erzähle die Geschichte eines ersten Mals — erster Job, erster Flug, erster Fehlschlag. Beginn mitten im Moment, nicht mit Vorgeschichte. „Die Tür stand schon offen, als …“ schlägt „Also, vor ein paar Jahren …“.",
    },
    focus: {
      en: "In medias res. Backstory is debt; scenes are cash.",
      de: "Mitten hinein. Vorgeschichte ist Schulden; Szenen sind Bargeld.",
    },
    difficulty: 3,
    targetSec: [80, 130],
  },
  {
    day: 24,
    title: { en: "Five senses", de: "Fünf Sinne" },
    prompt: {
      en: "Take the listener to a place from your memory using all five senses — the sound before the sight, the smell before the explanation. No opinions, only perception.",
      de: "Nimm den Zuhörer mit an einen Ort deiner Erinnerung — mit allen fünf Sinnen. Das Geräusch vor dem Bild, der Geruch vor der Erklärung. Keine Meinungen, nur Wahrnehmung.",
    },
    focus: {
      en: "Sensory detail is the fastest road into a listener's memory.",
      de: "Sinnesdetails sind der schnellste Weg ins Gedächtnis des Zuhörers.",
    },
    difficulty: 3,
    targetSec: [70, 110],
  },
  {
    day: 25,
    title: { en: "The turning point", de: "Der Wendepunkt" },
    prompt: {
      en: "Tell a true story built around one turning point: the moment before, the moment itself, and who you were after. Make the listener feel the hinge swing.",
      de: "Erzähle eine wahre Geschichte um einen Wendepunkt: der Moment davor, der Moment selbst, und wer du danach warst. Lass den Zuhörer das Scharnier schwingen spüren.",
    },
    focus: {
      en: "Stories are about change. No change, no story — just events.",
      de: "Geschichten handeln von Veränderung. Ohne Veränderung keine Geschichte — nur Ereignisse.",
    },
    difficulty: 3,
    targetSec: [90, 140],
  },
  {
    day: 26,
    title: { en: "Someone else's shoes", de: "In fremden Schuhen" },
    prompt: {
      en: "Tell a story from your life — but from another participant's point of view. Your boss, your friend, the stranger at the counter. What did they see that day?",
      de: "Erzähle eine Geschichte aus deinem Leben — aber aus der Sicht eines anderen Beteiligten. Dein Chef, deine Freundin, der Fremde am Schalter. Was hat er an dem Tag gesehen?",
    },
    focus: {
      en: "Perspective-taking is empathy practice disguised as a narrative trick.",
      de: "Perspektivwechsel ist Empathie-Training im Kostüm eines Erzähltricks.",
    },
    difficulty: 3,
    targetSec: [80, 130],
  },
  {
    day: 27,
    title: { en: "The embarrassing story", de: "Die peinliche Geschichte" },
    prompt: {
      en: "Tell a story where you look bad — and tell it with relish. Self-deprecation with a straight spine: no fishing for reassurance, no over-apologizing. Own the disaster.",
      de: "Erzähle eine Geschichte, in der du schlecht aussiehst — und erzähle sie mit Genuss. Selbstironie mit geradem Rücken: kein Betteln um Zuspruch, kein Über-Entschuldigen. Steh zum Desaster.",
    },
    focus: {
      en: "Speakers who can laugh at themselves are impossible to humiliate.",
      de: "Redner, die über sich lachen können, kann niemand bloßstellen.",
    },
    difficulty: 3,
    targetSec: [80, 130],
  },
  {
    day: 28,
    title: { en: "Dialogue", de: "Dialog" },
    prompt: {
      en: "Tell a story that contains at least three lines of spoken dialogue, performed — shift your voice slightly for each speaker. Quotation marks should be audible.",
      de: "Erzähle eine Geschichte mit mindestens drei Zeilen wörtlicher Rede, gespielt — verändere deine Stimme leicht pro Figur. Anführungszeichen müssen hörbar sein.",
    },
    focus: {
      en: "Reported speech tells; performed speech shows.",
      de: "Indirekte Rede berichtet; gespielte Rede zeigt.",
    },
    difficulty: 3,
    targetSec: [80, 130],
  },
  {
    day: 29,
    title: { en: "The family legend", de: "Die Familienlegende" },
    prompt: {
      en: "Retell a story your family tells — the one that comes out at every gathering. Honor it, shape it, and end with why it survived all these retellings.",
      de: "Erzähle eine Geschichte nach, die in deiner Familie erzählt wird — die bei jedem Fest auf den Tisch kommt. Ehre sie, forme sie und ende damit, warum sie all die Wiederholungen überlebt hat.",
    },
    focus: {
      en: "Inherited stories teach structure: they've been edited by generations.",
      de: "Vererbte Geschichten lehren Struktur: Generationen haben sie redigiert.",
    },
    difficulty: 3,
    targetSec: [90, 140],
  },
  {
    day: 30,
    title: { en: "Suspense", de: "Spannung" },
    prompt: {
      en: "Tell a story where you delay the reveal as long as you dare. Feed the listener questions, not answers, until the final two sentences.",
      de: "Erzähle eine Geschichte, in der du die Auflösung so lange hinauszögerst, wie du dich traust. Gib dem Zuhörer Fragen statt Antworten — bis zu den letzten zwei Sätzen.",
    },
    focus: {
      en: "Tension is a promise with the payment deferred.",
      de: "Spannung ist ein Versprechen mit aufgeschobener Zahlung.",
    },
    difficulty: 4,
    targetSec: [90, 150],
  },
  {
    day: 31,
    title: { en: "The object lesson", de: "Die Parabel" },
    prompt: {
      en: "Tell a personal story that carries a lesson — but never state the lesson. Trust the story to say it. If you're tempted to add 'and the moral is…', end earlier.",
      de: "Erzähle eine persönliche Geschichte mit einer Lehre — aber sprich die Lehre nie aus. Vertrau der Geschichte. Wenn du „und die Moral ist …“ sagen willst, hör früher auf.",
    },
    focus: {
      en: "Implication respects the listener. Explanation flatters the speaker.",
      de: "Andeutung respektiert den Zuhörer. Erklärung schmeichelt dem Redner.",
    },
    difficulty: 4,
    targetSec: [90, 140],
  },
  {
    day: 32,
    title: { en: "Two minutes, one life", de: "Zwei Minuten, ein Leben" },
    prompt: {
      en: "Tell the story of someone's whole life — a grandparent, a mentor, a historical figure you love — in two minutes. Choose three scenes that stand for everything else.",
      de: "Erzähle ein ganzes Leben — Großeltern, Mentor, eine historische Figur, die du liebst — in zwei Minuten. Wähle drei Szenen, die für alles andere stehen.",
    },
    focus: {
      en: "Compression is the storyteller's real craft: what to leave out.",
      de: "Verdichtung ist das eigentliche Handwerk: das Weglassen.",
    },
    difficulty: 4,
    targetSec: [100, 140],
  },
  {
    day: 33,
    title: { en: "Act III finale: your origin story", de: "Finale Akt III: deine Ursprungsgeschichte" },
    prompt: {
      en: "Every leader has an origin story. Tell yours: the moment or period that made you who you are. Scene, turn, consequence — and one line you'd want quoted back.",
      de: "Jede Führungspersönlichkeit hat eine Ursprungsgeschichte. Erzähle deine: der Moment oder die Zeit, die dich geprägt hat. Szene, Wendung, Folge — und ein Satz, den man dich zitieren soll.",
    },
    focus: {
      en: "This story becomes a tool. You will tell it in interviews and keynotes for years.",
      de: "Diese Geschichte wird ein Werkzeug. Du wirst sie jahrelang in Interviews und Keynotes erzählen.",
    },
    difficulty: 4,
    targetSec: [100, 160],
  },
];
