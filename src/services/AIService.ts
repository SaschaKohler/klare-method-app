// src/services/AIService.ts
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";

import { supabase } from "../lib/supabase";
import { Database } from "../types/supabase";
import { OpenAIService } from "./OpenAIService";
import { LifeWheelReflectionService } from "./LifeWheelReflectionService";

// Type Definitions
type AIConversation = Database["public"]["Tables"]["ai_conversations"]["Row"];
type AIPromptTemplate = Database["public"]["Tables"]["ai_prompt_templates"]["Row"];
type PersonalInsight = Database["public"]["Tables"]["personal_insights"]["Row"];

export interface AIConversationCreate {
  userId: string;
  sessionId: string;
  conversationType: "chat" | "coaching" | "insight_generation" | "content_personalization";
  messageType: "user" | "assistant" | "system";
  messageContent: string;
  promptTemplateId?: string;
  aiModel?: string;
  generationMetadata?: Record<string, any>;
}

export interface AIPromptTemplateCreate {
  templateName: string;
  promptType: "coaching_question" | "insight_generation" | "content_personalization" | "exercise_adaptation";
  promptTemplate: string;
  moduleReference?: string;
  targetUserProfiles?: Record<string, any>;
  personalizationFactors?: string[];
  modelSettings?: Record<string, any>;
  variables?: Record<string, any>;
  difficultyRange?: number[];
  safetyFilters?: string[];
  priority?: number;
}

export interface PersonalInsightCreate {
  userId: string;
  title: string;
  description: string;
  insightType: "pattern" | "breakthrough" | "resistance" | "growth" | "recommendation";
  source: "user" | "ai_generated" | "ai_suggested";
  relatedAreas?: string[];
  relatedModules?: string[];
  supportingEvidence?: string[];
  confidenceScore?: number;
  aiModel?: string;
}

export interface ChatContext {
  userId: string;
  currentLifeWheelData?: Record<string, any>;
  recentJournalEntries?: any[];
  completedModules?: string[];
  personalityTraits?: Record<string, any>;
  currentGoals?: string[];
  preferredLanguage?: string;
  // Neue erweiterte Kontext-Felder
  userAnswers?: any[]; // Letzte User-Antworten
  exerciseResults?: any[]; // Letzte Übungsergebnisse
  keyThemes?: string[]; // Häufigste Themen aus Antworten
  emotionalState?: string[]; // Emotionale Tags
  patterns?: Array<{ type: string; confidence: number }>; // Erkannte Muster
}

export interface AIResponse {
  content: string;
  confidence: number;
  suggestions?: string[];
  insights?: PersonalInsightCreate[];
  nextQuestions?: string[];
  metadata?: Record<string, any>;
}

/**
 * AI Service für KLARE-App
 * Verbindet AI-Funktionalität mit Supabase Backend
 */
export class AIService {
  
  // =============================================================================
  // CONVERSATION MANAGEMENT
  // =============================================================================
  
  /**
   * Startet eine neue AI-Konversation
   */
  static async startConversation(
    userId: string,
    conversationType: AIConversationCreate["conversationType"],
    initialMessage?: string
  ): Promise<{ sessionId: string; response?: AIResponse }> {
    try {
      const sessionId = uuidv4();
      
      // System Message für Kontext
      await this.saveMessage({
        userId,
        sessionId,
        conversationType,
        messageType: "system",
        messageContent: this.getSystemPrompt(conversationType),
        aiModel: "gpt-4"
      });
      
      // Initial User Message (optional)
      if (initialMessage) {
        await this.saveMessage({
          userId,
          sessionId,
          conversationType,
          messageType: "user",
          messageContent: initialMessage
        });
        
        // Generate AI Response
        const context = await this.buildChatContext(userId);
        const response = await this.generateResponse(initialMessage, context, conversationType);
        
        // Save AI Response
        await this.saveMessage({
          userId,
          sessionId,
          conversationType,
          messageType: "assistant",
          messageContent: response.content,
          aiModel: "gpt-4",
          generationMetadata: response.metadata
        });
        
        return { sessionId, response };
      }

      return { sessionId };
    } catch (error) {
      console.error("Error starting conversation:", error);
      throw new Error("Failed to start AI conversation");
    }
  }
  
  /**
   * Sendet eine Nachricht und erhält AI-Antwort
   */
  static async sendMessage(
    userId: string,
    sessionId: string,
    message: string,
    conversationType: AIConversationCreate["conversationType"]
  ): Promise<AIResponse> {
    try {
      // Save User Message
      await this.saveMessage({
        userId,
        sessionId,
        conversationType,
        messageType: "user",
        messageContent: message
      });
      
      // Build Context
      const context = await this.buildChatContext(userId);
      const conversationHistory = await this.getConversationHistory(sessionId);
      
      // Generate Response
      const response = await this.generateResponse(
        message, 
        context, 
        conversationType, 
        conversationHistory
      );
      
      // Save AI Response
      await this.saveMessage({
        userId,
        sessionId,
        conversationType,
        messageType: "assistant",
        messageContent: response.content,
        aiModel: "gpt-4",
        generationMetadata: response.metadata
      });
      
      // Save any generated insights
      if (response.insights && response.insights.length > 0) {
        for (const insight of response.insights) {
          await this.createPersonalInsight(insight);
        }
      }
      
      return response;
    } catch (error) {
      console.error("Error sending message:", error);
      throw new Error("Failed to process message");
    }
  }
  
  /**
   * Speichert eine Nachricht in der Datenbank
   */
  static async saveMessage(messageData: AIConversationCreate): Promise<AIConversation> {
    const { data, error } = await supabase
      .from("ai_conversations")
      .insert({
        user_id: messageData.userId,
        session_id: messageData.sessionId,
        conversation_type: messageData.conversationType,
        message_type: messageData.messageType,
        message_content: messageData.messageContent,
        prompt_template_id: messageData.promptTemplateId,
        ai_model: messageData.aiModel,
        generation_metadata: messageData.generationMetadata
      })
      .select()
      .single();
    
    if (error) {
      console.error("Error saving message:", error);
      throw new Error("Failed to save message");
    }
    
    return data;
  }

  static async getPromptTemplateForModule(
    promptType: string,
    moduleReference?: string,
  ): Promise<AIPromptTemplate | null> {
    if (!moduleReference) {
      return this.getPromptTemplate(promptType);
    }

    try {
      const { data, error } = await supabase
        .from("ai_prompt_templates")
        .select("*")
        .eq("prompt_type", promptType)
        .eq("module_reference", moduleReference)
        .eq("is_active", true)
        .order("priority", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        console.warn("Error fetching module-specific prompt template:", error);
      }

      if (data) {
        return data;
      }
    } catch (error) {
      console.warn("Error fetching module-specific prompt template:", error);
    }

    return this.getPromptTemplate(promptType);
  }
  
  /**
   * Holt Konversationsverlauf
   */
  static async getConversationHistory(sessionId: string): Promise<AIConversation[]> {
    const { data, error } = await supabase
      .from("ai_conversations")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });
    
    if (error) {
      console.error("Error fetching conversation history:", error);
      return [];
    }
    
    return data || [];
  }
  
  // =============================================================================
  // USER SESSION MANAGEMENT
  // =============================================================================
  
  /**
   * Lädt alle Sessions für einen User
   */
  static async getUserSessions(userId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from("ai_conversations")
        .select("session_id")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      // Return unique session IDs
      const uniqueSessionIds = [...new Set(data?.map(row => row.session_id) || [])];
      return uniqueSessionIds;
    } catch (error) {
      console.error("Error loading user sessions:", error);
      return [];
    }
  }
  
  /**
   * Löscht eine Session und alle zugehörigen Nachrichten
   */
  static async deleteSession(sessionId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("ai_conversations")
        .delete()
        .eq("session_id", sessionId);
      
      if (error) throw error;
    } catch (error) {
      console.error("Error deleting session:", error);
      throw error;
    }
  }
  
  // =============================================================================
  // PERSONAL INSIGHTS
  // =============================================================================
  
  /**
   * Erstellt einen Personal Insight
   */
  static async createPersonalInsight(insightData: PersonalInsightCreate): Promise<PersonalInsight> {
    const { data, error } = await supabase
      .from("personal_insights")
      .insert({
        user_id: insightData.userId,
        title: insightData.title,
        description: insightData.description,
        insight_type: insightData.insightType,
        source: insightData.source,
        related_areas: insightData.relatedAreas,
        related_modules: insightData.relatedModules,
        supporting_evidence: insightData.supportingEvidence,
        confidence_score: insightData.confidenceScore,
        ai_model: insightData.aiModel
      })
      .select()
      .single();
    
    if (error) {
      console.error("Error creating insight:", error);
      throw new Error("Failed to create insight");
    }
    
    return data;
  }
  
  /**
   * Holt alle Insights für einen User
   */
  static async getUserInsights(userId: string): Promise<PersonalInsight[]> {
    const { data, error } = await supabase
      .from("personal_insights")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true)
      .order("created_at", { ascending: false });
    
    if (error) {
      console.error("Error fetching insights:", error);
      return [];
    }
    
    return data || [];
  }
  
  /**
   * Generiert AI-Insights basierend auf User-Daten
   */
  static async generateInsights(userId: string): Promise<PersonalInsight[]> {
    try {
      const context = await this.buildChatContext(userId);
      
      // Use specialized prompt for insight generation
      const prompt = await this.getPromptTemplate("insight_generation");
      if (!prompt) {
        throw new Error("Insight generation template not found");
      }
      
      const response = await this.generateResponse(
        "Generiere persönliche Insights basierend auf meinen Daten.",
        context,
        "insight_generation"
      );
      
      const insights: PersonalInsight[] = [];
      
      if (response.insights) {
        for (const insightData of response.insights) {
          const insight = await this.createPersonalInsight(insightData);
          insights.push(insight);
        }
      }
      
      return insights;
    } catch (error) {
      console.error("Error generating insights:", error);
      return [];
    }
  }
  
  // =============================================================================
  // PROMPT TEMPLATES
  // =============================================================================
  
  /**
   * Erstellt ein neues Prompt Template
   */
  static async createPromptTemplate(templateData: AIPromptTemplateCreate): Promise<AIPromptTemplate> {
    const { data, error } = await supabase
      .from("ai_prompt_templates")
      .insert({
        template_name: templateData.templateName,
        prompt_type: templateData.promptType,
        prompt_template: templateData.promptTemplate,
        module_reference: templateData.moduleReference,
        target_user_profiles: templateData.targetUserProfiles,
        personalization_factors: templateData.personalizationFactors,
        model_settings: templateData.modelSettings,
        variables: templateData.variables,
        difficulty_range: templateData.difficultyRange,
        safety_filters: templateData.safetyFilters,
        priority: templateData.priority || 1
      })
      .select()
      .single();
    
    if (error) {
      console.error("Error creating prompt template:", error);
      throw new Error("Failed to create prompt template");
    }
    
    return data;
  }
  
  /**
   * Holt ein Prompt Template
   */
  static async getPromptTemplate(promptType: string): Promise<AIPromptTemplate | null> {
    const { data, error } = await supabase
      .from("ai_prompt_templates")
      .select("*")
      .eq("prompt_type", promptType)
      .eq("is_active", true)
      .order("priority", { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (error) {
      console.error("Error fetching prompt template:", error);
      return null;
    }
    
    return data;
  }
  
  // =============================================================================
  // CONTEXT BUILDING
  // =============================================================================
  
  /**
   * Baut Kontext für AI-Antworten auf
   * ERWEITERT: Nutzt jetzt user_answers und exercise_results für granulierte Personalisierung
   */
  static async buildChatContext(userId: string): Promise<ChatContext> {
    try {
      // Fetch user profile (inkl. Onboarding-Daten)
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", userId)
        .single();
      
      // Fetch latest life wheel snapshot
      const { data: lifeWheelSnapshot } = await supabase
        .from("life_wheel_snapshots")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      
      // Fetch recent journal entries
      const { data: journalEntries } = await supabase
        .from("journal_entries")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5);
      
      // NEU: Fetch recent user answers für Kontext
      const { data: userAnswers } = await supabase
        .from("user_answers")
        .select("question_text, answer_text, key_themes, emotion_tags, answered_at")
        .eq("user_id", userId)
        .order("answered_at", { ascending: false })
        .limit(20);
      
      // NEU: Fetch recent exercise results
      const { data: exerciseResults } = await supabase
        .from("exercise_results")
        .select("exercise_type, completion_status, score, completed_at")
        .eq("user_id", userId)
        .eq("completion_status", "completed")
        .order("completed_at", { ascending: false })
        .limit(10);
      
      // NEU: Fetch completed modules
      const { data: completedModules } = await supabase
        .from("completed_modules")
        .select("module_id")
        .eq("user_id", userId);
      
      // NEU: Fetch active patterns
      const { data: patterns } = await supabase
        .from("user_patterns")
        .select("pattern_type, confidence_score")
        .eq("user_id", userId)
        .eq("is_active", true);
      
      // Extrahiere häufigste Themen aus Antworten
      const themeCount = new Map<string, number>();
      const emotionSet = new Set<string>();
      
      userAnswers?.forEach(answer => {
        answer.key_themes?.forEach((theme: string) => {
          themeCount.set(theme, (themeCount.get(theme) || 0) + 1);
        });
        answer.emotion_tags?.forEach((emotion: string) => {
          emotionSet.add(emotion);
        });
      });
      
      const topThemes = Array.from(themeCount.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([theme]) => theme);
      
      return {
        userId,
        currentLifeWheelData: lifeWheelSnapshot?.snapshot_data as Record<string, any>,
        recentJournalEntries: journalEntries || [],
        completedModules: completedModules?.map(m => m.module_id) || [],
        personalityTraits: profile?.personality_traits as Record<string, any>,
        currentGoals: profile?.primary_goals || [],
        preferredLanguage: profile?.preferred_language || "de",
        // Erweiterte Kontext-Daten
        userAnswers: userAnswers || [],
        exerciseResults: exerciseResults || [],
        keyThemes: topThemes,
        emotionalState: Array.from(emotionSet),
        patterns: patterns?.map(p => ({ 
          type: p.pattern_type, 
          confidence: p.confidence_score || 0 
        })) || [],
      };
    } catch (error) {
      console.error("Error building chat context:", error);
      return { userId };
    }
  }
  
  // =============================================================================
  // AI RESPONSE GENERATION (MOCK/FALLBACK)
  // =============================================================================
  
  /**
   * Generiert AI-Antwort mit OpenAI GPT oder Fallback
   */
  private static async generateResponse(
    message: string,
    context: ChatContext,
    conversationType: string,
    conversationHistory?: AIConversation[]
  ): Promise<AIResponse> {
    const startTime = Date.now();

    // Try OpenAI API first
    if (OpenAIService.isServiceAvailable()) {
      try {
        const systemPrompt = this.getSystemPrompt(conversationType);
        
        // Build conversation history for OpenAI
        const aiHistory: Array<{ role: "user" | "assistant"; content: string }> = [];
        if (conversationHistory) {
          conversationHistory
            .filter(msg => msg.message_type !== "system")
            .forEach(msg => {
              aiHistory.push({
                role: msg.message_type as "user" | "assistant",
                content: msg.message_content,
              });
            });
        }

        // Add context to message
        let enrichedMessage = message;
        if (context.currentLifeWheelData) {
          enrichedMessage += `\n\nKontext: Aktuelle LifeWheel-Daten verfügbar.`;
        }

        const response = await OpenAIService.generateResponse({
          systemPrompt,
          userMessage: enrichedMessage,
          conversationHistory: aiHistory,
          max_output_tokens: 500,
        });

        return {
          content: response.content,
          confidence: 0.9,
          suggestions: this.extractSuggestions(response.content),
          nextQuestions: this.extractQuestions(response.content),
          metadata: {
            responseTime: Date.now() - startTime,
            contextUsed: Object.keys(context).length,
            conversationType,
            aiModel: "gpt-4o-mini",
            inputTokens: response.usage.inputTokens,
            outputTokens: response.usage.outputTokens,
          },
        };
      } catch (error) {
        console.warn("⚠️ OpenAI API Fehler, nutze Fallback:", error);
        // Fall through to fallback
      }
    }

    // FALLBACK: Mock Response für Development oder wenn API nicht verfügbar
    console.log("ℹ️ Verwende Mock-Responses (OpenAI nicht verfügbar)");
    
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
    
    const responses = {
      chat: [
        "Das ist eine interessante Frage. Basierend auf deinem aktuellen LifeWheel sehe ich, dass du dich auf [Bereich] fokussieren könntest.",
        "Ich verstehe deine Situation. Lass uns gemeinsam schauen, wie du hier weiterkommen kannst.",
        "Das klingt nach einem wichtigen Schritt in deiner Entwicklung. Was denkst du ist der erste kleine Schritt?"
      ],
      coaching: [
        "Welche drei Dinge würden sich in deinem Leben am positivsten verändern, wenn du dieses Ziel erreichst?",
        "Was würde jemand, der dich gut kennt, zu dieser Situation sagen?",
        "Wenn du auf diese Zeit in einem Jahr zurückblickst - was möchtest du dann erreicht haben?"
      ],
      insight_generation: [
        "Ich erkenne ein Muster in deinen Antworten: Du scheinst sehr selbstreflektiert zu sein, aber manchmal zögerst du bei der Umsetzung.",
        "Deine Stärke liegt in der analytischen Herangehensweise. Gleichzeitig könnte mehr Spontaneität dir neue Perspektiven eröffnen."
      ]
    };
    
    const typeResponses = responses[conversationType as keyof typeof responses] || responses.chat;
    const randomResponse = typeResponses[Math.floor(Math.random() * typeResponses.length)];
    
    const insights: PersonalInsightCreate[] = [];
    
    // Generate insights for insight_generation type
    if (conversationType === "insight_generation") {
      insights.push({
        userId: context.userId,
        title: "Entwicklungsmuster erkannt",
        description: "Du zeigst eine starke Tendenz zur Selbstreflexion, könntest aber von mehr praktischer Umsetzung profitieren.",
        insightType: "pattern",
        source: "ai_generated",
        relatedAreas: ["personal_growth", "action"],
        confidenceScore: 0.75,
        aiModel: "mock"
      });
    }
    
    return {
      content: randomResponse,
      confidence: 0.8,
      suggestions: ["Vertiefe diesen Gedanken", "Mache einen kleinen ersten Schritt", "Reflektiere über deine Erfolge"],
      insights: insights.length > 0 ? insights : undefined,
      nextQuestions: ["Was ist dein nächster kleiner Schritt?", "Wie fühlst du dich dabei?"],
      metadata: {
        responseTime: Date.now() - startTime,
        contextUsed: Object.keys(context).length,
        conversationType,
        aiModel: "mock"
      }
    };
  }

  /**
   * Extrahiert Vorschläge aus AI-Antwort
   */
  private static extractSuggestions(content: string): string[] {
    // Simple heuristic - look for bullet points or numbered lists
    const lines = content.split('\n');
    const suggestions: string[] = [];
    
    for (const line of lines) {
      if (line.match(/^[-*•]\s+/) || line.match(/^\d+\.\s+/)) {
        suggestions.push(line.replace(/^[-*•\d.]\s+/, '').trim());
      }
    }
    
    return suggestions.slice(0, 5); // Max 5 suggestions
  }

  /**
   * Extrahiert Fragen aus AI-Antwort
   */
  private static extractQuestions(content: string): string[] {
    const questionRegex = /[^.!?]*\?/g;
    const matches = content.match(questionRegex);
    return matches ? matches.map(q => q.trim()).slice(0, 3) : [];
  }
  
  /**
   * System Prompts für verschiedene Konversationstypen
   */
  private static getSystemPrompt(conversationType: string): string {
    const prompts = {
      chat: "Du bist ein einfühlsamer AI-Coach für die KLARE-Methode. Antworte warmherzig, unterstützend und auf Deutsch. Fokussiere auf die fünf KLARE-Bereiche: Klarheit, Lebendigkeit, Ausrichtung, Realisierung, Entfaltung.",
      coaching: "Du bist ein professioneller Life Coach. Stelle kraftvolle Fragen, die zur Selbstreflexion anregen. Verwende Coaching-Techniken und die KLARE-Methodik.",
      insight_generation: "Du generierst personalisierte Insights basierend auf Benutzerdaten. Erkenne Muster, biete neue Perspektiven und mache konkrete Entwicklungsvorschläge.",
      content_personalization: "Du personalisierst Inhalte der KLARE-Methode basierend auf dem individuellen Profil und Fortschritt des Benutzers."
    };
    
    return prompts[conversationType as keyof typeof prompts] || prompts.chat;
  }
  
  // =============================================================================
  // ANALYTICS & LOGGING
  // =============================================================================
  
  /**
   * Loggt AI Service Usage für Analytics
   */
  static async logServiceUsage(
    userId: string,
    serviceType: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from("ai_service_logs")
        .insert({
          user_id: userId,
          service_name: serviceType,
          operation_type: metadata?.operation_type || 'generic',
          request_data: metadata || {},
          success: true,
          // created_at wird automatisch gesetzt
        });
      
      if (error) throw error;
    } catch (error) {
      console.error("Error logging service usage:", error);
      // Don't throw - logging should not break the main flow
    }
  }
  
  /**
   * Holt Service Usage Statistics
   */
  static async getServiceUsageStats(
    userId: string,
    timeframe: "day" | "week" | "month" = "week"
  ): Promise<Record<string, number>> {
    try {
      const daysBack = timeframe === "day" ? 1 : timeframe === "week" ? 7 : 30;
      const since = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString();
      
      const { data, error } = await supabase
        .from("ai_service_logs")
        .select("service_name")
        .eq("user_id", userId)
        .gte("created_at", since);
      
      if (error) throw error;
      
      // Count by service type
      const stats: Record<string, number> = {};
      data?.forEach(log => {
        stats[log.service_name] = (stats[log.service_name] || 0) + 1;
      });
      
      return stats;
    } catch (error) {
      console.error("Error loading service usage stats:", error);
      return {};
    }
  }
  
  // =============================================================================
  // INTEGRATION HELPERS
  // =============================================================================
  
  /**
   * Generates AI-powered journal prompts based on user context
   */
  static async generateJournalPrompt(userId: string): Promise<string> {
    try {
      const context = await this.buildChatContext(userId);
      
      // Generate new prompt
      const response = await this.generateResponse(
        "Generate a personalized journal prompt for today",
        context,
        "content_personalization"
      );
      
      await this.logServiceUsage(userId, "journal_prompt_generation");
      
      return response.content;
    } catch (error) {
      console.error("Error generating journal prompt:", error);
      
      // Fallback prompts
      const fallbackPrompts = [
        "Was war heute dein größter Erfolg, auch wenn er noch so klein erscheint?",
        "Welche Emotion hat dich heute am meisten beschäftigt und warum?",
        "Wofür bist du heute besonders dankbar?",
        "Was hast du heute über dich selbst gelernt?"
      ];
      
      return fallbackPrompts[Math.floor(Math.random() * fallbackPrompts.length)];
    }
  }

  /**
   * Generiert eine Coaching-Frage für einen Lebensbereich im LifeWheel
   * Mit optionalem Memory vorheriger Assessments
   */
  static async generateLifeWheelCoachingQuestion(params: {
    userId: string;
    areaName: string;
    areaId: string;
    currentValue?: number;
    targetValue?: number;
    previousValue?: number;
    previousDate?: string;
  }): Promise<string> {
    const { userId, areaName, areaId, currentValue, targetValue, previousValue, previousDate } = params;

    // Load previous questions to avoid repetition
    const previousQuestions = await LifeWheelReflectionService.getPreviousQuestions(
      userId,
      areaId
    );
    
    // Load user profile for initial questions (maybeSingle to handle missing profile)
    const { data: userProfile } = await supabase
      .from("user_profiles")
      .select("age, preferences")
      .eq("user_id", userId)
      .maybeSingle();
    
    const isInitialQuestion = previousQuestions.length === 0;
    console.log(`📝 Area: ${areaName}, Previously asked: ${previousQuestions.length} questions, Initial: ${isInitialQuestion}, UserProfile: ${!!userProfile}`);

    // Try OpenAI first if available
    const openAIAvailable = OpenAIService.isServiceAvailable();
    console.log(`🤖 OpenAI Service available: ${openAIAvailable}`);
    
    if (openAIAvailable) {
      try {
        const areaDescriptions: Record<string, string> = {
          health: "Körperliche und mentale Gesundheit, Fitness, Ernährung",
          career: "Berufliche Entwicklung, Karriere, Arbeitszufriedenheit",
          relationships: "Beziehungen zu Familie, Freunden, Partner",
          personal_growth: "Persönliche Entwicklung, Lernen, Selbstverwirklichung",
          finances: "Finanzielle Situation, Sicherheit, Wohlstand",
          fun_recreation: "Freizeit, Hobbys, Entspannung, Lebensfreude",
          physical_environment: "Wohnraum, Arbeitsumgebung, Ordnung",
          contribution: "Beitrag für andere, gesellschaftliches Engagement, Sinn",
        };

        // Build context
        let userContext: Record<string, any> = {
          previousQuestions,
          isInitialQuestion,
          userAge: userProfile?.age,
          userPreferences: userProfile?.preferences,
        };
        
        if (previousValue !== undefined && previousDate) {
          const daysSince = Math.floor(
            (Date.now() - new Date(previousDate).getTime()) / (1000 * 60 * 60 * 24)
          );
          
          userContext = {
            ...userContext,
            previousValue,
            previousDate,
            daysSince,
            valueChange: currentValue !== undefined ? currentValue - previousValue : 0,
          };
        }

        const question = await OpenAIService.generateCoachingQuestion({
          areaName,
          areaDescription: areaDescriptions[areaId],
          currentValue,
          targetValue,
          userContext,
        });

        await this.logServiceUsage(userId, "lifewheel_coaching_question", {
          areaId,
          areaName,
          hasMemory: !!previousValue,
          previousQuestionsCount: previousQuestions.length,
        });

        console.log(`✅ OpenAI question generated: ${question.substring(0, 50)}...`);
        return question;
      } catch (error) {
        console.warn("⚠️ OpenAI Fehler bei Coaching-Frage, nutze Fallback:", error);
      }
    }

    // Fallback: Vordefinierte Coaching-Fragen (mit und ohne Memory)
    console.log(`🔄 Using fallback questions for area: ${areaId}`);
    const hasMemory = previousValue !== undefined;
    
    const fallbackQuestions: Record<string, string[]> = {
      health: hasMemory ? [
        "Was hat sich in deiner Gesundheit seit der letzten Einschätzung am meisten verändert?",
        "Welche Maßnahmen haben dir geholfen, deine Gesundheit zu verbessern?",
        "Was möchtest du in diesem Bereich als nächstes angehen?",
      ] : [
        "Was würde sich in deinem Leben verändern, wenn du dich körperlich und mental gestärkt fühlst?",
        "Welche kleine gesunde Gewohnheit könntest du heute beginnen?",
        "Was brauchst du, um dich in deinem Körper wohler zu fühlen?",
      ],
      career: [
        "Was macht dir an deiner Arbeit am meisten Freude?",
        "Wo siehst du dich beruflich in einem Jahr?",
        "Was würde deine ideale Arbeitswoche beinhalten?",
      ],
      relationships: [
        "Welche Beziehung in deinem Leben verdient mehr Aufmerksamkeit?",
        "Was schätzt du am meisten an deinen wichtigsten Beziehungen?",
        "Wie könntest du mehr Tiefe in deine Beziehungen bringen?",
      ],
      personal_growth: [
        "Was möchtest du in den nächsten 3 Monaten über dich lernen?",
        "Welche Fähigkeit würde dein Leben bereichern?",
        "Was hält dich davon ab, dein volles Potenzial zu entfalten?",
      ],
      finances: [
        "Was bedeutet finanzielle Freiheit für dich?",
        "Welcher erste Schritt würde deine finanzielle Situation verbessern?",
        "Wie könntest du mehr Freude im Umgang mit Geld entwickeln?",
      ],
      fun_recreation: [
        "Was bringt dich zum Lachen und zur Lebensfreude?",
        "Wann hast du dich zuletzt richtig lebendig gefühlt?",
        "Was könntest du tun, um mehr Leichtigkeit in deinen Alltag zu bringen?",
      ],
      physical_environment: [
        "Wie würde dein idealer Lebensraum aussehen und sich anfühlen?",
        "Was in deiner Umgebung gibt dir Energie, was raubt sie dir?",
        "Welche kleine Veränderung würde dein Wohlbefinden zu Hause steigern?",
      ],
      contribution: [
        "Wie möchtest du die Welt um dich herum positiv beeinflussen?",
        "Was ist dein einzigartiger Beitrag, den nur du geben kannst?",
        "Wo spürst du den Ruf, mehr zu geben?",
      ],
    };

    const questions = fallbackQuestions[areaId] || [
      "Was ist dir in diesem Bereich am wichtigsten?",
      "Was würde eine Verbesserung für dich bedeuten?",
      "Welcher erste Schritt fühlt sich richtig an?",
    ];

    // Filter out previously asked questions to avoid repetition
    const availableQuestions = questions.filter(
      q => !previousQuestions.includes(q)
    );
    
    // If all questions have been asked, use any question
    const finalQuestions = availableQuestions.length > 0 
      ? availableQuestions 
      : questions;

    const selectedQuestion = finalQuestions[Math.floor(Math.random() * finalQuestions.length)];
    console.log(`✅ Fallback question selected: ${selectedQuestion}`);
    return selectedQuestion;
  }
  
  /**
   * Analyzes user progress and suggests next steps
   */
  static async analyzeProgressAndSuggestNextSteps(userId: string): Promise<{
    analysis: string;
    suggestions: string[];
    nextModules: string[];
    insights: PersonalInsight[];
  }> {
    try {
      const context = await this.buildChatContext(userId);
      
      // Generate progress analysis
      const response = await this.generateResponse(
        "Analyze my current progress and suggest concrete next steps for my development",
        context,
        "insight_generation"
      );
      
      // Get module recommendations based on completed modules
      const nextModules = this.getRecommendedModules(context.completedModules || []);
      
      // Save generated insights
      const generatedInsights = response.insights || [];
      const persistedInsights: PersonalInsight[] = [];
      if (generatedInsights.length > 0) {
        for (const insight of generatedInsights) {
          try {
            const created = await this.createPersonalInsight(insight);
            persistedInsights.push(created);
          } catch (error) {
            console.warn("Failed to persist AI insight:", error);
          }
        }
      }
      
      await this.logServiceUsage(userId, "progress_analysis");
      
      return {
        analysis: response.content,
        suggestions: response.suggestions || [],
        nextModules,
        insights: persistedInsights
      };
    } catch (error) {
      console.error("Error analyzing progress:", error);
      return {
        analysis: "Analyse konnte nicht erstellt werden.",
        suggestions: [],
        nextModules: [],
        insights: []
      };
    }
  }

  static async generateExerciseIntroQuestion(
    userId: string,
    params: {
      moduleId: string;
      moduleTitle: string;
      stepId?: string;
      moduleDescription?: string | null;
    },
  ): Promise<string> {
    try {
      const context = await this.buildChatContext(userId);
      const template = await this.getPromptTemplateForModule(
        "exercise_adaptation",
        params.moduleId,
      );

      const templateVariables =
        template?.variables &&
        typeof template.variables === "object" &&
        !Array.isArray(template.variables)
          ? (template.variables as Record<string, any>)
          : undefined;

      const preferredLanguage =
        context.preferredLanguage || (templateVariables?.language as string) || "de";

      const basePrompt =
        template?.prompt_template ||
        "Formuliere eine kurze, fokussierte Coaching-Frage in {{language}}, die den Nutzer motiviert, sich auf die Übung {{module_title}} (KLARE-Schritt {{klare_step}}) einzustimmen. Verwende die du-Form und stelle genau eine Frage.";

      const promptMessage = this.applyTemplateVariables(basePrompt, {
        module_id: params.moduleId,
        module_title: params.moduleTitle,
        module_description: params.moduleDescription ?? "",
        klare_step: params.stepId ?? "",
        language: preferredLanguage,
      });

      const response = await this.generateResponse(
        promptMessage,
        { ...context, preferredLanguage },
        "coaching",
      );

      await this.logServiceUsage(userId, "exercise_intro_question", {
        moduleId: params.moduleId,
        moduleTitle: params.moduleTitle,
        stepId: params.stepId,
      });

      if (response.content?.trim()) {
        return response.content.trim();
      }
    } catch (error) {
      console.error("Error generating exercise intro question:", error);
    }

    return "Welche Intention möchtest du mit dieser Übung konkret verfolgen?";
  }
  
  /**
   * Gets recommended modules based on completed ones
   */
  private static getRecommendedModules(completedModules: string[]): string[] {
    // KLARE method progression logic
    const allModules = [
      "K1", "K2", "K3", "K4", "K5", "K6", "K7",  // Klarheit
      "L1", "L2", "L3", "L4", "L5", "L6", "L7",  // Lebendigkeit  
      "A1", "A2", "A3", "A4", "A5", "A6", "A7",  // Ausrichtung
      "R1", "R2", "R3", "R4", "R5", "R6", "R7",  // Realisierung
      "E1", "E2", "E3", "E4", "E5", "E6", "E7"   // Entfaltung
    ];
    
    const remainingModules = allModules.filter(module => !completedModules.includes(module));
    
    // Return next 3-5 modules based on progression logic
    return remainingModules.slice(0, 5);
  }
  
  // =============================================================================
  // HEALTH CHECKS & MAINTENANCE
  // =============================================================================
  
  /**
   * Checks AI service health and connectivity
   */
  static async healthCheck(): Promise<{
    status: "healthy" | "degraded" | "down";
    services: Record<string, boolean>;
    lastChecked: string;
  }> {
    try {
      const checks = {
        database: false,
        aiGeneration: false,
        promptTemplates: false,
        insights: false
      };
      
      // Check database connectivity
      try {
        const { error } = await supabase.from("ai_conversations").select("id").limit(1);
        checks.database = !error;
      } catch {
        checks.database = false;
      }
      
      // Check AI generation (mock for now)
      try {
        const testResponse = await this.generateResponse(
          "test",
          { userId: "test" },
          "chat"
        );
        checks.aiGeneration = !!testResponse.content;
      } catch {
        checks.aiGeneration = false;
      }
      
      // Check prompt templates
      try {
        const { error } = await supabase.from("ai_prompt_templates").select("id").limit(1);
        checks.promptTemplates = !error;
      } catch {
        checks.promptTemplates = false;
      }
      
      // Check insights functionality
      try {
        const { error } = await supabase.from("personal_insights").select("id").limit(1);
        checks.insights = !error;
      } catch {
        checks.insights = false;
      }
      
      const healthyServices = Object.values(checks).filter(Boolean).length;
      const totalServices = Object.keys(checks).length;
      
      let status: "healthy" | "degraded" | "down";
      if (healthyServices === totalServices) {
        status = "healthy";
      } else if (healthyServices > 0) {
        status = "degraded";
      } else {
        status = "down";
      }
      
      return {
        status,
        services: checks,
        lastChecked: new Date().toISOString()
      };
    } catch (error) {
      console.error("Error during health check:", error);
      return {
        status: "down",
        services: {},
        lastChecked: new Date().toISOString()
      };
    }
  }
  
  /**
   * Cleans up expired cached content
   */
  static async cleanupExpiredContent(): Promise<{ deletedCount: number }> {
    try {
      const { data, error } = await supabase
        .from("generated_content")
        .delete()
        .lt("cache_expires_at", new Date().toISOString())
        .select("id");
      
      if (error) throw error;
      
      return { deletedCount: data?.length || 0 };
    } catch (error) {
      console.error("Error cleaning up expired content:", error);
      return { deletedCount: 0 };
    }
  }

  private static applyTemplateVariables(
    template: string,
    variables: Record<string, string | undefined>,
  ): string {
    return Object.entries(variables).reduce((acc, [key, value]) => {
      const safeValue = value ?? "";
      const pattern = new RegExp(`{{\\s*${key}\\s*}}`, "g");
      return acc.replace(pattern, safeValue);
    }, template);
  }
}

export default AIService;
