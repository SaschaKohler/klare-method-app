// src/services/transformationService.ts
import { supabase } from "../lib/supabase";
import { getLocalizedStepId, getTranslationData } from "../utils/i18nUtils";

export interface TransformationPoint {
  id: string;
  step_id: "K" | "L" | "A" | "R" | "E";
  from_text: string;
  to_text: string;
  sort_order: number;
}

export interface PracticalExercise {
  id: string;
  step_id: "K" | "L" | "A" | "R" | "E";
  title: string;
  description: string | null;
  sort_order: number;
}

export interface SupportingQuestion {
  id: string;
  step_id: "K" | "L" | "A" | "R" | "E";
  question_text: string;
  sort_order: number;
}

/**
 * Fetches all transformation paths for a specific KLARE step
 */
export const getTransformationPaths = async (
  stepId: "K" | "L" | "A" | "R" | "E",
): Promise<TransformationPoint[]> => {
  console.log(`[TransformationService] Getting transformation paths for step: ${stepId}`);
  
  // TEMPORARY: Force fallback for testing
  console.log("FORCING FALLBACK for transformation paths testing");
  return getFallbackTransformationPaths(stepId);
  
  // Alternativer Weg mit rpc (Remote Procedure Call)
  const { data, error } = await supabase.rpc("get_transformation_paths", {
    step: stepId,
  });

  if (error) {
    console.error("Error fetching transformation paths:", error);
    console.log("Falling back to static data");
    // Fallback to static data if needed
    return getFallbackTransformationPaths(stepId);
  }

  console.log(`[TransformationService] Got ${data?.length || 0} transformation paths from Supabase`);
  return data || [];
};/**
 * Fetches all practical exercises for a specific KLARE step
 */
export const getPracticalExercises = async (
  stepId: "K" | "L" | "A" | "R" | "E",
): Promise<PracticalExercise[]> => {
  console.log(`[TransformationService] Getting practical exercises for step: ${stepId}`);
  
  // TEMPORARY: Force fallback for testing
  console.log("FORCING FALLBACK for testing");
  return getFallbackPracticalExercises(stepId);
  
  const { data, error } = await supabase.rpc("get_practical_exercises", {
    step: stepId,
  });

  if (error) {
    console.error("Error fetching practical exercises:", error);
    console.log("Falling back to static data");
    // Fallback to static data if needed
    return getFallbackPracticalExercises(stepId);
  }

  console.log(`[TransformationService] Got ${data?.length || 0} exercises from Supabase`);
  return data || [];
};

/**
 * Fetches all supporting questions for a specific KLARE step
 */
export const getSupportingQuestions = async (
  stepId: "K" | "L" | "A" | "R" | "E",
): Promise<SupportingQuestion[]> => {
  console.log(`[TransformationService] Getting supporting questions for step: ${stepId}`);
  
  // TEMPORARY: Force fallback for testing
  console.log("FORCING FALLBACK for supporting questions testing");
  return getFallbackSupportingQuestions(stepId);
  
  const { data, error } = await supabase.rpc("get_supporting_questions", {
    step: stepId,
  });

  if (error) {
    console.error("Error fetching supporting questions:", error);
    console.log("Falling back to static data");
    // Fallback to static data if needed
    return getFallbackSupportingQuestions(stepId);
  }

  console.log(`[TransformationService] Got ${data?.length || 0} supporting questions from Supabase`);
  return data || [];
};

// Fallback data in case the Supabase connection fails - now using translations
const getFallbackTransformationPaths = (
  stepId: "K" | "L" | "A" | "R" | "E",
): TransformationPoint[] => {
  console.log(`[TransformationService] Getting fallback transformation paths for step: ${stepId}`);
  const localizedStepId = getLocalizedStepId(stepId);
  console.log(`[TransformationService] Localized step ID: ${localizedStepId}`);
  const transformationPaths = getTranslationData(`fallbackData.transformationPaths.${localizedStepId}`) || [];
  console.log(`[TransformationService] Found ${transformationPaths.length} transformation paths`);

  return transformationPaths.map((item: { from: string; to: string }, index: number) => ({
    id: `fallback-${stepId}-${index}`,
    step_id: stepId,
    from_text: item.from,
    to_text: item.to,
    sort_order: index + 1,
  }));
};

const getFallbackPracticalExercises = (
  stepId: "K" | "L" | "A" | "R" | "E",
): PracticalExercise[] => {
  console.log(`[TransformationService] Getting fallback exercises for step: ${stepId}`);
  const localizedStepId = getLocalizedStepId(stepId);
  console.log(`[TransformationService] Localized step ID: ${localizedStepId}`);
  const exercises = getTranslationData(`fallbackData.practicalExercises.${localizedStepId}`) || [];
  console.log(`[TransformationService] Found ${exercises.length} exercises`);

  return exercises.map((item: string, index: number) => ({
    id: `fallback-${stepId}-${index}`,
    step_id: stepId,
    title: item,
    description: null,
    sort_order: index + 1,
  }));
};

const getFallbackSupportingQuestions = (
  stepId: "K" | "L" | "A" | "R" | "E",
): SupportingQuestion[] => {
  console.log(`[TransformationService] Getting fallback supporting questions for step: ${stepId}`);
  const localizedStepId = getLocalizedStepId(stepId);
  console.log(`[TransformationService] Localized step ID: ${localizedStepId}`);
  const questions = getTranslationData(`fallbackData.supportingQuestions.${localizedStepId}`) || [];
  console.log(`[TransformationService] Found ${questions.length} supporting questions`);

  return questions.map((item: string, index: number) => ({
    id: `fallback-${stepId}-${index}`,
    step_id: stepId,
    question_text: item,
    sort_order: index + 1,
  }));
};

const transformationService = {
  getTransformationPaths,
  getPracticalExercises,
  getSupportingQuestions,
};

export default transformationService;