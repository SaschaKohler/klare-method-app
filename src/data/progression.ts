// src/data/progression.ts
import { Module } from "./klareMethodData";
import { allModules } from "./klareMethodModules";
import i18n from "../utils/i18n";

/**
 * Interface für eine Progressionsstufe im zeitlichen Verlauf der KLARE-Methode
 * Definiert, wann und unter welchen Bedingungen Module freigeschaltet werden
 */
export interface ProgressionStage {
  id: string; // Eindeutige ID für die Progressionsstufe
  name: string; // Bezeichnung der Stufe (z.B. "Woche 1: Grundlagen der Klarheit")
  requiredDays: number; // Mindestanzahl der Tage im Programm vor Freischaltung
  requiredModules: string[]; // Module, die abgeschlossen sein müssen vor Freischaltung
  unlocksModules: string[]; // Module, die durch diese Stufe freigeschaltet werden
  description: string; // Beschreibung des Inhalts/Fokus dieser Progressionsstufe
  stepId?: "K" | "L" | "A" | "R" | "E"; // Optionale Zuordnung zu einem KLARE-Schritt
}

/**
 * Hilfsfunktion zum Abrufen einer übersetzten Progressionsstufe
 */
const getTranslatedStage = (
  id: string,
  defaultName: string,
  defaultDescription: string,
  requiredDays: number,
  requiredModules: string[],
  unlocksModules: string[],
  stepId?: "K" | "L" | "A" | "R" | "E",
): ProgressionStage => {
  return {
    id,
    // Für name und description verwenden wir die Übersetzungen aus modules.json
    name: i18n.t(`modules:progressionStages.${id}.name`, {
      defaultValue: defaultName,
    }),
    description: i18n.t(`modules:progressionStages.${id}.description`, {
      defaultValue: defaultDescription,
    }),
    requiredDays,
    requiredModules,
    unlocksModules,
    stepId,
  };
};

/**
 * OPTIMIERTE Progression der KLARE-Methode über 8 Wochen (statt 17)
 * Jede Stufe schaltet bestimmte Module frei, die dann vom Benutzer absolviert werden können
 */
export const progressionStages: ProgressionStage[] = [
  // ===== WOCHE 1: Einführung und Klarheit (K) =====
  getTranslatedStage(
    "1",
    "Woche 1: Grundlagen der Klarheit",
    "Einführung in die KLARE-Methode und Analyse deiner aktuellen Lebenssituation.",
    0, // Sofort verfügbar
    [],
    ["k-intro", "k-theory", "k-lifewheel"],
    "K",
  ),

  // ===== WOCHE 2: Vertiefte Klarheit =====
  getTranslatedStage(
    "2",
    "Woche 2: Vertiefte Klarheit",
    "Identifikation von Inkongruenzen und Reflexion deiner wahren Situation.",
    5, // Nach 5 Tagen
    ["k-intro", "k-lifewheel"],
    ["k-reality-check", "k-incongruence-finder", "k-reflection", "k-quiz"],
    "K",
  ),

  // ===== WOCHE 3: Start Lebendigkeit (L) =====
  getTranslatedStage(
    "3",
    "Woche 3: Start Lebendigkeit",
    "Entdecke deine natürlichen Energiequellen und verborgenen Ressourcen.",
    12, // Nach knapp 2 Wochen
    ["k-reflection"],
    ["l-intro", "l-theory", "l-resource-finder"],
    "L",
  ),

  // ===== WOCHE 4: Lebendigkeit vertiefen & Start Ausrichtung =====
  getTranslatedStage(
    "4",
    "Woche 4: Lebendigkeit & Ausrichtung",
    "Komplettiere die Lebendigkeit-Phase und beginne mit der Ausrichtung deiner Lebensbereiche.",
    19, // Nach knapp 3 Wochen
    ["l-resource-finder"],
    [
      "l-vitality-moments",
      "l-energy-blockers",
      "l-embodiment",
      "l-quiz",
      "a-intro",
      "a-theory",
    ],
    "A",
  ),

  // ===== WOCHE 5: Ausrichtung vertiefen =====
  getTranslatedStage(
    "5",
    "Woche 5: Ausrichtung vertiefen",
    "Entwickle eine Wertehierarchie und eine kongruente Lebensvision für alle Bereiche.",
    26, // Nach 3,5 Wochen
    ["a-intro"],
    [
      "a-values-hierarchy",
      "a-life-vision",
      "a-decision-alignment",
      "a-integration-check",
      "a-quiz",
    ],
    "A",
  ),

  // ===== WOCHE 6: Realisierung =====
  getTranslatedStage(
    "6",
    "Woche 6: Realisierung im Alltag",
    "Überführe deine Vision in konkrete Schritte und Alltagsroutinen.",
    33, // Nach knapp 5 Wochen
    ["a-values-hierarchy", "a-life-vision"],
    ["r-intro", "r-theory", "r-habit-builder", "r-micro-steps"],
    "R",
  ),

  // ===== WOCHE 7: Realisierung & Start Entfaltung =====
  getTranslatedStage(
    "7",
    "Woche 7: Realisierung & Entfaltung",
    "Vollende deine Realisierungsstrategien und starte in die Phase der Entfaltung.",
    40, // Nach knapp 6 Wochen
    ["r-habit-builder"],
    [
      "r-environment-design",
      "r-accountability",
      "r-quiz",
      "e-intro",
      "e-theory",
    ],
    "E",
  ),

  // ===== WOCHE 8: Programm-Abschluss =====
  getTranslatedStage(
    "8",
    "Woche 8: Gesamte Entfaltung",
    "Erlebe mühelose Manifestation und vollende den KLARE-Prozess zur ganzheitlichen Entfaltung.",
    47, // Nach knapp 7 Wochen
    ["e-intro"],
    [
      "e-integration-practice",
      "e-effortless-manifestation",
      "e-congruence-check",
      "e-sharing-wisdom",
      "e-quiz",
    ],
    "E",
  ),
];

/**
 * Hilfsfunktion zur Ermittlung der frühestmöglichen Verfügbarkeit eines Moduls
 * @param moduleId ID des Moduls
 * @returns Anzahl der Tage, nach denen das Modul frühestens verfügbar ist, oder -1 wenn nicht gefunden
 */
export function getEarliestAvailabilityForModule(moduleId: string): number {
  for (const stage of progressionStages) {
    if (stage.unlocksModules.includes(moduleId)) {
      return stage.requiredDays;
    }
  }
  return -1; // Modul nicht in Progression gefunden
}

/**
 * Gibt alle Stufen zurück, die einem bestimmten KLARE-Schritt zugeordnet sind
 * @param stepId ID des KLARE-Schritts (K, L, A, R, E)
 * @returns Array von Progressionsstufen für diesen Schritt
 */
export function getStagesByStep(
  stepId: "K" | "L" | "A" | "R" | "E",
): ProgressionStage[] {
  return progressionStages.filter((stage) => stage.stepId === stepId);
}

/**
 * Prüft, ob ein Modul in der angegebenen Progressionsstufe freigeschaltet wird
 * @param moduleId ID des Moduls
 * @param stageId ID der Progressionsstufe
 * @returns true, wenn das Modul in dieser Stufe freigeschaltet wird
 */
export function isModuleUnlockedInStage(
  moduleId: string,
  stageId: string,
): boolean {
  const stage = progressionStages.find((s) => s.id === stageId);
  return stage ? stage.unlocksModules.includes(moduleId) : false;
}
