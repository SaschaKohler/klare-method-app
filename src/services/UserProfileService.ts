RecommendedContentType(userId: string): Promise<{
    format: 'text' | 'video' | 'audio' | 'interactive';
    length: 'short' | 'medium' | 'long';
    complexity: 'simple' | 'moderate' | 'complex';
    interactionStyle: 'individual' | 'guided' | 'collaborative';
    personalizedElements: string[];
  }> {
    try {
      const profile = await this.getProfile(userId);
      
      if (!profile) {
        // Default recommendations for unknown users
        return {
          format: 'interactive',
          length: 'medium',
          complexity: 'moderate',
          interactionStyle: 'guided',
          personalizedElements: ['general_encouragement']
        };
      }
      
      const learning = profile.learning_style as LearningStyle | null;
      const content = profile.content_preferences as ContentPreferences | null;
      const traits = profile.personality_traits as PersonalityTraits | null;
      
      // Determine format based on learning style
      let format: 'text' | 'video' | 'audio' | 'interactive' = 'interactive';
      if (learning) {
        const max = Math.max(learning.visual, learning.auditory, learning.kinesthetic, learning.reading);
        if (max === learning.visual) format = 'video';
        else if (max === learning.auditory) format = 'audio';
        else if (max === learning.reading) format = 'text';
        else format = 'interactive';
      }
      
      // Override with explicit preferences
      if (content?.preferredFormat && content.preferredFormat !== 'mixed') {
        format = content.preferredFormat;
      }
      
      const length = content?.preferredLength || 'medium';
      const complexity = content?.preferredComplexity || 'moderate';
      
      // Determine interaction style
      let interactionStyle: 'individual' | 'guided' | 'collaborative' = 'guided';
      if (learning?.preferredInteraction) {
        interactionStyle = learning.preferredInteraction;
      }
      
      // Generate personalization elements
      const personalizedElements: string[] = [];
      
      if (traits) {
        if (traits.selfReflection > 7) personalizedElements.push('deep_reflection_prompts');
        if (traits.goalOrientation > 7) personalizedElements.push('goal_focused_exercises');
        if (traits.creativity > 7) personalizedElements.push('creative_approaches');
        if (traits.extraversion > 7) personalizedElements.push('social_elements');
        if (traits.conscientiousness > 7) personalizedElements.push('structured_approach');
      }
      
      if (personalizedElements.length === 0) {
        personalizedElements.push('balanced_approach');
      }
      
      return {
        format,
        length,
        complexity,
        interactionStyle,
        personalizedElements
      };
      
    } catch (error) {
      console.error("UserProfileService.getRecommendedContentType error:", error);
      // Return safe defaults
      return {
        format: 'interactive',
        length: 'medium',
        complexity: 'moderate',
        interactionStyle: 'guided',
        personalizedElements: ['general_encouragement']
      };
    }
  }
  
  // =============================================================================
  // PROFILE ANALYSIS & INSIGHTS
  // =============================================================================
  
  /**
   * Analysiert Profil-Vollständigkeit
   */
  static getCompleteness(profile: UserProfile): ProfileCompleteness {
    const basicInfo = this.calculateBasicInfoCompleteness(profile);
    const personalityTraits = this.calculateTraitsCompleteness(profile.personality_traits);
    const learningStyle = this.calculateLearningCompleteness(profile.learning_style);
    const motivationDrivers = this.calculateMotivationCompleteness(profile.motivation_drivers);
    const stressIndicators = this.calculateStressCompleteness(profile.stress_indicators);
    const contentPreferences = this.calculateContentCompleteness(profile.content_preferences);
    
    const overall = Math.round(
      (basicInfo + personalityTraits + learningStyle + motivationDrivers + stressIndicators + contentPreferences) / 6
    );
    
    return {
      basicInfo,
      personalityTraits,
      learningStyle,
      motivationDrivers,
      stressIndicators,
      contentPreferences,
      overall
    };
  }
  
  /**
   * Berechnet Vollständigkeit aus Profil-Daten
   */
  private static calculateCompleteness(profileData: any): ProfileCompleteness {
    // Simplified implementation
    let totalSections = 6;
    let completedSections = 0;
    
    if (profileData.displayName || profileData.preferredLanguage) completedSections++;
    if (profileData.personalityTraits) completedSections++;
    if (profileData.learningStyle) completedSections++;
    if (profileData.motivationDrivers) completedSections++;
    if (profileData.stressIndicators) completedSections++;
    if (profileData.contentPreferences) completedSections++;
    
    const overall = Math.round((completedSections / totalSections) * 100);
    
    return {
      basicInfo: profileData.displayName ? 100 : 0,
      personalityTraits: profileData.personalityTraits ? 100 : 0,
      learningStyle: profileData.learningStyle ? 100 : 0,
      motivationDrivers: profileData.motivationDrivers ? 100 : 0,
      stressIndicators: profileData.stressIndicators ? 100 : 0,
      contentPreferences: profileData.contentPreferences ? 100 : 0,
      overall
    };
  }
  
  private static calculateBasicInfoCompleteness(profile: UserProfile): number {
    let score = 0;
    if (profile.display_name) score += 40;
    if (profile.preferred_language) score += 30;
    if (profile.timezone) score += 30;
    return Math.min(score, 100);
  }
  
  private static calculateTraitsCompleteness(traits: any): number {
    if (!traits) return 0;
    const requiredFields = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'];
    const completedFields = requiredFields.filter(field => traits[field] !== undefined);
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
    const requiredFields = ['achievement', 'autonomy', 'connection', 'purpose', 'growth'];
    const completedFields = requiredFields.filter(field => motivation[field] !== undefined);
    return Math.round((completedFields.length / requiredFields.length) * 100);
  }
  
  private static calculateStressCompleteness(stress: any): number {
    if (!stress) return 0;
    const requiredFields = ['workOverload', 'relationshipConflicts', 'copingStrategies'];
    const completedFields = requiredFields.filter(field => 
      stress[field] !== undefined && 
      (typeof stress[field] !== 'object' || (Array.isArray(stress[field]) && stress[field].length > 0))
    );
    return Math.round((completedFields.length / requiredFields.length) * 100);
  }
  
  private static calculateContentCompleteness(content: any): number {
    if (!content) return 0;
    const requiredFields = ['preferredLength', 'preferredComplexity', 'preferredFormat'];
    const completedFields = requiredFields.filter(field => content[field] !== undefined);
    return Math.round((completedFields.length / requiredFields.length) * 100);
  }
  
  // =============================================================================
  // DESCRIPTION GENERATORS FOR AI
  // =============================================================================
  
  private static generatePersonalityDescription(traits: PersonalityTraits | null): string {
    if (!traits) return "Persönlichkeitsprofil noch nicht vollständig";
    
    const descriptions: string[] = [];
    
    if (traits.openness > 7) descriptions.push("sehr offen für neue Erfahrungen");
    else if (traits.openness < 4) descriptions.push("bevorzugt bekannte Strukturen");
    
    if (traits.conscientiousness > 7) descriptions.push("sehr gewissenhaft und strukturiert");
    else if (traits.conscientiousness < 4) descriptions.push("flexibel und spontan");
    
    if (traits.extraversion > 7) descriptions.push("extrovertiert und energievoll");
    else if (traits.extraversion < 4) descriptions.push("introvertiert und reflektiert");
    
    if (traits.selfReflection > 7) descriptions.push("stark selbstreflektiert");
    if (traits.goalOrientation > 7) descriptions.push("sehr zielorientiert");
    if (traits.resilience > 7) descriptions.push("widerstandsfähig");
    
    return descriptions.length > 0 
      ? `Persönlichkeit: ${descriptions.join(', ')}`
      : "Ausgewogene Persönlichkeit";
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
    
    const topMotivators = Object.entries(motivation)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([key]) => {
        const translations: Record<string, string> = {
          achievement: 'Erfolg',
          autonomy: 'Autonomie',
          connection: 'Verbindung',
          purpose: 'Sinn',
          growth: 'Wachstum',
          security: 'Sicherheit',
          recognition: 'Anerkennung',
          balance: 'Balance'
        };
        return translations[key] || key;
      });
    
    return `Hauptmotivatoren: ${topMotivators.join(', ')}`;
  }
  
  private static generateStressDescription(stress: StressIndicators | null): string {
    if (!stress) return "Stressfaktoren noch nicht ermittelt";
    
    const highStressAreas = Object.entries(stress)
      .filter(([key, value]) => typeof value === 'number' && value > 6)
      .map(([key]) => {
        const translations: Record<string, string> = {
          workOverload: 'Arbeitsüberlastung',
          relationshipConflicts: 'Beziehungskonflikte',
          financialConcerns: 'finanzielle Sorgen',
          healthIssues: 'Gesundheitsprobleme',
          uncertaintyAnxiety: 'Ungewissheit',
          perfectionism: 'Perfektionismus'
        };
        return translations[key] || key;
      });
    
    return highStressAreas.length > 0 
      ? `Hauptstressfaktoren: ${highStressAreas.join(', ')}`
      : "Niedriges Stresslevel";
  }
  
  // =============================================================================
  // UTILITY METHODS
  // =============================================================================
  
  /**
   * Validiert Profil-Daten
   */
  static validateProfileData(data: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Basic validation
    if (data.personalityTraits) {
      const traits = data.personalityTraits;
      const requiredTraits = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'];
      
      for (const trait of requiredTraits) {
        if (traits[trait] !== undefined && (traits[trait] < 1 || traits[trait] > 10)) {
          errors.push(`${trait} must be between 1 and 10`);
        }
      }
    }
    
    if (data.preferredLanguage && !['de', 'en'].includes(data.preferredLanguage)) {
      errors.push("Language must be 'de' or 'en'");
    }
    
    if (data.interactionStyle && !['supportive', 'challenging', 'neutral'].includes(data.interactionStyle)) {
      errors.push("Interaction style must be 'supportive', 'challenging', or 'neutral'");
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Erstellt Default-Profil für neuen User
   */
  static getDefaultProfile(): Partial<UserProfile> {
    return {
      preferred_language: 'de',
      timezone: 'Europe/Vienna',
      interaction_style: 'supportive',
      onboarding_completed: false,
      profile_completeness: 10
    };
  }
}

export default UserProfileService;
