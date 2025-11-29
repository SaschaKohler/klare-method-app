import { supabase } from "../lib/supabase";
import { UserProfile, LearningStyle, ContentPreferences, PersonalityTraits, MotivationDrivers, StressIndicators, ProfileCompleteness } from "../types/klare";

class UserProfileService {
  public static async getProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();
      if (error) {
        console.error("Error fetching user profile:", error.message);
        return null;
      }
      return data as UserProfile | null;
    } catch (error) {
      console.error("Exception in getProfile:", error);
      return null;
    }
  }

  public static async getRecommendedContentType(userId: string): Promise<{ format: "text" | "video" | "audio" | "interactive"; length: "short" | "medium" | "long"; complexity: "simple" | "moderate" | "complex"; interactionStyle: "individual" | "guided" | "collaborative"; personalizedElements: string[]; }> {
    try {
      const profile = await UserProfileService.getProfile(userId);
      if (!profile) {
        return { format: "interactive", length: "medium", complexity: "moderate", interactionStyle: "guided", personalizedElements: ["general_encouragement"] };
      }
      const learning = profile.learning_style as LearningStyle | null;
      const content = profile.content_preferences as ContentPreferences | null;
      const traits = profile.personality_traits as PersonalityTraits | null;
      let format: "text" | "video" | "audio" | "interactive" = "interactive";
      if (learning) {
        const max = Math.max(learning.visual, learning.auditory, learning.kinesthetic, learning.reading);
        if (max === learning.visual) format = "video";
        else if (max === learning.auditory) format = "audio";
        else if (max === learning.reading) format = "text";
        else format = "interactive";
      }
      if (content?.preferredFormat && content.preferredFormat !== "mixed") { format = content.preferredFormat; }
      const length = content?.preferredLength || "medium";
      const complexity = content?.preferredComplexity || "moderate";
      let interactionStyle: "individual" | "guided" | "collaborative" = "guided";
      if (learning?.preferredInteraction) { interactionStyle = learning.preferredInteraction; }
      const personalizedElements: string[] = [];
      if (traits) {
        if (traits.selfReflection > 7) personalizedElements.push("deep_reflection_prompts");
        if (traits.goalOrientation > 7) personalizedElements.push("goal_focused_exercises");
        if (traits.creativity > 7) personalizedElements.push("creative_approaches");
        if (traits.extraversion > 7) personalizedElements.push("social_elements");
        if (traits.conscientiousness > 7) personalizedElements.push("structured_approach");
      }
      if (personalizedElements.length === 0) { personalizedElements.push("balanced_approach"); }
      return { format, length, complexity, interactionStyle, personalizedElements };
    } catch (error) {
      console.error("UserProfileService.getRecommendedContentType error:", error);
      return { format: "interactive", length: "medium", complexity: "moderate", interactionStyle: "guided", personalizedElements: ["general_encouragement"] };
    }
  }

  static getCompleteness(profile: UserProfile): ProfileCompleteness {
    const basicInfo = UserProfileService.calculateBasicInfoCompleteness(profile);
    const personalityTraits = UserProfileService.calculateTraitsCompleteness(profile.personality_traits);
    const learningStyle = UserProfileService.calculateLearningCompleteness(profile.learning_style);
    const motivationDrivers = UserProfileService.calculateMotivationCompleteness(profile.motivation_drivers);
    const stressIndicators = UserProfileService.calculateStressCompleteness(profile.stress_indicators);
    const contentPreferences = UserProfileService.calculateContentCompleteness(profile.content_preferences);
    const total = Math.round((basicInfo + personalityTraits + learningStyle + motivationDrivers + stressIndicators + contentPreferences) / 6);
    return { total, basicInfo, personalityTraits, learningStyle, motivationDrivers, stressIndicators, contentPreferences };
  }

  private static calculateBasicInfoCompleteness(profile: UserProfile): number {
    const requiredFields = [
      profile.display_name,
      profile.preferred_language,
      profile.timezone,
    ];
    const completedFields = requiredFields.filter(field => field !== null && field !== undefined && field !== '');
    return Math.round((completedFields.length / requiredFields.length) * 100);
  }

  private static calculateTraitsCompleteness(traits: any): number {
    if (!traits) return 0;
    const requiredFields = ["openness", "conscientiousness", "extraversion", "agreeableness", "neuroticism"];
    const completedFields = requiredFields.filter((field) => traits[field] !== undefined);
    return Math.round((completedFields.length / requiredFields.length) * 100);
  }
  
  private static calculateLearningCompleteness(learning: any): number {
    if (!learning) return 0;
    const requiredFields = ['visual', 'auditory', 'kinesthetic', 'reading', 'preferredPace'];
    const completedFields = requiredFields.filter(field => learning[field] !== undefined);
    return Math.round((completedFields.length / requiredFields.length) * 100);
  }
  
  private static calculateMotivationCompleteness(motivation: any): number {
    if (!motivation) return 0;
    const requiredFields = ['achievement', 'autonomy', 'connection', 'purpose'];
    const completedFields = requiredFields.filter(field => motivation[field] !== undefined);
    return Math.round((completedFields.length / requiredFields.length) * 100);
  }

  private static calculateStressCompleteness(stress: any): number {
    if (!stress) return 0;
    const requiredFields = ["workOverload", "relationshipConflicts", "copingStrategies"];
    const completedFields = requiredFields.filter((field) => stress[field] !== undefined);
    return Math.round((completedFields.length / requiredFields.length) * 100);
  }

  private static calculateContentCompleteness(content: any): number {
    if (!content) return 0;
    const requiredFields = ['preferredFormat', 'preferredLength', 'preferredComplexity'];
    const completedFields = requiredFields.filter(field => content[field] !== undefined);
    return Math.round((completedFields.length / requiredFields.length) * 100);
  }

  private static generatePersonalityDescription(traits: PersonalityTraits | null): string {
    if (!traits) return "Persönlichkeitsprofil noch nicht vollständig";
    const descriptions: string[] = [];
    if (traits.openness > 7) descriptions.push("offen für Neues");
    if (traits.conscientiousness > 7) descriptions.push("gewissenhaft");
    if (traits.extraversion > 7) descriptions.push("extravertiert");
    if (traits.agreeableness > 7) descriptions.push("verträglich");
    if (traits.neuroticism < 3) descriptions.push("emotional stabil");
    if (traits.resilience > 7) descriptions.push("widerstandsfähig");
    return descriptions.length > 0 ? `Persönlichkeit: ${descriptions.join(", ")}` : "Ausgewogene Persönlichkeit";
  }

  private static generateLearningDescription(learning: LearningStyle | null): string {
    if (!learning) return "Lernpräferenzen noch nicht ermittelt";
    const max = Math.max(learning.visual, learning.auditory, learning.kinesthetic, learning.reading);
    let primaryStyle = "gemischt";
    if (max === learning.visual) primaryStyle = "visuell";
    else if (max === learning.auditory) primaryStyle = "auditiv";
    else if (max === learning.kinesthetic) primaryStyle = "kinästhetisch";
    else if (max === learning.reading) primaryStyle = "lesend";
    return `Bevorzugter Lernstil: ${primaryStyle}, Tempo: ${learning.preferredPace}`;
  }

  private static generateMotivationDescription(motivation: MotivationDrivers | null): string {
    if (!motivation) return "Motivationsfaktoren noch nicht ermittelt";
    const topMotivators = Object.entries(motivation).sort(([, a]: [string, any], [, b]: [string, any]) => b - a).slice(0, 3).map(([key]) => {
        const translations: Record<string, string> = { achievement: 'Erfolg', autonomy: 'Autonomie', connection: 'Verbindung', purpose: 'Sinn', growth: 'Wachstum', security: 'Sicherheit', recognition: 'Anerkennung', balance: 'Balance' };
        return translations[key] || key;
      });
    return `Hauptmotivatoren: ${topMotivators.join(', ')}`;
  }

  private static generateStressDescription(stress: StressIndicators | null): string {
    if (!stress) return "Stressfaktoren noch nicht ermittelt";
    const highStressAreas = Object.entries(stress).filter(([, value]) => typeof value === 'number' && value > 6).map(([key]) => {
        const translations: Record<string, string> = { workOverload: 'Arbeitsüberlastung', relationshipConflicts: 'Beziehungskonflikte', financialConcerns: 'finanzielle Sorgen', healthIssues: 'Gesundheitsprobleme', uncertaintyAnxiety: 'Ungewissheit', perfectionism: 'Perfektionismus' };
        return translations[key] || key;
      });
    return highStressAreas.length > 0 ? `Hauptstressfaktoren: ${highStressAreas.join(', ')}` : "Niedriges Stresslevel";
  }

  static validateProfileData(data: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (data.personalityTraits) {
      const traits = data.personalityTraits;
      const requiredTraits = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'];
      for (const trait of requiredTraits) {
        if (traits[trait] !== undefined && (traits[trait] < 1 || traits[trait] > 10)) { errors.push(`${trait} must be between 1 and 10`); }
      }
    }
    if (data.preferredLanguage && !['de', 'en'].includes(data.preferredLanguage)) { errors.push("Language must be 'de' or 'en'"); }
    if (data.interactionStyle && !['supportive', 'challenging', 'neutral'].includes(data.interactionStyle)) { errors.push("Interaction style must be 'supportive', 'challenging', or 'neutral'"); }
    return { isValid: errors.length === 0, errors };
  }

  static getDefaultProfile(): Partial<UserProfile> {
    return {
      preferred_language: 'de',
      timezone: 'Europe/Vienna',
      interaction_style: 'supportive',
      onboarding_completed: false,
      profile_completeness: {
        total: 11,
        basicInfo: 67,
        personalityTraits: 0,
        learningStyle: 0,
        motivationDrivers: 0,
        stressIndicators: 0,
        contentPreferences: 0,
      },
    };
  }
}

export default UserProfileService;
