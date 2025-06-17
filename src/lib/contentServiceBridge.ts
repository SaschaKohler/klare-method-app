// src/lib/contentServiceBridge.ts
// Temporary bridge to make old contentService imports work with new HybridContentService
// This allows for gradual migration without breaking existing components

import HybridContentService from '../services/HybridContentService';

// Re-export all functions from HybridContentService to maintain backward compatibility
export const {
  loadModuleContent,
  loadModulesByStep,
  saveExerciseResult,
  saveQuizAnswer,
  loadUserModuleProgress,
} = HybridContentService;

// Re-export types for backward compatibility
export type {
  ContentSection,
  ExerciseStep,
  QuizQuestion,
  ModuleContent,
} from '../services/HybridContentService';

// Default export to match the old pattern
export default HybridContentService;
