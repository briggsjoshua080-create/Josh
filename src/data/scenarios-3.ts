import type { Scenario } from "@/lib/types";

/**
 * Impromptu prompts, part 1 of 2 (everyday openers through explaining a concept).
 * Every title in this file and in scenarios-4.ts carries "Impromptu" / "Stegreif"
 * so one search in the library pulls the whole impromptu set out of the deck.
 */
export const SCENARIOS_3: Scenario[] = [
  // ——— Everyday openers & opinions ———
  {
    id: "imp-best-meal",
    category: "smalltalk",
    title: {
      en: "Impromptu — What's the best meal you've ever had?",
      de: "Stegreif — Was war das beste Essen deines Lebens?",
    },
    prompt: {
      en: "No prep, no notes. Put us at the table: where you were, who was with you, and what makes it the meal you still talk about.",
      de: "Keine Vorbereitung, keine Notizen. Setz uns mit an den Tisch: wo du warst, wer dabei war und warum du heute noch davon erzählst.",
    },
    difficulty: 1,
    targetSec: [45, 90],
  },
  {
    id: "imp-skill-everyone",
    category: "smalltalk",
    title: {
      en: "Impromptu — What's a skill everyone should learn?",
      de: "Stegreif — Welche Fähigkeit sollte jeder lernen?",
    },
    prompt: {
      en: "Pick one skill and make the case for it in a minute. Say what it is, who it helps, and what changes once someone has it.",
      de: "Wähl eine Fähigkeit und begründe sie in einer Minute. Sag, was sie ist, wem sie hilft und was sich ändert, sobald man sie hat.",
    },
    difficulty: 1,
    targetSec: [45, 90],
  },
  {
    id: "imp-perfect-saturday",
    category: "smalltalk",
    title: {
      en: "Impromptu — Describe your perfect Saturday",
      de: "Stegreif — Beschreib deinen perfekten Samstag",
    },
    prompt: {
      en: "Walk us through it hour by hour. Keep it concrete — the sounds, the food, the people — so we can picture the day, not just hear about it.",
      de: "Nimm uns Stunde für Stunde mit. Bleib konkret — Geräusche, Essen, Menschen — damit wir den Tag sehen und nicht nur davon hören.",
    },
    difficulty: 1,
    targetSec: [45, 90],
  },
  {
    id: "imp-useless-invention",
    category: "smalltalk",
    title: {
      en: "Impromptu — What's the most useless invention?",
      de: "Stegreif — Was ist die nutzloseste Erfindung?",
    },
    prompt: {
      en: "Name it, then prosecute it. One clear target beats a list — pick the worst offender and take it apart with a straight face.",
      de: "Nenn sie und klag sie an. Ein klares Ziel schlägt eine Liste — nimm den schlimmsten Fall und zerleg ihn mit ernster Miene.",
    },
    difficulty: 1,
    targetSec: [45, 90],
  },
  {
    id: "imp-overrated",
    category: "smalltalk",
    title: {
      en: "Impromptu — What's overrated in modern life?",
      de: "Stegreif — Was wird im modernen Leben überschätzt?",
    },
    prompt: {
      en: "Say what everyone praises and why you think the praise is misplaced. Land on one thing and defend it — don't hedge across five.",
      de: "Sag, was alle loben, und warum du das Lob für verfehlt hältst. Entscheide dich für eine Sache und verteidige sie — kein Rundumschlag.",
    },
    difficulty: 1,
    targetSec: [45, 90],
  },
  {
    id: "imp-underrated",
    category: "smalltalk",
    title: {
      en: "Impromptu — What's underrated in modern life?",
      de: "Stegreif — Was wird im modernen Leben unterschätzt?",
    },
    prompt: {
      en: "Something ordinary that deserves more credit than it gets. Make us notice it the way you do.",
      de: "Etwas Alltägliches, das mehr Anerkennung verdient, als es bekommt. Lass es uns so sehen, wie du es siehst.",
    },
    difficulty: 1,
    targetSec: [45, 90],
  },
  {
    id: "imp-rudest-animal",
    category: "smalltalk",
    title: {
      en: "Impromptu — If animals could talk, which would be the rudest?",
      de: "Stegreif — Wenn Tiere sprechen könnten, welches wäre am unhöflichsten?",
    },
    prompt: {
      en: "Commit to one animal and give us the evidence. Quote it if you like — the funnier the specifics, the better this works.",
      de: "Leg dich auf ein Tier fest und liefer die Belege. Zitier es ruhig — je konkreter, desto besser funktioniert das.",
    },
    difficulty: 1,
    targetSec: [45, 90],
  },
  {
    id: "imp-one-food-forever",
    category: "smalltalk",
    title: {
      en: "Impromptu — If you could only eat one food forever, what would it be?",
      de: "Stegreif — Wenn du für immer nur ein Gericht essen dürftest, welches wäre es?",
    },
    prompt: {
      en: "One dish, no negotiating. Tell us the pick and then the reasoning that would survive a week two of eating it.",
      de: "Ein Gericht, kein Verhandeln. Nenn deine Wahl und die Begründung, die auch die zweite Woche übersteht.",
    },
    difficulty: 1,
    targetSec: [45, 90],
  },
  {
    id: "imp-master-one-skill",
    category: "smalltalk",
    title: {
      en: "Impromptu — If you could instantly master one skill, what would it be?",
      de: "Stegreif — Welche Fähigkeit würdest du sofort perfekt beherrschen wollen?",
    },
    prompt: {
      en: "Name the skill, then the first thing you'd do with it on day one. The second half is where the speech gets interesting.",
      de: "Nenn die Fähigkeit und dann das Erste, was du damit an Tag eins tun würdest. Die zweite Hälfte macht die Rede spannend.",
    },
    difficulty: 1,
    targetSec: [45, 90],
  },
  {
    id: "imp-worst-superpower",
    category: "smalltalk",
    title: {
      en: "Impromptu — Describe the worst superpower imaginable",
      de: "Stegreif — Beschreib die schlechteste Superkraft, die es geben könnte",
    },
    prompt: {
      en: "Invent it, name it, then live one day with it out loud so we feel exactly how useless it is.",
      de: "Erfinde sie, benenne sie und lebe laut einen Tag damit, damit wir spüren, wie nutzlos sie wirklich ist.",
    },
    difficulty: 1,
    targetSec: [45, 90],
  },
  {
    id: "imp-build-trust-fast",
    category: "smalltalk",
    title: {
      en: "Impromptu — How do you build trust with people quickly?",
      de: "Stegreif — Wie baust du schnell Vertrauen zu Menschen auf?",
    },
    prompt: {
      en: "Not theory — what you actually do in the first five minutes with a stranger. Give us the moves, then why they work.",
      de: "Keine Theorie — was du in den ersten fünf Minuten mit Fremden wirklich tust. Nenn die Schritte und dann, warum sie wirken.",
    },
    difficulty: 2,
    targetSec: [60, 120],
  },

  // ——— Opinion & debate openers ———
  {
    id: "imp-school-start-later",
    category: "debate",
    title: {
      en: "Impromptu — Should school days start later?",
      de: "Stegreif — Sollte die Schule später beginnen?",
    },
    prompt: {
      en: "Pick a side in your first sentence. Two reasons, one concession to the other side, then close on the reason that matters most.",
      de: "Beziehe im ersten Satz Position. Zwei Gründe, ein Zugeständnis an die Gegenseite, dann der Schluss mit dem stärksten Grund.",
    },
    difficulty: 2,
    targetSec: [60, 120],
  },
  {
    id: "imp-social-media-harm",
    category: "debate",
    title: {
      en: "Impromptu — Is social media doing more harm than good?",
      de: "Stegreif — Richten soziale Medien mehr Schaden als Nutzen an?",
    },
    prompt: {
      en: "Answer the question directly, then defend it. Resist the easy middle — decide, and make us understand why.",
      de: "Beantworte die Frage direkt und verteidige die Antwort. Vermeide die bequeme Mitte — entscheide dich und begründe es.",
    },
    difficulty: 2,
    targetSec: [60, 120],
  },
  {
    id: "imp-leader-or-follower",
    category: "debate",
    title: {
      en: "Impromptu — Is it better to be a leader or a follower?",
      de: "Stegreif — Ist es besser zu führen oder zu folgen?",
    },
    prompt: {
      en: "Take the less obvious side if you can — the case for following well is harder to make and far more interesting to hear.",
      de: "Nimm wenn möglich die unerwartete Seite — gut zu folgen zu verteidigen ist schwerer und deutlich spannender.",
    },
    difficulty: 2,
    targetSec: [60, 120],
  },
  {
    id: "imp-abolish-homework",
    category: "debate",
    title: {
      en: "Impromptu — Should homework be abolished?",
      de: "Stegreif — Sollten Hausaufgaben abgeschafft werden?",
    },
    prompt: {
      en: "State your position, give the strongest argument against it, then dismantle it. Finish before you run out of conviction.",
      de: "Nenn deine Position, dann das stärkste Gegenargument — und widerlege es. Hör auf, bevor dir die Überzeugung ausgeht.",
    },
    difficulty: 2,
    targetSec: [60, 120],
  },
  {
    id: "imp-first-law",
    category: "debate",
    title: {
      en: "Impromptu — If you ruled a small country, what's the first law you'd pass?",
      de: "Stegreif — Wenn du ein kleines Land regiertest, welches Gesetz käme zuerst?",
    },
    prompt: {
      en: "One law, announced like a head of state. Say what it changes on day one and who will complain loudest.",
      de: "Ein Gesetz, verkündet wie ein Staatsoberhaupt. Sag, was sich an Tag eins ändert und wer am lautesten protestiert.",
    },
    difficulty: 2,
    targetSec: [60, 120],
  },
  {
    id: "imp-cats-or-dogs",
    category: "debate",
    title: {
      en: "Impromptu — Convince us that cats are better than dogs (or the reverse)",
      de: "Stegreif — Überzeug uns, dass Katzen besser sind als Hunde (oder umgekehrt)",
    },
    prompt: {
      en: "A silly topic argued seriously is the best filler-word drill there is. Pick a side and build a real argument.",
      de: "Ein albernes Thema ernsthaft zu vertreten ist die beste Übung gegen Füllwörter. Wähl eine Seite und argumentiere echt.",
    },
    difficulty: 1,
    targetSec: [60, 120],
  },
  {
    id: "imp-four-day-week",
    category: "debate",
    title: {
      en: "Impromptu — Argue for or against a four-day work week",
      de: "Stegreif — Argumentiere für oder gegen die Vier-Tage-Woche",
    },
    prompt: {
      en: "Choose in the first breath. Anchor at least one argument in something measurable, not just how it would feel.",
      de: "Entscheide dich im ersten Atemzug. Verankere mindestens ein Argument in etwas Messbarem, nicht nur im Gefühl.",
    },
    difficulty: 2,
    targetSec: [60, 120],
  },
  {
    id: "imp-ref-technology",
    category: "debate",
    title: {
      en: "Impromptu — Should football referees use more technology?",
      de: "Stegreif — Sollten Schiedsrichter mehr Technik einsetzen?",
    },
    prompt: {
      en: "You're on the panel and the question is yours. Speak from what the game actually loses or gains, not from the last decision that annoyed you.",
      de: "Du sitzt im Panel, die Frage geht an dich. Sprich davon, was das Spiel gewinnt oder verliert — nicht von der letzten Fehlentscheidung.",
    },
    difficulty: 2,
    targetSec: [60, 120],
  },
  {
    id: "imp-free-university",
    category: "debate",
    title: {
      en: "Impromptu — Should university be free?",
      de: "Stegreif — Sollte ein Studium kostenlos sein?",
    },
    prompt: {
      en: "Position first, then who pays and what it buys. Name the cost of your own position before someone else does.",
      de: "Erst die Position, dann wer zahlt und was das bringt. Benenne den Preis deiner Position, bevor es jemand anderes tut.",
    },
    difficulty: 3,
    targetSec: [60, 120],
  },
  {
    id: "imp-remote-learning",
    category: "debate",
    title: {
      en: "Impromptu — Argue for or against remote learning",
      de: "Stegreif — Argumentiere für oder gegen Fernunterricht",
    },
    prompt: {
      en: "Speak for the students who benefit most from your side, then admit who your side leaves behind.",
      de: "Sprich für die Lernenden, denen deine Seite am meisten nützt — und gib zu, wen sie zurücklässt.",
    },
    difficulty: 2,
    targetSec: [60, 120],
  },
  {
    id: "imp-athlete-pay",
    category: "debate",
    title: {
      en: "Impromptu — Should professional athletes be paid so much?",
      de: "Stegreif — Sollten Profisportler so viel verdienen?",
    },
    prompt: {
      en: "Decide, then hold the line under pressure. The weakest version of this speech is the one that agrees with everybody.",
      de: "Entscheide dich und halte die Linie. Die schwächste Version dieser Rede gibt allen recht.",
    },
    difficulty: 2,
    targetSec: [60, 120],
  },
  {
    id: "imp-mandatory-voting",
    category: "debate",
    title: {
      en: "Impromptu — Should voting be mandatory?",
      de: "Stegreif — Sollte Wählen Pflicht sein?",
    },
    prompt: {
      en: "Open with your verdict. Argue from what it does to a democracy, not from what it does to your Sunday.",
      de: "Beginne mit deinem Urteil. Argumentiere damit, was es mit einer Demokratie macht — nicht mit deinem Sonntag.",
    },
    difficulty: 3,
    targetSec: [60, 120],
  },
  {
    id: "imp-space-funding",
    category: "debate",
    title: {
      en: "Impromptu — Argue for or against funding space exploration",
      de: "Stegreif — Argumentiere für oder gegen die Finanzierung der Raumfahrt",
    },
    prompt: {
      en: "The money is real and so are the alternatives. Say where you'd put it and be honest about what you're giving up.",
      de: "Das Geld ist real, die Alternativen auch. Sag, wohin du es gibst, und sei ehrlich darüber, was dafür wegfällt.",
    },
    difficulty: 3,
    targetSec: [60, 120],
  },
  {
    id: "imp-schools-life-skills",
    category: "debate",
    title: {
      en: "Impromptu — What role should schools play in teaching life skills?",
      de: "Stegreif — Welche Rolle sollten Schulen beim Vermitteln von Alltagskompetenzen spielen?",
    },
    prompt: {
      en: "Draw the line: what belongs in a classroom, what belongs at home, and who decides. Name one skill schools get wrong today.",
      de: "Zieh die Grenze: Was gehört in den Unterricht, was nach Hause, und wer entscheidet? Nenn eine Kompetenz, die Schulen heute verfehlen.",
    },
    difficulty: 2,
    targetSec: [60, 120],
  },
  {
    id: "imp-tradition-vs-change",
    category: "debate",
    title: {
      en: "Impromptu — What's the value of tradition versus change?",
      de: "Stegreif — Was ist der Wert von Tradition gegenüber Wandel?",
    },
    prompt: {
      en: "Don't split the difference. Say which one you'd defend under pressure, and what test tells you when a tradition has outlived itself.",
      de: "Kein fauler Kompromiss. Sag, was du unter Druck verteidigen würdest — und woran du merkst, dass eine Tradition sich überlebt hat.",
    },
    difficulty: 3,
    targetSec: [60, 120],
  },

  // ——— Hypotheticals ———
  {
    id: "imp-dinner-with-anyone",
    category: "storytelling",
    title: {
      en: "Impromptu — If you could have dinner with anyone, living or dead, who would it be?",
      de: "Stegreif — Mit wem würdest du zu Abend essen, lebend oder tot?",
    },
    prompt: {
      en: "One guest, one table. Tell us who, then the first question you'd ask before the starters arrive.",
      de: "Ein Gast, ein Tisch. Sag uns wer — und die erste Frage, die du stellst, bevor die Vorspeise kommt.",
    },
    difficulty: 1,
    targetSec: [45, 90],
  },
  {
    id: "imp-different-age",
    category: "storytelling",
    title: {
      en: "Impromptu — If you woke up as a different age tomorrow, what would you do?",
      de: "Stegreif — Wenn du morgen in einem anderen Alter aufwachst, was würdest du tun?",
    },
    prompt: {
      en: "Pick the age out loud, then walk us through the morning. The choice is the story — tell us why that number.",
      de: "Nenn das Alter laut und nimm uns mit durch den Morgen. Die Wahl ist die Geschichte — sag uns, warum diese Zahl.",
    },
    difficulty: 1,
    targetSec: [45, 90],
  },
  {
    id: "imp-time-machine",
    category: "storytelling",
    title: {
      en: "Impromptu — If you had a time machine, where would you go first?",
      de: "Stegreif — Wenn du eine Zeitmaschine hättest, wohin zuerst?",
    },
    prompt: {
      en: "One destination, and you're only there an hour. Where do you stand, what do you watch, and what do you bring back?",
      de: "Ein Ziel, und du hast nur eine Stunde. Wo stehst du, was siehst du dir an, und was bringst du mit zurück?",
    },
    difficulty: 1,
    targetSec: [45, 90],
  },
  {
    id: "imp-invisible-day",
    category: "storytelling",
    title: {
      en: "Impromptu — If you were invisible for a day, what would you do?",
      de: "Stegreif — Wärst du einen Tag unsichtbar, was würdest du tun?",
    },
    prompt: {
      en: "Give us the day in order, and be honest about the first thing you'd actually try — that's the part people remember.",
      de: "Erzähl den Tag der Reihe nach und sei ehrlich beim ersten Einfall — genau den behalten die Leute im Kopf.",
    },
    difficulty: 1,
    targetSec: [45, 90],
  },
  {
    id: "imp-life-as-movie",
    category: "storytelling",
    title: {
      en: "Impromptu — If your life were a movie, what genre would it be?",
      de: "Stegreif — Wäre dein Leben ein Film, welches Genre wäre es?",
    },
    prompt: {
      en: "Name the genre, then prove it with three scenes from the last year. Cast it if you're feeling brave.",
      de: "Nenn das Genre und beweis es mit drei Szenen aus dem letzten Jahr. Und wenn du mutig bist: besetze die Rollen.",
    },
    difficulty: 1,
    targetSec: [45, 90],
  },
  {
    id: "imp-swap-lives",
    category: "storytelling",
    title: {
      en: "Impromptu — If you could swap lives with someone for a week, who?",
      de: "Stegreif — Mit wem würdest du für eine Woche das Leben tauschen?",
    },
    prompt: {
      en: "One person, one week. Tell us what you want to understand that you can't from the outside.",
      de: "Eine Person, eine Woche. Sag uns, was du verstehen willst und von außen nicht verstehen kannst.",
    },
    difficulty: 1,
    targetSec: [45, 90],
  },
  {
    id: "imp-life-as-video-game",
    category: "storytelling",
    title: {
      en: "Impromptu — Describe your life as if it were a video game",
      de: "Stegreif — Beschreib dein Leben, als wäre es ein Videospiel",
    },
    prompt: {
      en: "Give us the genre, the current level, your stats and the boss you're stuck on. Commit to the bit all the way through.",
      de: "Nenn Genre, aktuelles Level, deine Werte und den Boss, an dem du hängst. Zieh die Nummer bis zum Schluss durch.",
    },
    difficulty: 1,
    targetSec: [45, 90],
  },
  {
    id: "imp-alien-report",
    category: "storytelling",
    title: {
      en: "Impromptu — Describe what aliens would think of Earth after one day",
      de: "Stegreif — Was würden Außerirdische nach einem Tag über die Erde denken?",
    },
    prompt: {
      en: "Deliver it as their report home. The comedy is in what they misunderstand about something completely ordinary.",
      de: "Trag es als ihren Bericht nach Hause vor. Der Witz liegt darin, was sie an etwas völlig Alltäglichem missverstehen.",
    },
    difficulty: 1,
    targetSec: [45, 90],
  },
  {
    id: "imp-alien-weather",
    category: "storytelling",
    title: {
      en: "Impromptu — Give a weather report for an imaginary planet",
      de: "Stegreif — Gib eine Wettervorhersage für einen erfundenen Planeten",
    },
    prompt: {
      en: "Full broadcast voice, straight face. Invent the conditions, warn the viewers, and hand back to the studio.",
      de: "Volle Moderatorenstimme, ernstes Gesicht. Erfinde die Lage, warne die Zuschauer und gib zurück ins Studio.",
    },
    difficulty: 1,
    targetSec: [45, 90],
  },

  // ——— Telling a story ———
  {
    id: "imp-completely-wrong",
    category: "storytelling",
    title: {
      en: "Impromptu — Tell us about a time you were completely wrong about something",
      de: "Stegreif — Erzähl von einem Moment, in dem du völlig falsch lagst",
    },
    prompt: {
      en: "Set up what you believed, show the moment it broke, and say what you carried out of it. Don't soften the middle.",
      de: "Zeig, was du geglaubt hast, den Moment, in dem es kippte, und was du daraus mitgenommen hast. Beschönige die Mitte nicht.",
    },
    difficulty: 2,
    targetSec: [60, 120],
  },
  {
    id: "imp-embarrassing-moment",
    category: "storytelling",
    title: {
      en: "Impromptu — Describe your most embarrassing moment",
      de: "Stegreif — Beschreib deinen peinlichsten Moment",
    },
    prompt: {
      en: "Slow down at the worst part instead of rushing past it. The pause before the punchline does more work than the words.",
      de: "Werde an der schlimmsten Stelle langsamer, statt darüber hinwegzuhetzen. Die Pause vor der Pointe wirkt stärker als jedes Wort.",
    },
    difficulty: 2,
    targetSec: [60, 120],
  },
  {
    id: "imp-risk-paid-off",
    category: "storytelling",
    title: {
      en: "Impromptu — Tell us about a risk that paid off",
      de: "Stegreif — Erzähl von einem Risiko, das sich ausgezahlt hat",
    },
    prompt: {
      en: "Make us feel what was at stake before you tell us it worked. Without the fear, the payoff is just a fact.",
      de: "Lass uns spüren, was auf dem Spiel stand, bevor du sagst, dass es geklappt hat. Ohne die Angst ist der Erfolg nur eine Zahl.",
    },
    difficulty: 2,
    targetSec: [60, 120],
  },
  {
    id: "imp-truly-proud",
    category: "storytelling",
    title: {
      en: "Impromptu — Describe a moment you felt truly proud",
      de: "Stegreif — Beschreib einen Moment, in dem du wirklich stolz warst",
    },
    prompt: {
      en: "One moment, not a summary of a good year. Take us to the second it landed and tell us what you noticed.",
      de: "Ein Moment, keine Jahresbilanz. Nimm uns mit in die Sekunde, in der es ankam, und sag, was dir auffiel.",
    },
    difficulty: 2,
    targetSec: [60, 120],
  },
  {
    id: "imp-think-on-feet",
    category: "storytelling",
    title: {
      en: "Impromptu — Tell us about a time you had to think on your feet",
      de: "Stegreif — Erzähl von einem Moment, in dem du blitzschnell reagieren musstest",
    },
    prompt: {
      en: "Put us in the room with the clock running. What did you decide, how fast, and what would you do differently now?",
      de: "Setz uns in den Raum, während die Uhr läuft. Was hast du entschieden, wie schnell — und was würdest du heute anders machen?",
    },
    difficulty: 2,
    targetSec: [60, 120],
  },
  {
    id: "imp-hard-way",
    category: "storytelling",
    title: {
      en: "Impromptu — Describe a lesson you learned the hard way",
      de: "Stegreif — Beschreib eine Lektion, die du auf die harte Tour gelernt hast",
    },
    prompt: {
      en: "The lesson only lands if we felt the cost first. Tell the cost, then the lesson — never the other way round.",
      de: "Die Lektion wirkt nur, wenn wir vorher den Preis gespürt haben. Erst der Preis, dann die Lektion — nie umgekehrt.",
    },
    difficulty: 2,
    targetSec: [60, 120],
  },
  {
    id: "imp-changed-my-view",
    category: "storytelling",
    title: {
      en: "Impromptu — Tell us about someone who changed how you see the world",
      de: "Stegreif — Erzähl von jemandem, der deinen Blick auf die Welt verändert hat",
    },
    prompt: {
      en: "Introduce them in one line, then give us the single thing they said or did that moved you. One scene beats a portrait.",
      de: "Stell sie in einem Satz vor und gib uns die eine Sache, die dich bewegt hat. Eine Szene schlägt ein Porträt.",
    },
    difficulty: 2,
    targetSec: [60, 120],
  },
  {
    id: "imp-almost-gave-up",
    category: "storytelling",
    title: {
      en: "Impromptu — Describe a moment you almost gave up but didn't",
      de: "Stegreif — Beschreib einen Moment, in dem du fast aufgegeben hättest",
    },
    prompt: {
      en: "Find the exact point where you nearly stopped, and tell us what tipped it. That hinge is the whole speech.",
      de: "Finde genau den Punkt, an dem du fast aufgehört hättest, und sag, was den Ausschlag gab. Dieser Wendepunkt ist die ganze Rede.",
    },
    difficulty: 2,
    targetSec: [60, 120],
  },
  {
    id: "imp-plan-fell-apart",
    category: "storytelling",
    title: {
      en: "Impromptu — Describe a time a plan completely fell apart",
      de: "Stegreif — Erzähl von einem Plan, der komplett auseinanderfiel",
    },
    prompt: {
      en: "Set the plan up briefly so the collapse has something to break. Then tell us what you built out of the pieces.",
      de: "Skizziere den Plan kurz, damit der Zusammenbruch etwas zum Zerbrechen hat. Dann sag, was du aus den Trümmern gebaut hast.",
    },
    difficulty: 2,
    targetSec: [60, 120],
  },
  {
    id: "imp-childhood-belief",
    category: "storytelling",
    title: {
      en: "Impromptu — What's something you believed as a kid that you no longer believe?",
      de: "Stegreif — Was hast du als Kind geglaubt und glaubst es heute nicht mehr?",
    },
    prompt: {
      en: "Tell it in the child's voice first, then in yours. The gap between the two is where the speech lives.",
      de: "Erzähl es zuerst mit der Stimme des Kindes, dann mit deiner. Im Abstand dazwischen liegt die Rede.",
    },
    difficulty: 2,
    targetSec: [60, 120],
  },
  {
    id: "imp-younger-self",
    category: "storytelling",
    title: {
      en: "Impromptu — What's one thing you'd tell your younger self?",
      de: "Stegreif — Was würdest du deinem jüngeren Ich sagen?",
    },
    prompt: {
      en: "Say it to them, not about them. Pick an age, picture the room, and speak directly.",
      de: "Sag es zu ihm, nicht über ihn. Wähl ein Alter, stell dir den Raum vor und sprich direkt.",
    },
    difficulty: 2,
    targetSec: [60, 120],
  },
  {
    id: "imp-sport-life-lesson",
    category: "storytelling",
    title: {
      en: "Impromptu — What's a lesson sport has taught you about life?",
      de: "Stegreif — Welche Lektion fürs Leben hat dir der Sport beigebracht?",
    },
    prompt: {
      en: "Anchor it in one match, one training session, one decision. Generalise only at the very end.",
      de: "Verankere es in einem Spiel, einem Training, einer Entscheidung. Verallgemeinere erst ganz am Schluss.",
    },
    difficulty: 2,
    targetSec: [60, 120],
  },

  // ——— Persuading a room ———
  {
    id: "imp-hometown-visit",
    category: "persuasion",
    title: {
      en: "Impromptu — Convince us your hometown is worth visiting",
      de: "Stegreif — Überzeug uns, dass deine Heimatstadt einen Besuch wert ist",
    },
    prompt: {
      en: "Skip the tourist board copy. Sell us one street, one season, one thing we'd only find if you told us.",
      de: "Lass die Tourismusbroschüre weg. Verkauf uns eine Straße, eine Jahreszeit, eine Sache, die wir sonst nie fänden.",
    },
    difficulty: 2,
    targetSec: [60, 120],
  },
  {
    id: "imp-failure-over-success",
    category: "persuasion",
    title: {
      en: "Impromptu — Convince us that failure is more valuable than success",
      de: "Stegreif — Überzeug uns, dass Scheitern wertvoller ist als Erfolg",
    },
    prompt: {
      en: "It's an unpopular claim, so argue it properly: evidence from your own life, not a motivational poster.",
      de: "Eine unbequeme These — also begründe sie richtig: mit Belegen aus deinem Leben, nicht mit einem Motivationsposter.",
    },
    difficulty: 3,
    targetSec: [60, 120],
  },

  // ——— Explaining a concept simply ———
  {
    id: "imp-explain-internet",
    category: "ted",
    title: {
      en: "Impromptu — Explain how the internet works to a 10-year-old",
      de: "Stegreif — Erklär einem Zehnjährigen, wie das Internet funktioniert",
    },
    prompt: {
      en: "One analogy, carried all the way through. If you reach for a second one, you've lost the child.",
      de: "Ein Bild, konsequent durchgehalten. Greifst du zum zweiten, hast du das Kind verloren.",
    },
    difficulty: 2,
    targetSec: [60, 100],
  },
  {
    id: "imp-explain-sky-blue",
    category: "ted",
    title: {
      en: "Impromptu — Explain why the sky is blue",
      de: "Stegreif — Erklär, warum der Himmel blau ist",
    },
    prompt: {
      en: "Explain it without pretending to know more physics than you do. Honest and clear beats impressive and vague.",
      de: "Erklär es, ohne mehr Physik vorzutäuschen, als du kannst. Ehrlich und klar schlägt beeindruckend und schwammig.",
    },
    difficulty: 2,
    targetSec: [60, 100],
  },
  {
    id: "imp-explain-offside",
    category: "ted",
    title: {
      en: "Impromptu — Explain offside in football to someone who's never watched it",
      de: "Stegreif — Erklär Abseits jemandem, der noch nie Fußball gesehen hat",
    },
    prompt: {
      en: "No jargon, no hands waving at an imaginary pitch. Build the picture in words and check yourself as you go.",
      de: "Kein Fachjargon, kein Fuchteln über einem gedachten Spielfeld. Bau das Bild in Worten und prüf dich dabei selbst.",
    },
    difficulty: 2,
    targetSec: [60, 100],
  },
  {
    id: "imp-confidence-vs-arrogance",
    category: "ted",
    title: {
      en: "Impromptu — Explain the difference between confidence and arrogance",
      de: "Stegreif — Erklär den Unterschied zwischen Selbstsicherheit und Arroganz",
    },
    prompt: {
      en: "Draw the line with two examples of the same behaviour — one that reads as confident, one that reads as arrogant.",
      de: "Zieh die Grenze mit zwei Beispielen desselben Verhaltens — eines wirkt souverän, eines arrogant.",
    },
    difficulty: 2,
    targetSec: [60, 100],
  },
  {
    id: "imp-explain-exercise",
    category: "ted",
    title: {
      en: "Impromptu — Explain why exercise matters, without sounding like a lecture",
      de: "Stegreif — Erklär, warum Bewegung wichtig ist, ohne zu belehren",
    },
    prompt: {
      en: "Talk to one person who already knows they should and doesn't. Persuasion here is warmth, not information.",
      de: "Sprich zu einer Person, die es längst weiß und es trotzdem nicht tut. Hier überzeugt Wärme, nicht Information.",
    },
    difficulty: 2,
    targetSec: [60, 100],
  },
  {
    id: "imp-explain-democracy",
    category: "ted",
    title: {
      en: "Impromptu — Explain what democracy means",
      de: "Stegreif — Erklär, was Demokratie bedeutet",
    },
    prompt: {
      en: "Define it in your own words before you reach for anyone else's. Then say what it costs the people who live in one.",
      de: "Definiere es in eigenen Worten, bevor du fremde bemühst. Dann sag, was es die Menschen kostet, die darin leben.",
    },
    difficulty: 3,
    targetSec: [60, 100],
  },
  {
    id: "imp-explain-calm",
    category: "ted",
    title: {
      en: "Impromptu — Explain how to stay calm under pressure",
      de: "Stegreif — Erklär, wie man unter Druck ruhig bleibt",
    },
    prompt: {
      en: "Give us something we can do in ten seconds, not a philosophy. Then show it working in a moment you've lived.",
      de: "Gib uns etwas, das in zehn Sekunden geht, keine Philosophie. Dann zeig es an einem Moment, den du erlebt hast.",
    },
    difficulty: 2,
    targetSec: [60, 100],
  },
  {
    id: "imp-explain-compound-interest",
    category: "business",
    title: {
      en: "Impromptu — Explain how compound interest works",
      de: "Stegreif — Erklär, wie Zinseszins funktioniert",
    },
    prompt: {
      en: "Use one number and let it grow in front of us. Abstract percentages convince nobody; a running total does.",
      de: "Nimm eine Zahl und lass sie vor unseren Augen wachsen. Abstrakte Prozente überzeugen niemanden, eine laufende Summe schon.",
    },
    difficulty: 2,
    targetSec: [60, 100],
  },
  {
    id: "imp-explain-good-leader",
    category: "business",
    title: {
      en: "Impromptu — Explain what makes a good leader",
      de: "Stegreif — Erklär, was eine gute Führungskraft ausmacht",
    },
    prompt: {
      en: "Three qualities at most, each with a behaviour attached. A quality without a behaviour is just a nice word.",
      de: "Höchstens drei Eigenschaften, jede mit einem konkreten Verhalten. Eine Eigenschaft ohne Verhalten ist nur ein schönes Wort.",
    },
    difficulty: 2,
    targetSec: [60, 100],
  },
  {
    id: "imp-first-impression",
    category: "business",
    title: {
      en: "Impromptu — Explain how to make a good first impression",
      de: "Stegreif — Erklär, wie man einen guten ersten Eindruck macht",
    },
    prompt: {
      en: "The first thirty seconds, step by step. Say what you do with your eyes, your voice and your first question.",
      de: "Die ersten dreißig Sekunden, Schritt für Schritt. Sag, was du mit Blick, Stimme und deiner ersten Frage machst.",
    },
    difficulty: 2,
    targetSec: [60, 100],
  },
];
