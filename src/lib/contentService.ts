// src/lib/contentService.ts
// Legacy contentService - now bridged to AI-ready HybridContentService
// This file maintains backward compatibility while migrating to the new structure

import { 
  loadModuleContent,
  loadModulesByStep,
  saveExerciseResult,
  saveQuizAnswer,
  loadUserModuleProgress,
} from './contentServiceBridge';

export type {
  ContentSection,
  ExerciseStep,
  QuizQuestion,
  ModuleContent,
} from './contentServiceBridge';

// Re-export all functions to maintain existing import patterns
export {
  loadModuleContent,
  loadModulesByStep,
  saveExerciseResult,
  saveQuizAnswer,
  loadUserModuleProgress,
};

// Note: This file bridges the old contentService to the new AI-ready HybridContentService
// All new development should use HybridContentService directly from src/services/
// This bridge allows for gradual migration of existing components
