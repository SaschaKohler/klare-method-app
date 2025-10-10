// src/services/LifeWheelReflectionService.ts
import { supabase } from "../lib/supabase";

/**
 * Service for managing Life Wheel area reflections and AI coach Q&A
 * Ensures personalized questions without repetition
 */

export interface LifeWheelReflection {
  why_low?: string;
  what_matters?: string;
  ideal_state?: string;
  obstacles?: string[];
  first_steps?: string[];
  previous_answers?: Array<{
    question: string;
    answer: string;
    timestamp: string;
    session_id?: string;
  }>;
}

export class LifeWheelReflectionService {
  
  /**
   * Save a reflection answer for a specific life area
   */
  static async saveReflectionAnswer(
    userId: string,
    areaId: string,
    question: string,
    answer: string,
    sessionId?: string,
    areaData?: {
      name: string;
      currentValue?: number;
      targetValue?: number;
    }
  ): Promise<void> {
    try {
      // Try to find by name (string ID like "health") or UUID
      const { data: area, error: fetchError } = await supabase
        .from("life_wheel_areas")
        .select("reflection_data, id")
        .eq("user_id", userId)
        .or(`id.eq.${areaId},name.eq.${areaId}`)
        .maybeSingle();

      if (fetchError) {
        console.error("Error fetching area:", fetchError);
        throw fetchError;
      }

      const currentReflection: LifeWheelReflection = area?.reflection_data || {};
      
      // Add to previous_answers array
      if (!currentReflection.previous_answers) {
        currentReflection.previous_answers = [];
      }

      currentReflection.previous_answers.push({
        question,
        answer,
        timestamp: new Date().toISOString(),
        session_id: sessionId,
      });

      // If area doesn't exist yet, we can't save (areas are created elsewhere)
      if (!area) {
        console.warn(`⚠️ Cannot save reflection: life_wheel_area '${areaId}' does not exist yet for user ${userId}`);
        console.log("💡 Reflection will be saved later when areas are created.");
        // Don't throw - this is expected during onboarding
        return;
      }

      // Update the existing area
      const { error: updateError } = await supabase
        .from("life_wheel_areas")
        .update({ 
          reflection_data: currentReflection,
          updated_at: new Date().toISOString(),
        })
        .eq("id", areaId)
        .eq("user_id", userId);

      if (updateError) {
        console.error("Error updating area:", updateError);
        throw updateError;
      }

      console.log(`✅ Reflection answer saved for area ${areaId}`);
    } catch (error) {
      console.error("❌ Error saving reflection answer:", error);
      throw error;
    }
  }

  /**
   * Get all reflections for a life area
   */
  static async getAreaReflections(
    userId: string,
    areaId: string
  ): Promise<LifeWheelReflection> {
    try {
      const { data, error } = await supabase
        .from("life_wheel_areas")
        .select("reflection_data")
        .eq("id", areaId)
        .eq("user_id", userId)
        .maybeSingle();

      // If no row found, return empty object (not an error)
      if (!data) {
        console.log(`ℹ️ No life_wheel_area found for id=${areaId}, user=${userId}. Returning empty reflections.`);
        return {};
      }

      if (error) {
        console.error("❌ Error fetching area reflections:", error);
        return {};
      }

      return data?.reflection_data || {};
    } catch (error) {
      console.error("❌ Error fetching area reflections:", error);
      return {};
    }
  }

  /**
   * Get all previously asked questions for an area
   * Used to avoid repeating the same questions
   */
  static async getPreviousQuestions(
    userId: string,
    areaId: string
  ): Promise<string[]> {
    try {
      const reflections = await this.getAreaReflections(userId, areaId);
      
      return reflections.previous_answers?.map(a => a.question) || [];
    } catch (error) {
      console.error("❌ Error fetching previous questions:", error);
      return [];
    }
  }

  /**
   * Update structured reflection fields (why_low, ideal_state, etc.)
   */
  static async updateStructuredReflection(
    userId: string,
    areaId: string,
    updates: Partial<LifeWheelReflection>
  ): Promise<void> {
    try {
      // Get current reflection_data
      const { data: area, error: fetchError } = await supabase
        .from("life_wheel_areas")
        .select("reflection_data")
        .eq("id", areaId)
        .eq("user_id", userId)
        .single();

      if (fetchError) throw fetchError;

      const currentReflection: LifeWheelReflection = area?.reflection_data || {};
      
      // Merge updates
      const updatedReflection = {
        ...currentReflection,
        ...updates,
      };

      // Update the area
      const { error: updateError } = await supabase
        .from("life_wheel_areas")
        .update({ 
          reflection_data: updatedReflection,
          updated_at: new Date().toISOString(),
        })
        .eq("id", areaId)
        .eq("user_id", userId);

      if (updateError) throw updateError;

      console.log(`✅ Structured reflection updated for area ${areaId}`);
    } catch (error) {
      console.error("❌ Error updating structured reflection:", error);
      throw error;
    }
  }

  /**
   * Get context for AI to generate personalized questions
   * Returns all user data relevant for this life area
   */
  static async getAIContext(
    userId: string,
    areaId: string
  ): Promise<{
    area: any;
    reflections: LifeWheelReflection;
    previousQuestions: string[];
    userProfile: any;
  }> {
    try {
      // Get life wheel area
      const { data: area } = await supabase
        .from("life_wheel_areas")
        .select("*")
        .eq("id", areaId)
        .eq("user_id", userId)
        .single();

      // Get reflections
      const reflections = await this.getAreaReflections(userId, areaId);
      
      // Get previous questions
      const previousQuestions = await this.getPreviousQuestions(userId, areaId);

      // Get user profile for personalization
      const { data: userProfile } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      return {
        area,
        reflections,
        previousQuestions,
        userProfile,
      };
    } catch (error) {
      console.error("❌ Error getting AI context:", error);
      throw error;
    }
  }
}
