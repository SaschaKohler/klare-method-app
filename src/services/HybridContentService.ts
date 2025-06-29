// =====================================================
// Privacy-First Service Architecture
// Hybrid AI/Static Content with User Control
// =====================================================

import { supabase } from '../lib/supabase';
import { storage, sensitiveStorage, privacyStorage } from '../lib/storage';
import AIService from './AIService';

export interface UserPrivacyPreferences {
  aiEnabled: boolean;
  aiPersonalizationLevel: 'none' | 'basic' | 'advanced';
  dataSharingLevel: 'local_only' | 'cloud_safe' | 'ai_enabled';
  sensitiveDataLocalOnly: boolean;
  intimateDataLocalOnly: boolean;
  prefersStaticQuestions: boolean;
  allowsAiQuestions: boolean;
  preferredLanguage: 'de' | 'en';
  autoTranslate: boolean;
  consentVersion?: string;
  lastUpdated?: string;
}

export interface ContentSensitivity {
  level: 'public' | 'sensitive' | 'intimate';
  recommendedStorage: 'local_only' | 'cloud_safe' | 'ai_enabled';
  tags: string[];
}

export interface JournalResponse {
  id: string;
  questionText: string;
  responseText: string;
  sensitivityLevel: 'public' | 'sensitive' | 'intimate';
  storageLocation: 'local_only' | 'cloud_safe' | 'ai_enabled';
  allowAiAnalysis: boolean;
  localOnly: boolean;
  createdAt: Date;
  moduleContext?: string;
  aiGenerated?: boolean;
}

// Legacy interfaces for backward compatibility
export interface ContentSection {
  id: string;
  title: string;
  content: string;
  section_type: string;
  order_index: number;
}

export interface ExerciseStep {
  id: string;
  title: string;
  description: string;
  step_type: string;
  options: any;
  order_index: number;
}

export interface QuizQuestion {
  id: string;
  question_text: string;
  question_type: string;
  options: any;
  correct_answer: string;
  explanation?: string;
}

export interface ModuleContent {
  id: string;
  title: string;
  description?: string;
  content: any;
  klare_step: string;
  order_index: number;
  difficulty_level: number;
  duration?: number;
  estimated_duration?: number; // Legacy
  content_type?: 'video' | 'theory' | 'intro' | 'exercise' | 'quiz' | string;
  title_localized?: string;
  module_id?: string; // Legacy
  // Additional properties for flexibility
  [key: string]: any;
}

// =======================================
// PRIVACY SERVICE
// =======================================

export class PrivacyService {
  private static instance: PrivacyService;
  
  static getInstance(): PrivacyService {
    if (!PrivacyService.instance) {
      PrivacyService.instance = new PrivacyService();
    }
    return PrivacyService.instance;
  }

  /**
   * Check if user allows AI for specific content sensitivity
   */
  async canUseAiForContent(
    userId: string, 
    sensitivityLevel: 'public' | 'sensitive' | 'intimate'
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('user_allows_ai_for_content', {
        p_user_id: userId,
        p_sensitivity_level: sensitivityLevel
      });
      
      if (error) {
        console.warn('Privacy check failed, defaulting to restrictive:', error);
        return false;
      }
      
      return data;
    } catch (error) {
      console.warn('Privacy check error, defaulting to restrictive:', error);
      return false;
    }
  }

  /**
   * Get appropriate storage location for user and content
   */
  async getStorageLocation(
    userId: string,
    sensitivityLevel: 'public' | 'sensitive' | 'intimate'
  ): Promise<'local_only' | 'cloud_safe' | 'ai_enabled'> {
    try {
      const { data, error } = await supabase.rpc('get_storage_location_for_user', {
        p_user_id: userId,
        p_sensitivity_level: sensitivityLevel
      });
      
      if (error) {
        console.warn('Storage location check failed, defaulting to local:', error);
        return 'local_only';
      }
      
      return data;
    } catch (error) {
      console.warn('Storage location error, defaulting to local:', error);
      return 'local_only';
    }
  }

  /**
   * Update user privacy preferences
   */
  async updatePrivacyPreferences(
    userId: string, 
    preferences: Partial<UserPrivacyPreferences>
  ): Promise<void> {
    const { error } = await supabase
      .from('user_privacy_preferences')
      .upsert({
        user_id: userId,
        ...preferences,
        last_consent_update: new Date().toISOString()
      });
    
    if (error) throw error;
  }

  /**
   * Get user privacy preferences
   */
  async getPrivacyPreferences(userId: string): Promise<UserPrivacyPreferences | null> {
    const { data, error } = await supabase
      .from('user_privacy_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  /**
   * Classify content sensitivity automatically
   */
  classifyContentSensitivity(content: string): ContentSensitivity {
    const intimateKeywords = [
      'trauma', 'missbrauch', 'depression', 'suizid', 'beziehungsprobleme',
      'sexualität', 'abhängigkeit', 'schulden', 'krankheit', 'tod',
      'trauma', 'abuse', 'depression', 'suicide', 'relationship problems',
      'sexuality', 'addiction', 'debt', 'illness', 'death'
    ];
    
    const sensitiveKeywords = [
      'angst', 'stress', 'arbeit', 'chef', 'familie', 'geld', 'zukunft',
      'fear', 'stress', 'work', 'boss', 'family', 'money', 'future'
    ];
    
    const lowerContent = content.toLowerCase();
    
    // Check for intimate content
    if (intimateKeywords.some(keyword => lowerContent.includes(keyword))) {
      return {
        level: 'intimate',
        recommendedStorage: 'local_only',
        tags: ['intimate', 'personal']
      };
    }
    
    // Check for sensitive content
    if (sensitiveKeywords.some(keyword => lowerContent.includes(keyword))) {
      return {
        level: 'sensitive',
        recommendedStorage: 'cloud_safe',
        tags: ['sensitive', 'personal']
      };
    }
    
    // Default to public
    return {
      level: 'public',
      recommendedStorage: 'cloud_safe',
      tags: ['general']
    };
  }
}

// =======================================
// HYBRID CONTENT SERVICE  
// =======================================

export class HybridContentService {
  private privacyService = PrivacyService.getInstance();
  private aiServiceWrapper = new AIServiceWrapper();
  private localResponses = new Map<string, JournalResponse>();
  private static instance: HybridContentService;

  static getInstance(): HybridContentService {
    if (!HybridContentService.instance) {
      HybridContentService.instance = new HybridContentService();
    }
    return HybridContentService.instance;
  }

  /**
   * Get questions for user - static first, AI enhancement optional
   */
  async getQuestionsForUser(
    userId: string,
    templateId: string,
    language: 'de' | 'en' = 'de'
  ): Promise<{
    staticQuestions: string[];
    aiQuestions?: string[];
    contentSensitivity: ContentSensitivity;
  }> {
    // 1. Always get static questions as baseline
    const staticQuestions = await this.getStaticQuestions(templateId, language);
    
    // 2. Classify content sensitivity
    const questionText = staticQuestions.join(' ');
    const contentSensitivity = this.privacyService.classifyContentSensitivity(questionText);
    
    // 3. Check if AI is allowed for this content
    const canUseAi = await this.privacyService.canUseAiForContent(
      userId, 
      contentSensitivity.level
    );
    
    let aiQuestions: string[] | undefined;
    
    if (canUseAi) {
      // 4. Generate AI-enhanced questions
      try {
        aiQuestions = await this.aiServiceWrapper.generatePersonalizedQuestions(
          staticQuestions,
          await this.getUserContextForAi(userId),
          templateId,
          userId
        );
      } catch (error) {
        console.warn('AI question generation failed, using static fallback:', error);
      }
    }
    
    return {
      staticQuestions,
      aiQuestions,
      contentSensitivity
    };
  }

  /**
   * Save journal response with privacy controls
   */
  async saveJournalResponse(
    userId: string,
    templateId: string,
    questionText: string,
    responseText: string,
    userOverrideSensitivity?: 'public' | 'sensitive' | 'intimate'
  ): Promise<void> {
    // 1. Determine content sensitivity
    const contentSensitivity = userOverrideSensitivity || 
      this.privacyService.classifyContentSensitivity(responseText).level;
    
    // 2. Get storage location based on user preferences
    const storageLocation = await this.privacyService.getStorageLocation(
      userId,
      contentSensitivity
    );
    
    // 3. Determine AI permissions
    const allowAiAnalysis = await this.privacyService.canUseAiForContent(
      userId,
      contentSensitivity
    );
    
    const response: Omit<JournalResponse, 'id' | 'createdAt'> = {
      questionText,
      responseText,
      sensitivityLevel: contentSensitivity,
      storageLocation,
      allowAiAnalysis,
      localOnly: storageLocation === 'local_only'
    };
    
    // 4. Save based on storage location
    if (storageLocation === 'local_only') {
      await this.saveToLocalStorage(userId, response);
    } else {
      await this.saveToCloud(userId, templateId, response);
    }
  }

  private async getStaticQuestions(
    templateId: string, 
    language: 'de' | 'en'
  ): Promise<string[]> {
    const { data, error } = await supabase
      .from('journal_templates')
      .select('questions, translations')
      .eq('id', templateId)
      .single();
    
    if (error) throw error;
    
    // Return translated questions if available, fallback to original
    if (language === 'en' && data.translations?.en?.questions) {
      return data.translations.en.questions;
    }
    
    return data.questions || [];
  }

  private async generateAiQuestions(
    userId: string,
    templateId: string,
    staticQuestions: string[]
  ): Promise<string[]> {
    // Get user context for personalization
    const userContext = await this.getUserContextForAi(userId);
    
    // Generate AI-enhanced questions based on static baseline
    return await this.aiServiceWrapper.generatePersonalizedQuestions(
      staticQuestions,
      userContext,
      templateId,
      userId
    );
  }

  /**
   * Get all responses for user (local + cloud based on preferences)
   */
  async getAllResponsesForUser(userId: string): Promise<{
    localResponses: JournalResponse[];
    cloudResponses: JournalResponse[];
    totalCount: number;
  }> {
    // Get local responses from storage
    const localResponses = await this.getLocalResponses(userId);
    
    // Get cloud responses
    const { data: cloudResponses, error } = await supabase
      .from('journal_responses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.warn('Failed to fetch cloud responses:', error);
      return {
        localResponses,
        cloudResponses: [],
        totalCount: localResponses.length
      };
    }
    
    return {
      localResponses,
      cloudResponses: cloudResponses || [],
      totalCount: localResponses.length + (cloudResponses?.length || 0)
    };
  }

  private async saveToLocalStorage(
    userId: string,
    response: Omit<JournalResponse, 'id' | 'createdAt'>
  ): Promise<void> {
    const responseId = `response_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const fullResponse: JournalResponse = {
      ...response,
      id: responseId,
      createdAt: new Date()
    };
    
    // Store in local storage
    const existingResponses = await this.getLocalResponses(userId);
    existingResponses.push(fullResponse);
    
    await storage.setString(`journal_responses_${userId}`, JSON.stringify(existingResponses));
    
    console.log('💾 Saved sensitive response locally');
  }

  private async saveToCloud(
    userId: string,
    templateId: string,
    response: Omit<JournalResponse, 'id' | 'createdAt'>
  ): Promise<void> {
    const { error } = await supabase
      .from('journal_responses')
      .insert({
        user_id: userId,
        template_id: templateId,
        question_text: response.questionText,
        response_text: response.responseText,
        sensitivity_level: response.sensitivityLevel,
        storage_location: response.storageLocation,
        allow_ai_analysis: response.allowAiAnalysis,
        local_only: response.localOnly
      });
    
    if (error) throw error;
    
    console.log('☁️ Saved response to cloud with privacy controls');
  }

  private async getLocalResponses(userId: string): Promise<JournalResponse[]> {
    const stored = await storage.getString(`journal_responses_${userId}`);
    
    if (!stored) return [];
    
    try {
      const responses = JSON.parse(stored);
      return Array.isArray(responses) ? responses.map((response: any) => ({
        ...response,
        createdAt: new Date(response.createdAt)
      })) : [];
    } catch {
      return [];
    }
  }

  private async getUserContextForAi(userId: string): Promise<object> {
    // Get anonymized user context for AI (no intimate data)
    const { data } = await supabase
      .from('life_wheel_snapshots')
      .select('scores, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1);
    
    return {
      recentLifeWheelScores: data?.[0]?.scores || {},
      progressLevel: 'intermediate', // Calculate based on usage
      preferredComplexity: 'medium'
    };
  }

  public async getServiceHealth(): Promise<{ status: "healthy" | "degraded" | "down"; components: object }> {
    try {
      const { error } = await supabase.from("modules").select("id").limit(1);
      if (error) throw error;
      return { status: "healthy", components: { database: "ok" } };
    } catch (error) {
      return { status: "down", components: { database: "failed" } };
    }
  }

  public async getUserPrivacyPreferences(userId: string): Promise<UserPrivacyPreferences | null> {
    return this.privacyService.getPrivacyPreferences(userId);
  }

  public async setUserPrivacyPreferences(userId: string, preferences: Partial<UserPrivacyPreferences>): Promise<void> {
    return this.privacyService.updatePrivacyPreferences(userId, preferences);
  }
}

// =======================================
// AI SERVICE WITH PRIVACY
// =======================================

export class AIServiceWrapper {
  private privacyService = PrivacyService.getInstance();
  
  /**
   * Generate personalized questions with privacy safeguards
   */
  async generatePersonalizedQuestions(
    staticQuestions: string[],
    userContext: object,
    templateId: string,
    userId?: string
  ): Promise<string[]> {
    // Check if user allows AI (if userId provided)
    if (userId) {
      const canUseAi = await this.privacyService.canUseAiForContent(userId, 'sensitive');
      if (!canUseAi) {
        throw new Error('AI not allowed for this user/content');
      }
    }
    
    // Placeholder implementation - integrate with your AI service
    return [
      ...staticQuestions,
      'Basierend auf Ihren Antworten: Was ist Ihnen heute besonders wichtig?',
      'Welche Ihrer Stärken können Sie heute bewusst einsetzen?'
    ];
  }
}

// =======================================
// LEGACY COMPATIBILITY FUNCTIONS
// =======================================

/**
 * Load module content (legacy compatibility)
 */
export async function loadModuleContent(moduleId: string): Promise<ModuleContent | null> {
  try {
    const { data, error } = await supabase
      .from('module_contents')
      .select('*')
      .eq('id', moduleId)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Failed to load module content:', error);
    return null;
  }
}

/**
 * Load modules by KLARE step (legacy compatibility)
 */
export async function loadModulesByStep(step: string): Promise<ModuleContent[]> {
  try {
    const { data, error } = await supabase
      .from('module_contents')
      .select('*')
      .eq('klare_step', step)
      .order('order_index');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Failed to load modules by step:', error);
    return [];
  }
}

/**
 * Save exercise result (legacy compatibility)
 */
export async function saveExerciseResult(
  userId: string,
  exerciseId: string,
  result: any
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_answers')
      .insert({
        user_id: userId,
        exercise_id: exerciseId,
        answer_data: result,
        answered_at: new Date().toISOString()
      });
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Failed to save exercise result:', error);
    return false;
  }
}

/**
 * Save quiz answer (legacy compatibility)
 */
export async function saveQuizAnswer(
  userId: string,
  quizId: string,
  questionId: string,
  answer: any
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_answers')
      .insert({
        user_id: userId,
        quiz_id: quizId,
        question_id: questionId,
        answer_data: answer,
        answered_at: new Date().toISOString()
      });
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Failed to save quiz answer:', error);
    return false;
  }
}

/**
 * Load user module progress (legacy compatibility)
 */
export async function loadUserModuleProgress(userId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('completed_modules')
      .select('*')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Failed to load user module progress:', error);
    return [];
  }
}



// Export a singleton instance as the default
export default HybridContentService.getInstance();
