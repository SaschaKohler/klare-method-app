// hooks/useAIIntegration.ts
import { useState, useCallback, useEffect } from 'react';
import AIService, { AIResponse, PersonalInsight } from '../services/AIService';
import HybridContentService, { UserPrivacyPreferences, ModuleContent } from '../services/HybridContentService';
import { useUserStore } from '../stores/userStore';
import i18n from '../utils/i18n';

export interface AIIntegrationState {
  isAIEnabled: boolean;
  isLoading: boolean;
  hasError: boolean;
  errorMessage?: string;
  privacyPreferences: UserPrivacyPreferences;
  serviceHealth: {
    status: 'healthy' | 'degraded' | 'down';
    capabilities: string[];
  };
}

export interface AIConversationState {
  sessionId?: string;
  messages: Array<{
    id: string;
    type: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    insights?: PersonalInsight[];
  }>;
  isTyping: boolean;
}

/**
 * Hook for AI integration in KLARE app
 * Provides AI chat, content generation, and insights
 */
export const useAIIntegration = () => {
  const { user } = useUserStore();
  
  const [state, setState] = useState<AIIntegrationState>({
    isAIEnabled: false,
    isLoading: false,
    hasError: false,
    privacyPreferences: {} as UserPrivacyPreferences,
    serviceHealth: { status: 'down', capabilities: [] }
  });
  
  const [conversation, setConversation] = useState<AIConversationState>({
    messages: [],
    isTyping: false
  });
  
  // =============================================================================
  // INITIALIZATION
  // =============================================================================
  
  useEffect(() => {
    if (user?.id) {
      initializeAI();
    }
  }, [user?.id]);
  
  const initializeAI = useCallback(async () => {
    if (!user?.id) return;
    
    setState(prev => ({ ...prev, isLoading: true, hasError: false }));
    
    try {
      // Load privacy preferences
      const privacy = HybridContentService.getUserPrivacyPreferences(user.id);
      
      // Check service health
      const health = await HybridContentService.getServiceHealth();
      
      setState(prev => ({
        ...prev,
        isAIEnabled: privacy.aiEnabled && health.capabilities.includes('ai_personalization'),
        privacyPreferences: privacy,
        serviceHealth: health,
        isLoading: false
      }));
    } catch (error) {
      console.error('Failed to initialize AI:', error);
      setState(prev => ({
        ...prev,
        hasError: true,
        errorMessage: 'AI initialization failed',
        isLoading: false
      }));
    }
  }, [user?.id]);
  
  // =============================================================================
  // PRIVACY MANAGEMENT
  // =============================================================================
  
  const updatePrivacyPreferences = useCallback((
    updates: Partial<UserPrivacyPreferences>
  ) => {
    if (!user?.id) return;
    
    HybridContentService.setUserPrivacyPreferences(user.id, updates);
    
    setState(prev => ({
      ...prev,
      privacyPreferences: { ...prev.privacyPreferences, ...updates },
      isAIEnabled: updates.aiEnabled !== undefined 
        ? updates.aiEnabled && prev.serviceHealth.capabilities.includes('ai_personalization')
        : prev.isAIEnabled
    }));
  }, [user?.id]);
  
  const enableAI = useCallback((personalizationLevel: 'basic' | 'advanced' = 'basic') => {
    updatePrivacyPreferences({
      aiEnabled: true,
      aiPersonalizationLevel: personalizationLevel,
      allowsAiQuestions: true,
      dataSharingLevel: personalizationLevel === 'advanced' ? 'ai_enabled' : 'cloud_safe'
    });
  }, [updatePrivacyPreferences]);
  
  const disableAI = useCallback(() => {
    updatePrivacyPreferences({
      aiEnabled: false,
      aiPersonalizationLevel: 'none',
      allowsAiQuestions: false,
      dataSharingLevel: 'local_only'
    });
    
    // Clear current conversation
    setConversation({ messages: [], isTyping: false });
  }, [updatePrivacyPreferences]);
  
  // =============================================================================
  // CONVERSATION MANAGEMENT
  // =============================================================================
  
  const startConversation = useCallback(async (
    type: 'chat' | 'coaching' | 'insight_generation' = 'chat',
    initialMessage?: string
  ) => {
    if (!user?.id || !state.isAIEnabled) {
      throw new Error('AI is not enabled or user not authenticated');
    }
    
    setState(prev => ({ ...prev, isLoading: true }));
    setConversation(prev => ({ ...prev, isTyping: true }));
    
    try {
      const result = await AIService.startConversation(
        user.id,
        type,
        initialMessage
      );
      
      const messages = [];
      
      if (initialMessage) {
        messages.push({
          id: `user_${Date.now()}`,
          type: 'user' as const,
          content: initialMessage,
          timestamp: new Date()
        });
      }
      
      if (result.response) {
        messages.push({
          id: `ai_${Date.now()}`,
          type: 'assistant' as const,
          content: result.response.content,
          timestamp: new Date(),
          insights: result.response.insights
        });
      }
      
      setConversation({
        sessionId: result.sessionId,
        messages,
        isTyping: false
      });
      
      setState(prev => ({ ...prev, isLoading: false }));
      
      return result;
    } catch (error) {
      console.error('Failed to start conversation:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        hasError: true,
        errorMessage: 'Failed to start AI conversation'
      }));
      setConversation(prev => ({ ...prev, isTyping: false }));
      throw error;
    }
  }, [user?.id, state.isAIEnabled]);
  
  const sendMessage = useCallback(async (message: string) => {
    if (!user?.id || !conversation.sessionId || !state.isAIEnabled) {
      throw new Error('No active conversation or AI disabled');
    }
    
    // Add user message immediately
    const userMessage = {
      id: `user_${Date.now()}`,
      type: 'user' as const,
      content: message,
      timestamp: new Date()
    };
    
    setConversation(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isTyping: true
    }));
    
    try {
      const response = await AIService.continueConversation(
        user.id,
        conversation.sessionId,
        message
      );
      
      const aiMessage = {
        id: `ai_${Date.now()}`,
        type: 'assistant' as const,
        content: response.content,
        timestamp: new Date(),
        insights: response.insights
      };
      
      setConversation(prev => ({
        ...prev,
        messages: [...prev.messages, aiMessage],
        isTyping: false
      }));
      
      return response;
    } catch (error) {
      console.error('Failed to send message:', error);
      setConversation(prev => ({ ...prev, isTyping: false }));
      
      // Add error message
      const errorMessage = {
        id: `error_${Date.now()}`,
        type: 'assistant' as const,
        content: i18n.t('ai.errorMessage', { 
          defaultValue: 'I apologize, but I encountered an error. Please try again.' 
        }),
        timestamp: new Date()
      };
      
      setConversation(prev => ({
        ...prev,
        messages: [...prev.messages, errorMessage]
      }));
      
      throw error;
    }
  }, [user?.id, conversation.sessionId, state.isAIEnabled]);
  
  const clearConversation = useCallback(() => {
    setConversation({ messages: [], isTyping: false });
  }, []);
  
  // =============================================================================
  // CONTENT GENERATION
  // =============================================================================
  
  const getPersonalizedContent = useCallback(async (
    contentType: 'module' | 'exercise' | 'question' | 'insight',
    contentId: string,
    options?: {
      preferAI?: boolean;
      personalizationLevel?: 'basic' | 'advanced';
    }
  ): Promise<ModuleContent | null> => {
    if (!user?.id) return null;
    
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const content = await HybridContentService.getContentForUser(
        user.id,
        contentType,
        contentId,
        {
          preferAI: options?.preferAI ?? state.isAIEnabled,
          personalizationLevel: options?.personalizationLevel ?? state.privacyPreferences.aiPersonalizationLevel,
          language: i18n.language
        }
      );
      
      setState(prev => ({ ...prev, isLoading: false }));
      return content;
    } catch (error) {
      console.error('Failed to get personalized content:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        hasError: true,
        errorMessage: 'Failed to load content'
      }));
      return null;
    }
  }, [user?.id, state.isAIEnabled, state.privacyPreferences.aiPersonalizationLevel]);
  
  const generateJournalPrompt = useCallback(async (): Promise<string> => {
    if (!user?.id) {
      // Fallback prompts for non-authenticated users
      const fallbacks = i18n.language === 'de' ? [
        'Was beschäftigt dich heute am meisten?',
        'Wofür bist du heute dankbar?',
        'Was hast du heute über dich gelernt?'
      ] : [
        'What is on your mind today?',
        'What are you grateful for today?',
        'What did you learn about yourself today?'
      ];
      return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }
    
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const prompt = await AIService.generateJournalPrompt(user.id);
      setState(prev => ({ ...prev, isLoading: false }));
      return prompt;
    } catch (error) {
      console.error('Failed to generate journal prompt:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      
      // Return fallback
      const fallbacks = i18n.language === 'de' ? [
        'Wie fühlst du dich gerade und warum?',
        'Was war heute besonders bedeutsam für dich?',
        'Welche Gedanken beschäftigen dich heute?'
      ] : [
        'How are you feeling right now and why?',
        'What was particularly meaningful to you today?',
        'What thoughts are occupying your mind today?'
      ];
      return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }
  }, [user?.id]);
  
  const generateInsights = useCallback(async (): Promise<PersonalInsight[]> => {
    if (!user?.id || !state.isAIEnabled) return [];
    
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const insights = await AIService.generateInsights(user.id);
      setState(prev => ({ ...prev, isLoading: false }));
      return insights;
    } catch (error) {
      console.error('Failed to generate insights:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      return [];
    }
  }, [user?.id, state.isAIEnabled]);
  
  const analyzeProgress = useCallback(async () => {
    if (!user?.id || !state.isAIEnabled) return null;
    
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const analysis = await AIService.analyzeProgressAndSuggestNextSteps(user.id);
      setState(prev => ({ ...prev, isLoading: false }));
      return analysis;
    } catch (error) {
      console.error('Failed to analyze progress:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      return null;
    }
  }, [user?.id, state.isAIEnabled]);
  
  // =============================================================================
  // UTILITY FUNCTIONS
  // =============================================================================
  
  const refreshServiceHealth = useCallback(async () => {
    try {
      const health = await HybridContentService.getServiceHealth();
      setState(prev => ({
        ...prev,
        serviceHealth: health,
        isAIEnabled: prev.privacyPreferences.aiEnabled && health.capabilities.includes('ai_personalization')
      }));
      return health;
    } catch (error) {
      console.error('Failed to refresh service health:', error);
      return null;
    }
  }, []);
  
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, hasError: false, errorMessage: undefined }));
  }, []);
  
  // =============================================================================
  // RETURN API
  // =============================================================================
  
  return {
    // State
    ...state,
    conversation,
    
    // Privacy management
    updatePrivacyPreferences,
    enableAI,
    disableAI,
    
    // Conversation
    startConversation,
    sendMessage,
    clearConversation,
    
    // Content generation
    getPersonalizedContent,
    generateJournalPrompt,
    generateInsights,
    analyzeProgress,
    
    // Utilities
    refreshServiceHealth,
    clearError,
    initializeAI
  };
};

export default useAIIntegration;