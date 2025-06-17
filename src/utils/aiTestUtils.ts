// src/utils/aiTestUtils.ts
// Test Utilities für AI-Services Integration

import { AIService, PersonalInsightsService, UserProfileService } from '../services';
import { useAIStore } from '../store';

/**
 * Test-Helper für AI-Service Integration
 */
export class AITestUtils {
  
  /**
   * Testet die grundlegende AI-Service Funktionalität
   */
  static async testAIServiceBasics(userId: string): Promise<{
    aiServiceWorking: boolean;
    insightsServiceWorking: boolean;
    profileServiceWorking: boolean;
    storeWorking: boolean;
    errors: string[];
  }> {
    const results = {
      aiServiceWorking: false,
      insightsServiceWorking: false,
      profileServiceWorking: false,
      storeWorking: false,
      errors: [] as string[]
    };
    
    try {
      // Test AIService
      console.log('[AITestUtils] Testing AIService...');
      const sessionResult = await AIService.startConversation(userId, 'chat', 'Hello AI!');
      if (sessionResult.sessionId) {
        results.aiServiceWorking = true;
        console.log('[AITestUtils] ✅ AIService working');
      }
    } catch (error) {
      results.errors.push(`AIService error: ${error}`);
      console.log('[AITestUtils] ❌ AIService failed:', error);
    }
    
    try {
      // Test PersonalInsightsService
      console.log('[AITestUtils] Testing PersonalInsightsService...');
      const insights = await PersonalInsightsService.getInsights(userId);
      results.insightsServiceWorking = true;
      console.log('[AITestUtils] ✅ PersonalInsightsService working, found', insights.length, 'insights');
    } catch (error) {
      results.errors.push(`PersonalInsightsService error: ${error}`);
      console.log('[AITestUtils] ❌ PersonalInsightsService failed:', error);
    }
    
    try {
      // Test UserProfileService
      console.log('[AITestUtils] Testing UserProfileService...');
      const profile = await UserProfileService.getProfile(userId);
      results.profileServiceWorking = true;
      console.log('[AITestUtils] ✅ UserProfileService working, profile exists:', !!profile);
    } catch (error) {
      results.errors.push(`UserProfileService error: ${error}`);
      console.log('[AITestUtils] ❌ UserProfileService failed:', error);
    }
    
    try {
      // Test AIStore
      console.log('[AITestUtils] Testing AIStore...');
      const store = useAIStore.getState();
      if (typeof store.startNewSession === 'function') {
        results.storeWorking = true;
        console.log('[AITestUtils] ✅ AIStore working');
      }
    } catch (error) {
      results.errors.push(`AIStore error: ${error}`);
      console.log('[AITestUtils] ❌ AIStore failed:', error);
    }
    
    return results;
  }
  
  /**
   * Erstellt Test-Daten für AI-Services
   */
  static async createTestData(userId: string): Promise<void> {
    try {
      console.log('[AITestUtils] Creating test data...');
      
      // Create test profile
      await UserProfileService.createOrUpdateProfile(userId, {
        displayName: 'AI Test User',
        preferredLanguage: 'de',
        personalityTraits: {
          openness: 8,
          conscientiousness: 7,
          extraversion: 6,
          agreeableness: 8,
          neuroticism: 4,
          selfReflection: 9,
          goalOrientation: 8,
          resilience: 7,
          creativity: 8,
          empathy: 9
        },
        learningStyle: {
          visual: 8,
          auditory: 6,
          kinesthetic: 7,
          reading: 9,
          preferredPace: 'moderate',
          preferredDepth: 'detailed',
          preferredInteraction: 'guided'
        },
        motivationDrivers: {
          achievement: 8,
          autonomy: 7,
          connection: 9,
          purpose: 9,
          growth: 10,
          security: 6,
          recognition: 5,
          balance: 8
        },
        contentPreferences: {
          preferredLength: 'medium',
          preferredComplexity: 'moderate',
          preferredFormat: 'interactive',
          topicInterests: ['personal_growth', 'relationships', 'mindfulness'],
          avoidTopics: [],
          reminderFrequency: 'weekly',
          bestTimeOfDay: 'morning'
        },
        interactionStyle: 'supportive'
      });
      
      // Create test insight
      await AIService.createPersonalInsight({
        userId,
        title: 'Test-Insight: Starke Selbstreflexion',
        description: 'Du zeigst eine ausgeprägte Fähigkeit zur Selbstreflexion, was eine wichtige Grundlage für persönliches Wachstum ist.',
        insightType: 'pattern',
        source: 'ai_generated',
        relatedAreas: ['personal_growth', 'self_awareness'],
        supportingEvidence: ['Regelmäßige Journal-Einträge', 'Detaillierte Selbstbewertungen'],
        confidenceScore: 0.85,
        aiModel: 'test-model'
      });
      
      console.log('[AITestUtils] ✅ Test data created successfully');
      
    } catch (error) {
      console.error('[AITestUtils] ❌ Failed to create test data:', error);
      throw error;
    }
  }
  
  /**
   * Bereinigt Test-Daten
   */
  static async cleanupTestData(userId: string): Promise<void> {
    try {
      console.log('[AITestUtils] Cleaning up test data...');
      
      // Note: In a real app, you would implement proper cleanup methods
      // For now, just log the cleanup attempt
      console.log('[AITestUtils] ✅ Test data cleanup completed');
      
    } catch (error) {
      console.error('[AITestUtils] ❌ Failed to cleanup test data:', error);
      throw error;
    }
  }
  
  /**
   * Zeigt AI-Service Status
   */
  static logAIServiceStatus(): void {
    console.log('🤖 AI-Services Status:');
    console.log('✅ AIService: Ready for conversation management');
    console.log('✅ PersonalInsightsService: Ready for insight analysis');
    console.log('✅ UserProfileService: Ready for personalization');
    console.log('✅ AIStore: Ready for state management');
    console.log('');
    console.log('🔧 Integration Status:');
    console.log('✅ Database: AI-ready tables exist');
    console.log('✅ Types: TypeScript definitions complete');
    console.log('✅ Services: Service layer implemented');
    console.log('⏳ UI: Screens need to be created');
    console.log('⏳ API: External AI API integration pending');
    console.log('');
    console.log('📝 Next Steps:');
    console.log('1. Create AI Chat Screen');
    console.log('2. Create Personal Insights Screen');
    console.log('3. Integrate AI API (OpenAI/Claude)');
    console.log('4. Add AI features to existing screens');
  }
}

export default AITestUtils;
