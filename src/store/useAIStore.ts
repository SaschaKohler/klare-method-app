// src/store/useAIStore.ts
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { MMKV } from "react-native-mmkv";
import AIService, { AIResponse, ChatContext } from "../services/AIService";
import { Database } from "../types/supabase";

// Types
type AIConversation = Database["public"]["Tables"]["ai_conversations"]["Row"];
type PersonalInsight = Database["public"]["Tables"]["personal_insights"]["Row"];

interface ChatSession {
  sessionId: string;
  conversationType: "chat" | "coaching" | "insight_generation" | "content_personalization";
  messages: AIConversation[];
  isActive: boolean;
  startedAt: string;
  lastActivity: string;
}

interface AIState {
  // Chat Management
  currentSession: ChatSession | null;
  chatHistory: ChatSession[];
  isLoading: boolean;
  error: string | null;
  
  // Personal Insights
  insights: PersonalInsight[];
  insightsLoading: boolean;
  
  // AI Status
  isAIAvailable: boolean;
  lastSyncTime: string | null;
}

interface AIActions {
  // Session Management
  startNewSession: (
    userId: string, 
    conversationType: ChatSession["conversationType"],
    initialMessage?: string
  ) => Promise<void>;
  
  sendMessage: (userId: string, message: string) => Promise<AIResponse | null>;
  
  switchSession: (sessionId: string) => void;
  
  endCurrentSession: () => void;
  
  loadChatHistory: (userId: string) => Promise<void>;
  
  // Insights Management
  loadInsights: (userId: string) => Promise<void>;
  
  generateNewInsights: (userId: string) => Promise<void>;
  
  acknowledgeInsight: (insightId: string) => Promise<void>;
  
  rateInsight: (insightId: string, rating: number) => Promise<void>;
  
  // Utility
  clearError: () => void;
  
  reset: () => void;
}

type AIStore = AIState & AIActions;

// MMKV Storage
const aiStorage = new MMKV({
  id: "klare-ai-storage",
  encryptionKey: "klare-ai-secure-key-2025"
});

// Initial State
const initialState: AIState = {
  currentSession: null,
  chatHistory: [],
  isLoading: false,
  error: null,
  insights: [],
  insightsLoading: false,
  isAIAvailable: true,
  lastSyncTime: null
};

export const useAIStore = create<AIStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      // =============================================================================
      // SESSION MANAGEMENT
      // =============================================================================
      
      startNewSession: async (userId, conversationType, initialMessage) => {
        try {
          set({ isLoading: true, error: null });
          
          console.log(`[AIStore] Starting new ${conversationType} session for user ${userId}`);
          
          const response = await AIService.startConversation(
            userId, 
            conversationType, 
            initialMessage
          );
          
          const newSession: ChatSession = {
            sessionId: response.sessionId,
            conversationType,
            messages: [],
            isActive: true,
            startedAt: new Date().toISOString(),
            lastActivity: new Date().toISOString()
          };
          
          // Load conversation history for the new session
          const history = await AIService.getConversationHistory(response.sessionId);
          newSession.messages = history;
          
          const { chatHistory } = get();
          
          set({
            currentSession: newSession,
            chatHistory: [newSession, ...chatHistory],
            isLoading: false,
            lastSyncTime: new Date().toISOString()
          });
          
          console.log(`[AIStore] Session started successfully: ${response.sessionId}`);
          
        } catch (error) {
          console.error("[AIStore] Error starting session:", error);
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : "Failed to start session" 
          });
        }
      },
      
      sendMessage: async (userId, message) => {
        const { currentSession } = get();
        
        if (!currentSession) {
          set({ error: "No active session" });
          return null;
        }
        
        try {
          set({ isLoading: true, error: null });
          
          console.log(`[AIStore] Sending message to session ${currentSession.sessionId}`);
          
          const response = await AIService.sendMessage(
            userId,
            currentSession.sessionId,
            message,
            currentSession.conversationType
          );
          
          // Reload conversation history
          const updatedHistory = await AIService.getConversationHistory(currentSession.sessionId);
          
          const updatedSession: ChatSession = {
            ...currentSession,
            messages: updatedHistory,
            lastActivity: new Date().toISOString()
          };
          
          // Update chat history
          const { chatHistory } = get();
          const updatedChatHistory = chatHistory.map(session => 
            session.sessionId === currentSession.sessionId ? updatedSession : session
          );
          
          set({
            currentSession: updatedSession,
            chatHistory: updatedChatHistory,
            isLoading: false,
            lastSyncTime: new Date().toISOString()
          });
          
          // If insights were generated, reload insights
          if (response.insights && response.insights.length > 0) {
            get().loadInsights(userId);
          }
          
          return response;
          
        } catch (error) {
          console.error("[AIStore] Error sending message:", error);
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : "Failed to send message" 
          });
          return null;
        }
      },
      
      switchSession: (sessionId) => {
        const { chatHistory } = get();
        const session = chatHistory.find(s => s.sessionId === sessionId);
        
        if (session) {
          // Mark previous session as inactive
          const { currentSession } = get();
          if (currentSession) {
            const updatedHistory = chatHistory.map(s => 
              s.sessionId === currentSession.sessionId 
                ? { ...s, isActive: false }
                : s.sessionId === sessionId 
                ? { ...s, isActive: true }
                : s
            );
            
            set({
              currentSession: { ...session, isActive: true },
              chatHistory: updatedHistory
            });
          } else {
            set({ currentSession: { ...session, isActive: true } });
          }
          
          console.log(`[AIStore] Switched to session: ${sessionId}`);
        }
      },
      
      endCurrentSession: () => {
        const { currentSession, chatHistory } = get();
        
        if (currentSession) {
          const updatedHistory = chatHistory.map(session => 
            session.sessionId === currentSession.sessionId 
              ? { ...session, isActive: false }
              : session
          );
          
          set({
            currentSession: null,
            chatHistory: updatedHistory
          });
          
          console.log(`[AIStore] Ended session: ${currentSession.sessionId}`);
        }
      },
      
      loadChatHistory: async (userId) => {
        try {
          console.log(`[AIStore] Loading chat history for user ${userId}`);
          
          // Note: This would require a new RPC function in Supabase
          // For now, we'll use the stored chatHistory
          const { chatHistory } = get();
          
          set({ 
            chatHistory,
            lastSyncTime: new Date().toISOString() 
          });
          
        } catch (error) {
          console.error("[AIStore] Error loading chat history:", error);
          set({ error: "Failed to load chat history" });
        }
      },
      
      // =============================================================================
      // INSIGHTS MANAGEMENT
      // =============================================================================
      
      loadInsights: async (userId) => {
        try {
          set({ insightsLoading: true, error: null });
          
          console.log(`[AIStore] Loading insights for user ${userId}`);
          
          const insights = await AIService.getUserInsights(userId);
          
          set({ 
            insights,
            insightsLoading: false,
            lastSyncTime: new Date().toISOString()
          });
          
          console.log(`[AIStore] Loaded ${insights.length} insights`);
          
        } catch (error) {
          console.error("[AIStore] Error loading insights:", error);
          set({ 
            insightsLoading: false, 
            error: "Failed to load insights" 
          });
        }
      },
      
      generateNewInsights: async (userId) => {
        try {
          set({ insightsLoading: true, error: null });
          
          console.log(`[AIStore] Generating new insights for user ${userId}`);
          
          const newInsights = await AIService.generateInsights(userId);
          
          const { insights } = get();
          
          set({
            insights: [...newInsights, ...insights],
            insightsLoading: false,
            lastSyncTime: new Date().toISOString()
          });
          
          console.log(`[AIStore] Generated ${newInsights.length} new insights`);
          
        } catch (error) {
          console.error("[AIStore] Error generating insights:", error);
          set({ 
            insightsLoading: false, 
            error: "Failed to generate insights" 
          });
        }
      },
      
      acknowledgeInsight: async (insightId) => {
        try {
          // Update in database
          // Note: Would need to add this functionality to AIService
          
          // Update local state
          const { insights } = get();
          const updatedInsights = insights.map(insight => 
            insight.id === insightId 
              ? { ...insight, user_acknowledged: true }
              : insight
          );
          
          set({ insights: updatedInsights });
          
          console.log(`[AIStore] Acknowledged insight: ${insightId}`);
          
        } catch (error) {
          console.error("[AIStore] Error acknowledging insight:", error);
          set({ error: "Failed to acknowledge insight" });
        }
      },
      
      rateInsight: async (insightId, rating) => {
        try {
          // Update in database
          // Note: Would need to add this functionality to AIService
          
          // Update local state
          const { insights } = get();
          const updatedInsights = insights.map(insight => 
            insight.id === insightId 
              ? { ...insight, user_rating: rating }
              : insight
          );
          
          set({ insights: updatedInsights });
          
          console.log(`[AIStore] Rated insight ${insightId}: ${rating}/10`);
          
        } catch (error) {
          console.error("[AIStore] Error rating insight:", error);
          set({ error: "Failed to rate insight" });
        }
      },
      
      // =============================================================================
      // UTILITY
      // =============================================================================
      
      clearError: () => {
        set({ error: null });
      },
      
      reset: () => {
        set(initialState);
        aiStorage.clearAll();
        console.log("[AIStore] Store reset and storage cleared");
      }
    }),
    {
      name: "klare-ai-store",
      storage: createJSONStorage(() => ({
        getItem: (key) => {
          const value = aiStorage.getString(key);
          return value ? JSON.parse(value) : null;
        },
        setItem: (key, value) => {
          aiStorage.set(key, JSON.stringify(value));
        },
        removeItem: (key) => {
          aiStorage.delete(key);
        }
      })),
      // Only persist non-sensitive state
      partialize: (state) => ({
        chatHistory: state.chatHistory,
        insights: state.insights,
        lastSyncTime: state.lastSyncTime,
        isAIAvailable: state.isAIAvailable
      })
    }
  )
);

export default useAIStore;
