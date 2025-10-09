// src/services/UserAnswerTrackingService.ts
import { supabase } from "../lib/supabase";

/**
 * Typdefinitionen für User Answer Tracking
 */
export interface UserAnswer {
  id?: string;
  user_id: string;
  module_id?: string;
  question_id?: string;
  question_type: 'quiz' | 'reflection' | 'metamodel' | 'genius_gate' | 'coaching' | 'exercise';
  question_text: string;
  answer_text?: string;
  answer_data?: Record<string, any>;
  emotion_tags?: string[];
  key_themes?: string[];
  confidence_level?: number; // 1-5
  ai_analysis?: Record<string, any>;
  related_insights?: string[];
  answered_at?: string;
}

export interface ExerciseResult {
  id?: string;
  user_id: string;
  module_id?: string;
  exercise_step_id?: string;
  exercise_type: string;
  user_input: Record<string, any>;
  completion_status?: 'in_progress' | 'completed' | 'skipped';
  time_spent_seconds?: number;
  attempts_count?: number;
  score?: number;
  ai_feedback?: Record<string, any>;
  suggested_improvements?: string[];
  started_at?: string;
  completed_at?: string;
}

export interface ComprehensiveUserContext {
  profile: {
    goals: string[];
    challenges: string[];
    experience_level: string;
    time_commitment: string;
  };
  recent_answers: Array<{
    question: string;
    answer: string;
    themes: string[];
    emotions: string[];
    date: string;
  }>;
  life_wheel: Record<string, any>;
  patterns: Array<{
    type: string;
    data: Record<string, any>;
    confidence: number;
  }>;
  completed_modules: string[];
}

/**
 * Service für granulares Tracking von User-Antworten und Übungen
 * Ermöglicht hochpersonalisierte AI-Prompts basierend auf User-Historie
 */
export class UserAnswerTrackingService {
  
  // =============================================================================
  // USER ANSWERS
  // =============================================================================
  
  /**
   * Speichert eine User-Antwort
   */
  static async saveUserAnswer(answer: UserAnswer): Promise<void> {
    try {
      const { error } = await supabase
        .from("user_answers")
        .insert({
          user_id: answer.user_id,
          module_id: answer.module_id,
          question_id: answer.question_id,
          question_type: answer.question_type,
          question_text: answer.question_text,
          answer_text: answer.answer_text,
          answer_data: answer.answer_data,
          emotion_tags: answer.emotion_tags,
          key_themes: answer.key_themes,
          confidence_level: answer.confidence_level,
          ai_analysis: answer.ai_analysis,
          related_insights: answer.related_insights,
        });

      if (error) throw error;
      console.log("✅ User answer saved successfully");
    } catch (error) {
      console.error("❌ Error saving user answer:", error);
      throw error;
    }
  }

  /**
   * Holt Antworten eines Users zu einem bestimmten Thema
   */
  static async getUserAnswersByTheme(
    userId: string,
    theme: string,
    limit: number = 10
  ): Promise<any[]> {
    try {
      const { data, error } = await supabase.rpc(
        "get_user_answers_by_theme",
        {
          p_user_id: userId,
          p_theme: theme,
          p_limit: limit,
        }
      );

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching user answers by theme:", error);
      return [];
    }
  }

  /**
   * Holt alle Antworten eines Users zu einem Modul
   */
  static async getUserAnswersByModule(
    userId: string,
    moduleId: string
  ): Promise<UserAnswer[]> {
    try {
      const { data, error } = await supabase
        .from("user_answers")
        .select("*")
        .eq("user_id", userId)
        .eq("module_id", moduleId)
        .order("answered_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching user answers by module:", error);
      return [];
    }
  }

  /**
   * Holt die letzten N Antworten eines Users
   */
  static async getRecentUserAnswers(
    userId: string,
    limit: number = 20
  ): Promise<UserAnswer[]> {
    try {
      const { data, error } = await supabase
        .from("user_answers")
        .select("*")
        .eq("user_id", userId)
        .order("answered_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching recent user answers:", error);
      return [];
    }
  }

  /**
   * Aktualisiert AI-Analyse für eine Antwort
   */
  static async updateAnswerAnalysis(
    answerId: string,
    analysis: Record<string, any>
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from("user_answers")
        .update({ ai_analysis: analysis })
        .eq("id", answerId);

      if (error) throw error;
    } catch (error) {
      console.error("Error updating answer analysis:", error);
      throw error;
    }
  }

  // =============================================================================
  // EXERCISE RESULTS
  // =============================================================================

  /**
   * Speichert ein Übungsergebnis
   */
  static async saveExerciseResult(result: ExerciseResult): Promise<string> {
    try {
      const { data, error } = await supabase
        .from("exercise_results")
        .insert({
          user_id: result.user_id,
          module_id: result.module_id,
          exercise_step_id: result.exercise_step_id,
          exercise_type: result.exercise_type,
          user_input: result.user_input,
          completion_status: result.completion_status || 'in_progress',
          time_spent_seconds: result.time_spent_seconds,
          attempts_count: result.attempts_count || 1,
          score: result.score,
          ai_feedback: result.ai_feedback,
          suggested_improvements: result.suggested_improvements,
          started_at: result.started_at || new Date().toISOString(),
          completed_at: result.completed_at,
        })
        .select("id")
        .single();

      if (error) throw error;
      console.log("✅ Exercise result saved successfully");
      return data.id;
    } catch (error) {
      console.error("❌ Error saving exercise result:", error);
      throw error;
    }
  }

  /**
   * Aktualisiert ein Übungsergebnis (z.B. bei Completion)
   */
  static async updateExerciseResult(
    resultId: string,
    updates: Partial<ExerciseResult>
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from("exercise_results")
        .update(updates)
        .eq("id", resultId);

      if (error) throw error;
    } catch (error) {
      console.error("Error updating exercise result:", error);
      throw error;
    }
  }

  /**
   * Holt alle Übungsergebnisse eines Users zu einem Modul
   */
  static async getExerciseResultsByModule(
    userId: string,
    moduleId: string
  ): Promise<ExerciseResult[]> {
    try {
      const { data, error } = await supabase
        .from("exercise_results")
        .select("*")
        .eq("user_id", userId)
        .eq("module_id", moduleId)
        .order("started_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching exercise results:", error);
      return [];
    }
  }

  // =============================================================================
  // COMPREHENSIVE CONTEXT
  // =============================================================================

  /**
   * Holt umfassenden User-Kontext für AI-Personalisierung
   * Nutzt die Datenbank-Funktion get_comprehensive_user_context
   */
  static async getComprehensiveUserContext(
    userId: string
  ): Promise<ComprehensiveUserContext | null> {
    try {
      const { data, error } = await supabase.rpc(
        "get_comprehensive_user_context",
        { p_user_id: userId }
      );

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching comprehensive user context:", error);
      return null;
    }
  }

  /**
   * Erstellt einen AI-Prompt-Kontext basierend auf User-Historie
   * Diese Methode bereitet die Daten für AI-Prompts auf
   */
  static async buildAIPromptContext(userId: string): Promise<string> {
    const context = await this.getComprehensiveUserContext(userId);
    if (!context) return "";

    const parts: string[] = [];

    // User Profile
    if (context.profile) {
      parts.push(`Ziele: ${context.profile.goals.join(", ")}`);
      parts.push(`Herausforderungen: ${context.profile.challenges.join(", ")}`);
      parts.push(`Erfahrungslevel: ${context.profile.experience_level}`);
    }

    // Recent Answers mit Themen
    if (context.recent_answers && context.recent_answers.length > 0) {
      const recentThemes = new Set<string>();
      const recentEmotions = new Set<string>();
      
      context.recent_answers.forEach(answer => {
        answer.themes?.forEach(theme => recentThemes.add(theme));
        answer.emotions?.forEach(emotion => recentEmotions.add(emotion));
      });

      if (recentThemes.size > 0) {
        parts.push(`Aktuelle Themen: ${Array.from(recentThemes).join(", ")}`);
      }
      if (recentEmotions.size > 0) {
        parts.push(`Emotionale Lage: ${Array.from(recentEmotions).join(", ")}`);
      }
    }

    // Life Wheel Status
    if (context.life_wheel) {
      parts.push(`LifeWheel Durchschnitt: ${this.calculateLifeWheelAverage(context.life_wheel)}/10`);
    }

    // Patterns
    if (context.patterns && context.patterns.length > 0) {
      const highConfidencePatterns = context.patterns
        .filter(p => p.confidence > 0.7)
        .map(p => p.type);
      if (highConfidencePatterns.length > 0) {
        parts.push(`Erkannte Muster: ${highConfidencePatterns.join(", ")}`);
      }
    }

    return parts.join("\n");
  }

  /**
   * Berechnet LifeWheel Durchschnitt aus Snapshot
   */
  private static calculateLifeWheelAverage(lifeWheel: any): number {
    if (!lifeWheel?.areas || !Array.isArray(lifeWheel.areas)) {
      return 0;
    }

    const sum = lifeWheel.areas.reduce(
      (acc: number, area: any) => acc + (area.currentValue || 0),
      0
    );
    return Math.round((sum / lifeWheel.areas.length) * 10) / 10;
  }

  // =============================================================================
  // ANALYTICS & INSIGHTS
  // =============================================================================

  /**
   * Analysiert Antwort-Patterns für Insights
   */
  static async analyzeAnswerPatterns(userId: string): Promise<{
    frequentThemes: Array<{ theme: string; count: number }>;
    emotionalTrend: string;
    progressIndicators: Record<string, any>;
  }> {
    const answers = await this.getRecentUserAnswers(userId, 50);

    // Häufigste Themen
    const themeCount = new Map<string, number>();
    const emotionCount = new Map<string, number>();

    answers.forEach(answer => {
      answer.key_themes?.forEach(theme => {
        themeCount.set(theme, (themeCount.get(theme) || 0) + 1);
      });
      answer.emotion_tags?.forEach(emotion => {
        emotionCount.set(emotion, (emotionCount.get(emotion) || 0) + 1);
      });
    });

    const frequentThemes = Array.from(themeCount.entries())
      .map(([theme, count]) => ({ theme, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Emotionaler Trend (vereinfacht)
    const dominantEmotion = Array.from(emotionCount.entries())
      .sort((a, b) => b[1] - a[1])[0];

    return {
      frequentThemes,
      emotionalTrend: dominantEmotion ? dominantEmotion[0] : 'neutral',
      progressIndicators: {
        totalAnswers: answers.length,
        averageConfidence: this.calculateAverageConfidence(answers),
      },
    };
  }

  private static calculateAverageConfidence(answers: UserAnswer[]): number {
    const withConfidence = answers.filter(a => a.confidence_level);
    if (withConfidence.length === 0) return 0;

    const sum = withConfidence.reduce(
      (acc, a) => acc + (a.confidence_level || 0),
      0
    );
    return Math.round((sum / withConfidence.length) * 10) / 10;
  }
}
