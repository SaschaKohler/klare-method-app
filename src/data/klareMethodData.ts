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

// Module für Schritt K (exemplarisch)
export const modules: Module[] = [
  {
    id: "k-intro",
    stepId: "K",
    title: "Einführung in die Klarheit",
    description: "Überblick über den ersten Schritt der KLARE-Methode",
    duration: 5,
    type: "video",
    content: "url_to_video_content",
    order: 1,
  },
  {
    id: "k-theory",
    stepId: "K",
    title: "Die Theorie hinter Klarheit",
    description: "Verstehen, warum Klarheit der erste Schritt sein muss",
    duration: 10,
    type: "text",
    content: "Lorem ipsum...",
    order: 2,
  },
  {
    id: "k-lifewheel",
    stepId: "K",
    title: "Lebensrad-Analyse",
    description: "Bestandsaufnahme Ihrer aktuellen Lebenssituation",
    duration: 15,
    type: "exercise",
    content: "exercise_lifewheel",
    order: 3,
  },
];
