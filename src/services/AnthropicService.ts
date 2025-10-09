// src/services/AnthropicService.ts
import Anthropic from "@anthropic-ai/sdk";
import { ANTHROPIC_API_KEY } from "@env";

/**
 * Anthropic Claude Service für KLARE-App
 * Wrapper für Anthropic API mit Error Handling und Fallback
 */
export class AnthropicService {
  private static client: Anthropic | null = null;
  private static isAvailable: boolean = false;

  /**
   * Initialisiert den Anthropic Client
   */
  private static initializeClient(): void {
    if (this.client) return;

    try {
      if (!ANTHROPIC_API_KEY || ANTHROPIC_API_KEY === "sk-ant-api03-your-key-here") {
        console.warn("⚠️ ANTHROPIC_API_KEY nicht konfiguriert. Fallback auf Mock-Responses.");
        this.isAvailable = false;
        return;
      }

      this.client = new Anthropic({
        apiKey: ANTHROPIC_API_KEY,
      });
      this.isAvailable = true;
      console.log("✅ Anthropic Client erfolgreich initialisiert");
    } catch (error) {
      console.error("❌ Fehler beim Initialisieren des Anthropic Clients:", error);
      this.isAvailable = false;
    }
  }

  /**
   * Prüft ob Anthropic API verfügbar ist
   */
  static isServiceAvailable(): boolean {
    this.initializeClient();
    return this.isAvailable;
  }

  /**
   * Generiert eine AI-Antwort mit Claude
   */
  static async generateResponse(params: {
    systemPrompt: string;
    userMessage: string;
    conversationHistory?: Array<{ role: "user" | "assistant"; content: string }>;
    maxTokens?: number;
    temperature?: number;
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
      throw new Error("Anthropic Service nicht verfügbar");
    }

    const {
      systemPrompt,
      userMessage,
      conversationHistory = [],
      maxTokens = 1024,
      temperature = 0.7,
      model = "claude-3-5-sonnet-20241022",
    } = params;

    try {
      // Build messages array
      const messages: Array<{ role: "user" | "assistant"; content: string }> = [
        ...conversationHistory,
        { role: "user", content: userMessage },
      ];

      const response = await this.client.messages.create({
        model,
        max_tokens: maxTokens,
        temperature,
        system: systemPrompt,
        messages,
      });

      const content = response.content[0];
      if (content.type !== "text") {
        throw new Error("Unexpected response type from Claude");
      }

      return {
        content: content.text,
        usage: {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
        },
        stopReason: response.stop_reason,
      };
    } catch (error) {
      console.error("❌ Fehler bei Claude API Call:", error);
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
      throw new Error("Anthropic Service nicht verfügbar");
    }

    const { areaName, areaDescription, currentValue, targetValue, userContext } = params;

    const systemPrompt = `Du bist ein einfühlsamer Life Coach, der die KLARE-Methode verwendet. 
Deine Aufgabe ist es, präzise, motivierende Coaching-Fragen zu stellen, die zur Selbstreflexion anregen.
Verwende die Du-Form und stelle genau EINE konkrete Frage.
Die Frage sollte kurz (max. 20 Wörter), kraftvoll und auf Deutsch sein.`;

    let userMessage = `Stelle eine Coaching-Frage zum Lebensbereich "${areaName}".`;
    
    if (areaDescription) {
      userMessage += ` Kontext: ${areaDescription}`;
    }
    
    if (currentValue !== undefined && targetValue !== undefined) {
      userMessage += ` Der Klient bewertet sich aktuell mit ${currentValue}/10 und möchte auf ${targetValue}/10 kommen.`;
    }

    try {
      const response = await this.generateResponse({
        systemPrompt,
        userMessage,
        maxTokens: 150,
        temperature: 0.8,
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
      throw new Error("Anthropic Service nicht verfügbar");
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
      .map((item) => `${item.area}: Ist ${item.currentValue}/10, Ziel ${item.targetValue}/10`)
      .join("\n");

    const userMessage = `Analysiere diese LifeWheel-Daten:\n\n${lifeWheelSummary}`;

    try {
      const response = await this.generateResponse({
        systemPrompt,
        userMessage,
        maxTokens: 800,
        temperature: 0.7,
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
      throw new Error("Anthropic Service nicht verfügbar");
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
        maxTokens: 100,
        temperature: 0.9,
      });

      return response.content.trim();
    } catch (error) {
      console.error("❌ Fehler beim Generieren der Journal-Prompt:", error);
      throw error;
    }
  }

  /**
   * Health Check für Anthropic Service
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
        maxTokens: 10,
      });

      return {
        available: true,
        model: "claude-3-5-sonnet-20241022",
        responseTime: Date.now() - startTime,
      };
    } catch (error) {
      return {
        available: false,
        model: "claude-3-5-sonnet-20241022",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}

export default AnthropicService;
