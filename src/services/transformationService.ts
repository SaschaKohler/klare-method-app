// src/services/transformationService.ts
import { supabase } from "../lib/supabase";

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
  // Alternativer Weg mit rpc (Remote Procedure Call)
  const { data, error } = await supabase.rpc("get_transformation_paths", {
    step: stepId,
  });

  if (error) {
    console.error("Error fetching transformation paths:", error);
    // Fallback to static data if needed
    return getFallbackTransformationPaths(stepId);
  }

  return data || [];
};

/**
 * Fetches all practical exercises for a specific KLARE step
 */
export const getPracticalExercises = async (
  stepId: "K" | "L" | "A" | "R" | "E",
): Promise<PracticalExercise[]> => {
  const { data, error } = await supabase.rpc("get_practical_exercises", {
    step: stepId,
  });

  if (error) {
    console.error("Error fetching practical exercises:", error);
    // Fallback to static data if needed
    return getFallbackPracticalExercises(stepId);
  }

  return data || [];
};

/**
 * Fetches all supporting questions for a specific KLARE step
 */
export const getSupportingQuestions = async (
  stepId: "K" | "L" | "A" | "R" | "E",
): Promise<SupportingQuestion[]> => {
  const { data, error } = await supabase.rpc("get_supporting_questions", {
    step: stepId,
  });

  if (error) {
    console.error("Error fetching supporting questions:", error);
    // Fallback to static data if needed
    return getFallbackSupportingQuestions(stepId);
  }

  return data || [];
};

// Fallback data in case the Supabase connection fails
const getFallbackTransformationPaths = (
  stepId: "K" | "L" | "A" | "R" | "E",
): TransformationPoint[] => {
  const staticData: Record<string, { from: string; to: string }[]> = {
    K: [
      { from: "Vermeidung und Verdrängung", to: "Ehrliche Selbstreflexion" },
      { from: "Unklarheit über Ist-Zustand", to: "Präzise Standortbestimmung" },
      { from: "Selbsttäuschung", to: "Authentische Selbsterkenntnis" },
    ],
    L: [
      {
        from: "Energielosigkeit und Blockaden",
        to: "Natürliche Lebensenergie",
      },
      { from: "Verschüttete Ressourcen", to: "Wiederentdeckte Kraftquellen" },
      { from: "Stagnation im Alltag", to: "Spontane Leichtigkeit" },
    ],
    A: [
      { from: "Widersprüchliche Ziele", to: "Kongruente Zielausrichtung" },
      { from: "Getrennte Lebensbereiche", to: "Ganzheitliche Integration" },
      { from: "Wertekonflikt", to: "Innere Werte-Harmonie" },
    ],
    R: [
      { from: "Ideen ohne Umsetzung", to: "Konsequente Realisierung" },
      {
        from: "Sporadische Bemühungen",
        to: "Nachhaltige Integration im Alltag",
      },
      {
        from: "Rückfall in alte Muster",
        to: "Selbstverstärkende neue Gewohnheiten",
      },
    ],
    E: [
      { from: "Stagnierende Entwicklung", to: "Kontinuierliches Wachstum" },
      { from: "Anstrengende Zielerreichung", to: "Mühelose Manifestation" },
      {
        from: "Fragmentierte Lebensbereiche",
        to: "Vollständige Kongruenz in allen Dimensionen",
      },
    ],
  };

  return staticData[stepId].map((item, index) => ({
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
  const staticData: Record<string, string[]> = {
    K: [
      "Lebensrad-Analyse zur Standortbestimmung",
      "Journaling zu Diskrepanzen zwischen Wunsch und Realität",
      "Feedback-Einholung von vertrauten Personen",
    ],
    L: [
      "Identifikation von Momenten natürlicher Lebendigkeit",
      "Ressourcen-Anker für positive Energiezustände",
      "Blockaden-Mapping und Auflösungsstrategien",
    ],
    A: [
      "Werte-Hierarchie und Lebensbereiche-Integration",
      "Visionboard für Ihre ideale Kongruenz",
      "Ausrichtungs-Check für Entscheidungen",
    ],
    R: [
      "Micro-Habits für tägliche Kongruenz-Praxis",
      "Wochenplan mit integrierten Kongruenz-Ritualen",
      "Fortschrittstracking mit visuellen Hilfsmitteln",
    ],
    E: [
      "Regelmäßiger Kongruenz-Check mit dem KLARE-System",
      "Journaling zu mühelosen Erfolgs-Momenten",
      "Mentoring und Weitergabe Ihrer Erkenntnisse",
    ],
  };

  return staticData[stepId].map((item, index) => ({
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
  const staticData: Record<string, string[]> = {
    K: [
      "Welche Diskrepanzen zwischen Wunsch und Realität nehme ich aktuell in meinen Lebensbereichen wahr?",
      "In welchen Bereichen meines Lebens fühle ich mich nicht vollständig authentisch?",
      "Welche Glaubenssätze hindern mich an einer realistischen Selbstwahrnehmung?",
    ],
    L: [
      "In welchen Momenten fühle ich mich vollständig lebendig und energiegeladen?",
      "Welche Aktivitäten oder Umgebungen blockieren meinen natürlichen Energiefluss?",
      "Welche verschütteten Talente und Ressourcen möchte ich wiederentdecken?",
    ],
    A: [
      "Wie kann ich meine unterschiedlichen Lebensbereiche harmonischer integrieren?",
      "Welche meiner Werte stehen aktuell im Konflikt miteinander?",
      "Wie kann ich meine Ziele mit meinen tiefsten Werten in Einklang bringen?",
    ],
    R: [
      "Welche konkreten täglichen Gewohnheiten können meine Kongruenz unterstützen?",
      "Wie kann ich Hindernisse für die nachhaltige Umsetzung überwinden?",
      "Welche Strukturen brauche ich, um alte Muster zu durchbrechen?",
    ],
    E: [
      "Wie kann ich mein Wachstum mühelos und natürlich gestalten?",
      "In welchen Bereichen erlebe ich bereits mühelose Manifestation?",
      "Wie kann ich anderen von meinen Erkenntnissen weitergeben?",
    ],
  };

  return staticData[stepId].map((item, index) => ({
    id: `fallback-${stepId}-${index}`,
    step_id: stepId,
    question_text: item,
    sort_order: index + 1,
  }));
};
