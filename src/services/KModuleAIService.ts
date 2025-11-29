// src/services/KModuleAIService.ts
// KLARE Schritt K - AI Service Wrapper mit Fallback-Strategie

import AIService, { AIResponse } from "./AIService";
import { supabase } from "../lib/supabase";

export interface UserContext {
  name: string;
  mainChallenge: string;
  reflectionExperience: "Anfänger" | "Fortgeschritten" | "Experte";
  currentLifeAreas: string[];
}

export interface AICoachResponse {
  type: "welcome" | "analysis" | "guidance" | "feedback";
  message: string;
  exercises?: string[];
  nextSteps?: string[];
  encouragement?: string;
  metadata?: Record<string, any>;
}

export interface AnalysisResult {
  pattern_type: string;
  identified_word: string;
  generated_question: string;
}

export interface MetaModelAnalysisResult {
  analysis: AnalysisResult[];
  coachResponse: AICoachResponse;
  levelAssessment: number;
  nextSteps?: string[];
  metadata?: {
    usedFallback: boolean;
    challenge: string;
  };
}

interface SupabaseMetaModelResponse {
  analysis: AnalysisResult[];
}

interface HeuristicAnalysis {
  patterns: string[];
  questions: string[];
  keywords: string[];
}

const DEFAULT_CHALLENGE = "universalquantoren";

export class KModuleAIService {
  private readonly language: string;
  private sessionId: string | null = null;
  private currentUserId: string | null = null;
  private activeModuleId: string | null = null;
  private cachedUserContext: UserContext | null = null;

  constructor(language: string = "de") {
    this.language = language;
  }

  async getMetaModelQuestions(
    level: number,
    mainGoal: string,
    lowestAreas: string[] = [],
    options: { userId?: string } = {},
  ): Promise<AICoachResponse> {
    const levelName = level === 1 ? "Generalisierungen" : level === 2 ? "Tilgungen" : "Verzerrungen";
    if (!options.userId) {
      return this.buildFallbackMetaQuestions(levelName, mainGoal, lowestAreas);
    }
    try {
      await this.ensureSession(options.userId);
      const prompt = [
        `Erzeuge genau 3 kurze, aufeinander aufbauende Fragen zum Meta-Modell-Level ${level} (${levelName}).`,
        `Ziel: Den Nutzer zu präzisen Antworten herausfordern und typische Fehler (${levelName}) sichtbar machen.`,
        `Kontext: Hauptziel/Herausforderung: ${mainGoal || "nicht angegeben"}.`,
        lowestAreas.length ? `Kritische Lebensbereiche: ${lowestAreas.join(", ")}.` : "",
        "Anforderungen:",
        "- Jede Frage muss mit einem Fragezeichen enden.",
        "- Frage 1: Einstieg auf Ziel/aktuelles Problem bezogen.",
        "- Frage 2: Zuspitzung mit Meta‑Modell‑Trigger (Wer/Wann/Was GENAU? Woran machst du das fest?).",
        "- Frage 3: Konfrontierend-klar, zwingt zur konkreten Benennung (Zeitpunkt, Person, Handlung, Messkriterium).",
        "- Nutze eine direkte, respektvolle Formulierung in Du-Ansprache.",
      ].filter(Boolean).join("\n");
      const response = await AIService.sendMessage(options.userId, this.sessionId!, prompt, "coaching");
      const mapped = this.mapAIResponseToCoach(response, "guidance");
      if (mapped.nextSteps && mapped.nextSteps.length >= 3) return mapped;
      return this.buildFallbackMetaQuestions(levelName, mainGoal, lowestAreas);
    } catch (e) {
      return this.buildFallbackMetaQuestions(levelName, mainGoal, lowestAreas);
    }
  }

  private buildFallbackMetaQuestions(levelName: string, mainGoal: string, lowestAreas: string[]): AICoachResponse {
    const area = lowestAreas[0] || "deinen wichtigsten Bereich";
    const base = levelName === "Generalisierungen"
      ? [
          `Was ist dein konkretestes Ziel in ${area} und woran würdest du erkennen, dass du es erreicht hast?`,
          `Wenn du sagst, es ist schwierig: Wer genau sagt das, was genau ist schwierig und wann genau tritt es auf?`,
          `Welche ganz konkrete Ausnahme gab es zuletzt – und was GENAU hast du dann anders gemacht?`,
        ]
      : levelName === "Tilgungen"
      ? [
          `Wovon sprichst du ganz genau in Bezug auf ${area} und dein Ziel?`,
          `Wer ist konkret beteiligt, was GENAU passiert und wann/wo passiert es?`,
          `Welche Information fehlt dir noch, um heute einen ersten, messbaren Schritt zu gehen?`,
        ]
      : [
          `Wenn du sagst „X führt zu Y“ in ${area}: Wie GENAU hängt das zusammen und woran machst du das fest?`,
          `Wessen Gedanken oder Erwartungen nimmst du hier an – und welche Beobachtung stützt das?`,
          `Formuliere das als beobachtbares Verhalten: Was GENAU tust du oder andere als nächstes, mit welchem Ergebnis?`,
        ];
    return { type: "guidance", message: "", nextSteps: base };
  }

  async startKSession(
    userContext: UserContext,
    moduleId: string,
    options: { userId?: string; completedModules?: string[] } = {},
  ): Promise<AICoachResponse> {
    this.cachedUserContext = userContext;
    this.activeModuleId = moduleId;

    const fallbackResponse = this.generateWelcomeByModule(userContext, moduleId);

    if (!options.userId) {
      return fallbackResponse;
    }

    try {
      const introPrompt = this.buildIntroPrompt(userContext, moduleId, options.completedModules);
      const { sessionId, response } = await AIService.startConversation(
        options.userId,
        "coaching",
        introPrompt,
      );

      this.sessionId = sessionId;
      this.currentUserId = options.userId;

      await AIService.logServiceUsage(options.userId, "k_module_session_start", {
        moduleId,
        language: this.language,
      });

      return response ? this.mapAIResponseToCoach(response, "welcome") : fallbackResponse;
    } catch (error) {
      console.warn("[KModuleAIService] Start session fallback genutzt", error);
      return fallbackResponse;
    }
  }

  async analyzeMetaModel(
    userStatement: string,
    currentLevel: number,
    challenge: string,
    options: { userId?: string } = {},
  ): Promise<MetaModelAnalysisResult> {
    const effectiveChallenge = challenge || DEFAULT_CHALLENGE;
    const fallback = this.buildFallbackAnalysis(userStatement, currentLevel, effectiveChallenge);

    try {
      const { data, error } = await supabase
        .functions
        .invoke<SupabaseMetaModelResponse>("meta-modell-analyse", {
          body: { inputText: userStatement },
        });

      if (error) {
        throw new Error(error.message || "Meta-Modell Analyse fehlgeschlagen");
      }

      const serverAnalysis = Array.isArray(data?.analysis) ? data!.analysis : [];
      const analysis = serverAnalysis.length > 0 ? serverAnalysis : fallback.analysis;
      const levelAssessment = this.assessLevelFromAnalysis(analysis, currentLevel, serverAnalysis.length > 0);

      const coachResponse = await this.generateCoachFeedback(
        analysis,
        userStatement,
        effectiveChallenge,
        levelAssessment,
        options.userId,
      );

      if (options.userId) {
        await AIService.logServiceUsage(options.userId, "k_module_meta_model_analysis", {
          moduleId: this.activeModuleId,
          analysisSize: analysis.length,
          usedFallback: serverAnalysis.length === 0,
        });
      }

      return {
        analysis,
        coachResponse,
        levelAssessment,
        nextSteps: coachResponse.nextSteps,
        metadata: {
          usedFallback: serverAnalysis.length === 0,
          challenge: effectiveChallenge,
        },
      };
    } catch (error) {
      console.warn("[KModuleAIService] Analyse fallback genutzt", error);
      return fallback;
    }
  }

  async generatePersonalizedCoaching(
    context: string,
    userProgress: Record<string, unknown>,
    options: { userId?: string } = {},
  ): Promise<AICoachResponse> {
    if (!options.userId) {
      return this.buildFallbackCoaching(context, userProgress);
    }

    try {
      await this.ensureSession(options.userId);
      const response = await AIService.sendMessage(
        options.userId,
        this.sessionId!,
        context,
        "coaching",
      );

      await AIService.logServiceUsage(options.userId, "k_module_contextual_guidance", {
        moduleId: this.activeModuleId,
      });

      return this.mapAIResponseToCoach(response, "guidance");
    } catch (error) {
      console.warn("[KModuleAIService] Coaching fallback genutzt", error);
      return this.buildFallbackCoaching(context, userProgress);
    }
  }

  private async ensureSession(userId: string): Promise<void> {
    if (this.sessionId) {
      return;
    }

    const introContext = this.cachedUserContext || {
      name: "Teilnehmer",
      mainChallenge: "Klarheit in der Kommunikation",
      reflectionExperience: "Anfänger" as const,
      currentLifeAreas: [],
    };

    const prompt = this.buildIntroPrompt(introContext, this.activeModuleId || "k-meta-model");
    const { sessionId } = await AIService.startConversation(userId, "coaching", prompt);
    this.sessionId = sessionId;
    this.currentUserId = userId;
  }

  private buildIntroPrompt(
    userContext: UserContext,
    moduleId: string,
    completedModules: string[] = [],
  ): string {
    const moduleName = moduleId.replace("k-", "");
    const completedList = completedModules.length > 0
      ? `Der Nutzer hat bereits folgende K-Module abgeschlossen: ${completedModules.join(", ")}.`
      : "Dies ist das erste Modul dieser Session.";

    return [
      `Sprache: ${this.language.toUpperCase()}.`,
      `Modul: ${moduleId} (${moduleName}).`,
      `Name des Nutzers: ${userContext.name}.`,
      `Haupt-Herausforderung: ${userContext.mainChallenge}.`,
      `Reflexions-Erfahrung: ${userContext.reflectionExperience}.`,
      `Aktuelle Lebensbereiche: ${userContext.currentLifeAreas.join(", ") || "nicht angegeben"}.`,
      completedList,
      "Gib eine warme, strukturierte Begrüßung mit Fokus auf Klarheit und Meta-Modell.",
      "WICHTIG: Verwende strikt die KLARE-Schritte mit diesen Namen (in Deutsch): Klarheit, Lebendigkeit, Ausrichtung, Realisierung, Entfaltung.",
      "Verwende KEINE Synonyme wie Lernen, Leben, Aussicht, Reflexion, Entscheidung anstelle der KLARE-Namen.",
      "Dupliziere keine Begrüßungstexte – formuliere die Begrüßung einmal konsistent.",
      "Stelle im Anschluss 2-3 prägnante Fragen (jeweils mit Fragezeichen), beginnend mit: Was ist aktuell dein wichtigstes Ziel?",
      "Beziehe mindestens eine Frage klar auf einen schwächeren Lebensbereich (falls genannt) und konfrontiere freundlich-provokativ mögliche Ausweichmuster.",
      "Nutze Meta-Modell-Fragen (Wer/Wann/Was genau? Woran machst du das fest? Was passiert, wenn nicht?), ohne belehrend zu wirken.",
    ].join("\n");
  }

  private generateWelcomeByModule(userContext: UserContext, moduleId: string): AICoachResponse {
    if (moduleId === "k-meta-model") {
      return this.generateMetaModelWelcome(userContext);
    }
    if (moduleId === "k-intro") {
      return this.generateKIntroWelcome(userContext);
    }
    return this.generateGenericKWelcome(userContext);
  }

  private async generateCoachFeedback(
    analysis: AnalysisResult[],
    userStatement: string,
    challenge: string,
    levelAssessment: number,
    userId?: string,
  ): Promise<AICoachResponse> {
    if (!userId) {
      return this.buildFallbackFeedback(analysis, levelAssessment);
    }

    try {
      await this.ensureSession(userId);
      const summary = this.buildAnalysisSummaryMessage(analysis, userStatement, challenge, levelAssessment);
      const response = await AIService.sendMessage(userId, this.sessionId!, summary, "coaching");
      return this.mapAIResponseToCoach(response, "feedback", analysis);
    } catch (error) {
      console.warn("[KModuleAIService] Feedback fallback genutzt", error);
      return this.buildFallbackFeedback(analysis, levelAssessment);
    }
  }

  private buildAnalysisSummaryMessage(
    analysis: AnalysisResult[],
    userStatement: string,
    challenge: string,
    levelAssessment: number,
  ): string {
    const patternSummary = analysis
      .map((item, index) => `${index + 1}. Muster: ${item.pattern_type} – Schlüsselwort: "${item.identified_word}"`)
      .join("\n");

    return [
      "Fasse die Meta-Modell-Analyse empathisch zusammen.",
      `Originalaussage: "${userStatement}"`,
      `Aktuelle Herausforderung: ${challenge}`,
      `Empfohlenes Level: ${levelAssessment}`,
      "Gefundene Muster:",
      patternSummary || "Keine Muster identifiziert.",
      "Formuliere 2-3 kurze, klar-provokative Folgefragen (mit Fragezeichen), die Ausweichmuster minimieren und zu Präzision zwingen.",
      "Gib konkrete nächste Schritte und eine motivierende Abschlussbotschaft.",
    ].join("\n");
  }

  private buildFallbackAnalysis(
    statement: string,
    currentLevel: number,
    challenge: string,
  ): MetaModelAnalysisResult {
    const heuristics = this.performMetaModelAnalysis(statement, currentLevel);
    const mapped = this.mapHeuristicToAnalysis(heuristics);
    const feedback = this.buildFallbackFeedback(mapped, this.assessUserLevelHeuristic(heuristics, currentLevel));

    return {
      analysis: mapped,
      coachResponse: feedback,
      levelAssessment: this.assessUserLevelHeuristic(heuristics, currentLevel),
      nextSteps: feedback.nextSteps,
      metadata: {
        usedFallback: true,
        challenge,
      },
    };
  }

  private performMetaModelAnalysis(statement: string, _level: number): HeuristicAnalysis {
    const analysis: HeuristicAnalysis = {
      patterns: [],
      questions: [],
      keywords: [],
    };

    const normalized = statement.toLowerCase();

    const universal = ["alle", "jeder", "niemand", "nie", "niemals", "immer", "ständig", "jedes mal"];
    const universalMatch = universal.find((q) => normalized.includes(q));
    if (universalMatch) {
      analysis.patterns.push("Universalquantoren");
      analysis.questions.push("Alle? Wirklich immer? Nenne konkrete Ausnahmen.");
      analysis.keywords.push(universalMatch);
    }

    const causalWords = ["weil", "deshalb", "dadurch", "führt zu", "verursacht", "macht mich", "macht dass"];
    const causalMatch = causalWords.find((word) => normalized.includes(word));
    if (causalMatch) {
      analysis.patterns.push("Ursache-Wirkung-Verknüpfung");
      analysis.questions.push("Wie GENAU hängt das zusammen? Woran machst du das fest?");
      analysis.keywords.push(causalMatch);
    }

    const vagueness = ["man", "sie", "es", "das", "sowas", "die leute", "manche"];
    const vagueMatch = vagueness.find((word) => normalized.includes(word));
    if (vagueMatch || statement.length < 20) {
      analysis.patterns.push("Tilgungen / fehlende Referenzen");
      analysis.questions.push("Wer genau? Was GENAU? Wann und wo genau? Sag es präzise.");
      analysis.keywords.push(vagueMatch || "unpräzise Aussage");
    }

    const presuppositions = ["schon wieder", "endlich", "sogar", "nur", "bereits", "noch immer"];
    const presuppositionMatch = presuppositions.find((word) => normalized.includes(word));
    if (presuppositionMatch) {
      analysis.patterns.push("Vorannahmen");
      analysis.questions.push("Welche unausgesprochene Annahme steckt dahinter?");
      analysis.keywords.push(presuppositionMatch);
    }

    const modalPatterns = ["muss", "müsste", "sollte", "kann nicht", "darf nicht", "geht nicht"];
    const modalMatch = modalPatterns.find((w) => normalized.includes(w));
    if (modalMatch) {
      analysis.patterns.push("Modaloperatoren");
      analysis.questions.push("Wer sagt, dass du das musst/solltest? Was passiert, wenn du es NICHT tust?");
      analysis.keywords.push(modalMatch);
    }

    const mindReadingCues = ["denkt", "glaubt", "meint", "will", "erwartet", "finden alle"];
    const mindMatch = mindReadingCues.find((w) => normalized.includes(w));
    if (mindMatch) {
      analysis.patterns.push("Gedankenlesen");
      analysis.questions.push("Woher WEISST du das? Woran genau machst du das fest?");
      analysis.keywords.push(mindMatch);
    }

    const nominalizationRegex = /\b(\w+(ung|keit|heit|tion))\b/;
    const nomMatch = normalized.match(nominalizationRegex)?.[1];
    if (nomMatch) {
      analysis.patterns.push("Nominalisierung");
      analysis.questions.push("Wie würdest du das als VERB ausdrücken? Was GENAU tust du/andere?");
      analysis.keywords.push(nomMatch);
    }

    return analysis;
  }

  private mapHeuristicToAnalysis(heuristics: HeuristicAnalysis): AnalysisResult[] {
    return heuristics.patterns.map((pattern, index) => ({
      pattern_type: pattern,
      identified_word: heuristics.keywords[index] || pattern,
      generated_question: heuristics.questions[index] || "Kannst du das genauer beschreiben?",
    }));
  }

  private assessLevelFromAnalysis(
    analysis: AnalysisResult[],
    currentLevel: number,
    hasServerAnalysis: boolean,
  ): number {
    if (!hasServerAnalysis) {
      return Math.min(currentLevel + (analysis.length >= 3 ? 1 : 0), 5);
    }

    if (analysis.length >= 4 && currentLevel < 5) {
      return currentLevel + 1;
    }
    if (analysis.length >= 2 && currentLevel < 5) {
      return currentLevel;
    }
    return currentLevel;
  }

  private assessUserLevelHeuristic(heuristics: HeuristicAnalysis, currentLevel: number): number {
    return heuristics.patterns.length >= 3 && currentLevel < 5 ? currentLevel + 1 : currentLevel;
  }

  private buildFallbackFeedback(
    analysis: AnalysisResult[],
    levelAssessment: number,
  ): AICoachResponse {
    if (analysis.length === 0) {
      return {
        type: "feedback",
        message:
          "Spannend! Deine Aussage ist bereits sehr präzise formuliert. Bleib dran und achte weiterhin auf feine sprachliche Nuancen.",
        nextSteps: ["bewusst_reflektieren"],
        encouragement: "Deine Klarheit wächst mit jedem Schritt! 👏",
      };
    }

    const patternSummary = analysis
      .map((item, index) => `${index + 1}. ${item.pattern_type} – Schlüsselwort: "${item.identified_word}"`)
      .join("\n");

    return {
      type: "feedback",
      message: [
        "Großartig! Ich habe folgende Meta-Modell-Muster erkannt:",
        patternSummary,
        "Nutze die Fragen, um tiefer zu forschen und mehr Klarheit zu gewinnen.",
      ].join("\n\n"),
      nextSteps: [levelAssessment > 1 ? "level_fortsetzen" : "aktuelles_level_vertiefen"],
      encouragement: "Jede Analyse schärft deinen Bewusstseins-Muskel. Weiter so! 💪",
    };
  }

  private buildFallbackCoaching(
    context: string,
    userProgress: Record<string, unknown>,
  ): AICoachResponse {
    return {
      type: "guidance",
      message: `Basierend auf deinem Kontext ("${context}") empfehle ich dir, eine konkrete Situation zu wählen und das Meta-Modell bewusst anzuwenden.`,
      nextSteps: ["reflexion_vertiefen", "meta_modell_üben"],
      encouragement: "Du bist auf einem starken Weg – nutze jeden Moment für Klarheit! ✨",
    };
  }

  private mapAIResponseToCoach(
    response: AIResponse,
    type: AICoachResponse["type"],
    analysis?: AnalysisResult[],
  ): AICoachResponse {
    return {
      type,
      message: response.content,
      nextSteps: response.nextQuestions,
      encouragement: response.metadata?.encouragement,
      exercises: response.suggestions,
      metadata: {
        confidence: response.confidence,
        analysisSize: analysis?.length ?? 0,
      },
    };
  }

  private generateKIntroWelcome(context: UserContext): AICoachResponse {
    const welcomes = [
      `Hallo ${context.name}! Lass uns herausfinden, wo du gerade stehst – Klarheit öffnet jede neue Tür.`,
      `Willkommen ${context.name}! Der erste Schritt ist getan: Du schaust ehrlich hin.`,
      `Hi ${context.name}! Klarheit beginnt mit bewusster Wahrnehmung – großartig, dass du hier bist.`,
    ];

    const challengeHints: Record<string, string> = {
      "Klarheit in der Kommunikation": "Wenn du präziser sprichst, wirst du besser verstanden – das Meta-Modell hilft dir dabei.",
      "Lebensentscheidungen": "Große Entscheidungen werden leichter, sobald du deine wahren Werte erkennst.",
      "Berufliche Orientierung": "Berufliche Klarheit startet mit dem Bewusstsein über deine Stärken und Bedürfnisse.",
    };

    const challengeMessage = challengeHints[context.mainChallenge] ??
      "Jede Herausforderung wird beherrschbar, sobald du sie in klare Elemente zerlegst.";

    return {
      type: "welcome",
      message: `${this.pickRandom(welcomes)}\n\n${challengeMessage}\n\nDieses Modul unterstützt dich dabei, deine Wahrnehmung zu schärfen und bewusstere Entscheidungen zu treffen.`,
      encouragement: "Du bist bereit für Klarheit – und ich begleite dich dabei. 🌱",
    };
  }

  private generateMetaModelWelcome(context: UserContext): AICoachResponse {
    return {
      type: "welcome",
      message: [
        `Super, ${context.name}! Wir steigen jetzt in das Meta-Modell der Sprache ein – dein Werkzeug für präzise Kommunikation.`,
        "Es hilft dir, unbewusste Sprachmuster zu entlarven, bessere Fragen zu stellen und innere wie äußere Klarheit zu schaffen.",
        "Wir starten mit Level 1: Achte auf Generalisierungen wie 'alle', 'immer', 'nie'.",
      ].join("\n\n"),
      exercises: [
        "Notiere heute drei Aussagen (eigene oder fremde), die Generalisierungen enthalten.",
        "Formuliere zu jeder Aussage eine Präzisierungsfrage.",
        "Beobachte, wie sich die Wirkung der Aussage durch die Frage verändert.",
      ],
      encouragement: "Mit jedem Muster erkennst du mehr Handlungsspielraum. Du bist auf Kurs! 💡",
    };
  }

  private generateGenericKWelcome(context: UserContext): AICoachResponse {
    return {
      type: "welcome",
      message: `Willkommen ${context.name}! Klarheit ist das Fundament für nachhaltige Veränderung. Lass uns gemeinsam deinen inneren Kompass schärfen.`,
      encouragement: "Du bist genau am richtigen Ort zur richtigen Zeit. 🎯",
    };
  }

  async analyzeLifeWheel(
    lifeWheelAreas: Array<{ name: string; currentValue: number; targetValue: number }>,
    userId?: string,
  ): Promise<AICoachResponse> {
    if (!lifeWheelAreas || lifeWheelAreas.length === 0) {
      return {
        type: "guidance",
        message: "Bewerte zunächst dein Lebensrad, damit ich dir personalisierte Insights geben kann.",
        encouragement: "Sei ehrlich zu dir selbst – das ist der erste Schritt zur Klarheit! 🎯",
      };
    }

    // Finde niedrigste und höchste Bereiche
    const sortedByValue = [...lifeWheelAreas].sort((a, b) => a.currentValue - b.currentValue);
    const lowestAreas = sortedByValue.slice(0, 2);
    const highestAreas = sortedByValue.slice(-2).reverse();
    
    // Berechne Gaps (Differenz zwischen IST und SOLL)
    const areasWithGaps = lifeWheelAreas
      .map(area => ({
        ...area,
        gap: area.targetValue - area.currentValue,
      }))
      .sort((a, b) => b.gap - a.gap);
    
    const biggestGaps = areasWithGaps.slice(0, 2);

    // Generiere personalisierte Insights
    const lowestAreaNames = lowestAreas.map(a => a.name).join(" und ");
    const highestAreaNames = highestAreas.map(a => a.name).join(" und ");
    const gapAreaNames = biggestGaps.map(a => a.name).join(" und ");

    const insights = [
      `Ich sehe, dass **${lowestAreaNames}** aktuell deine größten Herausforderungen sind.`,
      `Gleichzeitig läuft es in **${highestAreaNames}** bereits gut – das sind deine Ressourcen-Bereiche.`,
      `Die größte Diskrepanz zwischen IST und SOLL zeigt sich bei **${gapAreaNames}**.`,
    ];

    const questions = [
      `Was GENAU hält dich davon ab, in ${lowestAreas[0].name} heute aktiv zu werden?`,
      `Welche ganz konkrete Ressource aus ${highestAreas[0].name} überträgst du diese Woche auf ${lowestAreas[0].name}?`,
      `Welche Ausrede erzählst du dir aktuell bei ${biggestGaps[0].name} – und was ist der kleinste Schritt trotz dieser Ausrede?`,
    ];

    // Versuche AI-Service zu nutzen, falls userId vorhanden
    if (userId) {
      try {
        await this.ensureSession(userId);
        const prompt = [
          "Analysiere das Lebensrad des Nutzers und gib empathische, handlungsorientierte Insights.",
          `Niedrigste Bereiche: ${lowestAreaNames}`,
          `Höchste Bereiche: ${highestAreaNames}`,
          `Größte Gaps: ${gapAreaNames}`,
          "Stelle 2-3 präzise Meta-Modell-Fragen, die zur Selbstreflexion anregen.",
        ].join("\n");

        const response = await AIService.sendMessage(userId, this.sessionId!, prompt, "coaching");
        return this.mapAIResponseToCoach(response, "analysis");
      } catch (error) {
        console.warn("[KModuleAIService] LifeWheel analysis fallback genutzt", error);
      }
    }

    // Fallback: Heuristische Analyse
    return {
      type: "analysis",
      message: insights.join("\n\n"),
      exercises: questions,
      encouragement: "Klarheit über deine IST-Situation ist der erste Schritt zur Veränderung. Du bist auf dem richtigen Weg! 💪",
      metadata: {
        lowestAreas: lowestAreas.map(a => a.name),
        highestAreas: highestAreas.map(a => a.name),
        biggestGaps: biggestGaps.map(a => ({ name: a.name, gap: a.gap })),
      },
    };
  }

  private pickRandom<T>(values: T[]): T {
    return values[Math.floor(Math.random() * values.length)];
  }

  getSessionInfo(): {
    sessionId: string | null;
    userId: string | null;
    moduleId: string | null;
  } {
    return {
      sessionId: this.sessionId,
      userId: this.currentUserId,
      moduleId: this.activeModuleId,
    };
  }
}

export default KModuleAIService;
