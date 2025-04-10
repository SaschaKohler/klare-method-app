// src/data/klareMethodModules.ts
import { Module } from "./klareMethodData";

/**
 * Vollständige Module für alle KLARE-Schritte
 *
 * Jeder Schritt (K-L-A-R-E) enthält:
 * - Einführungsmodule (Theorie, Konzept, Wissenschaft)
 * - Praktische Übungen
 * - Reflexionsübungen
 * - Quiz/Tests
 * - Anwendungsbeispiele
 */

export const allModules: Module[] = [
  // ===== K - KLARHEIT =====
  {
    id: "k-intro",
    stepId: "K",
    title: "Einführung in die Klarheit",
    description: "Überblick über den ersten Schritt der KLARE-Methode",
    duration: 5,
    type: "video",
    content: "k_intro_video",
    order: 1,
  },
  {
    id: "k-theory",
    stepId: "K",
    title: "Die Theorie hinter Klarheit",
    description: "Verstehen, warum Klarheit der erste Schritt sein muss",
    duration: 10,
    type: "text",
    content: "k_theory_text",
    order: 2,
  },
  {
    id: "k-lifewheel",
    stepId: "K",
    title: "Lebensrad-Analyse",
    description: "Bestandsaufnahme Ihrer aktuellen Lebenssituation",
    duration: 15,
    type: "exercise",
    content: "k_lifewheel_exercise",
    order: 3,
  },
  {
    id: "k-reality-check",
    stepId: "K",
    title: "Realitäts-Check Übung",
    description: "Ehrliche Bestandsaufnahme Ihrer aktuellen Situation",
    duration: 20,
    type: "exercise",
    content: "k_reality_check_exercise",
    order: 4,
  },
  {
    id: "k-incongruence-finder",
    stepId: "K",
    title: "Inkongruenz-Finder",
    description:
      "Identifizieren Sie Diskrepanzen zwischen Denken, Fühlen und Handeln",
    duration: 25,
    type: "exercise",
    content: "k_incongruence_finder",
    order: 5,
  },
  {
    id: "k-reflection",
    stepId: "K",
    title: "Klarheits-Reflexion",
    description: "Reflektieren Sie Ihre Erkenntnisse aus den Klarheits-Übungen",
    duration: 10,
    type: "exercise",
    content: "k_reflection_exercise",
    order: 6,
  },
  {
    id: "k-quiz",
    stepId: "K",
    title: "Klarheits-Quiz",
    description: "Testen Sie Ihr Verständnis des Klarheits-Konzepts",
    duration: 5,
    type: "quiz",
    content: "k_quiz_content",
    order: 7,
  },

  // ===== L - LEBENDIGKEIT =====
  {
    id: "l-intro",
    stepId: "L",
    title: "Einführung in die Lebendigkeit",
    description: "Überblick über den zweiten Schritt der KLARE-Methode",
    duration: 5,
    type: "video",
    content: "l_intro_video",
    order: 1,
  },
  {
    id: "l-theory",
    stepId: "L",
    title: "Die Theorie der Lebendigkeit",
    description: "Verstehen, wie natürliche Lebendigkeit Kongruenz fördert",
    duration: 10,
    type: "text",
    content: "l_theory_text",
    order: 2,
  },
  {
    id: "l-resource-finder",
    stepId: "L",
    title: "Ressourcen-Finder",
    description:
      "Entdecken Sie Ihre natürlichen Energie- und Ressourcenquellen",
    duration: 20,
    type: "exercise",
    content: "l_resource_finder",
    order: 3,
  },
  {
    id: "l-vitality-moments",
    stepId: "L",
    title: "Lebendigkeits-Momente",
    description:
      "Identifizieren und verstärken Sie Momente natürlicher Lebendigkeit",
    duration: 15,
    type: "exercise",
    content: "l_vitality_moments",
    order: 4,
  },
  {
    id: "l-energy-blockers",
    stepId: "L",
    title: "Energie-Blocker Analyse",
    description: "Identifizieren und transformieren Sie Energieblocker",
    duration: 25,
    type: "exercise",
    content: "l_energy_blockers",
    order: 5,
  },
  {
    id: "l-embodiment",
    stepId: "L",
    title: "Verkörperungsübung",
    description:
      "Körperliche Übung zur Aktivierung Ihrer natürlichen Lebendigkeit",
    duration: 10,
    type: "exercise",
    content: "l_embodiment_exercise",
    order: 6,
  },
  {
    id: "l-quiz",
    stepId: "L",
    title: "Lebendigkeits-Quiz",
    description: "Testen Sie Ihr Verständnis des Lebendigkeits-Konzepts",
    duration: 5,
    type: "quiz",
    content: "l_quiz_content",
    order: 7,
  },

  // ===== A - AUSRICHTUNG =====
  {
    id: "a-intro",
    stepId: "A",
    title: "Einführung in die Ausrichtung",
    description: "Überblick über den dritten Schritt der KLARE-Methode",
    duration: 5,
    type: "video",
    content: "a_intro_video",
    order: 1,
  },
  {
    id: "a-theory",
    stepId: "A",
    title: "Die Theorie der Ausrichtung",
    description: "Verstehen, wie Ausrichtung zu innerer Kohärenz führt",
    duration: 10,
    type: "text",
    content: "a_theory_text",
    order: 2,
  },
  {
    id: "a-values-hierarchy",
    stepId: "A",
    title: "Werte-Hierarchie",
    description: "Erarbeiten einer kohärenten Hierarchie Ihrer Kernwerte",
    duration: 30,
    type: "exercise",
    content: "a_values_hierarchy",
    order: 3,
  },
  {
    id: "a-life-vision",
    stepId: "A",
    title: "Kongruente Lebensvision",
    description: "Entwickeln einer Vision, die alle Lebensbereiche integriert",
    duration: 25,
    type: "exercise",
    content: "a_life_vision",
    order: 4,
  },
  {
    id: "a-decision-alignment",
    stepId: "A",
    title: "Entscheidungs-Alignment",
    description: "Praktische Methode zum Treffen kongruenter Entscheidungen",
    duration: 15,
    type: "exercise",
    content: "a_decision_alignment",
    order: 5,
  },
  {
    id: "a-integration-check",
    stepId: "A",
    title: "Integrations-Check",
    description: "Überprüfen der Integrationsgrade Ihrer Lebensbereiche",
    duration: 20,
    type: "exercise",
    content: "a_integration_check",
    order: 6,
  },
  {
    id: "a-quiz",
    stepId: "A",
    title: "Ausrichtungs-Quiz",
    description: "Testen Sie Ihr Verständnis des Ausrichtungs-Konzepts",
    duration: 5,
    type: "quiz",
    content: "a_quiz_content",
    order: 7,
  },

  // ===== R - REALISIERUNG =====
  {
    id: "r-intro",
    stepId: "R",
    title: "Einführung in die Realisierung",
    description: "Überblick über den vierten Schritt der KLARE-Methode",
    duration: 5,
    type: "video",
    content: "r_intro_video",
    order: 1,
  },
  {
    id: "r-theory",
    stepId: "R",
    title: "Die Theorie der Realisierung",
    description: "Verstehen, wie Realisierung zu nachhaltiger Kongruenz führt",
    duration: 10,
    type: "text",
    content: "r_theory_text",
    order: 2,
  },
  {
    id: "r-habit-builder",
    stepId: "R",
    title: "Gewohnheits-Builder",
    description: "Entwickeln kongruenter Gewohnheiten für den Alltag",
    duration: 20,
    type: "exercise",
    content: "r_habit_builder",
    order: 3,
  },
  {
    id: "r-micro-steps",
    stepId: "R",
    title: "Mikro-Schritte-Planer",
    description:
      "Aufteilen großer Veränderungen in kleine, umsetzbare Schritte",
    duration: 15,
    type: "exercise",
    content: "r_micro_steps",
    order: 4,
  },
  {
    id: "r-environment-design",
    stepId: "R",
    title: "Umgebungs-Design",
    description: "Gestalten Sie Ihre Umgebung für optimale Kongruenz",
    duration: 25,
    type: "exercise",
    content: "r_environment_design",
    order: 5,
  },
  {
    id: "r-accountability",
    stepId: "R",
    title: "Verantwortlichkeits-System",
    description:
      "Erstellen eines Verantwortlichkeits-Systems für Ihre Umsetzung",
    duration: 15,
    type: "exercise",
    content: "r_accountability",
    order: 6,
  },
  {
    id: "r-quiz",
    stepId: "R",
    title: "Realisierungs-Quiz",
    description: "Testen Sie Ihr Verständnis des Realisierungs-Konzepts",
    duration: 5,
    type: "quiz",
    content: "r_quiz_content",
    order: 7,
  },

  // ===== E - ENTFALTUNG =====
  {
    id: "e-intro",
    stepId: "E",
    title: "Einführung in die Entfaltung",
    description: "Überblick über den fünften Schritt der KLARE-Methode",
    duration: 5,
    type: "video",
    content: "e_intro_video",
    order: 1,
  },
  {
    id: "e-theory",
    stepId: "E",
    title: "Die Theorie der Entfaltung",
    description:
      "Verstehen, wie vollständige Kongruenz zu müheloser Entfaltung führt",
    duration: 10,
    type: "text",
    content: "e_theory_text",
    order: 2,
  },
  {
    id: "e-integration-practice",
    stepId: "E",
    title: "Integrations-Praxis",
    description: "Übung zur Integration aller KLARE-Aspekte in Ihrem Leben",
    duration: 30,
    type: "exercise",
    content: "e_integration_practice",
    order: 3,
  },
  {
    id: "e-effortless-manifestation",
    stepId: "E",
    title: "Mühelose Manifestation",
    description: "Erleben und verstärken müheloser Manifestationsmomente",
    duration: 20,
    type: "exercise",
    content: "e_effortless_manifestation",
    order: 4,
  },
  {
    id: "e-congruence-check",
    stepId: "E",
    title: "Kongruenz-Check",
    description: "Überprüfen Ihrer Gesamtkongruenz in allen Lebensbereichen",
    duration: 15,
    type: "exercise",
    content: "e_congruence_check",
    order: 5,
  },
  {
    id: "e-sharing-wisdom",
    stepId: "E",
    title: "Weisheits-Weitergabe",
    description: "Teilen Ihrer Erkenntnisse und Unterstützen anderer",
    duration: 20,
    type: "exercise",
    content: "e_sharing_wisdom",
    order: 6,
  },
  {
    id: "e-quiz",
    stepId: "E",
    title: "Entfaltungs-Quiz",
    description: "Testen Sie Ihr Verständnis des Entfaltungs-Konzepts",
    duration: 5,
    type: "quiz",
    content: "e_quiz_content",
    order: 7,
  },
];

// Funktion zum Abrufen der Module für einen bestimmten KLARE-Schritt
export const getModulesByStep = (
  stepId: "K" | "L" | "A" | "R" | "E",
): Module[] => {
  // Sicherstellen, dass stepId ein gültiger Wert ist
  if (!stepId || !["K", "L", "A", "R", "E"].includes(stepId)) {
    console.warn(`Invalid stepId provided to getModulesByStep: ${stepId}`);
    return [];
  }

  const filteredModules = allModules
    .filter((module) => module.stepId === stepId)
    .sort((a, b) => a.order - b.order);

  return filteredModules || [];
};

// Funktion zum Abrufen eines einzelnen Moduls anhand seiner ID
export function getModuleById(moduleId: string): Module | undefined {
  return allModules.find((module) => module.id === moduleId);
}
