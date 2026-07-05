import type { Scenario } from "@/lib/types";

/** Scenario library, part 1: business, interview, storytelling, occasions, difficult. */
export const SCENARIOS_1: Scenario[] = [
  // ——— Business & Pitches ———
  {
    id: "biz-elevator-30",
    category: "business",
    title: { en: "The 30-second elevator pitch", de: "Der 30-Sekunden-Elevator-Pitch" },
    prompt: {
      en: "You step into an elevator with the investor you've been chasing for months. Thirty seconds: what you're building, why it wins, what you need.",
      de: "Du steigst in den Aufzug — neben dir der Investor, den du seit Monaten erreichen willst. Dreißig Sekunden: Was du baust, warum es gewinnt, was du brauchst.",
    },
    difficulty: 2,
    targetSec: [25, 45],
  },
  {
    id: "biz-meeting-hook",
    category: "business",
    title: { en: "Open the big presentation", de: "Eröffne die große Präsentation" },
    prompt: {
      en: "Deliver the first sixty seconds of a presentation that decides your project's budget. Hook them before the first slide would even load.",
      de: "Halte die ersten sechzig Sekunden einer Präsentation, die über das Budget deines Projekts entscheidet. Fessle den Raum, bevor die erste Folie überhaupt laden würde.",
    },
    difficulty: 2,
    targetSec: [50, 75],
  },
  {
    id: "biz-status-uh-oh",
    category: "business",
    title: { en: "The slipping deadline", de: "Die rutschende Deadline" },
    prompt: {
      en: "Give a project update where the news is: two weeks late. State it plainly in the first sentence, explain the cause without blame, present the recovery plan.",
      de: "Gib ein Projekt-Update mit der Nachricht: zwei Wochen Verzug. Sag es klar im ersten Satz, erkläre die Ursache ohne Schuldzuweisung, präsentiere den Aufholplan.",
    },
    difficulty: 2,
    targetSec: [60, 100],
  },
  {
    id: "biz-negotiate-raise",
    category: "business",
    title: { en: "Ask for the raise", de: "Verhandle deine Gehaltserhöhung" },
    prompt: {
      en: "Open your salary negotiation: your case in three achievements with results, the number you want, and then — the hardest part — stop talking.",
      de: "Eröffne deine Gehaltsverhandlung: dein Fall in drei Erfolgen mit Ergebnissen, deine Wunschzahl, und dann — der schwerste Teil — hör auf zu reden.",
    },
    difficulty: 3,
    targetSec: [50, 90],
  },
  {
    id: "biz-product-demo",
    category: "business",
    title: { en: "Demo without a screen", de: "Demo ohne Bildschirm" },
    prompt: {
      en: "The projector just died. Demo your product with words alone: walk the audience through what they would see, feel, and click, moment by moment.",
      de: "Der Beamer ist gerade gestorben. Führe dein Produkt nur mit Worten vor: Geh mit dem Publikum durch, was es sehen, fühlen und klicken würde — Moment für Moment.",
    },
    difficulty: 3,
    targetSec: [70, 110],
  },
  {
    id: "biz-all-hands",
    category: "business",
    title: { en: "The all-hands announcement", de: "Die Ansage vor versammelter Mannschaft" },
    prompt: {
      en: "Announce a big strategic change to the whole company: what's changing, why now, what stays the same, and what you're asking of everyone this quarter.",
      de: "Verkünde der gesamten Firma eine große strategische Änderung: was sich ändert, warum jetzt, was bleibt, und worum du alle in diesem Quartal bittest.",
    },
    difficulty: 3,
    targetSec: [80, 130],
  },
  {
    id: "biz-farewell-client",
    category: "business",
    title: { en: "Decline the deal", de: "Sag den Deal ab" },
    prompt: {
      en: "Turn down a lucrative client whose project conflicts with your values or capacity. Be gracious, be clear, and leave the door open without wobbling on the no.",
      de: "Lehne einen lukrativen Auftrag ab, der deinen Werten oder Kapazitäten widerspricht. Sei verbindlich, sei klar, und halte die Tür offen, ohne beim Nein zu wackeln.",
    },
    difficulty: 3,
    targetSec: [50, 90],
  },

  // ——— Job Interviews ———
  {
    id: "int-tell-me-about",
    category: "interview",
    title: { en: "“Tell me about yourself”", de: "„Erzählen Sie von sich“" },
    prompt: {
      en: "The classic opener. Ninety seconds: present, past, future — where you are, the path that shaped you, and why this role is the logical next chapter.",
      de: "Der Klassiker zum Einstieg. Neunzig Sekunden: Gegenwart, Weg, Zukunft — wo du stehst, was dich geprägt hat und warum diese Stelle das logische nächste Kapitel ist.",
    },
    difficulty: 1,
    targetSec: [70, 100],
  },
  {
    id: "int-proudest",
    category: "interview",
    title: { en: "Your proudest achievement", de: "Dein größter Erfolg" },
    prompt: {
      en: "Describe your proudest professional moment using STAR: the situation, your task, the actions you took, the result — with one number that proves it.",
      de: "Beschreibe deinen größten beruflichen Erfolg nach STAR: Situation, Aufgabe, dein Handeln, Ergebnis — mit einer Zahl, die es belegt.",
    },
    difficulty: 2,
    targetSec: [70, 110],
  },
  {
    id: "int-weakness",
    category: "interview",
    title: { en: "The weakness question", de: "Die Schwächen-Frage" },
    prompt: {
      en: "'What's your greatest weakness?' Answer with a real one, its real cost, and the system you've built around it. No strengths in disguise.",
      de: "„Was ist Ihre größte Schwäche?“ Antworte mit einer echten, ihren echten Kosten und dem System, das du darum gebaut hast. Keine verkleideten Stärken.",
    },
    difficulty: 3,
    targetSec: [50, 90],
  },
  {
    id: "int-conflict",
    category: "interview",
    title: { en: "A conflict you resolved", de: "Ein Konflikt, den du gelöst hast" },
    prompt: {
      en: "Tell about a real disagreement with a colleague or manager: both positions fairly, what you did, and what the relationship looked like afterwards.",
      de: "Erzähl von einem echten Konflikt mit Kollegin oder Chef: beide Positionen fair, dein Handeln, und wie das Verhältnis danach aussah.",
    },
    difficulty: 3,
    targetSec: [70, 110],
  },
  {
    id: "int-why-us",
    category: "interview",
    title: { en: "“Why do you want to work here?”", de: "„Warum wollen Sie zu uns?“" },
    prompt: {
      en: "Answer 'why us' with specifics only a genuine candidate would know: their product, their culture, the problem you want to solve for them in year one.",
      de: "Beantworte „Warum wir?“ nur mit Details, die ein echter Kandidat kennt: ihr Produkt, ihre Kultur, das Problem, das du im ersten Jahr für sie lösen willst.",
    },
    difficulty: 2,
    targetSec: [50, 90],
  },
  {
    id: "int-failure",
    category: "interview",
    title: { en: "Tell me about a failure", de: "Erzählen Sie von einem Scheitern" },
    prompt: {
      en: "Describe a professional failure that was truly your fault. Own it, name the lesson, show the receipts of how you've applied that lesson since.",
      de: "Beschreibe ein berufliches Scheitern, das wirklich deine Schuld war. Steh dazu, benenne die Lehre und belege, wie du sie seither anwendest.",
    },
    difficulty: 3,
    targetSec: [70, 110],
  },
  {
    id: "int-questions-for-us",
    category: "interview",
    title: { en: "“Any questions for us?”", de: "„Haben Sie Fragen an uns?“" },
    prompt: {
      en: "End the interview strong: ask two questions that show you think like an owner, then close with a summary of why the match works — in under a minute.",
      de: "Beende das Gespräch stark: Stelle zwei Fragen, die zeigen, dass du wie eine Unternehmerin denkst, und schließe mit einem Fazit, warum es passt — unter einer Minute.",
    },
    difficulty: 2,
    targetSec: [45, 70],
  },

  // ——— Storytelling ———
  {
    id: "story-weekend",
    category: "storytelling",
    title: { en: "Your weekend, but a story", de: "Dein Wochenende, aber als Geschichte" },
    prompt: {
      en: "Tell the story of your last weekend so that a stranger would want to hear the ending. Pick one thread; give it stakes, however small.",
      de: "Erzähle dein letztes Wochenende so, dass ein Fremder das Ende hören will. Wähle einen Faden; gib ihm Fallhöhe, und sei sie noch so klein.",
    },
    difficulty: 1,
    targetSec: [60, 120],
  },
  {
    id: "story-childhood-place",
    category: "storytelling",
    title: { en: "The place from childhood", de: "Der Ort aus der Kindheit" },
    prompt: {
      en: "Take us to one place from your childhood — a kitchen, a yard, a corner shop. Build it with the senses, then tell us the one thing that happened there.",
      de: "Nimm uns mit an einen Ort deiner Kindheit — eine Küche, einen Hof, einen Kiosk. Baue ihn mit den Sinnen auf, dann erzähle das eine, was dort geschah.",
    },
    difficulty: 2,
    targetSec: [80, 130],
  },
  {
    id: "story-stranger",
    category: "storytelling",
    title: { en: "The stranger you remember", de: "Der Fremde, den du nicht vergisst" },
    prompt: {
      en: "Tell about a stranger you met once and still think about. What they said or did, and why it stuck. End with what you'd tell them today.",
      de: "Erzähl von einem Fremden, den du einmal trafst und an den du noch denkst. Was er sagte oder tat, und warum es blieb. Ende mit dem, was du ihm heute sagen würdest.",
    },
    difficulty: 2,
    targetSec: [80, 130],
  },
  {
    id: "story-wrong-turn",
    category: "storytelling",
    title: { en: "The wrong turn", de: "Die falsche Abzweigung" },
    prompt: {
      en: "Tell the story of a plan that went sideways — a trip, a move, a project — where the detour turned out to matter more than the destination.",
      de: "Erzähl von einem Plan, der schiefging — eine Reise, ein Umzug, ein Projekt — und bei dem der Umweg am Ende wichtiger war als das Ziel.",
    },
    difficulty: 2,
    targetSec: [90, 140],
  },
  {
    id: "story-object",
    category: "storytelling",
    title: { en: "The heirloom", de: "Das Erbstück" },
    prompt: {
      en: "Tell the story of an object that's been passed down or kept too long to explain rationally. Let the object carry the people who touched it.",
      de: "Erzähl die Geschichte eines Gegenstands, der weitergegeben oder unvernünftig lange behalten wurde. Lass den Gegenstand die Menschen tragen, die ihn berührt haben.",
    },
    difficulty: 3,
    targetSec: [90, 140],
  },
  {
    id: "story-two-endings",
    category: "storytelling",
    title: { en: "The story with two endings", de: "Die Geschichte mit zwei Enden" },
    prompt: {
      en: "Tell a true story from your life, then give it a second, alternative ending — the version where you chose differently. Let the gap between them say something.",
      de: "Erzähle eine wahre Geschichte aus deinem Leben — und gib ihr dann ein zweites, alternatives Ende: die Version, in der du dich anders entschieden hast. Lass die Lücke dazwischen sprechen.",
    },
    difficulty: 3,
    targetSec: [100, 150],
  },
  {
    id: "story-ordinary-hero",
    category: "storytelling",
    title: { en: "The ordinary hero", de: "Der Alltagsheld" },
    prompt: {
      en: "Tell the story of someone unfamous who did something quietly remarkable. Your job: make the audience remember their name.",
      de: "Erzähl die Geschichte eines unbekannten Menschen, der still etwas Bemerkenswertes getan hat. Deine Aufgabe: Das Publikum soll sich seinen Namen merken.",
    },
    difficulty: 3,
    targetSec: [90, 140],
  },

  // ——— Toasts & Occasions ———
  {
    id: "occ-wedding-toast",
    category: "occasions",
    title: { en: "The wedding toast", de: "Die Hochzeitsrede" },
    prompt: {
      en: "Your best friend just got married. Raise a glass: one story that captures who they are, one line about the couple, one wish for their future.",
      de: "Dein bester Freund hat geheiratet. Erhebe das Glas: eine Geschichte, die zeigt, wer er ist, ein Satz über das Paar, ein Wunsch für die Zukunft.",
    },
    difficulty: 2,
    targetSec: [60, 120],
  },
  {
    id: "occ-birthday-60",
    category: "occasions",
    title: { en: "The milestone birthday", de: "Der runde Geburtstag" },
    prompt: {
      en: "Speak at a parent's or mentor's milestone birthday. Three decades, three tiny scenes — and a toast that makes them laugh, then swallow hard.",
      de: "Sprich am runden Geburtstag eines Elternteils oder Mentors. Drei Jahrzehnte, drei kleine Szenen — und ein Spruch, der erst lachen und dann schlucken lässt.",
    },
    difficulty: 3,
    targetSec: [80, 130],
  },
  {
    id: "occ-farewell-colleague",
    category: "occasions",
    title: { en: "The farewell speech", de: "Die Abschiedsrede" },
    prompt: {
      en: "A beloved colleague is leaving. Send them off: what they built, one story nobody outside the team knows, and what will be missing when they're gone.",
      de: "Eine geschätzte Kollegin geht. Verabschiede sie: was sie aufgebaut hat, eine Geschichte, die außerhalb des Teams niemand kennt, und was fehlen wird, wenn sie weg ist.",
    },
    difficulty: 2,
    targetSec: [70, 110],
  },
  {
    id: "occ-award-accept",
    category: "occasions",
    title: { en: "Accepting the award", de: "Die Dankesrede" },
    prompt: {
      en: "You've just won an award. Forty-five seconds: genuine surprise without false modesty, two thank-yous with names and reasons, and one sentence about what the work means.",
      de: "Du hast gerade einen Preis gewonnen. Fünfundvierzig Sekunden: echte Überraschung ohne falsche Bescheidenheit, zwei Danksagungen mit Namen und Grund, und ein Satz darüber, was die Arbeit bedeutet.",
    },
    difficulty: 2,
    targetSec: [35, 60],
  },
  {
    id: "occ-eulogy",
    category: "occasions",
    title: { en: "The eulogy", de: "Die Trauerrede" },
    prompt: {
      en: "Deliver a eulogy for someone imagined or remembered. Dignity first, one specific story, one laugh through tears, one goodbye line.",
      de: "Halte eine Trauerrede für einen erdachten oder erinnerten Menschen. Würde zuerst, eine konkrete Geschichte, ein Lachen unter Tränen, ein Abschiedssatz.",
    },
    difficulty: 3,
    targetSec: [90, 150],
  },
  {
    id: "occ-graduation",
    category: "occasions",
    title: { en: "Speech to the graduates", de: "Rede an die Absolventen" },
    prompt: {
      en: "Address this year's graduates of your old school or program. One thing you wish someone had told you, one thing they should ignore, one thing to protect.",
      de: "Sprich zu den diesjährigen Absolventen deiner alten Schule oder deines Studiengangs. Eine Sache, die dir damals jemand hätte sagen sollen, eine, die sie ignorieren sollen, eine, die sie schützen müssen.",
    },
    difficulty: 3,
    targetSec: [90, 140],
  },
  {
    id: "occ-new-year",
    category: "occasions",
    title: { en: "The New Year's address", de: "Die Neujahrsansprache" },
    prompt: {
      en: "Give a New Year's address to your family, team, or club: the year in three honest sentences, the one thing you're proud of, the one hope for next year.",
      de: "Halte eine Neujahrsansprache für Familie, Team oder Verein: das Jahr in drei ehrlichen Sätzen, der eine Stolz, die eine Hoffnung fürs neue Jahr.",
    },
    difficulty: 2,
    targetSec: [60, 100],
  },

  // ——— Difficult Conversations ———
  {
    id: "diff-feedback-friend",
    category: "difficult",
    title: { en: "The honest feedback", de: "Das ehrliche Feedback" },
    prompt: {
      en: "A friend's behavior is hurting them — at work, in love, in health. Say the hard thing: observation, impact, care. No sandwich, no sermon.",
      de: "Das Verhalten eines Freundes schadet ihm — im Job, in der Liebe, in der Gesundheit. Sag das Schwierige: Beobachtung, Wirkung, Zuneigung. Kein Sandwich, keine Predigt.",
    },
    difficulty: 3,
    targetSec: [60, 100],
  },
  {
    id: "diff-boundary",
    category: "difficult",
    title: { en: "Drawing the line", de: "Die Grenze ziehen" },
    prompt: {
      en: "Someone keeps crossing a boundary — your time, your role, your privacy. Name the pattern, state the boundary, and say what happens if it's crossed again. Warm voice, firm floor.",
      de: "Jemand überschreitet wiederholt eine Grenze — deine Zeit, deine Rolle, deine Privatsphäre. Benenne das Muster, ziehe die Grenze und sag, was bei der nächsten Überschreitung passiert. Warme Stimme, fester Boden.",
    },
    difficulty: 3,
    targetSec: [50, 90],
  },
  {
    id: "diff-apology-personal",
    category: "difficult",
    title: { en: "The real apology", de: "Die echte Entschuldigung" },
    prompt: {
      en: "You hurt someone you care about. Apologize properly: what you did, what it cost them, no 'but', and the change they can expect. Then let silence do its work.",
      de: "Du hast jemanden verletzt, der dir wichtig ist. Entschuldige dich richtig: was du getan hast, was es ihn gekostet hat, kein „aber“, und die Veränderung, auf die er zählen kann. Dann lass die Stille arbeiten.",
    },
    difficulty: 3,
    targetSec: [40, 80],
  },
  {
    id: "diff-decline-family",
    category: "difficult",
    title: { en: "Saying no to family", de: "Nein sagen in der Familie" },
    prompt: {
      en: "Decline a family request loaded with expectation — the loan, the move, the tradition. Honor the relationship out loud while keeping the no intact.",
      de: "Lehne eine erwartungsschwere Bitte aus der Familie ab — das Darlehen, den Umzug, die Tradition. Würdige die Beziehung hörbar und lass das Nein trotzdem stehen.",
    },
    difficulty: 3,
    targetSec: [50, 90],
  },
  {
    id: "diff-underperformer",
    category: "difficult",
    title: { en: "The performance talk", de: "Das Leistungsgespräch" },
    prompt: {
      en: "Open a conversation with a team member whose work has slipped: specific observations, genuine curiosity about causes, clear expectations, real support.",
      de: "Eröffne das Gespräch mit einem Teammitglied, dessen Leistung nachgelassen hat: konkrete Beobachtungen, echtes Interesse an den Ursachen, klare Erwartungen, echte Unterstützung.",
    },
    difficulty: 3,
    targetSec: [70, 110],
  },
  {
    id: "diff-breakup-business",
    category: "difficult",
    title: { en: "Ending the partnership", de: "Die Partnerschaft beenden" },
    prompt: {
      en: "End a long collaboration that has stopped working — a business partner, a co-founder, a band. The history deserves honor; the decision deserves clarity.",
      de: "Beende eine lange Zusammenarbeit, die nicht mehr trägt — Geschäftspartner, Mitgründerin, Band. Die Geschichte verdient Würdigung; die Entscheidung verdient Klarheit.",
    },
    difficulty: 3,
    targetSec: [70, 110],
  },
  {
    id: "diff-elephant",
    category: "difficult",
    title: { en: "Naming the elephant", de: "Den Elefanten benennen" },
    prompt: {
      en: "A meeting is dancing around an obvious problem everyone feels and nobody names. Be the one who says it — factually, without accusation, with a way forward.",
      de: "Ein Meeting tänzelt um ein offensichtliches Problem, das alle spüren und niemand ausspricht. Sei die Person, die es sagt — sachlich, ohne Anklage, mit einem Weg nach vorn.",
    },
    difficulty: 3,
    targetSec: [50, 90],
  },
];
