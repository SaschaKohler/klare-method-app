// src/data/progression.ts
import { Module } from "./klareMethodData";
import { allModules } from "./klareMethodModules";

/**
 * Interface für eine Progressionsstufe im zeitlichen Verlauf der KLARE-Methode
 * Definiert, wann und unter welchen Bedingungen Module freigeschaltet werden
 */
export interface ProgressionStage {
  id: string;                    // Eindeutige ID für die Progressionsstufe
  name: string;                  // Bezeichnung der Stufe (z.B. "Woche 1: Grundlagen der Klarheit")
  requiredDays: number;          // Mindestanzahl der Tage im Programm vor Freischaltung
  requiredModules: string[];     // Module, die abgeschlossen sein müssen vor Freischaltung 
  unlocksModules: string[];      // Module, die durch diese Stufe freigeschaltet werden
  description: string;           // Beschreibung des Inhalts/Fokus dieser Progressionsstufe
  stepId?: "K" | "L" | "A" | "R" | "E"; // Optionale Zuordnung zu einem KLARE-Schritt
}

/**
 * OPTIMIERTE Progression der KLARE-Methode über 8 Wochen (statt 17)
 * Jede Stufe schaltet bestimmte Module frei, die dann vom Benutzer absolviert werden können
 */
export const progressionStages: ProgressionStage[] = [
  // ===== WOCHE 1: Einführung und Klarheit (K) =====
  {
    id: 'week1',
    name: 'Woche 1: Grundlagen der Klarheit',
    requiredDays: 0, // Sofort verfügbar
    requiredModules: [],
    unlocksModules: ['k-intro', 'k-theory', 'k-lifewheel'],
    description: 'Einführung in die KLARE-Methode und Analyse deiner aktuellen Lebenssituation.',
    stepId: "K"
  },
  
  // ===== WOCHE 2: Vertiefte Klarheit =====
  {
    id: 'week2',
    name: 'Woche 2: Vertiefte Klarheit',
    requiredDays: 5, // Nach 5 Tagen
    requiredModules: ['k-intro', 'k-lifewheel'],
    unlocksModules: ['k-reality-check', 'k-incongruence-finder', 'k-reflection', 'k-quiz'],
    description: 'Identifikation von Inkongruenzen und Reflexion deiner wahren Situation.',
    stepId: "K"
  },
  
  // ===== WOCHE 3: Start Lebendigkeit (L) =====
  {
    id: 'week3',
    name: 'Woche 3: Start Lebendigkeit',
    requiredDays: 12, // Nach knapp 2 Wochen
    requiredModules: ['k-reflection'],
    unlocksModules: ['l-intro', 'l-theory', 'l-resource-finder'],
    description: 'Entdecke deine natürlichen Energiequellen und verborgenen Ressourcen.',
    stepId: "L"
  },
  
  // ===== WOCHE 4: Lebendigkeit vertiefen & Start Ausrichtung =====
  {
    id: 'week4',
    name: 'Woche 4: Lebendigkeit & Ausrichtung',
    requiredDays: 19, // Nach knapp 3 Wochen
    requiredModules: ['l-resource-finder'],
    unlocksModules: ['l-vitality-moments', 'l-energy-blockers', 'l-embodiment', 'l-quiz', 'a-intro', 'a-theory'],
    description: 'Komplettiere die Lebendigkeit-Phase und beginne mit der Ausrichtung deiner Lebensbereiche.',
    stepId: "A"
  },
  
  // ===== WOCHE 5: Ausrichtung vertiefen =====
  {
    id: 'week5',
    name: 'Woche 5: Ausrichtung vertiefen',
    requiredDays: 26, // Nach 3,5 Wochen
    requiredModules: ['a-intro'],
    unlocksModules: ['a-values-hierarchy', 'a-life-vision', 'a-decision-alignment', 'a-integration-check', 'a-quiz'],
    description: 'Entwickle eine Wertehierarchie und eine kongruente Lebensvision für alle Bereiche.',
    stepId: "A"
  },
  
  // ===== WOCHE 6: Realisierung =====
  {
    id: 'week6',
    name: 'Woche 6: Realisierung im Alltag',
    requiredDays: 33, // Nach knapp 5 Wochen
    requiredModules: ['a-values-hierarchy', 'a-life-vision'],
    unlocksModules: ['r-intro', 'r-theory', 'r-habit-builder', 'r-micro-steps'],
    description: 'Überführe deine Vision in konkrete Schritte und Alltagsroutinen.',
    stepId: "R"
  },
  
  // ===== WOCHE 7: Realisierung & Start Entfaltung =====
  {
    id: 'week7',
    name: 'Woche 7: Realisierung & Entfaltung',
    requiredDays: 40, // Nach knapp 6 Wochen
    requiredModules: ['r-habit-builder'],
    unlocksModules: ['r-environment-design', 'r-accountability', 'r-quiz', 'e-intro', 'e-theory'],
    description: 'Vollende deine Realisierungsstrategien und starte in die Phase der Entfaltung.',
    stepId: "E"
  },
  
  // ===== WOCHE 8: Programm-Abschluss =====
  {
    id: 'week8',
    name: 'Woche 8: Gesamte Entfaltung',
    requiredDays: 47, // Nach knapp 7 Wochen 
    requiredModules: ['e-intro'],
    unlocksModules: ['e-integration-practice', 'e-effortless-manifestation', 'e-congruence-check', 'e-sharing-wisdom', 'e-quiz'],
    description: 'Erlebe mühelose Manifestation und vollende den KLARE-Prozess zur ganzheitlichen Entfaltung.',
    stepId: "E"
  }
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
export function getStagesByStep(stepId: "K" | "L" | "A" | "R" | "E"): ProgressionStage[] {
  return progressionStages.filter(stage => stage.stepId === stepId);
}

/**
 * Prüft, ob ein Modul in der angegebenen Progressionsstufe freigeschaltet wird
 * @param moduleId ID des Moduls
 * @param stageId ID der Progressionsstufe
 * @returns true, wenn das Modul in dieser Stufe freigeschaltet wird
 */
export function isModuleUnlockedInStage(moduleId: string, stageId: string): boolean {
  const stage = progressionStages.find(s => s.id === stageId);
  return stage ? stage.unlocksModules.includes(moduleId) : false;
}
