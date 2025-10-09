// src/store/useAIStore.ts
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { MMKV } from "react-native-mmkv";
import AIService, { AIResponse } from "../services/AIService";
import { Database } from "../types/supabase";

type AIConversation = Database["public"]["Tables"]["ai_conversations"]["Row"];
type PersonalInsight = Database["public"]["Tables"]["personal_insights"]["Row"];

type ConversationType =
  | "chat"
  | "coaching"
  | "insight_generation"
  | "content_personalization";

interface ChatSession {
  sessionId: string;
  conversationType: ConversationType;
  messages: AIConversation[];
  isActive: boolean;
  startedAt: string;
  lastActivity: string;
}

interface AIState {
  currentSession: ChatSession | null;
  chatHistory: ChatSession[];
  isLoading: boolean;
  error: string | null;
  insights: PersonalInsight[];
  insightsLoading: boolean;
  isAIAvailable: boolean;
  lastSyncTime: string | null;
}

interface SyncSessionPayload {
  sessionId: string;
  conversationType: ConversationType;
  messages?: AIConversation[];
  isActive?: boolean;
  startedAt?: string;
  lastActivity?: string;
}

interface AIActions {
  startNewSession: (
    userId: string,
    conversationType: ConversationType,
    initialMessage?: string,
  ) => Promise<void>;
  sendMessage: (userId: string, message: string) => Promise<AIResponse | null>;
  switchSession: (sessionId: string) => void;
  endCurrentSession: () => void;
  loadChatHistory: (userId: string) => Promise<void>;
  syncExternalSession: (payload: SyncSessionPayload) => void;
  loadInsights: (userId: string) => Promise<void>;
  generateNewInsights: (userId: string) => Promise<void>;
  acknowledgeInsight: (insightId: string) => Promise<void>;
  rateInsight: (insightId: string, rating: number) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

type AIStore = AIState & AIActions;

const aiStorage = new MMKV({
  id: "klare-ai-storage",
  encryptionKey: "klare-ai-secure-key-2025",
});

const initialState: AIState = {
  currentSession: null,
  chatHistory: [],
  isLoading: false,
  error: null,
  insights: [],
  insightsLoading: false,
  isAIAvailable: true,
  lastSyncTime: null,
};

const buildSession = (
  sessionId: string,
  conversationType: ConversationType,
  messages: AIConversation[] = [],
  overrides?: Partial<ChatSession>,
): ChatSession => {
  const timestamp = new Date().toISOString();

  return {
    sessionId,
    conversationType,
    messages,
    isActive: overrides?.isActive ?? true,
    startedAt: overrides?.startedAt ?? timestamp,
    lastActivity: overrides?.lastActivity ?? timestamp,
  };
};

const mergeSessionIntoHistory = (
  history: ChatSession[],
  session: ChatSession,
): ChatSession[] => {
  const filteredHistory = history.filter(
    (entry) => entry.sessionId !== session.sessionId,
  );
  return [session, ...filteredHistory];
};

const useAIStore = create<AIStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      startNewSession: async (userId, conversationType, initialMessage) => {
        set({ isLoading: true, error: null });

        try {
          const response = await AIService.startConversation(
            userId,
            conversationType,
            initialMessage,
          );
          const history = await AIService.getConversationHistory(response.sessionId);
          const session = buildSession(response.sessionId, conversationType, history);

          set((state) => ({
            currentSession: session,
            chatHistory: mergeSessionIntoHistory(state.chatHistory, session),
            isLoading: false,
            lastSyncTime: new Date().toISOString(),
          }));
        } catch (error) {
          console.error("[AIStore] startNewSession failed", error);
          set({
            isLoading: false,
            error:
              error instanceof Error
                ? error.message
                : "Session konnte nicht gestartet werden",
          });
        }
      },

      sendMessage: async (userId, message) => {
        const { currentSession } = get();
        if (!currentSession) {
          set({ error: "Keine aktive Session" });
          return null;
        }

        set({ isLoading: true, error: null });

        try {
          const response = await AIService.sendMessage(
            userId,
            currentSession.sessionId,
            message,
            currentSession.conversationType,
          );

          const updatedMessages = await AIService.getConversationHistory(
            currentSession.sessionId,
          );
          const updatedSession: ChatSession = {
            ...currentSession,
            messages: updatedMessages,
            lastActivity: new Date().toISOString(),
          };

          set((state) => ({
            currentSession: updatedSession,
            chatHistory: mergeSessionIntoHistory(
              state.chatHistory,
              updatedSession,
            ),
            isLoading: false,
            lastSyncTime: new Date().toISOString(),
          }));

          if (response.insights?.length) {
            void get().loadInsights(userId);
          }

          return response;
        } catch (error) {
          console.error("[AIStore] sendMessage failed", error);
          set({
            isLoading: false,
            error:
              error instanceof Error
                ? error.message
                : "Nachricht konnte nicht gesendet werden",
          });
          return null;
        }
      },

      switchSession: (sessionId) => {
        const { chatHistory } = get();
        const session = chatHistory.find(
          (entry) => entry.sessionId === sessionId,
        );
        if (!session) {
          return;
        }

        const timestamp = new Date().toISOString();
        const updatedHistory = chatHistory.map((entry) =>
          entry.sessionId === sessionId
            ? { ...entry, isActive: true, lastActivity: timestamp }
            : { ...entry, isActive: false },
        );

        set({
          currentSession: { ...session, isActive: true },
          chatHistory: updatedHistory,
        });
      },

      endCurrentSession: () => {
        const { currentSession, chatHistory } = get();
        if (!currentSession) {
          return;
        }

        const updatedHistory = chatHistory.map((entry) =>
          entry.sessionId === currentSession.sessionId
            ? { ...entry, isActive: false }
            : entry,
        );

        set({
          currentSession: null,
          chatHistory: updatedHistory,
        });
      },

      loadChatHistory: async (userId) => {
        try {
          console.log(`[AIStore] loadChatHistory for ${userId}`);
          set({ lastSyncTime: new Date().toISOString() });
        } catch (error) {
          console.error("[AIStore] loadChatHistory failed", error);
          set({ error: "Chat-Verlauf konnte nicht geladen werden" });
        }
      },

      syncExternalSession: (payload) => {
        const session = buildSession(
          payload.sessionId,
          payload.conversationType,
          payload.messages,
          {
            isActive: payload.isActive,
            startedAt: payload.startedAt,
            lastActivity: payload.lastActivity,
          },
        );

        set((state) => ({
          currentSession: session,
          chatHistory: mergeSessionIntoHistory(state.chatHistory, session),
          isLoading: false,
          error: null,
          lastSyncTime: new Date().toISOString(),
        }));
      },

      loadInsights: async (userId) => {
        try {
          set({ insightsLoading: true, error: null });
          const insights = await AIService.getUserInsights(userId);
          set({
            insights,
            insightsLoading: false,
            lastSyncTime: new Date().toISOString(),
          });
        } catch (error) {
          console.error("[AIStore] loadInsights failed", error);
          set({
            insightsLoading: false,
            error: "Insights konnten nicht geladen werden",
          });
        }
      },

      generateNewInsights: async (userId) => {
        try {
          set({ insightsLoading: true, error: null });
          const newInsights = await AIService.generateInsights(userId);
          set((state) => ({
            insights: [...newInsights, ...state.insights],
            insightsLoading: false,
            lastSyncTime: new Date().toISOString(),
          }));
        } catch (error) {
          console.error("[AIStore] generateNewInsights failed", error);
          set({
            insightsLoading: false,
            error: "Insights konnten nicht generiert werden",
          });
        }
      },

      acknowledgeInsight: async (insightId) => {
        set((state) => ({
          insights: state.insights.map((insight) =>
            insight.id === insightId
              ? { ...insight, user_acknowledged: true }
              : insight,
          ),
        }));
      },

      rateInsight: async (insightId, rating) => {
        set((state) => ({
          insights: state.insights.map((insight) =>
            insight.id === insightId
              ? { ...insight, user_rating: rating }
              : insight,
          ),
        }));
      },

      clearError: () => set({ error: null }),

      reset: () => {
        set(initialState);
        aiStorage.clearAll();
      },
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
        },
      })),
      partialize: (state) => ({
        chatHistory: state.chatHistory,
        insights: state.insights,
        lastSyncTime: state.lastSyncTime,
        isAIAvailable: state.isAIAvailable,
      }),
    },
  ),
);

export default useAIStore;
