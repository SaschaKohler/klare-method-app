// =====================================================
// Privacy-First Service Architecture
// Hybrid AI/Static Content with User Control
// =====================================================

import { supabase } from '../lib/supabase';
import { storage, sensitiveStorage, privacyStorage } from '../lib/storage';
import AIService from './AIService';
import type {
  PostgrestError,
  PostgrestResponse,
  PostgrestSingleResponse,
} from '@supabase/supabase-js';

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
  last_consent_update?: string;
  updated_at?: string;
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
  description?: string;
  instructions?: string;
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
  module_id: string;
  module_slug?: string | null;
  klare_step: string;
  title: string;
  description?: string | null;
  content_type?: 'video' | 'theory' | 'intro' | 'exercise' | 'quiz' | 'text' | string;
  content: any;
  order_index: number;
  difficulty_level?: number | null;
  duration?: number | null;
  estimated_duration?: number | null;
  sections?: ContentSection[];
  exercise_steps?: ExerciseStep[];
  quiz_questions?: QuizQuestion[];
  title_localized?: string | null;
  learning_objectives?: string[] | null;
  tags?: string[] | null;
  metadata?: Record<string, any> | null;
  // Additional properties for flexibility
  [key: string]: any;
}

interface ModuleSectionRaw {
  id: string;
  module_content_id?: string | null;
  module_id?: string | null;
  title: string;
  content: any;
  section_type?: string | null;
  order_index: number;
}

interface ModuleExerciseStepRaw {
  id: string;
  module_content_id: string;
  title: string;
  instructions: any;
  step_type: string;
  options: any;
  order_index: number;
}

interface ModuleQuizQuestionRaw {
  id: string;
  module_content_id: string;
  question: string;
  question_type: string;
  options: any;
  correct_answer: any;
  explanation?: any;
  order_index: number;
}

type RawModuleContent = {
  id: string;
  module_id?: string | null;
  klare_step?: string | null;
  title: string;
  description?: string | null;
  content_type: string;
  content: any;
  order_index: number;
  difficulty_level?: number | null;
  duration?: number | null;
  estimated_duration?: number | null;
  title_localized?: string | null;
};

type RawModuleFetchResult = RawModuleContent & {
  content_sections: ModuleSectionRaw[] | null;
  exercise_steps: ModuleExerciseStepRaw[] | null;
  quiz_questions: ModuleQuizQuestionRaw[] | null;
  modules?: {
    id?: string | null;
    slug?: string | null;
    klare_step?: string | null;
    title?: string | null;
    description?: string | null;
    content_type?: string | null;
    order_index?: number | null;
    difficulty_level?: number | null;
    estimated_duration?: number | null;
    learning_objectives?: string[] | null;
    tags?: string[] | null;
    metadata?: Record<string, any> | null;
  } | null;
};

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

  private mapPreferencesToDb(
    userId: string,
    preferences: Partial<UserPrivacyPreferences>,
  ): Record<string, any> {
    const timestamp = new Date().toISOString();
    const dbPreferences: Record<string, any> = {
      id: userId,
      updated_at: timestamp,
    };

    if (preferences.aiEnabled !== undefined) {
      dbPreferences.ai_enabled = preferences.aiEnabled;
    }
    if (preferences.aiPersonalizationLevel !== undefined) {
      dbPreferences.ai_personalization_level = preferences.aiPersonalizationLevel;
    }
    if (preferences.dataSharingLevel !== undefined) {
      dbPreferences.data_sharing_level = preferences.dataSharingLevel;
    }
    if (preferences.sensitiveDataLocalOnly !== undefined) {
      dbPreferences.sensitive_data_local_only = preferences.sensitiveDataLocalOnly;
    }
    if (preferences.intimateDataLocalOnly !== undefined) {
      dbPreferences.intimate_data_local_only = preferences.intimateDataLocalOnly;
    }
    if (preferences.prefersStaticQuestions !== undefined) {
      dbPreferences.prefers_static_questions = preferences.prefersStaticQuestions;
    }
    if (preferences.allowsAiQuestions !== undefined) {
      dbPreferences.allows_ai_questions = preferences.allowsAiQuestions;
    }
    if (preferences.preferredLanguage !== undefined) {
      dbPreferences.preferred_language = preferences.preferredLanguage;
    }
    if (preferences.autoTranslate !== undefined) {
      dbPreferences.auto_translate = preferences.autoTranslate;
    }
    if (preferences.consentVersion !== undefined) {
      dbPreferences.consent_version = preferences.consentVersion;
    }

    if (preferences.last_consent_update !== undefined) {
      dbPreferences.last_consent_update = preferences.last_consent_update;
    } else {
      dbPreferences.last_consent_update = timestamp;
    }

    return dbPreferences;
  }

  private mapPreferencesFromDb(data: any): UserPrivacyPreferences {
    if (!data) {
      return data;
    }

    return {
      aiEnabled: data.ai_enabled ?? false,
      aiPersonalizationLevel: data.ai_personalization_level ?? 'basic',
      dataSharingLevel: data.data_sharing_level ?? 'cloud_safe',
      sensitiveDataLocalOnly: data.sensitive_data_local_only ?? true,
      intimateDataLocalOnly: data.intimate_data_local_only ?? true,
      prefersStaticQuestions: data.prefers_static_questions ?? false,
      allowsAiQuestions: data.allows_ai_questions ?? true,
      preferredLanguage: data.preferred_language ?? 'de',
      autoTranslate: data.auto_translate ?? false,
      consentVersion: data.consent_version ?? undefined,
      last_consent_update: data.last_consent_update ?? undefined,
      updated_at: data.updated_at ?? undefined,
    };
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
        p_id: userId,
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
        p_id: userId,
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
    const dbPreferences = this.mapPreferencesToDb(userId, preferences);

    const { error } = await supabase
      .from('user_privacy_preferences')
      .upsert(dbPreferences);
    
    if (error) throw error;
  }

  /**
   * Get user privacy preferences
   */
  async getPrivacyPreferences(userId: string): Promise<UserPrivacyPreferences | null> {
    const { data, error } = await supabase
      .from('user_privacy_preferences')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data ? this.mapPreferencesFromDb(data) : null;
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
      .eq('id', userId)
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
        id: userId,
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
      .eq('id', userId)
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
const LOCAL_MODULE_CACHE: Record<string, ModuleContent> = {};

function normalizeArray<T extends { order_index?: number }>(items: T[] | null | undefined): T[] {
  if (!items) {
    return [];
  }
  return items
    .slice()
    .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
    .map((item) => ({ ...item }));
}

function mapSection(section: ModuleSectionRaw): ContentSection {
  return {
    id: section.id,
    title: section.title,
    content: typeof section.content === 'string' ? section.content : JSON.stringify(section.content ?? {}),
    section_type: section.section_type ?? 'text',
    order_index: section.order_index,
  };
}

function mapExerciseStep(step: ModuleExerciseStepRaw): ExerciseStep {
  return {
    id: step.id,
    title: step.title,
    description:
      typeof step.instructions === 'string'
        ? step.instructions
        : JSON.stringify(step.instructions ?? {}),
    instructions:
      typeof step.instructions === 'string'
        ? step.instructions
        : step.instructions != null
          ? JSON.stringify(step.instructions)
          : undefined,
    step_type: step.step_type,
    options: step.options ?? {},
    order_index: step.order_index,
  };
}

function mapQuizQuestion(question: ModuleQuizQuestionRaw): QuizQuestion {
  const normalizedOptions =
    typeof question.options === 'string'
      ? (() => {
          try {
            return JSON.parse(question.options);
          } catch (error) {
            console.warn('Quiz options JSON parse failed:', error);
            return [];
          }
        })()
      : question.options ?? [];

  const normalizedCorrectAnswer =
    typeof question.correct_answer === 'string' && question.correct_answer.trim().startsWith('{')
      ? question.correct_answer
      : typeof question.correct_answer === 'object'
        ? JSON.stringify(question.correct_answer)
        : String(question.correct_answer ?? '');

  return {
    id: question.id,
    question_text: question.question,
    question_type: question.question_type,
    options: normalizedOptions,
    correct_answer: normalizedCorrectAnswer,
    explanation:
      typeof question.explanation === 'string'
        ? question.explanation
        : question.explanation
          ? JSON.stringify(question.explanation)
          : undefined,
  };
}

type ModuleMetadata = {
  id?: string | null;
  slug?: string | null;
  klare_step?: string | null;
  title?: string | null;
  description?: string | null;
  content_type?: string | null;
  order_index?: number | null;
  difficulty_level?: number | null;
  estimated_duration?: number | null;
  learning_objectives?: string[] | null;
  tags?: string[] | null;
  metadata?: Record<string, any> | null;
};

function mapRawModuleContent(
  raw: RawModuleFetchResult,
  moduleMeta?: ModuleMetadata | null,
  moduleSlug?: string | null,
): ModuleContent {
  let content: any = {};

  if (raw.content == null) {
    content = {};
  } else if (typeof raw.content === 'string') {
    content = {
      intro_text: raw.content,
      markdown: raw.content,
    };
  } else {
    content = raw.content;
  }

  const sectionsSource =
    raw.content_sections ??
    ((raw as unknown as { content_sections?: ModuleSectionRaw[] | null }).content_sections ?? []);
  const exerciseSource =
    raw.exercise_steps ??
    ((raw as unknown as { excercise_steps?: ModuleExerciseStepRaw[] | null }).excercise_steps ?? []);
  const quizSource = raw.quiz_questions ?? [];

  const sections = normalizeArray<ModuleSectionRaw>(sectionsSource as ModuleSectionRaw[])
    .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
    .map(mapSection);
  const exerciseSteps = normalizeArray<ModuleExerciseStepRaw>(exerciseSource as ModuleExerciseStepRaw[])
    .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
    .map(
    mapExerciseStep,
  );
  const quizQuestions = normalizeArray<ModuleQuizQuestionRaw>(quizSource as ModuleQuizQuestionRaw[])
    .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
    .map(
    mapQuizQuestion,
  );

  const moduleIdentifier = raw.module_id ?? raw.id;
  const resolvedMeta = moduleMeta ?? raw.modules ?? {};
  const klareStep =
    resolvedMeta.klare_step ??
    raw.klare_step ??
    moduleIdentifier.substring(0, 1).toUpperCase();

  const resolvedDescription = raw.description ?? resolvedMeta.description ?? undefined;
  const resolvedContentType = raw.content_type ?? resolvedMeta.content_type ?? undefined;
  const resolvedOrderIndex = raw.order_index ?? resolvedMeta.order_index ?? 0;
  const resolvedDifficulty = raw.difficulty_level ?? resolvedMeta.difficulty_level ?? undefined;
  const resolvedDuration = raw.duration ?? (content as any)?.duration_minutes ?? undefined;
  const resolvedEstimatedDuration =
    raw.estimated_duration ?? resolvedMeta.estimated_duration ?? (content as any)?.estimated_duration ?? undefined;

  return {
    id: raw.id,
    module_id: moduleIdentifier,
    module_slug: moduleSlug ?? resolvedMeta.slug ?? null,
    klare_step: klareStep,
    title: raw.title ?? resolvedMeta.title ?? '',
    description: resolvedDescription,
    content_type: resolvedContentType,
    content,
    order_index: resolvedOrderIndex,
    difficulty_level: resolvedDifficulty,
    duration: resolvedDuration ?? (content as any)?.duration_minutes ?? undefined,
    estimated_duration: resolvedEstimatedDuration,
    title_localized: raw.title_localized ?? undefined,
    sections,
    exercise_steps: exerciseSteps,
    quiz_questions: quizQuestions,
    learning_objectives: resolvedMeta.learning_objectives ?? null,
    tags: resolvedMeta.tags ?? null,
    metadata: resolvedMeta.metadata ?? null,
  };
}

const MODULE_SELECT_COLUMNS_LEGACY = `
  id,
  module_id,
  klare_step,
  title,
  description,
  content_type,
  content,
  order_index,
  difficulty_level,
  duration,
  estimated_duration,
  title_localized,
  excercise_steps:excercise_steps(*),
  quiz_questions:quiz_questions(*)
`;

const MODULE_SELECT_COLUMNS_MODERN = `
  id,
  klare_step,
  title,
  description,
  content_type,
  content,
  order_index,
  difficulty_level,
  duration,
  estimated_duration,
  title_localized,
  excercise_steps:excercise_steps(*),
  quiz_questions:quiz_questions(*)
`;

type SupabaseModuleResponse = RawModuleFetchResult & { module_id?: string | null };

type ModuleListRow = {
  id: string;
  module_id?: string | null;
  klare_step?: string | null;
  title: string;
  description?: string | null;
  content_type: string;
  content: any;
  order_index: number;
  difficulty_level?: number | null;
  duration?: number | null;
  estimated_duration?: number | null;
  title_localized?: string | null;
  modules?: {
    slug?: string | null;
    klare_step?: string | null;
    title?: string | null;
    description?: string | null;
    content_type?: string | null;
    order_index?: number | null;
    difficulty_level?: number | null;
    duration?: number | null;
    estimated_duration?: number | null;
    title_localized?: string | null;
  } | null;
};

async function runModuleSelect(
  moduleId: string,
  field: 'module_id' | 'id',
  columns: string,
): Promise<PostgrestSingleResponse<SupabaseModuleResponse>> {
  const response = await supabase
    .from('module_contents')
    .select(columns)
    .eq(field, moduleId)
    .maybeSingle<SupabaseModuleResponse>();

  return response as PostgrestSingleResponse<SupabaseModuleResponse>;
}

async function fetchModuleFromSupabase(moduleId: string): Promise<ModuleContent | null> {
  try {
    // Wenn moduleId ein Slug ist (z.B. "k-intro"), müssen wir zuerst die UUID aus der modules Tabelle holen
    let actualModuleId = moduleId;
    let moduleRecord: ModuleMetadata | null = null;
    let resolvedSlug: string | null = null;

    // Prüfe ob es eine UUID ist (enthält Bindestriche in UUID-Format)
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(moduleId);

    if (!isUUID) {
      // Versuche den Slug in der modules Tabelle zu finden
      const { data: moduleData, error: moduleError } = await supabase
        .from('modules')
        .select(
          'id, slug, klare_step, title, description, content_type, order_index, difficulty_level, estimated_duration, learning_objectives, tags, metadata',
        )
        .eq('slug', moduleId)
        .maybeSingle();

      if (moduleError && moduleError.code !== 'PGRST116') {
        console.warn(`Fehler beim Lookup von Modul-Slug ${moduleId}:`, moduleError);
      }

      if (moduleData?.id) {
        actualModuleId = moduleData.id;
        moduleRecord = moduleData;
        resolvedSlug = moduleData.slug ?? moduleId;
      } else {
        console.warn(`Supabase: Modul mit Slug ${moduleId} nicht gefunden.`);
        return null;
      }
    } else {
      const { data: moduleData, error: moduleError } = await supabase
        .from('modules')
        .select(
          'id, slug, klare_step, title, description, content_type, order_index, difficulty_level, estimated_duration, learning_objectives, tags, metadata',
        )
        .eq('id', actualModuleId)
        .maybeSingle();

      if (moduleError && moduleError.code !== 'PGRST116') {
        console.warn(`Fehler beim Laden der Modulmetadaten ${moduleId}:`, moduleError);
      }

      if (moduleData) {
        moduleRecord = moduleData;
        resolvedSlug = moduleData.slug ?? moduleId;
      }
    }

    let useLegacyColumns = true;
    let response = await runModuleSelect(actualModuleId, 'module_id', MODULE_SELECT_COLUMNS_LEGACY);

    if (response.error) {
      if ((response.error as PostgrestError).code === '42703') {
        useLegacyColumns = false;
        response = await runModuleSelect(actualModuleId, 'module_id', MODULE_SELECT_COLUMNS_MODERN);
      } else if ((response.error as PostgrestError).code !== 'PGRST116') {
        throw response.error;
      }
    }

    if ((!response.data || (response.error as PostgrestError | null)?.code === 'PGRST116') && useLegacyColumns) {
      response = await runModuleSelect(actualModuleId, 'id', MODULE_SELECT_COLUMNS_LEGACY);
      if (
        response.error &&
        (response.error as PostgrestError).code !== 'PGRST116' &&
        (response.error as PostgrestError).code !== '42703'
      ) {
        throw response.error;
      }
    }

    if (!response.data) {
      if (useLegacyColumns) {
        const fallback = await runModuleSelect(actualModuleId, 'id', MODULE_SELECT_COLUMNS_MODERN);
        if (
          fallback.error &&
          (fallback.error as PostgrestError).code !== 'PGRST116' &&
          (fallback.error as PostgrestError).code !== '42703'
        ) {
          throw fallback.error;
        }
        if (!fallback.data) {
          console.warn(`Supabase: Modul ${moduleId} nicht gefunden.`);
          return null;
        }
        return mapRawModuleContent(fallback.data);
      }

      console.warn(`Supabase: Modul ${moduleId} nicht gefunden.`);
      return null;
    }

    const mapped = mapRawModuleContent(response.data, moduleRecord, resolvedSlug);

    if (moduleRecord?.klare_step && mapped.klare_step !== moduleRecord.klare_step) {
      mapped.klare_step = moduleRecord.klare_step;
    }

    // Versuche Content Sections separat zu laden, da sie modules.id referenzieren
    const sections = await fetchContentSections(actualModuleId);
    if (sections.length > 0) {
      mapped.sections = sections;
    }

    LOCAL_MODULE_CACHE[moduleId] = mapped;
    LOCAL_MODULE_CACHE[mapped.module_id] = mapped;

    return mapped;
  } catch (error) {
    console.error('Failed to load module content from Supabase:', error);
    return null;
  }
}

async function fetchContentSections(moduleId: string): Promise<ContentSection[]> {
  try {
    const { data, error } = await supabase
      .from('content_sections')
      .select('*')
      .eq('module_id', moduleId)
      .order('order_index');

    if (error) {
      if (error.code !== 'PGRST116') {
        console.warn('Fehler beim Laden der Content Sections:', error);
      }
      return [];
    }

    return normalizeArray<ModuleSectionRaw>((data ?? []) as ModuleSectionRaw[]).map(mapSection);
  } catch (error) {
    console.warn('Content Sections konnten nicht geladen werden:', error);
    return [];
  }
}

function loadModuleFromModuleDefinitions(moduleId: string): ModuleContent | null {
  try {
    const { getModuleById } = require('../data/klareMethodModules') as typeof import('../data/klareMethodModules');
    const moduleContentData = require('../data/klareModuleContent') as typeof import('../data/klareModuleContent');

    const moduleDefinition = getModuleById(moduleId);
    if (!moduleDefinition) {
      return null;
    }

    const { theoryContent, exerciseContent, quizContent } = moduleContentData;

    let content: any = {
      intro_text: moduleDefinition.description,
    };
    let sections: ContentSection[] = [];
    let exerciseSteps: ExerciseStep[] = [];
    let quizQuestions: QuizQuestion[] = [];

    if (moduleDefinition.type === 'text') {
      const markdown = moduleDefinition.content
        ? theoryContent[moduleDefinition.content as keyof typeof theoryContent]
        : undefined;
      if (markdown) {
        content = { markdown };
        sections = [
          {
            id: `${moduleId}-section-1`,
            title: moduleDefinition.title,
            content: markdown,
            section_type: 'markdown',
            order_index: 1,
          },
        ];
      }
    }

    if (moduleDefinition.type === 'video') {
      content = {
        intro_text: moduleDefinition.description,
        media_key: moduleDefinition.content,
      };
    }

    if (moduleDefinition.type === 'exercise') {
      const exercise = moduleDefinition.content
        ? exerciseContent[moduleDefinition.content as keyof typeof exerciseContent]
        : undefined;
      if (exercise) {
        content = {
          intro_text: exercise.description,
        };
        exerciseSteps = exercise.steps.map((step, index) => ({
          id: `${moduleId}-step-${index + 1}`,
          title: `Schritt ${index + 1}`,
          description: step,
          step_type: 'reflection',
          options: {},
          order_index: index + 1,
        }));
      }
    }

    if (moduleDefinition.type === 'quiz') {
      const quiz = moduleDefinition.content
        ? quizContent[moduleDefinition.content as keyof typeof quizContent]
        : undefined;
      if (quiz) {
        quizQuestions = quiz.questions.map((question, index) => ({
          id: `${moduleId}-quiz-${index + 1}`,
          question_text: question.question,
          question_type: 'single_choice',
          options: question.options,
          correct_answer: String(question.correctAnswer),
          explanation: question.explanation,
        }));
        content = {
          intro_text: moduleDefinition.description,
        };
      }
    }

    return {
      id: moduleId,
      module_id: moduleId,
      klare_step: moduleDefinition.stepId,
      title: moduleDefinition.title,
      description: moduleDefinition.description,
      content_type: moduleDefinition.type,
      content,
      order_index: moduleDefinition.order,
      difficulty_level: null,
      duration: moduleDefinition.duration,
      estimated_duration: undefined,
      sections,
      exercise_steps: exerciseSteps,
      quiz_questions: quizQuestions,
      title_localized: undefined,
    };
  } catch (error) {
    console.warn('Module definition fallback failed:', error);
    return null;
  }
}

function loadModuleFromLocalData(moduleId: string): ModuleContent | null {
  const moduleFromDefinitions = loadModuleFromModuleDefinitions(moduleId);
  if (moduleFromDefinitions) {
    return moduleFromDefinitions;
  }

  try {
    const localModule = require('../data/klareModuleContent') as typeof import('../data/klareModuleContent');
    const theoryContent = localModule.theoryContent?.[moduleId];
    const exerciseContent = localModule.exerciseContent?.[moduleId];
    const quizContent = localModule.quizContent?.[moduleId];

    if (!theoryContent && !exerciseContent && !quizContent) {
      return null;
    }

    const content: Record<string, unknown> = theoryContent
      ? { markdown: theoryContent }
      : exerciseContent
        ? {
            intro_text: exerciseContent.description,
          }
        : {
            intro_text: '',
          };

    const exerciseSteps: ExerciseStep[] = exerciseContent
      ? exerciseContent.steps.map((step, index) => ({
          id: `${moduleId}-step-${index + 1}`,
          title: `Schritt ${index + 1}`,
          description: step,
          step_type: 'reflection',
          options: {},
          order_index: index + 1,
        }))
      : [];

    const quizQuestions: QuizQuestion[] = quizContent
      ? quizContent.questions.map((question, index) => ({
          id: `${moduleId}-quiz-${index + 1}`,
          question_text: question.question,
          question_type: 'single_choice',
          options: question.options,
          correct_answer: String(question.correctAnswer),
          explanation: question.explanation,
        }))
      : [];

    const sections: ContentSection[] = theoryContent
      ? [
          {
            id: `${moduleId}-section-1`,
            title: 'Inhalt',
            content: theoryContent,
            section_type: 'markdown',
            order_index: 1,
          },
        ]
      : [];

    const klareStep = moduleId.substring(0, 1).toUpperCase();

    return {
      id: moduleId,
      module_id: moduleId,
      klare_step: klareStep,
      title: moduleId,
      content_type: theoryContent ? 'theory' : exerciseContent ? 'exercise' : 'quiz',
      content,
      order_index: 0,
      sections,
      exercise_steps: exerciseSteps,
      quiz_questions: quizQuestions,
      difficulty_level: null,
      duration: null,
      estimated_duration: undefined,
      description: undefined,
    };
  } catch (error) {
    console.warn('Legacy local content fallback failed:', error);
    return null;
  }
}
export async function loadModuleContent(moduleId: string): Promise<ModuleContent | null> {
  if (!moduleId) {
    console.warn('loadModuleContent called without moduleId');
    return null;
  }

  if (LOCAL_MODULE_CACHE[moduleId]) {
    return LOCAL_MODULE_CACHE[moduleId];
  }

  const remoteModule = await fetchModuleFromSupabase(moduleId);

  if (remoteModule) {
    LOCAL_MODULE_CACHE[moduleId] = remoteModule;
    return remoteModule;
  }

  const localFallback = loadModuleFromLocalData(moduleId);
  if (localFallback) {
    console.warn(
      `Module ${moduleId} not found in Supabase. Falling back to static data from src/data/klareModuleContent.ts`,
    );
    LOCAL_MODULE_CACHE[moduleId] = localFallback;
    return localFallback;
  }

  return null;
}

/**
 * Load modules by KLARE step (legacy compatibility)
 */
const MODULE_LIST_COLUMNS_LEGACY = `
  id,
  module_id,
  title,
  description,
  content_type,
  content,
  order_index,
  difficulty_level,
  duration,
  estimated_duration,
  title_localized
`;

const MODULE_LIST_COLUMNS_MODERN = `
  id,
  module_id,
  title,
  description,
  content_type,
  content,
  order_index,
  difficulty_level,
  duration,
  estimated_duration,
  title_localized
`;

async function selectModulesByStep(step: string, columns: string): Promise<PostgrestResponse<ModuleListRow>> {
  const response = await supabase
    .from('module_contents')
    .select(`${columns}, modules!inner(slug, klare_step, title, description, content_type, order_index, estimated_duration)`)
    .eq('modules.klare_step', step)
    .order('order_index');

  return response as PostgrestResponse<ModuleListRow>;
}

export async function loadModulesByStep(step: string): Promise<ModuleContent[]> {
  try {
    let useLegacyColumns = true;
    let { data, error } = await selectModulesByStep(step, MODULE_LIST_COLUMNS_LEGACY);

    if (error) {
      if (error.code === '42703') {
        useLegacyColumns = false;
        const fallback = await selectModulesByStep(step, MODULE_LIST_COLUMNS_MODERN);
        data = fallback.data ?? [];
        error = fallback.error ?? null;
      } else {
        throw error;
      }
    }

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Dedupliziere: nur ein Eintrag pro Module (module_id) zurückgeben
    const byModuleId = new Map<string, ModuleContent>();

    for (const row of data) {
      const moduleIdentifier = row.module_id ?? row.id;
      const moduleMetadata = row.modules ?? null;
      const klareStep = row.klare_step
        ?? moduleMetadata?.klare_step
        ?? moduleIdentifier.substring(0, 1).toUpperCase();

      const candidate: ModuleContent = {
        id: row.id,
        module_id: moduleIdentifier,
        module_slug: moduleMetadata?.slug ?? null,
        klare_step: klareStep,
        title: row.title ?? moduleMetadata?.title ?? "",
        description: row.description ?? moduleMetadata?.description ?? undefined,
        content_type: row.content_type ?? moduleMetadata?.content_type ?? "intro",
        content: row.content ?? {},
        order_index: row.order_index ?? moduleMetadata?.order_index ?? 0,
        difficulty_level: row.difficulty_level ?? moduleMetadata?.difficulty_level ?? undefined,
        duration: row.duration ?? undefined,
        estimated_duration: row.estimated_duration ?? moduleMetadata?.estimated_duration ?? undefined,
        title_localized: row.title_localized ?? undefined,
        sections: [],
        exercise_steps: [],
        quiz_questions: [],
      };

      const existing = byModuleId.get(moduleIdentifier);
      // Behalte den "frühesten" (kleinsten) order_index als Repräsentant
      if (!existing || candidate.order_index < existing.order_index) {
        byModuleId.set(moduleIdentifier, candidate);
        LOCAL_MODULE_CACHE[moduleIdentifier] = candidate;
      }
    }

    return Array.from(byModuleId.values()).sort((a, b) => a.order_index - b.order_index);
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
        id: userId,
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
        id: userId,
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
      .eq('id', userId)
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
