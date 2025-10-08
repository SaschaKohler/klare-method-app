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
      analysis.questions.push("Alle? Gibt es Ausnahmen? Bitte differenzieren.");
      analysis.keywords.push(universalMatch);
    }

    const causalWords = ["weil", "deshalb", "dadurch", "führt zu", "verursacht", "macht mich", "macht dass"];
    const causalMatch = causalWords.find((word) => normalized.includes(word));
    if (causalMatch) {
      analysis.patterns.push("Ursache-Wirkung-Verknüpfung");
      analysis.questions.push("Wie genau hängt das eine mit dem anderen zusammen?");
      analysis.keywords.push(causalMatch);
    }

    const vagueness = ["man", "sie", "es", "das", "sowas", "die leute", "manche"];
    const vagueMatch = vagueness.find((word) => normalized.includes(word));
    if (vagueMatch || statement.length < 20) {
      analysis.patterns.push("Tilgungen / fehlende Referenzen");
      analysis.questions.push("Wer genau? Was genau? Wann genau?");
      analysis.keywords.push(vagueMatch || "unpräzise Aussage");
    }

    const presuppositions = ["schon wieder", "endlich", "sogar", "nur", "bereits", "noch immer"];
    const presuppositionMatch = presuppositions.find((word) => normalized.includes(word));
    if (presuppositionMatch) {
      analysis.patterns.push("Vorannahmen");
      analysis.questions.push("Welche unausgesprochene Annahme steckt dahinter?");
      analysis.keywords.push(presuppositionMatch);
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

  private pickRandom<T>(values: T[]): T {
    return values[Math.floor(Math.random() * values.length)];
  }
}

export default KModuleAIService;
