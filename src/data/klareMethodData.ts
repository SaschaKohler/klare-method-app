// src/data/klareMethodData.ts
import { klareColors } from "../constants/theme";

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

export const klareSteps: KlareStep[] = [
  {
    id: "K",
    title: "Klarheit",
    description: "über die aktuelle Situation",
    color: klareColors.k,
    iconName: "search",
  },
  {
    id: "L",
    title: "Lebendigkeit",
    description: "und Ressourcen wiederentdecken",
    color: klareColors.l,
    iconName: "flash",
  },
  {
    id: "A",
    title: "Ausrichtung",
    description: "der Lebensbereiche",
    color: klareColors.a,
    iconName: "compass",
  },
  {
    id: "R",
    title: "Realisierung",
    description: "im Alltag",
    color: klareColors.r,
    iconName: "hammer",
  },
  {
    id: "E",
    title: "Entfaltung",
    description: "durch vollständige Kongruenz",
    color: klareColors.e,
    iconName: "sparkles",
  },
];
