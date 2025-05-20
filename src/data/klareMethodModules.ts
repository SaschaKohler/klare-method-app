// src/data/klareMethodModules.ts
import { Module } from "./klareMethodData";
import i18n from "../utils/i18n";

/**
 * Hilfsfunktion zum Abrufen der übersetzten Titel und Beschreibungen für Module
 */
const getTranslatedModule = (
  moduleId: string,
  stepId: "K" | "L" | "A" | "R" | "E",
  defaultTitle: string,
  defaultDescription: string,
  duration: number,
  type: "video" | "text" | "exercise" | "quiz",
  content: string,
  order: number,
): Module => {
  return {
    id: moduleId,
    stepId,
    title: i18n.t(`modules:${stepId}.modules.${moduleId}.title`, {
      defaultValue: defaultTitle,
    }),
    description: i18n.t(`modules:${stepId}.modules.${moduleId}.description`, {
      defaultValue: defaultDescription,
    }),
    duration,
    type,
    content,
    order,
  };
};

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
  getTranslatedModule(
    "k-intro",
    "K",
    "Einführung in die Klarheit",
    "Überblick über den ersten Schritt der KLARE-Methode",
    5,
    "video",
    "k_intro_video",
    1,
  ),
  getTranslatedModule(
    "k-theory",
    "K",
    "Die Theorie hinter Klarheit",
    "Verstehen, warum Klarheit der erste Schritt sein muss",
    10,
    "text",
    "k_theory_text",
    2,
  ),
  getTranslatedModule(
    "k-lifewheel",
    "K",
    "Lebensrad-Analyse",
    "Bestandsaufnahme Ihrer aktuellen Lebenssituation",
    15,
    "exercise",
    "k_lifewheel_exercise",
    3,
  ),
  getTranslatedModule(
    "k-reality-check",
    "K",
    "Realitäts-Check Übung",
    "Ehrliche Bestandsaufnahme Ihrer aktuellen Situation",
    20,
    "exercise",
    "k_reality_check_exercise",
    4,
  ),
  getTranslatedModule(
    "k-incongruence-finder",
    "K",
    "Inkongruenz-Finder",
    "Identifizieren Sie Diskrepanzen zwischen Denken, Fühlen und Handeln",
    25,
    "exercise",
    "k_incongruence_finder",
    5,
  ),
  getTranslatedModule(
    "k-reflection",
    "K",
    "Klarheits-Reflexion",
    "Reflektieren Sie Ihre Erkenntnisse aus den Klarheits-Übungen",
    10,
    "exercise",
    "k_reflection_exercise",
    6,
  ),
  getTranslatedModule(
    "k-quiz",
    "K",
    "Klarheits-Quiz",
    "Testen Sie Ihr Verständnis des Klarheits-Konzepts",
    5,
    "quiz",
    "k_quiz_content",
    7,
  ),

  // ===== L - LEBENDIGKEIT =====
  getTranslatedModule(
    "l-intro",
    "L",
    "Einführung in die Lebendigkeit",
    "Überblick über den zweiten Schritt der KLARE-Methode",
    5,
    "video",
    "l_intro_video",
    1,
  ),
  getTranslatedModule(
    "l-theory",
    "L",
    "Die Theorie der Lebendigkeit",
    "Verstehen, wie natürliche Lebendigkeit Kongruenz fördert",
    10,
    "text",
    "l_theory_text",
    2,
  ),
  getTranslatedModule(
    "l-resource-finder",
    "L",
    "Ressourcen-Finder",
    "Entdecken Sie Ihre natürlichen Energie- und Ressourcenquellen",
    20,
    "exercise",
    "l_resource_finder",
    3,
  ),
  getTranslatedModule(
    "l-vitality-moments",
    "L",
    "Lebendigkeits-Momente",
    "Identifizieren und verstärken Sie Momente natürlicher Lebendigkeit",
    15,
    "exercise",
    "l_vitality_moments",
    4,
  ),
  getTranslatedModule(
    "l-energy-blockers",
    "L",
    "Energie-Blocker Analyse",
    "Identifizieren und transformieren Sie Energieblocker",
    25,
    "exercise",
    "l_energy_blockers",
    5,
  ),
  getTranslatedModule(
    "l-embodiment",
    "L",
    "Verkörperungsübung",
    "Körperliche Übung zur Aktivierung Ihrer natürlichen Lebendigkeit",
    10,
    "exercise",
    "l_embodiment_exercise",
    6,
  ),
  getTranslatedModule(
    "l-quiz",
    "L",
    "Lebendigkeits-Quiz",
    "Testen Sie Ihr Verständnis des Lebendigkeits-Konzepts",
    5,
    "quiz",
    "l_quiz_content",
    7,
  ),

  // ===== A - AUSRICHTUNG =====
  getTranslatedModule(
    "a-intro",
    "A",
    "Einführung in die Ausrichtung",
    "Überblick über den dritten Schritt der KLARE-Methode",
    5,
    "video",
    "a_intro_video",
    1,
  ),
  getTranslatedModule(
    "a-theory",
    "A",
    "Die Theorie der Ausrichtung",
    "Verstehen, wie Ausrichtung zu innerer Kohärenz führt",
    10,
    "text",
    "a_theory_text",
    2,
  ),
  getTranslatedModule(
    "a-values-hierarchy",
    "A",
    "Werte-Hierarchie",
    "Erarbeiten einer kohärenten Hierarchie Ihrer Kernwerte",
    30,
    "exercise",
    "a_values_hierarchy",
    3,
  ),
  getTranslatedModule(
    "a-life-vision",
    "A",
    "Kongruente Lebensvision",
    "Entwickeln einer Vision, die alle Lebensbereiche integriert",
    25,
    "exercise",
    "a_life_vision",
    4,
  ),
  getTranslatedModule(
    "a-decision-alignment",
    "A",
    "Entscheidungs-Alignment",
    "Praktische Methode zum Treffen kongruenter Entscheidungen",
    15,
    "exercise",
    "a_decision_alignment",
    5,
  ),
  getTranslatedModule(
    "a-integration-check",
    "A",
    "Integrations-Check",
    "Überprüfen der Integrationsgrade Ihrer Lebensbereiche",
    20,
    "exercise",
    "a_integration_check",
    6,
  ),
  getTranslatedModule(
    "a-quiz",
    "A",
    "Ausrichtungs-Quiz",
    "Testen Sie Ihr Verständnis des Ausrichtungs-Konzepts",
    5,
    "quiz",
    "a_quiz_content",
    7,
  ),

  // ===== R - REALISIERUNG =====
  getTranslatedModule(
    "r-intro",
    "R",
    "Einführung in die Realisierung",
    "Überblick über den vierten Schritt der KLARE-Methode",
    5,
    "video",
    "r_intro_video",
    1,
  ),
  getTranslatedModule(
    "r-theory",
    "R",
    "Die Theorie der Realisierung",
    "Verstehen, wie Realisierung zu nachhaltiger Kongruenz führt",
    10,
    "text",
    "r_theory_text",
    2,
  ),
  getTranslatedModule(
    "r-habit-builder",
    "R",
    "Gewohnheits-Builder",
    "Entwickeln kongruenter Gewohnheiten für den Alltag",
    20,
    "exercise",
    "r_habit_builder",
    3,
  ),
  getTranslatedModule(
    "r-micro-steps",
    "R",
    "Mikro-Schritte-Planer",
    "Aufteilen großer Veränderungen in kleine, umsetzbare Schritte",
    15,
    "exercise",
    "r_micro_steps",
    4,
  ),
  getTranslatedModule(
    "r-environment-design",
    "R",
    "Umgebungs-Design",
    "Gestalten Sie Ihre Umgebung für optimale Kongruenz",
    25,
    "exercise",
    "r_environment_design",
    5,
  ),
  getTranslatedModule(
    "r-accountability",
    "R",
    "Verantwortlichkeits-System",
    "Erstellen eines Verantwortlichkeits-Systems für Ihre Umsetzung",
    15,
    "exercise",
    "r_accountability",
    6,
  ),
  getTranslatedModule(
    "r-quiz",
    "R",
    "Realisierungs-Quiz",
    "Testen Sie Ihr Verständnis des Realisierungs-Konzepts",
    5,
    "quiz",
    "r_quiz_content",
    7,
  ),

  // ===== E - ENTFALTUNG =====
  getTranslatedModule(
    "e-intro",
    "E",
    "Einführung in die Entfaltung",
    "Überblick über den fünften Schritt der KLARE-Methode",
    5,
    "video",
    "e_intro_video",
    1,
  ),
  getTranslatedModule(
    "e-theory",
    "E",
    "Die Theorie der Entfaltung",
    "Verstehen, wie vollständige Kongruenz zu müheloser Entfaltung führt",
    10,
    "text",
    "e_theory_text",
    2,
  ),
  getTranslatedModule(
    "e-integration-practice",
    "E",
    "Integrations-Praxis",
    "Übung zur Integration aller KLARE-Aspekte in Ihrem Leben",
    30,
    "exercise",
    "e_integration_practice",
    3,
  ),
  getTranslatedModule(
    "e-effortless-manifestation",
    "E",
    "Mühelose Manifestation",
    "Erleben und verstärken müheloser Manifestationsmomente",
    20,
    "exercise",
    "e_effortless_manifestation",
    4,
  ),
  getTranslatedModule(
    "e-congruence-check",
    "E",
    "Kongruenz-Check",
    "Überprüfen Ihrer Gesamtkongruenz in allen Lebensbereichen",
    15,
    "exercise",
    "e_congruence_check",
    5,
  ),
  getTranslatedModule(
    "e-sharing-wisdom",
    "E",
    "Weisheits-Weitergabe",
    "Teilen Ihrer Erkenntnisse und Unterstützen anderer",
    20,
    "exercise",
    "e_sharing_wisdom",
    6,
  ),
  getTranslatedModule(
    "e-quiz",
    "E",
    "Entfaltungs-Quiz",
    "Testen Sie Ihr Verständnis des Entfaltungs-Konzepts",
    5,
    "quiz",
    "e_quiz_content",
    7,
  ),
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
