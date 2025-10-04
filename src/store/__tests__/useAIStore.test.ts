import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import AIService, { type AIResponse } from "../../services/AIService";
import { useAIStore } from "../useAIStore";
import type { Database } from "../../types/supabase";

// Typ-Helfer für Supabase Rows
 type AIConversationRow = Database["public"]["Tables"]["ai_conversations"]["Row"];
 type PersonalInsightRow = Database["public"]["Tables"]["personal_insights"]["Row"];

 type StorageFunctions = {
   getString: (key: string) => string | null;
   set: (key: string, value: string) => void;
   delete: (key: string) => void;
   clearAll: () => void;
 };

 type MockStorage = jest.Mocked<StorageFunctions>;

 const createStorageMock = (): MockStorage => ({
   getString: jest.fn(() => null),
   set: jest.fn(),
   delete: jest.fn(),
   clearAll: jest.fn(),
 });

 jest.mock("react-native-mmkv", () => {
   const storage = createStorageMock();
   return {
     MMKV: jest.fn(() => storage),
     __storage: storage,
   };
 });

 jest.mock("../../services/AIService", () => ({
   __esModule: true,
   default: {
     startConversation: jest.fn(),
     getConversationHistory: jest.fn(),
     sendMessage: jest.fn(),
     getUserInsights: jest.fn(),
     generateInsights: jest.fn(),
   },
 }));

 const { __storage: storageMock } = jest.requireMock("react-native-mmkv") as {
   __storage: MockStorage;
 };

 const mockAIService = jest.mocked(AIService);

 const createConversationRow = (overrides: Partial<AIConversationRow> = {}): AIConversationRow => ({
   id: "conv-id",
   user_id: "user-id",
   session_id: "session-id",
   conversation_type: "chat",
   message_type: "system",
   message_content: "",
   created_at: new Date().toISOString(),
   ai_model: null,
   prompt_template_id: null,
   generation_metadata: null,
   ...overrides,
 });

 const createInsightRow = (overrides: Partial<PersonalInsightRow> = {}): PersonalInsightRow => ({
   id: "insight-id",
   user_id: "user-1",
   title: "Insight",
   description: "Beschreibung",
   insight_type: "growth",
   source: "ai_generated",
   created_at: new Date().toISOString(),
   updated_at: new Date().toISOString(),
   related_areas: null,
   related_modules: null,
   supporting_evidence: null,
   confidence_score: null,
   ai_model: null,
   is_active: true,
   user_acknowledged: false,
   user_notes: null,
   user_rating: null,
   ...overrides,
 });

 const resetStoreState = () => {
   useAIStore.setState({
     currentSession: null,
     chatHistory: [],
     isLoading: false,
     error: null,
     insights: [],
     insightsLoading: false,
     isAIAvailable: true,
     lastSyncTime: null,
   });
 };

 describe("useAIStore", () => {
   beforeEach(() => {
     jest.clearAllMocks();
     resetStoreState();
   });

   test("startet eine neue Session und lädt Verlauf", async () => {
     const sessionId = "session-123";
     const userId = "user-1";
     const history: AIConversationRow[] = [
       createConversationRow({
         id: "conv-1",
         user_id: userId,
         session_id: sessionId,
         message_type: "system",
         message_content: "Hallo",
         ai_model: "gpt-4",
       }),
     ];

     mockAIService.startConversation.mockResolvedValue({ sessionId });
     mockAIService.getConversationHistory.mockResolvedValue(history);

     await useAIStore.getState().startNewSession(userId, "chat", "Hi");

     expect(mockAIService.startConversation).toHaveBeenCalledWith(userId, "chat", "Hi");
     expect(mockAIService.getConversationHistory).toHaveBeenCalledWith(sessionId);

     const state = useAIStore.getState();
     expect(state.currentSession?.sessionId).toBe(sessionId);
     expect(state.currentSession?.messages).toEqual(history);
     expect(state.chatHistory[0].sessionId).toBe(sessionId);
     expect(state.isLoading).toBe(false);
     expect(state.error).toBeNull();
   });

   test("sendMessage setzt Fehler, wenn keine Session aktiv ist", async () => {
     const response = await useAIStore.getState().sendMessage("user-1", "Hallo");

     expect(response).toBeNull();
     expect(useAIStore.getState().error).toBe("No active session");
   });

   test("sendMessage aktualisiert aktuellen Verlauf", async () => {
     const sessionId = "session-123";
     const userId = "user-1";
     const timestamp = new Date().toISOString();

     const session = {
       sessionId,
       conversationType: "chat" as const,
       messages: [] as AIConversationRow[],
       isActive: true,
       startedAt: timestamp,
       lastActivity: timestamp,
     };

     useAIStore.setState({
       currentSession: session,
       chatHistory: [session],
       isLoading: false,
       error: null,
     });

     const apiResponse: AIResponse = {
       content: "Antwort",
       confidence: 0.9,
       suggestions: [],
       insights: [],
       nextQuestions: [],
       metadata: { tokenUsage: 42 },
     };

     const updatedHistory: AIConversationRow[] = [
       createConversationRow({
         id: "conv-2",
         user_id: userId,
         session_id: sessionId,
         message_type: "assistant",
         message_content: "Antwort",
         created_at: timestamp,
         ai_model: "gpt-4",
       }),
     ];

     mockAIService.sendMessage.mockResolvedValue(apiResponse);
     mockAIService.getConversationHistory.mockResolvedValue(updatedHistory);

     const result = await useAIStore.getState().sendMessage(userId, "Wie geht's?");

     expect(mockAIService.sendMessage).toHaveBeenCalledWith(userId, sessionId, "Wie geht's?", "chat");
     expect(mockAIService.getConversationHistory).toHaveBeenCalledWith(sessionId);
     expect(result).toEqual(apiResponse);

     const state = useAIStore.getState();
     expect(state.currentSession?.messages).toEqual(updatedHistory);
     expect(state.chatHistory[0].messages).toEqual(updatedHistory);
     expect(state.isLoading).toBe(false);
     expect(state.error).toBeNull();
   });

   test("loadInsights lädt persönliche Insights", async () => {
     const userId = "user-1";
     const insights: PersonalInsightRow[] = [
       createInsightRow({ id: "insight-1", title: "Neue Erkenntnis" }),
     ];

     mockAIService.getUserInsights.mockResolvedValue(insights);

     await useAIStore.getState().loadInsights(userId);

     expect(mockAIService.getUserInsights).toHaveBeenCalledWith(userId);
     expect(useAIStore.getState().insights).toEqual(insights);
     expect(useAIStore.getState().insightsLoading).toBe(false);
   });

   test("generateNewInsights fügt neue Insights hinzu", async () => {
     const userId = "user-1";
     const existingInsight = createInsightRow({ id: "insight-existing", description: "Bestehend" });
     const newInsights: PersonalInsightRow[] = [
       createInsightRow({ id: "insight-new", description: "Neu" }),
     ];

     useAIStore.setState({ insights: [existingInsight] });
     mockAIService.generateInsights.mockResolvedValue(newInsights);

     await useAIStore.getState().generateNewInsights(userId);

     const mergedInsights = useAIStore.getState().insights;
     expect(mockAIService.generateInsights).toHaveBeenCalledWith(userId);
     expect(mergedInsights).toHaveLength(2);
     expect(mergedInsights[0].id).toBe("insight-new");
     expect(mergedInsights[1].id).toBe("insight-existing");
   });

   test("reset setzt Zustand zurück und leert Storage", () => {
     const timestamp = new Date().toISOString();

     useAIStore.setState({
       currentSession: {
         sessionId: "session-reset",
         conversationType: "chat",
         messages: [],
         isActive: true,
         startedAt: timestamp,
         lastActivity: timestamp,
       },
       chatHistory: [],
       isLoading: true,
       error: "Fehler",
       insights: [createInsightRow({ id: "insight-temp" })],
       insightsLoading: true,
       isAIAvailable: false,
       lastSyncTime: timestamp,
     });

     useAIStore.getState().reset();

     const state = useAIStore.getState();
     expect(state.currentSession).toBeNull();
     expect(state.chatHistory).toHaveLength(0);
     expect(state.isLoading).toBe(false);
     expect(state.error).toBeNull();
     expect(state.insights).toHaveLength(0);
     expect(state.insightsLoading).toBe(false);
     expect(state.isAIAvailable).toBe(true);
     expect(state.lastSyncTime).toBeNull();
     expect(storageMock.clearAll).toHaveBeenCalledTimes(1);
   });
 });
