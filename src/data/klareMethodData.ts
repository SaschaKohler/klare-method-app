// src/data/klareMethodData.ts
import { klareColors } from "../constants/theme";
import i18n from "../utils/i18n";

export interface KlareStep {
  id: "K" | "L" | "A" | "R" | "E";
  title: string;
  description: string;
  color: string;
  iconName: string;
}

export interface Module {
  id: string;
  stepId: "K" | "L" | "A" | "R" | "E";
  title: string;
  description: string;
  duration: number; // in Minuten
  type: "video" | "text" | "exercise" | "quiz";
  content: string;
  order: number;
}

// Hilfsfunktion zum Abrufen eines übersetzten KLARE-Schritts
// Wird nur zur Typsicherheit verwendet, die tatsächliche Übersetzung erfolgt dynamisch in getKlareSteps()
const createStepTemplate = (
  id: "K" | "L" | "A" | "R" | "E",
  defaultTitle: string,
  defaultDescription: string,
  color: string,
  iconName: string,
): KlareStep => {
  return {
    id,
    title: defaultTitle,
    description: defaultDescription,
    color,
    iconName,
  };
};

// Statische Definitionen der KLARE-Schritte (ohne Übersetzung)
const stepTemplates: KlareStep[] = [
  createStepTemplate(
    "K",
    "Klarheit",
    "über die aktuelle Situation",
    klareColors.k,
    "search",
  ),
  createStepTemplate(
    "L",
    "Lebendigkeit",
    "und Ressourcen wiederentdecken",
    klareColors.l,
    "flash",
  ),
  createStepTemplate(
    "A",
    "Ausrichtung",
    "der Lebensbereiche",
    klareColors.a,
    "compass",
  ),
  createStepTemplate("R", "Realisierung", "im Alltag", klareColors.r, "hammer"),
  createStepTemplate(
    "E",
    "Entfaltung",
    "durch vollständige Kongruenz",
    klareColors.e,
    "star-four-points",
  ),
];

// Funktion zum dynamischen Abrufen übersetzter KLARE-Schritte
// Wird zur Laufzeit aufgerufen, wenn die Sprache bereits initialisiert ist
export function getKlareSteps(): KlareStep[] {
  return stepTemplates.map((step) => ({
    ...step,
    title: i18n.t(`modules:${step.id}.title`, { defaultValue: step.title }),
    description: i18n.t(`modules:${step.id}.description`, {
      defaultValue: step.description,
    }),
  }));
}

// Exportiere als Variable für Abwärtskompatibilität
// Wichtig: Diese erste Definition verwendet die Standardwerte
// und wird später durch die Funktion getKlareSteps() ersetzt
export const klareSteps: KlareStep[] = stepTemplates;
