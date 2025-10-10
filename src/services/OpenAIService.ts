// src/services/OpenAIService.ts
import OpenAI from "openai";
import { OPENAI_API_KEY } from "@env";

/**
 * OpenAI GPT Service für KLARE-App
 * Wrapper für OpenAI API mit Error Handling und Fallback
 */
export class OpenAIService {
  private static client: OpenAI | null = null;
  private static isAvailable: boolean = false;

  /**
   * Initialisiert den OpenAI Client
   */
  private static initializeClient(): void {
    if (this.client) return;

    try {
      console.log(`🔑 OPENAI_API_KEY Status: ${OPENAI_API_KEY ? `Gefunden (${OPENAI_API_KEY.substring(0, 10)}...)` : 'NICHT GEFUNDEN'}`);
      
      if (!OPENAI_API_KEY || OPENAI_API_KEY === "sk-your-openai-key-here") {
        console.warn(
          "⚠️ OPENAI_API_KEY nicht konfiguriert. Fallback auf Mock-Responses.",
        );
        this.isAvailable = false;
        return;
      }

      this.client = new OpenAI({
        apiKey: OPENAI_API_KEY,
      });
      this.isAvailable = true;
      console.log("✅ OpenAI Client erfolgreich initialisiert");
    } catch (error) {
      console.error("❌ Fehler beim Initialisieren des OpenAI Clients:", error);
      this.isAvailable = false;
    }
  }

  /**
   * Prüft ob OpenAI API verfügbar ist
   */
  static isServiceAvailable(): boolean {
    this.initializeClient();
    return this.isAvailable;
  }

  /**
   * Generiert eine AI-Antwort mit GPT
   */
  static async generateResponse(params: {
    systemPrompt: string;
    userMessage: string;
    conversationHistory?: Array<{
      role: "user" | "assistant";
      content: string;
    }>;
    max_output_tokens?: number;
    model?: string;
  }): Promise<{
    content: string;
    usage: {
      inputTokens: number;
      outputTokens: number;
    };
    stopReason: string | null;
  }> {
    this.initializeClient();

    if (!this.isAvailable || !this.client) {
      throw new Error("OpenAI Service nicht verfügbar");
    }

    const {
      systemPrompt,
      userMessage,
      conversationHistory = [],
      max_output_tokens = 1024,
      model = "gpt-4o-mini",
    } = params;

    try {
      // Build messages array
      const messages: Array<{
        role: "system" | "user" | "assistant";
        content: string;
      }> = [
        { role: "system", content: systemPrompt },
        ...conversationHistory.map((msg) => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        })),
        { role: "user", content: userMessage },
      ];

      const response = await this.client.chat.completions.create({
        model,
        max_completion_tokens: max_output_tokens,
        temperature: 0.7,
        messages,
      });

      console.log(`📦 OpenAI Response:`, {
        choices: response.choices?.length,
        firstChoice: response.choices[0]?.message?.content?.substring(0, 100),
        finishReason: response.choices[0]?.finish_reason,
        usage: response.usage,
      });

      const content = response.choices[0]?.message?.content || "";

      if (!content) {
        console.error("❌ OpenAI returned empty content!");
      }

      return {
        content,
        usage: {
          inputTokens: response.usage?.prompt_tokens || 0,
          outputTokens: response.usage?.completion_tokens || 0,
        },
        stopReason: response.choices[0]?.finish_reason || null,
      };
    } catch (error) {
      console.error("❌ Fehler bei OpenAI API Call:", error);
      throw error;
    }
  }

  /**
   * Generiert eine kurze Coaching-Frage
   * Optimiert für LifeWheel Setup
   */
  static async generateCoachingQuestion(params: {
    areaName: string;
    areaDescription?: string;
    currentValue?: number;
    targetValue?: number;
    userContext?: Record<string, any>;
  }): Promise<string> {
    this.initializeClient();

    if (!this.isAvailable || !this.client) {
      throw new Error("OpenAI Service nicht verfügbar");
    }

    const {
      areaName,
      areaDescription,
      currentValue,
      targetValue,
      userContext,
    } = params;

    // Check if this is an initial question (no previous questions)
    const isInitialQuestion = userContext?.isInitialQuestion === true;
    const userAge = userContext?.userAge;
    const userPreferences = userContext?.userPreferences;
    const previousQuestions = userContext?.previousQuestions || [];

    const systemPrompt = `Du bist ein einfühlsamer Life Coach, der die KLARE-Methode verwendet. 
Deine Aufgabe ist es, präzise, motivierende Coaching-Fragen zu stellen, die zur Selbstreflexion anregen.
Verwende die Du-Form und stelle genau EINE konkrete Frage.
Die Frage sollte kurz (max. 20 Wörter), kraftvoll und auf Deutsch sein.`;

    let userMessage = `Stelle eine Coaching-Frage zum Lebensbereich "${areaName}".`;

    if (areaDescription) {
      userMessage += ` Kontext: ${areaDescription}`;
    }

    // For initial questions: only use age and basic preferences
    if (isInitialQuestion) {
      if (userAge) {
        userMessage += ` Der Klient ist ${userAge} Jahre alt.`;
      }
      if (userPreferences) {
        userMessage += ` Präferenzen: ${JSON.stringify(userPreferences)}`;
      }
      userMessage += ` Dies ist die erste Frage zu diesem Bereich. Stelle eine grundlegende, offene Einstiegsfrage.`;
    } else {
      // For follow-up questions: include current/target values
      if (currentValue !== undefined && targetValue !== undefined) {
        userMessage += ` Der Klient bewertet sich aktuell mit ${currentValue}/10 und möchte auf ${targetValue}/10 kommen.`;
      }
      
      // Avoid repeating previous questions
      if (previousQuestions.length > 0) {
        userMessage += ` Vermeide diese bereits gestellten Fragen: ${previousQuestions.slice(-3).join("; ")}`;
      }
    }

    try {
      const response = await this.generateResponse({
        systemPrompt,
        userMessage,
        max_output_tokens: 150,
      });

      return response.content.trim();
    } catch (error) {
      console.error("❌ Fehler beim Generieren der Coaching-Frage:", error);
      throw error;
    }
  }

  /**
   * Generiert personalisierte Insights basierend auf LifeWheel Daten
   */
  static async generateLifeWheelInsights(params: {
    lifeWheelData: Array<{
      area: string;
      currentValue: number;
      targetValue: number;
    }>;
    userContext?: Record<string, any>;
  }): Promise<{
    insights: Array<{
      title: string;
      description: string;
      priority: "high" | "medium" | "low";
      relatedAreas: string[];
    }>;
    recommendations: string[];
  }> {
    this.initializeClient();

    if (!this.isAvailable || !this.client) {
      throw new Error("OpenAI Service nicht verfügbar");
    }

    const { lifeWheelData } = params;

    const systemPrompt = `Du bist ein erfahrener Life Coach mit Expertise in der KLARE-Methode.
Analysiere die LifeWheel-Daten des Klienten und erstelle:
1. 2-3 prägnante Insights über erkennbare Muster
2. 3-5 konkrete, umsetzbare Empfehlungen

Antworte im JSON-Format mit deutscher Sprache:
{
  "insights": [
    {
      "title": "Kurzer Titel",
      "description": "Beschreibung des Musters",
      "priority": "high/medium/low",
      "relatedAreas": ["bereich1", "bereich2"]
    }
  ],
  "recommendations": ["Empfehlung 1", "Empfehlung 2", ...]
}`;

    const lifeWheelSummary = lifeWheelData
      .map(
        (item) =>
          `${item.area}: Ist ${item.currentValue}/10, Ziel ${item.targetValue}/10`,
      )
      .join("\n");

    const userMessage = `Analysiere diese LifeWheel-Daten:\n\n${lifeWheelSummary}`;

    try {
      const response = await this.generateResponse({
        systemPrompt,
        userMessage,
        max_output_tokens: 800,
      });

      // Parse JSON response
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Keine gültige JSON-Antwort erhalten");
      }

      const parsed = JSON.parse(jsonMatch[0]);
      return parsed;
    } catch (error) {
      console.error("❌ Fehler beim Generieren der Insights:", error);
      throw error;
    }
  }

  /**
   * Generiert eine personalisierte Journal-Prompt
   */
  static async generateJournalPrompt(params: {
    userContext?: Record<string, any>;
    recentTopics?: string[];
    lifeWheelFocus?: string;
  }): Promise<string> {
    this.initializeClient();

    if (!this.isAvailable || !this.client) {
      throw new Error("OpenAI Service nicht verfügbar");
    }

    const { recentTopics = [], lifeWheelFocus } = params;

    const systemPrompt = `Du bist ein einfühlsamer Journaling-Coach.
Erstelle EINE kurze, inspirierende Journaling-Frage auf Deutsch.
Die Frage sollte zur Selbstreflexion anregen und max. 25 Wörter haben.`;

    let userMessage = "Erstelle eine Journaling-Frage für heute.";

    if (lifeWheelFocus) {
      userMessage += ` Fokus: ${lifeWheelFocus}`;
    }

    if (recentTopics.length > 0) {
      userMessage += ` Vermeide diese kürzlich verwendeten Themen: ${recentTopics.join(", ")}`;
    }

    try {
      const response = await this.generateResponse({
        systemPrompt,
        userMessage,
        max_output_tokens: 100,
      });

      return response.content.trim();
    } catch (error) {
      console.error("❌ Fehler beim Generieren der Journal-Prompt:", error);
      throw error;
    }
  }

  /**
   * Health Check für OpenAI Service
   */
  static async healthCheck(): Promise<{
    available: boolean;
    model: string;
    responseTime?: number;
    error?: string;
  }> {
    this.initializeClient();

    if (!this.isAvailable || !this.client) {
      return {
        available: false,
        model: "N/A",
        error: "Service nicht konfiguriert",
      };
    }

    const startTime = Date.now();
    try {
      await this.generateResponse({
        systemPrompt: "Du bist ein Test-Assistent.",
        userMessage: "Antworte mit 'OK'",
        max_output_tokens: 10,
      });

      return {
        available: true,
        model: "gpt-4o-mini",
        responseTime: Date.now() - startTime,
      };
    } catch (error) {
      return {
        available: false,
        model: "gpt-4o-mini",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}

export default OpenAIService;
