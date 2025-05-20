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

// Hilfsfunktion zum Abrufen der übersetzten KLARE-Schritte
const getTranslatedStep = (
  id: "K" | "L" | "A" | "R" | "E",
  defaultTitle: string,
  defaultDescription: string,
  color: string,
  iconName: string,
): KlareStep => {
  return {
    id,
    title: i18n.t(`modules:${id}.title`, { defaultValue: defaultTitle }),
    description: i18n.t(`modules:${id}.description`, {
      defaultValue: defaultDescription,
    }),
    color,
    iconName,
  };
};

export const klareSteps: KlareStep[] = [
  getTranslatedStep(
    "K",
    "Klarheit",
    "über die aktuelle Situation",
    klareColors.k,
    "search",
  ),
  getTranslatedStep(
    "L",
    "Lebendigkeit",
    "und Ressourcen wiederentdecken",
    klareColors.l,
    "flash",
  ),
  getTranslatedStep(
    "A",
    "Ausrichtung",
    "der Lebensbereiche",
    klareColors.a,
    "compass",
  ),
  getTranslatedStep("R", "Realisierung", "im Alltag", klareColors.r, "hammer"),
  getTranslatedStep(
    "E",
    "Entfaltung",
    "durch vollständige Kongruenz",
    klareColors.e,
    "sparkles",
  ),
];
