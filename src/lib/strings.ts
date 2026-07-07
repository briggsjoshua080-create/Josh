/**
 * UI copy, authored per-language (not machine-translated).
 * German uses the informal "du" — a coach, not a bureaucracy.
 */
export const strings = {
  // App shell
  navToday: { en: "Today", de: "Heute" },
  navLibrary: { en: "Library", de: "Szenarien" },
  navProgress: { en: "Progress", de: "Fortschritt" },
  appName: { en: "Orato", de: "Orato" },

  // Today screen
  dayLabel: { en: "Day {n}", de: "Tag {n}" },
  dayOfPath: { en: "Day {n} of your speaking journey", de: "Tag {n} deiner Rede-Reise" },
  streakDays: { en: "{n}-day streak", de: "{n} Tage in Serie" },
  streakOneDay: { en: "1-day streak", de: "1 Tag in Serie" },
  streakNone: { en: "Start your streak today", de: "Starte heute deine Serie" },
  todayChallenge: { en: "Today's challenge", de: "Heutige Challenge" },
  wordOfDay: { en: "Word of the day", de: "Wort des Tages" },
  wordOfDayHint: {
    en: "Work it into today's recording.",
    de: "Baue es in deine heutige Aufnahme ein.",
  },
  beginSession: { en: "Take the stage", de: "Auf die Bühne" },
  doneToday: { en: "Day {n} complete", de: "Tag {n} geschafft" },
  doneTodaySub: {
    en: "The next challenge unlocks tomorrow. Keep sharp in the library.",
    de: "Die nächste Challenge wartet morgen. Bleib scharf – in den Szenarien.",
  },
  reviewFeedback: { en: "Review today's feedback", de: "Heutiges Feedback ansehen" },
  practiceScenario: { en: "Practice a scenario", de: "Ein Szenario üben" },
  difficulty: { en: "Difficulty", de: "Schwierigkeit" },
  targetLength: { en: "Aim for {a}–{b}", de: "Ziel: {a}–{b}" },
  coachFocus: { en: "Coach's focus", de: "Fokus des Coaches" },

  // Library
  libraryTitle: { en: "Scenario library", de: "Szenario-Bibliothek" },
  librarySub: {
    en: "{n} rehearsal rooms. Pick one or let fate decide.",
    de: "{n} Übungsräume. Such dir einen aus – oder lass den Zufall wählen.",
  },
  allCategories: { en: "All", de: "Alle" },
  surpriseMe: { en: "Surprise me", de: "Überrasch mich" },
  viewDeck: { en: "Cards", de: "Karten" },
  viewList: { en: "List", de: "Liste" },
  scenarios: { en: "{n} scenarios", de: "{n} Szenarien" },
  searchScenarios: { en: "Search scenarios…", de: "Szenarien durchsuchen…" },
  noResults: {
    en: "Nothing matches — try another word or filter.",
    de: "Kein Treffer — versuch ein anderes Wort oder einen anderen Filter.",
  },
  recommendedNext: { en: "Recommended next", de: "Empfohlen als Nächstes" },
  recommendedBadge: { en: "Recommended", de: "Empfohlen" },
  recommendedReason: {
    en: "Your lowest score last session was {dim} — this scenario trains exactly that.",
    de: "Dein niedrigster Wert zuletzt war {dim} — dieses Szenario trainiert genau das.",
  },
  difficultyBeginner: { en: "Beginner", de: "Einsteiger" },
  difficultyIntermediate: { en: "Intermediate", de: "Fortgeschritten" },
  difficultyAdvanced: { en: "Advanced", de: "Profi" },
  trainsLabel: { en: "Trains", de: "Trainiert" },
  timeApprox: { en: "~{n} min", de: "~{n} Min." },
  masteryPct: { en: "{n}% mastered", de: "{n}% gemeistert" },
  notPracticed: { en: "Not practiced yet", de: "Noch nicht geübt" },
  startExercise: { en: "Start exercise", de: "Übung starten" },
  emptyLibraryTitle: {
    en: "No exercises completed yet",
    de: "Noch keine Übung abgeschlossen",
  },
  emptyLibraryBody: {
    en: "Try this beginner-friendly scenario to get your first score on the board:",
    de: "Starte mit diesem einsteigerfreundlichen Szenario und hol dir deinen ersten Score:",
  },

  // Session / recording
  ready: { en: "Ready when you are.", de: "Bereit, wenn du es bist." },
  micHint: {
    en: "Speak clearly toward your microphone. The transcript builds as you talk.",
    de: "Sprich klar in dein Mikrofon. Das Transkript entsteht, während du redest.",
  },
  startRecording: { en: "Start speaking", de: "Los sprechen" },
  stopRecording: { en: "Finish", de: "Fertig" },
  discard: { en: "Discard", de: "Verwerfen" },
  listening: { en: "Listening…", de: "Ich höre zu…" },
  analyzing: { en: "Your coach is listening back…", de: "Dein Coach hört sich alles an…" },
  micDenied: {
    en: "Microphone access was blocked. Allow it in your browser's site settings, then try again.",
    de: "Der Mikrofon-Zugriff wurde blockiert. Erlaube ihn in den Website-Einstellungen deines Browsers und versuch es erneut.",
  },
  speechUnsupported: {
    en: "This browser doesn't support live transcription. Use Chrome, Edge, or Safari — or type your speech below to practice anyway.",
    de: "Dieser Browser unterstützt keine Live-Transkription. Nutze Chrome, Edge oder Safari — oder tippe deine Rede unten ein und übe trotzdem.",
  },
  typeFallbackLabel: { en: "Type your speech", de: "Tippe deine Rede" },
  typeFallbackSubmit: { en: "Add to transcript", de: "Zum Transkript hinzufügen" },
  typeInstead: { en: "Type instead", de: "Stattdessen tippen" },
  tooShort: {
    en: "That was too short to coach. Give it at least ten words.",
    de: "Das war zu kurz für Feedback. Gib mir mindestens zehn Wörter.",
  },
  useWord: { en: "Bonus: use “{w}”", de: "Bonus: Verwende „{w}“" },

  // Feedback
  overall: { en: "Overall", de: "Gesamt" },
  scorePace: { en: "Pace", de: "Tempo" },
  scoreVolume: { en: "Volume", de: "Lautstärke" },
  scoreFillers: { en: "Filler words", de: "Füllwörter" },
  scoreFluency: { en: "Fluency", de: "Redefluss" },
  scoreEloquence: { en: "Words & Eloquence", de: "Worte & Eloquenz" },
  scoreStructure: { en: "Structure", de: "Struktur" },
  scoreStyle: { en: "Stylistic Devices", de: "Stilmittel" },
  scoreComprehensiveness: { en: "Comprehensiveness", de: "Vollständigkeit" },
  scoreLogic: { en: "Logic of Arguments", de: "Argumentationslogik" },
  scorePhrasing: { en: "Phrasing", de: "Ausdruck" },
  scoreProfessionalism: { en: "Professionalism", de: "Professionalität" },
  categoryScores: { en: "The seven dimensions", de: "Die sieben Dimensionen" },
  deliveryDetail: { en: "Delivery detail", de: "Vortrag im Detail" },
  volumeUnmeasured: {
    en: "Volume wasn't measured this session — record with the mic on to score it.",
    de: "Die Lautstärke wurde diese Session nicht gemessen — nimm mit Mikrofon auf, um sie zu bewerten.",
  },
  coachSummary: { en: "Coach's verdict", de: "Urteil des Coaches" },
  whatWorked: { en: "What worked", de: "Was gut war" },
  sayItBetter: { en: "Say it better", de: "Sag es besser" },
  yourVersion: { en: "You said", de: "Du sagtest" },
  betterVersion: { en: "Stronger", de: "Stärker" },
  nextSteps: { en: "Work on this next", de: "Daran arbeitest du als Nächstes" },
  transcriptTitle: { en: "Transcript", de: "Transkript" },
  wpmUnit: { en: "wpm", de: "WpM" },
  wordsUnit: { en: "words", de: "Wörter" },
  pausesUnit: { en: "pauses", de: "Pausen" },
  fillersDetected: { en: "fillers", de: "Füllwörter" },
  offlineCoach: {
    en: "Offline analysis — connect to the internet for full AI coaching.",
    de: "Offline-Analyse — geh online für das volle KI-Coaching.",
  },
  retryCoach: { en: "Get AI coaching", de: "KI-Coaching holen" },
  coachFailed: {
    en: "Couldn't reach your coach. Your recording and metrics are saved — retry when you're back online.",
    de: "Dein Coach war nicht erreichbar. Aufnahme und Messwerte sind gespeichert — versuch es online erneut.",
  },
  wordUsedYes: { en: "Word of the day: used", de: "Wort des Tages: verwendet" },
  wordUsedNo: { en: "Word of the day: not used", de: "Wort des Tages: nicht verwendet" },
  backToToday: { en: "Back to today", de: "Zurück zu Heute" },
  anotherScenario: { en: "Another scenario", de: "Noch ein Szenario" },

  // The eight metrics (progression system)
  metricClarity: { en: "Clarity", de: "Klarheit" },
  metricConfidence: { en: "Confidence", de: "Souveränität" },
  metricStructure: { en: "Structure", de: "Struktur" },
  metricPace: { en: "Pace", de: "Tempo" },
  metricFluency: { en: "Fluency", de: "Redefluss" },
  metricWordPower: { en: "Word Power", de: "Wortkraft" },
  metricConciseness: { en: "Conciseness", de: "Prägnanz" },
  metricEngagement: { en: "Engagement", de: "Wirkung" },
  expClarity: {
    en: "How easily a listener follows your ideas.",
    de: "Wie mühelos ein Zuhörer deinen Gedanken folgt.",
  },
  expConfidence: {
    en: "How assured you sound — hedge words lower it.",
    de: "Wie souverän du klingst — Relativierungen senken den Wert.",
  },
  expStructure: {
    en: "Opening, body, close — with clear transitions.",
    de: "Einstieg, Hauptteil, Schluss — mit klaren Übergängen.",
  },
  expPace: {
    en: "Words per minute against the easy-to-follow band.",
    de: "Wörter pro Minute im gut folgbaren Bereich.",
  },
  expFluency: {
    en: "Fillers, false starts, and repeated words.",
    de: "Füllwörter, Fehlstarts und Wiederholungen.",
  },
  expWordPower: {
    en: "Strong, vivid words over weak, vague ones.",
    de: "Starke, bildhafte Wörter statt schwacher, vager.",
  },
  expConciseness: {
    en: "Every sentence earns its place.",
    de: "Jeder Satz verdient seinen Platz.",
  },
  expEngagement: {
    en: "Rhetorical devices, vividness, story.",
    de: "Stilmittel, Bildhaftigkeit, Erzählung.",
  },

  // Feedback (redesigned report)
  metricsSection: { en: "The eight metrics", de: "Die acht Metriken" },
  wordBonusChip: { en: "+20 word of the day", de: "+20 Wort des Tages" },
  xpPendingChip: { en: "XP pending", de: "XP ausstehend" },
  xpPendingNote: {
    en: "XP is awarded once the full analysis completes.",
    de: "XP gibt es, sobald die volle Analyse abgeschlossen ist.",
  },
  reconnectNote: {
    en: "Reconnect for your full score.",
    de: "Geh online für deine volle Bewertung.",
  },
  levelUpTitle: { en: "Level up", de: "Aufgestiegen" },
  viewStats: { en: "View Your Stats", de: "Deine Statistik ansehen" },
  powerWordsTitle: { en: "Power Words", de: "Starke Wörter" },
  weakWordsTitle: { en: "Weak Words", de: "Schwache Wörter" },
  strongestLineTitle: { en: "Your Strongest Line", de: "Deine stärkste Zeile" },
  tightenTitle: { en: "Tighten This", de: "Straffe das" },
  tightenRewrite: { en: "Tighter", de: "Straffer" },
  vocalDeliveryTitle: { en: "Vocal Delivery", de: "Stimmlicher Vortrag" },
  articulationLabel: { en: "Articulation", de: "Artikulation" },
  hardToCatchLabel: { en: "Hard to catch", de: "Schwer zu verstehen" },
  cleanSpeechLabel: {
    en: "{n}s of clean, unbroken speech",
    de: "{n}s sauberes Sprechen am Stück",
  },
  easyBandLabel: { en: "easy to follow", de: "gut folgbar" },
  confidenceTitle: { en: "Confidence", de: "Souveränität" },
  paceSectionTitle: { en: "Pace", de: "Tempo" },
  meterTentative: { en: "Tentative", de: "Zögerlich" },
  meterCommanding: { en: "Commanding", de: "Souverän" },
  meterSlow: { en: "Slow", de: "Langsam" },
  meterFast: { en: "Fast", de: "Schnell" },
  confLabelTentative: { en: "Tentative", de: "Zögerlich" },
  confLabelHesitant: { en: "Hesitant", de: "Unsicher" },
  confLabelSteady: { en: "Steady", de: "Stabil" },
  confLabelAssured: { en: "Assured", de: "Sicher" },
  confLabelCommanding: { en: "Commanding", de: "Souverän" },

  // Progress / progression
  statsLabel: { en: "Stats", de: "Statistik" },
  xpTotal: { en: "{n} XP total", de: "{n} XP gesamt" },
  xpToNext: { en: "{n} XP to {rank}", de: "{n} XP bis {rank}" },
  maxRank: { en: "Max rank", de: "Höchster Rang" },
  levelWord: { en: "Level {n}", de: "Level {n}" },

  // Progress
  progressTitle: { en: "Your journey", de: "Deine Reise" },
  progressSub: {
    en: "Every session, scored and remembered — on this device only.",
    de: "Jede Session, bewertet und gespeichert — nur auf diesem Gerät.",
  },
  sessionsCount: { en: "Sessions", de: "Sessions" },
  avgScore: { en: "Avg. score", de: "Ø-Score" },
  bestScore: { en: "Best", de: "Bestwert" },
  statStreak: { en: "Day streak", de: "Tage-Serie" },
  trendTitle: { en: "Score trend", de: "Score-Verlauf" },
  historyTitle: { en: "History", de: "Verlauf" },
  emptyProgress: {
    en: "No sessions yet. Your first recording starts the record.",
    de: "Noch keine Sessions. Deine erste Aufnahme eröffnet die Chronik.",
  },
  emptyProgressCta: { en: "Record your first session", de: "Nimm deine erste Session auf" },

  // Misc
  minutes: { en: "min", de: "Min." },
  seconds: { en: "s", de: "s" },
  languageToggle: { en: "Sprache: Deutsch", de: "Language: English" },
  loading: { en: "Setting the stage…", de: "Die Bühne wird bereitet…" },
  dayBeyondCore: {
    en: "Beyond the core program — you're in mastery territory.",
    de: "Jenseits des Kernprogramms — du bist im Meisterschafts-Modus.",
  },
} as const;

export type StringKey = keyof typeof strings;

/** A per-language list of interchangeable phrasings for one coaching line. */
export interface CoachingVariants {
  en: readonly string[];
  de: readonly string[];
}

/**
 * Deterministic delivery-coaching copy used by deliveryCoaching() in
 * lib/feedback.ts. Kept apart from `strings` (which t() indexes as single
 * values): each "improve" line carries 2–3 rotating variants per language so
 * repeat users don't read identical advice every session. All variants of a
 * key must stay true to the same measurement — same advice, fresh wording.
 */
export const coachingCopy = {
  feedbackPaceSlowImprove: {
    en: [
      "Add forward drive and stop letting the last words of each sentence trail off.",
      "Pick up the tempo a notch — finish every sentence with the same energy you started it with.",
      "Tighten your delivery: shorter sentences, firmer endings, no fading out.",
    ],
    de: [
      "Nimm mehr Zug nach vorn und lass die letzten Wörter jedes Satzes nicht ausklingen.",
      "Zieh das Tempo eine Stufe an — beende jeden Satz mit derselben Energie, mit der du ihn begonnen hast.",
      "Straffe deinen Vortrag: kürzere Sätze, feste Endungen, kein Verklingen.",
    ],
  },
  feedbackPaceFastImprove: {
    en: [
      "Plant a deliberate pause before your key points so they land.",
      "Slow down for the sentences that matter — give your audience a beat to catch up.",
      "Breathe at the full stops: a short pause after each point makes fast speech feel controlled.",
    ],
    de: [
      "Setze bewusste Pausen vor deinen Kernaussagen, damit sie landen können.",
      "Werde bei den wichtigen Sätzen langsamer — gib deinem Publikum einen Moment zum Mitkommen.",
      "Atme an den Satzenden: Eine kurze Pause nach jedem Punkt macht schnelles Sprechen kontrolliert.",
    ],
  },
  feedbackPaceGoodImprove: {
    en: [
      "Hold this tempo, but slow down just before your most important line.",
      "Keep this pace — and take it down half a step right before your core message.",
      "Your tempo carries; use it deliberately by easing off just ahead of the line that matters most.",
    ],
    de: [
      "Halte das Tempo, aber verlangsame kurz vor deiner wichtigsten Zeile.",
      "Bleib bei diesem Tempo — und nimm es kurz vor deiner Kernbotschaft eine halbe Stufe zurück.",
      "Dein Tempo trägt; setz es gezielt ein, indem du vor deiner wichtigsten Aussage leicht abbremst.",
    ],
  },
  feedbackFillersGoodImprove: {
    en: [
      "Keep this — your fillers are already rare. Own the silent pauses.",
      "Stay the course: fillers are rare, so practice holding the silence a beat longer.",
      "Your filler discipline holds — now let the pauses stretch a touch for extra weight.",
    ],
    de: [
      "Bleib so — deine Füllwörter sind bereits selten. Halte die Pausen bewusst.",
      "Bleib auf Kurs: Füllwörter sind selten — übe jetzt, die Stille einen Schlag länger zu halten.",
      "Deine Füllwort-Disziplin sitzt — lass die Pausen nun etwas länger stehen, das gibt Gewicht.",
    ],
  },
  feedbackFillersHighImprove: {
    en: [
      "Consciously replace each “um” with one silent beat instead of a sound.",
      "When you feel an “um” coming, close your mouth and let the pause do the work.",
      "Trade every filler for a breath: pause, inhale, then continue with the next word.",
    ],
    de: [
      "Ersetze bewusst jedes „äh“ durch eine stille Sekunde statt eines Lauts.",
      "Wenn du ein „äh“ kommen spürst: Mund zu und die Pause arbeiten lassen.",
      "Tausche jedes Füllwort gegen einen Atemzug: Pause, einatmen, dann mit dem nächsten Wort weiter.",
    ],
  },
  feedbackFluencyGoodImprove: {
    en: [
      "Your flow holds — keep it as you stretch the length tomorrow.",
      "Fluency is solid; raise the bar by speaking 30 seconds longer at the same quality.",
      "The flow is there — now protect it while you tackle a harder prompt.",
    ],
    de: [
      "Dein Redefluss steht — halte ihn, wenn du morgen die Länge steigerst.",
      "Der Redefluss sitzt; leg die Latte höher und sprich 30 Sekunden länger in derselben Qualität.",
      "Der Fluss ist da — schütze ihn jetzt, während du dir eine schwerere Aufgabe vornimmst.",
    ],
  },
  feedbackFluencyLowImprove: {
    en: [
      "When you trip: kill the sentence, take a breath, restart the whole sentence.",
      "After a stumble, don't patch mid-sentence — pause briefly and start the sentence again cleanly.",
      "Recover deliberately: stop, one calm breath, then deliver the full sentence from the top.",
    ],
    de: [
      "Wenn du dich verhaspelst: Satz abbrechen, kurz atmen, den ganzen Satz neu.",
      "Nach einem Stolperer nicht mitten im Satz flicken — kurz innehalten und den Satz sauber neu beginnen.",
      "Fang dich bewusst: stoppen, ein ruhiger Atemzug, dann den ganzen Satz von vorn.",
    ],
  },
} as const satisfies Record<string, CoachingVariants>;

/** Single-variant volume coaching lines (measured client-side only). */
export const volumeCopy = {
  feedbackVolumeLowNote: {
    en: "Your projection stayed low — the back row would strain to hear you.",
    de: "Deine Projektion blieb leise — die letzte Reihe müsste sich anstrengen.",
  },
  feedbackVolumeLowImprove: {
    en: "Speak from your diaphragm and aim your voice at the far wall, not the mic.",
    de: "Sprich aus dem Zwerchfell und richte die Stimme auf die hintere Wand, nicht aufs Mikro.",
  },
  feedbackVolumeGoodNote: {
    en: "Strong, steady projection — you filled the room.",
    de: "Kräftige, gleichmäßige Projektion — du hast den Raum gefüllt.",
  },
  feedbackVolumeGoodImprove: {
    en: "Push volume up a notch right before your strongest line for emphasis.",
    de: "Heb die Lautstärke kurz vor deiner stärksten Zeile noch eine Stufe an.",
  },
  feedbackVolumeUnevenNote: {
    en: "Audible but uneven — your volume sagged in places.",
    de: "Hörbar, aber ungleichmäßig — die Lautstärke sackte stellenweise ab.",
  },
  feedbackVolumeUnevenImprove: {
    en: "Keep the energy up through the middle — don't let volume dip between points.",
    de: "Halte die Energie durch die Mitte, statt zwischen den Punkten leiser zu werden.",
  },
} as const satisfies Record<string, { en: string; de: string }>;
