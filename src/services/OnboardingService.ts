import { supabase } from "../lib/supabase";
import {
  OnboardingProfile,
  PrivacySettings,
  LifeWheelArea,
} from "../store/onboardingStore";
import { UserAnswerTrackingService } from "./UserAnswerTrackingService";

export interface OnboardingData {
  profile: OnboardingProfile;
  privacySettings: PrivacySettings;
  lifeWheelAreas: LifeWheelArea[];
}

export class OnboardingService {
  /**
   * Save user profile to the AI-ready database
   * @param markAsCompleted - Set to true to mark onboarding as completed (only for final completion)
   */
  static async saveUserProfile(
    userId: string,
    profile: OnboardingProfile,
    markAsCompleted: boolean = false,
  ): Promise<void> {
    try {
      // Prepare the update data
      const updateData: any = {
        user_id: userId,
        first_name: profile.firstName,
        preferred_name: profile.preferredName || null,
        age_range: profile.ageRange,
        primary_goals: profile.primaryGoals,
        current_challenges: profile.currentChallenges,
        experience_level: profile.experienceLevel,
        time_commitment: profile.timeCommitment,
        updated_at: new Date().toISOString(),
      };

      // Only set onboarding_completed_at when explicitly marking as completed
      if (markAsCompleted) {
        updateData.onboarding_completed_at = new Date().toISOString();
      }

      // Create or update user profile in the new AI-ready schema
      // Use onConflict to ensure updates instead of creating duplicates
      const { error: profileError } = await supabase
        .from("user_profiles")
        .upsert(updateData, { onConflict: 'user_id' });

      if (profileError) {
        throw new Error(`Failed to save user profile: ${profileError.message}`);
      }

      console.log(`✅ User profile saved successfully${markAsCompleted ? ' (marked as completed)' : ''}`);
    } catch (error) {
      console.error("❌ Error saving user profile:", error);
      throw error;
    }
  }

  /**
   * Save privacy settings to secure storage and database
   */
  static async savePrivacySettings(
    userId: string,
    settings: PrivacySettings,
  ): Promise<void> {
    try {
      // Update user profile with privacy preferences in JSONB format
      const { error: settingsError } = await supabase
        .from("user_profiles")
        .update({
          privacy_settings: {
            dataProcessing: settings.dataProcessing,
            analytics: settings.analytics,
            crashReporting: settings.crashReporting,
            marketing: settings.marketing,
            aiFeatures: settings.aiFeatures,
            personalInsights: settings.personalInsights,
          },
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      if (settingsError) {
        throw new Error(
          `Failed to save privacy settings: ${settingsError.message}`,
        );
      }

      console.log("✅ Privacy settings saved successfully");
    } catch (error) {
      console.error("❌ Error saving privacy settings:", error);
      throw error;
    }
  }

  /**
   * Create initial Life Wheel snapshot
   */
  static async createLifeWheelSnapshot(
    userId: string,
    areas: LifeWheelArea[],
  ): Promise<void> {
    try {
      // Prepare snapshot data for the JSON field
      const snapshotData = {
        title: "Initial Assessment",
        areas: areas.map((area) => ({
          id: area.id,
          name: area.name,
          currentValue: area.currentValue,
          targetValue: area.targetValue,
          color: area.color,
        })),
        averageScore:
          areas.reduce((sum, area) => sum + area.currentValue, 0) /
          areas.length,
        createdDuringOnboarding: true,
      };

      // Create a new life wheel snapshot with correct schema
      const { data: insertedSnapshot, error: snapshotError } = await supabase
        .from("life_wheel_snapshots")
        .insert({
          user_id: userId,
          snapshot_data: snapshotData,
          context: "Life Wheel setup during onboarding",
          created_at: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (snapshotError || !insertedSnapshot) {
        throw new Error(
          `Failed to create life wheel snapshot: ${snapshotError?.message}`,
        );
      }

      console.log("✅ Life Wheel snapshot created successfully");
    } catch (error) {
      console.error("❌ Error creating Life Wheel snapshot:", error);
      throw error;
    }
  }

  /**
   * Complete the entire onboarding process
   */
  static async completeOnboarding(
    userId: string,
    onboardingData: OnboardingData,
  ): Promise<void> {
    try {
      console.log("🚀 Starting onboarding completion process...");

      // Save all onboarding data in sequence
      // Mark as completed only here, not during progress saves
      await this.saveUserProfile(userId, onboardingData.profile, true);
      await this.savePrivacySettings(userId, onboardingData.privacySettings);
      await this.createLifeWheelSnapshot(userId, onboardingData.lifeWheelAreas);

      // Mark onboarding as completed in the profiles table
      const { error: completionError } = await supabase
        .from("profiles")
        .update({
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (completionError) {
        console.warn(
          "Warning: Could not update users table:",
          completionError.message,
        );
        // Don't throw error - the main onboarding data is saved in user_profiles
      }

      // Create initial personal insights based on onboarding data
      await this.createInitialInsights(userId, onboardingData);

      // Save onboarding answers to user_answers table for AI personalization
      await this.saveOnboardingAnswers(userId, onboardingData);

      console.log("🎉 Onboarding completed successfully!");
    } catch (error) {
      console.error("❌ Error completing onboarding:", error);
      throw error;
    }
  }

  /**
   * Create initial personal insights based on onboarding data
   */
  private static async createInitialInsights(
    userId: string,
    data: OnboardingData,
  ): Promise<void> {
    try {
      const insights = [];

      // Generate insights based on primary goals
      if (data.profile.primaryGoals.length > 0) {
        insights.push({
          user_id: userId,
          insight_type: "goal",
          title: "Your Focus Areas",
          description: `You've identified ${data.profile.primaryGoals.length} key areas for growth: ${data.profile.primaryGoals.join(", ")}. This shows a clear direction for your personal development journey.`,
          source: "assessment",
          confidence_score: 0.9,
          is_active: true,
          created_at: new Date().toISOString(),
        });
      }

      // Generate insights based on Life Wheel assessment
      const averageCurrentSatisfaction =
        data.lifeWheelAreas.reduce((sum, area) => sum + area.currentValue, 0) /
        data.lifeWheelAreas.length;
      const averageTargetSatisfaction =
        data.lifeWheelAreas.reduce((sum, area) => sum + area.targetValue, 0) /
        data.lifeWheelAreas.length;
      const growthPotential =
        averageTargetSatisfaction - averageCurrentSatisfaction;

      insights.push({
        user_id: userId,
        insight_type: "pattern",
        title: "Life Balance Assessment",
        description: `Your current life satisfaction average is ${averageCurrentSatisfaction.toFixed(1)}/10, with a growth potential of ${growthPotential.toFixed(1)} points. This indicates ${growthPotential > 2 ? "significant" : "moderate"} room for improvement.`,
        source: "assessment",
        confidence_score: 0.85,
        is_active: true,
        created_at: new Date().toISOString(),
      });

      // Find the area with the biggest gap (highest growth potential)
      const maxGapArea = data.lifeWheelAreas.reduce((max, area) =>
        area.targetValue - area.currentValue >
        max.targetValue - max.currentValue
          ? area
          : max,
      );

      insights.push({
        user_id: userId,
        insight_type: "recommendation",
        title: "Priority Development Area",
        description: `${maxGapArea.name} shows the biggest gap between current (${maxGapArea.currentValue}/10) and target satisfaction (${maxGapArea.targetValue}/10). Consider focusing your initial efforts here.`,
        source: "assessment",
        confidence_score: 0.8,
        is_active: true,
        related_areas: [maxGapArea.name],
        created_at: new Date().toISOString(),
      });

      // Save insights to database
      if (insights.length > 0) {
        console.log("Creating initial personal insights:", insights);
        const { error: insightsError } = await supabase
          .from("personal_insights")
          .insert(insights);

        if (insightsError) {
          console.error(
            "⚠️ Warning: Failed to save initial insights:",
            insightsError.message,
          );
          // Don't throw error here - insights are nice to have but not critical
        } else {
          console.log("✅ Initial insights created successfully");
        }
      }
    } catch (error) {
      console.error("⚠️ Warning: Error creating initial insights:", error);
      // Don't rethrow - this is a non-critical operation
    }
  }

  /**
   * Save onboarding answers to user_answers table for AI personalization
   */
  private static async saveOnboardingAnswers(
    userId: string,
    data: OnboardingData,
  ): Promise<void> {
    try {
      const answers = [];

      // Save primary goals as answers
      if (data.profile.primaryGoals.length > 0) {
        answers.push({
          user_id: userId,
          content_type: 'onboarding_profile',
          question_type: 'coaching' as const,
          question_text: 'Was sind deine primären Ziele?',
          answer_data: { goals: data.profile.primaryGoals },
          answer_text: data.profile.primaryGoals.join(', '),
          key_themes: data.profile.primaryGoals,
        });
      }

      // Save challenges as answers
      if (data.profile.currentChallenges.length > 0) {
        answers.push({
          user_id: userId,
          content_type: 'onboarding_profile',
          question_type: 'coaching' as const,
          question_text: 'Was sind deine aktuellen Herausforderungen?',
          answer_data: { challenges: data.profile.currentChallenges },
          answer_text: data.profile.currentChallenges.join(', '),
          key_themes: data.profile.currentChallenges,
        });
      }

      // Save age range
      if (data.profile.ageRange) {
        answers.push({
          user_id: userId,
          content_type: 'onboarding_profile',
          question_type: 'coaching' as const,
          question_text: 'In welcher Altersgruppe bist du?',
          answer_data: { age_range: data.profile.ageRange },
          answer_text: data.profile.ageRange,
        });
      }

      // Save experience level
      if (data.profile.experienceLevel) {
        answers.push({
          user_id: userId,
          content_type: 'onboarding_profile',
          question_type: 'coaching' as const,
          question_text: 'Wie viel Erfahrung hast du mit persönlicher Entwicklung?',
          answer_data: { experience_level: data.profile.experienceLevel },
          answer_text: data.profile.experienceLevel,
        });
      }

      // Save time commitment
      if (data.profile.timeCommitment) {
        answers.push({
          user_id: userId,
          content_type: 'onboarding_profile',
          question_type: 'coaching' as const,
          question_text: 'Wie viel Zeit möchtest du täglich investieren?',
          answer_data: { time_commitment: data.profile.timeCommitment },
          answer_text: data.profile.timeCommitment,
        });
      }

      // Save all answers
      if (answers.length > 0) {
        console.log(`📝 Attempting to save ${answers.length} onboarding answers...`);
        for (const answer of answers) {
          try {
            await UserAnswerTrackingService.saveUserAnswer(answer);
          } catch (answerError) {
            console.error("❌ Failed to save answer:", answer.question_text, answerError);
          }
        }
        console.log(`✅ Saved ${answers.length} onboarding answers for AI personalization`);
      } else {
        console.log('⚠️ No onboarding answers to save');
      }
    } catch (error) {
      console.error("⚠️ Warning: Error saving onboarding answers:", error);
      // Don't rethrow - this is a non-critical operation
    }
  }

  /**
   * Check if user has completed onboarding
   */
  static async isOnboardingCompleted(userId: string): Promise<boolean> {
    try {
      // Check in user_profiles table (AI-ready schema)
      const { data, error } = await supabase
        .from("user_profiles")
        .select("onboarding_completed_at")
        .eq("user_id", userId)
        .single();

      if (error) {
        // If no profile exists yet, onboarding is not completed
        if (error.code === "PGRST116") {
          return false;
        }
        console.error("Error checking onboarding status:", error);
        return false;
      }

      return !!data?.onboarding_completed_at;
    } catch (error) {
      console.error("Error checking onboarding status:", error);
      return false;
    }
  }

  /**
   * Get user's onboarding data for review/editing
   */
  static async getOnboardingData(
    userId: string,
  ): Promise<OnboardingData | null> {
    try {
      // Get user profile
      const { data: profileData, error: profileError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (profileError) {
        console.error("Error fetching user profile:", profileError);
        return null;
      }

      // Get latest life wheel snapshot
      const { data: snapshotData, error: snapshotError } = await supabase
        .from("life_wheel_snapshots")
        .select(
          `
          id,
          life_wheel_area_values (
            area_id,
            area_name,
            current_value,
            target_value,
            color
          )
        `,
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (snapshotError) {
        console.error("Error fetching life wheel data:", snapshotError);
        return null;
      }

      // Transform data back to OnboardingData format
      const privacySettings = profileData.privacy_settings || {};
      const onboardingData: OnboardingData = {
        profile: {
          firstName: profileData.first_name || "",
          preferredName: profileData.preferred_name || "",
          ageRange: profileData.age_range || "",
          primaryGoals: profileData.primary_goals || [],
          currentChallenges: profileData.current_challenges || [],
          experienceLevel: profileData.experience_level || "",
          timeCommitment: profileData.time_commitment || "",
        },
        privacySettings: {
          dataProcessing: privacySettings.dataProcessing || "local",
          analytics: privacySettings.analytics ?? false,
          crashReporting: privacySettings.crashReporting ?? true,
          marketing: privacySettings.marketing ?? false,
          aiFeatures: privacySettings.aiFeatures ?? false,
          personalInsights: privacySettings.personalInsights ?? true,
        },
        lifeWheelAreas: snapshotData.life_wheel_area_values.map(
          (area: any) => ({
            id: area.area_id,
            name: area.area_name,
            currentValue: area.current_value,
            targetValue: area.target_value,
            color: area.color,
          }),
        ),
      };

      return onboardingData;
    } catch (error) {
      console.error("Error getting onboarding data:", error);
      return null;
    }
  }
}
