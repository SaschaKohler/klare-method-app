// src/services/KModuleAICoaching.ts
/**
 * K-Modul AI-Coaching Service
 * 
 * Dieser Service bietet personalisiertes AI-Coaching für das K-Modul (Klarheit).
 * Er aggregiert User-Kontext und generiert maßgeschneiderte Coaching-Inhalte.
 */

import { supabase } from '../lib/supabase';
import AIService from './AIService';

export interface UserContextForAI {
  userId: string;
  userName?: string;
  ageRange?: string;
  experienceLevel?: string;
  primaryGoals?: string[];
  timeCommitment?: string;
  
  lifeWheelData?: {
    lowestAreas: Array<{ name: string; value: number }>;
    highestAreas: Array<{ name: string; value: number }>;
    gapAreas: Array<{ name: string; currentValue: number; targetValue: number }>;
    average: number;
  };
  
  kModuleProgress?: {
    currentPhase?: string;
    completedPhases?: string[];
    metamodelLevel?: number;
    keyInsights?: any[];
    patternsIdentified?: any[];
  };
  
  previousResponses?: Array<{
    exerciseId: string;
    answerData: any;
    reflectionText?: string;
  }>;
  
  privacySettings?: {
    aiEnabled: boolean;
    aiPersonalizationLevel: 'none' | 'basic' | 'enhanced' | 'ai' | 'predictive';
    allowsAiQuestions: boolean;
  };
}

export interface AIInsight {
  type: 'insight' | 'warning' | 'encouragement' | 'suggestion';
  title: string;
  content: string;
  actionable?: boolean;
  relatedModule?: string;
}

export interface AIFeedback {
  isCorrect: boolean;
  feedback: string;
  suggestions?: string[];
  encouragement: string;
  nextSteps?: string[];
}

export interface ProgressSummary {
  overallProgress: number;
  completedModules: string[];
  keyAchievements: string[];
  areasForImprovement: string[];
  personalizedRecommendations: string[];
  motivationalMessage: string;
}

export class KModuleAICoaching {
  private aiService: AIService;

  constructor() {
    this.aiService = new AIService();
  }

  /**
   * Aggregiert User-Kontext aus verschiedenen Datenquellen
   */
  async getUserContext(userId: string): Promise<UserContextForAI> {
    try {
      // User Profile laden
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      // Life Wheel Daten laden
      const { data: lifeWheelAreas } = await supabase
        .from('life_wheel_areas')
        .select('*')
        .eq('user_id', userId);

      // K-Modul Progress laden
      const { data: kProgress } = await supabase
        .from('k_module_progress')
        .select('*')
        .eq('user_id', userId)
        .single();

      // Recent User Answers laden
      const { data: recentAnswers } = await supabase
        .from('user_answers')
        .select('exercise_id, answer_data, reflection_text')
        .eq('user_id', userId)
        .order('answered_at', { ascending: false })
        .limit(10);

      // Life Wheel Analyse
      let lifeWheelData;
      if (lifeWheelAreas && lifeWheelAreas.length > 0) {
        const sorted = [...lifeWheelAreas].sort((a, b) => a.current_value - b.current_value);
        const average = lifeWheelAreas.reduce((sum, area) => sum + area.current_value, 0) / lifeWheelAreas.length;
        
        lifeWheelData = {
          lowestAreas: sorted.slice(0, 3).map(a => ({ name: a.area_name, value: a.current_value })),
          highestAreas: sorted.slice(-3).map(a => ({ name: a.area_name, value: a.current_value })),
          gapAreas: lifeWheelAreas
            .filter(a => Math.abs(a.target_value - a.current_value) > 3)
            .map(a => ({
              name: a.area_name,
              currentValue: a.current_value,
              targetValue: a.target_value
            })),
          average
        };
      }

      return {
        userId,
        userName: profile?.preferred_name || profile?.first_name,
        ageRange: profile?.age_range,
        experienceLevel: profile?.experience_level,
        primaryGoals: profile?.primary_goals || [],
        timeCommitment: profile?.time_commitment,
        lifeWheelData,
        kModuleProgress: kProgress ? {
          currentPhase: kProgress.current_phase,
          completedPhases: kProgress.completed_phases || [],
          metamodelLevel: kProgress.metamodel_level || 1,
          keyInsights: kProgress.key_insights || [],
          patternsIdentified: kProgress.patterns_identified || []
        } : undefined,
        previousResponses: recentAnswers?.map(a => ({
        exerciseId: a.exercise_id,
        answerData: a.answer_data,
        reflectionText: a.reflection_text
      })) || [],
        privacySettings: profile?.privacy_settings || {
          aiEnabled: false,
          aiPersonalizationLevel: 'basic',
          allowsAiQuestions: false
        }
      };
    } catch (error) {
      console.error('Error loading user context:', error);
      throw error;
    }
  }

  /**
   * Generiert personalisierte Einführung für K-Modul
   */
  async getPersonalizedIntro(userId: string): Promise<string> {
    try {
      const context = await this.getUserContext(userId);

      // Privacy Check
      if (!context.privacySettings?.aiEnabled || 
          context.privacySettings.aiPersonalizationLevel === 'none') {
        return this.getStaticIntro();
      }

      // AI-Prompt Template laden
      const { data: template } = await supabase
        .from('ai_prompt_templates')
        .select('*')
        .eq('template_name', 'k_intro_personalized')
        .eq('is_active', true)
        .single();

      if (!template) {
        return this.getStaticIntro();
      }

      // Variablen für Template vorbereiten
      const variables = {
        user_name: context.userName || 'du',
        age_range: context.ageRange || 'Erwachsener',
        primary_goal: context.primaryGoals?.[0] || 'persönliche Entwicklung',
        lowest_areas: context.lifeWheelData?.lowestAreas.map(a => a.name).join(', ') || 'verschiedene Bereiche',
        highest_areas: context.lifeWheelData?.highestAreas.map(a => a.name).join(', ') || 'einige Bereiche',
        gap_area: context.lifeWheelData?.gapAreas[0]?.name || 'Work-Life-Balance'
      };

      // Prompt mit Variablen füllen
      let filledPrompt = template.prompt_template;
      Object.entries(variables).forEach(([key, value]) => {
        filledPrompt = filledPrompt.replace(new RegExp(`{{${key}}}`, 'g'), value);
      });

      // AI-Antwort generieren (vereinfacht - TODO: Implementiere mit echtem AI-Service)
      const response = filledPrompt.substring(0, 300) + '...';

      // Log AI-Interaktion
      await this.logAIInteraction(userId, 'k_intro_personalized', filledPrompt, response);

      return response;
    } catch (error) {
      console.error('Error generating personalized intro:', error);
      return this.getStaticIntro();
    }
  }

  /**
   * Analysiert Life Wheel und gibt AI-Insights
   */
  async analyzeLifeWheelInsights(userId: string, lifeWheelData: any): Promise<AIInsight[]> {
    try {
      const context = await this.getUserContext(userId);

      if (!context.privacySettings?.aiEnabled) {
        return [];
      }

      const { data: template } = await supabase
        .from('ai_prompt_templates')
        .select('*')
        .eq('template_name', 'k_lifewheel_insights')
        .single();

      if (!template) {
        return [];
      }

      // Prompt mit Life Wheel Daten füllen
      const prompt = `Analysiere folgendes Lebensrad:
${JSON.stringify(lifeWheelData, null, 2)}

Erstelle 3-5 prägnante Insights im JSON-Format:
[
  {
    "type": "insight|warning|encouragement|suggestion",
    "title": "Kurzer Titel",
    "content": "Insight-Text (max. 80 Wörter)",
    "actionable": true|false,
    "relatedModule": "k-module-slug"
  }
]`;

      // TODO: Implementiere mit echtem AI-Service
      const insights: AIInsight[] = [];
      
      await this.logAIInteraction(userId, 'k_lifewheel_insights', prompt, JSON.stringify(insights));

      return insights;
    } catch (error) {
      console.error('Error analyzing life wheel:', error);
      return [];
    }
  }

  /**
   * Gibt Feedback zu Meta-Modell Übungen
   */
  async provideMetaModelFeedback(
    userId: string, 
    userStatement: string,
    identifiedPattern: string,
    userQuestion: string,
    level: number
  ): Promise<AIFeedback> {
    try {
      const context = await this.getUserContext(userId);

      if (!context.privacySettings?.aiEnabled) {
        return this.getStaticFeedback();
      }

      const { data: template } = await supabase
        .from('ai_prompt_templates')
        .select('*')
        .eq('template_name', 'k_metamodel_level1_coaching')
        .single();

      if (!template) {
        return this.getStaticFeedback();
      }

      const prompt = template.prompt_template
        .replace('{{user_statement}}', userStatement)
        .replace('{{identified_pattern}}', identifiedPattern)
        .replace('{{user_question}}', userQuestion);

      // TODO: Implementiere mit echtem AI-Service
      return this.getStaticFeedback();
    } catch (error) {
      console.error('Error providing meta model feedback:', error);
      return this.getStaticFeedback();
    }
  }

  /**
   * Generiert Reflexionsfragen basierend auf User-Phase
   */
  async generateReflectionPrompts(userId: string, phase: string): Promise<string[]> {
    try {
      const context = await this.getUserContext(userId);

      if (!context.privacySettings?.aiEnabled) {
        return this.getStaticReflectionPrompts(phase);
      }

      const prompt = `Erstelle 3 tiefgehende Reflexionsfragen für einen User in der "${phase}"-Phase des K-Moduls.

Kontext:
- Erfahrungslevel: ${context.experienceLevel}
- Bisherige Insights: ${context.kModuleProgress?.keyInsights?.length || 0}
- Fokus-Bereiche: ${context.lifeWheelData?.lowestAreas.map(a => a.name).join(', ')}

Die Fragen sollen:
1. Zum ehrlichen Nachdenken anregen
2. Konkret und persönlich relevant sein
3. Keine Ja/Nein-Fragen sein
4. Auf Klarheit abzielen

Format: Einfache Liste, eine Frage pro Zeile.`;

      // TODO: Implementiere mit echtem AI-Service
      const questions = this.getStaticReflectionPrompts(phase);
      
      await this.logAIInteraction(userId, 'k_reflection_prompts', prompt, JSON.stringify(questions));

      return questions;
    } catch (error) {
      console.error('Error generating reflection prompts:', error);
      return this.getStaticReflectionPrompts(phase);
    }
  }

  /**
   * Erstellt Fortschritts-Zusammenfassung
   */
  async summarizeProgress(userId: string): Promise<ProgressSummary> {
    try {
      const context = await this.getUserContext(userId);

      const { data: completedModules } = await supabase
        .from('completed_modules')
        .select('module_id')
        .eq('user_id', userId);

      const completedCount = completedModules?.length || 0;
      const totalKModules = 23;
      const progress = (completedCount / totalKModules) * 100;

      if (!context.privacySettings?.aiEnabled) {
        return {
          overallProgress: progress,
          completedModules: completedModules?.map(m => m.module_id) || [],
          keyAchievements: ['K-Modul gestartet'],
          areasForImprovement: ['Weitere Module absolvieren'],
          personalizedRecommendations: ['Setze das Gelernte im Alltag um'],
          motivationalMessage: 'Du bist auf einem guten Weg!'
        };
      }

      const { data: template } = await supabase
        .from('ai_prompt_templates')
        .select('*')
        .eq('template_name', 'k_completion_summary')
        .single();

      if (!template) {
        return this.getStaticProgressSummary(progress, completedCount);
      }

      const prompt = `Erstelle eine motivierende Fortschritts-Zusammenfassung:

Fortschritt: ${progress.toFixed(1)}% (${completedCount}/${totalKModules} Module)
Metamodell-Level: ${context.kModuleProgress?.metamodelLevel || 1}
Key Insights: ${context.kModuleProgress?.keyInsights?.length || 0}
Lebensrad-Durchschnitt: ${context.lifeWheelData?.average.toFixed(1) || 'N/A'}

Erstelle JSON:
{
  "keyAchievements": ["Achievement 1", "Achievement 2", ...],
  "areasForImprovement": ["Area 1", "Area 2"],
  "personalizedRecommendations": ["Rec 1", "Rec 2", "Rec 3"],
  "motivationalMessage": "Persönliche Motivationsnachricht (max. 100 Wörter)"
}`;

      // TODO: Implementiere mit echtem AI-Service
      const summary = {
        keyAchievements: [`${completedCount} Module abgeschlossen`],
        areasForImprovement: ['Weitere Module absolvieren'],
        personalizedRecommendations: ['Setze das Gelernte im Alltag um'],
        motivationalMessage: 'Du machst Fortschritte! Bleib dran.'
      };

      await this.logAIInteraction(userId, 'k_progress_summary', prompt, JSON.stringify(summary));

      return {
        overallProgress: progress,
        completedModules: completedModules?.map(m => m.module_id) || [],
        ...summary
      };
    } catch (error) {
      console.error('Error summarizing progress:', error);
      return this.getStaticProgressSummary(0, 0);
    }
  }

  /**
   * Loggt AI-Interaktionen für Analytics
   */
  private async logAIInteraction(
    userId: string,
    templateName: string,
    prompt: string,
    response: string
  ): Promise<void> {
    try {
      await supabase.from('ai_service_logs').insert({
        user_id: userId,
        service_name: 'KModuleAICoaching',
        operation_type: templateName,
        request_data: { prompt },
        response_data: { response },
        success: true,
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error logging AI interaction:', error);
    }
  }

  // Fallback-Methoden für statischen Content

  private getStaticIntro(): string {
    return `Willkommen zum K-Modul der KLARE-Methode! 

Klarheit ist der erste und wichtigste Schritt auf deinem Weg zur persönlichen Transformation. In diesem Modul lernst du, deine aktuelle Lebenssituation ehrlich und präzise zu erfassen.

Wir werden gemeinsam:
- Dein Lebensrad analysieren
- Das Meta-Modell der Sprache kennenlernen
- Inkongruenzen in deinem Leben identifizieren
- Ein klares Fundament für Veränderung schaffen

Lass uns beginnen!`;
  }

  private getStaticFeedback(): AIFeedback {
    return {
      isCorrect: true,
      feedback: 'Gute Arbeit! Du bist auf dem richtigen Weg.',
      encouragement: 'Weiter so!',
      nextSteps: ['Übe weiter mit verschiedenen Beispielen']
    };
  }

  private getStaticReflectionPrompts(phase: string): string[] {
    return [
      'Was hast du heute über dich selbst gelernt?',
      'Welche Muster erkennst du in deinem Denken?',
      'Wo spürst du Widersprüche zwischen deinen Worten und Taten?'
    ];
  }

  private getStaticProgressSummary(progress: number, completed: number): ProgressSummary {
    return {
      overallProgress: progress,
      completedModules: [],
      keyAchievements: [`${completed} Module abgeschlossen`],
      areasForImprovement: ['Weitere Module absolvieren'],
      personalizedRecommendations: ['Setze das Gelernte im Alltag um'],
      motivationalMessage: 'Du machst Fortschritte! Bleib dran.'
    };
  }
}

export default new KModuleAICoaching();
