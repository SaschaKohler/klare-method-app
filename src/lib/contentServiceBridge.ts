// src/lib/contentServiceBridge.ts
// Temporary bridge to make old contentService imports work with new HybridContentService
// This allows for gradual migration without breaking existing components

import { HybridContentService } from '../services/HybridContentService';

// Create a service instance
const contentService = new HybridContentService();

// Re-export types for backward compatibility
export type {
  ContentSection,
  ExerciseStep,
  QuizQuestion,
  ModuleContent,
} from '../services/HybridContentService';

// Simple mock functions for now - TODO: Replace with real implementations
export const loadModuleContent = async (moduleId: string) => {
  // Mock data for K-modules
  const mockModules = {
    'k-intro': {
      id: 'k-intro',
      module_id: 'k-intro',
      title: 'Klarheit - Einführung',
      content: 'Willkommen zur Klarheit-Phase der KLARE-Methode',
      klare_step: 'K',
      order_index: 1,
      difficulty_level: 1,
      estimated_duration: 15,
      content_type: 'intro',
      sections: [],
      exercise_steps: [],
      quiz_questions: [],
    },
    'k-meta-model': {
      id: 'k-meta-model',
      module_id: 'k-meta-model',
      title: 'Meta-Modell der Sprache',
      content: 'Lerne präzise Kommunikation durch das Meta-Modell',
      klare_step: 'K',
      order_index: 2,
      difficulty_level: 3,
      estimated_duration: 25,
      content_type: 'exercise',
      sections: [],
      exercise_steps: [],
      quiz_questions: [],
    },
  };

  return mockModules[moduleId] || null;
};

export const loadModulesByStep = async (step: string) => {
  // Mock data for K-step modules
  if (step === 'K') {
    return [
      await loadModuleContent('k-intro'),
      await loadModuleContent('k-meta-model'),
    ].filter(Boolean);
  }
  return [];
};

export const saveExerciseResult = async (exerciseId: string, result: any) => {
  console.log('Mock: Saving exercise result', exerciseId, result);
  return { success: true };
};

export const saveQuizAnswer = async (quizId: string, answer: any) => {
  console.log('Mock: Saving quiz answer', quizId, answer);
  return { success: true };
};

export const loadUserModuleProgress = async (userId: string) => {
  console.log('Mock: Loading user module progress', userId);
  return {
    completedModules: [],
    currentModule: null,
    totalProgress: 0,
  };
};

// Default export to match the old pattern
export default {
  loadModuleContent,
  loadModulesByStep,
  saveExerciseResult,
  saveQuizAnswer,
  loadUserModuleProgress,
};
