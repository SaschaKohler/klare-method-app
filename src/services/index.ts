// src/services/index.ts
// AI-Ready Services Export
import AIService from './AIService';
import HybridContentService from './HybridContentService';

// Core AI Services
export { default as AIService } from './AIService';
export type {
  AIConversationCreate,
  AIPromptTemplateCreate,
  PersonalInsightCreate,
  ChatContext,
  AIResponse
} from './AIService';

// Hybrid Content Service
export { default as HybridContentService } from './HybridContentService';
export type {
  UserPrivacyPreferences,
  ContentSensitivity,
  JournalResponse,
  ModuleContent,
  ExerciseStep
} from './HybridContentService';

// Legacy Services (maintaining compatibility)
export { default as JournalService } from './JournalServiceUpdate';
export { default as PersonalInsightsService } from './PersonalInsightsService';
export { default as UserProfileService } from './UserProfileService';
export { default as VisionBoardService } from './VisionBoardService';
export { default as ResourceLibraryService } from './ResourceLibraryService';
export { default as transformationService } from './transformationService';



/**
 * Service Health Check
 * Tests all AI-ready services for proper functionality
 */
export const checkAllServicesHealth = async () => {
  try {
    const [aiHealth, hybridHealth] = await Promise.all([
      AIService.healthCheck(),
      HybridContentService.getServiceHealth()
    ]);
    
    return {
      ai: aiHealth,
      hybrid: hybridHealth,
      overall: aiHealth.status === 'healthy' && hybridHealth.status === 'healthy' 
        ? 'healthy' 
        : 'degraded',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error checking services health:', error);
    return {
      ai: { status: 'down' as const, services: {}, lastChecked: new Date().toISOString() },
      hybrid: { status: 'down' as const, components: {}, capabilities: [] },
      overall: 'down' as const,
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Initialize all AI-ready services
 * Should be called on app startup after user authentication
 */
export const initializeAIServices = async (userId: string) => {
  try {
    console.log('Initializing AI services for user:', userId);
    
    // Initialize privacy preferences if not set
    const privacy = await HybridContentService.getUserPrivacyPreferences(userId);

    // If no preferences exist, create a default entry.
    if (!privacy) {
      await HybridContentService.setUserPrivacyPreferences(userId, {
        aiEnabled: false,
        aiPersonalizationLevel: 'basic',
        dataSharingLevel: 'cloud_safe',
        consentVersion: '1.0.0', // Set initial consent version
        sensitiveDataLocalOnly: true,
        intimateDataLocalOnly: true,
        prefersStaticQuestions: false,
        allowsAiQuestions: true,
        preferredLanguage: 'de',
        autoTranslate: false,
        last_consent_update: new Date().toISOString(),
      });
    }
    
    // Check service health
    const health = await checkAllServicesHealth();
    console.log('AI Services Health:', health);
    
    return {
      success: true,
      health,
      userId,
      message: 'AI services initialized successfully'
    };
  } catch (error) {
    console.error('Failed to initialize AI services:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      userId,
      message: 'AI services initialization failed'
    };
  }
};

/**
 * Cleanup and maintenance tasks
 * Should be run periodically (e.g., daily)
 */
export const performServiceMaintenance = async () => {
  try {
    console.log('Starting service maintenance...');
    
    // Cleanup expired AI content
    const cleanupResult = await AIService.cleanupExpiredContent();
    console.log(`Cleaned up ${cleanupResult.deletedCount} expired content items`);
    
    // Health check
    const health = await checkAllServicesHealth();
    
    return {
      success: true,
      cleanedUpItems: cleanupResult.deletedCount,
      health,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Service maintenance failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
  }
};

// Service status constants
export const SERVICE_STATUS = {
  HEALTHY: 'healthy' as const,
  DEGRADED: 'degraded' as const,
  DOWN: 'down' as const
};

export const AI_PERSONALIZATION_LEVELS = {
  NONE: 'none' as const,
  BASIC: 'basic' as const,
  ADVANCED: 'advanced' as const
};

export const DATA_SHARING_LEVELS = {
  LOCAL_ONLY: 'local_only' as const,
  CLOUD_SAFE: 'cloud_safe' as const,
  AI_ENABLED: 'ai_enabled' as const
};

export const CONTENT_SENSITIVITY_LEVELS = {
  PUBLIC: 'public' as const,
  SENSITIVE: 'sensitive' as const,
  INTIMATE: 'intimate' as const
};
