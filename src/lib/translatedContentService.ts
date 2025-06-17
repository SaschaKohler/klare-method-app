// src/lib/translatedContentService.ts - Erweiterte Version mit Übersetzungsunterstützung
import { supabase } from "./supabase";
import { Database } from "../types/supabase-klare-app";
import i18n from "../utils/i18n";

// Typen für übersetzte Views
type TranslatedModuleContentRow =
  Database["public"]["Views"]["translated_module_contents"]["Row"];
type TranslatedContentSectionRow =
  Database["public"]["Views"]["translated_content_sections"]["Row"];
type TranslatedExerciseStepRow =
  Database["public"]["Views"]["translated_exercise_steps"]["Row"];
type TranslatedQuizQuestionRow =
  Database["public"]["Views"]["translated_quiz_questions"]["Row"];

// Erweiterte Interfaces für übersetzte Inhalte
export interface TranslatedModuleContent extends TranslatedModuleContentRow {
  sections?: TranslatedContentSection[];
  exercise_steps?: TranslatedExerciseStep[];
  quiz_questions?: TranslatedQuizQuestion[];
}

export interface TranslatedContentSection extends TranslatedContentSectionRow {}
export interface TranslatedExerciseStep extends TranslatedExerciseStepRow {}
export interface TranslatedQuizQuestion extends TranslatedQuizQuestionRow {}

// Funktion zum Laden eines übersetzten Moduls
export const loadTranslatedModuleContent = async (
  moduleId: string,
): Promise<TranslatedModuleContent | null> => {
  try {
    const currentLanguage = i18n.language || "de";

    // Modul-Hauptinformationen aus übersetzter View abrufen
    const { data: moduleData, error: moduleError } = await supabase
      .from("translated_module_contents")
      .select("*")
      .eq("module_id", moduleId)
      .single();

    if (moduleError || !moduleData) {
      console.log("Übersetztes Modul nicht gefunden:", moduleError);
      return null;
    }

    // Vollständiges Modul-Objekt erstellen mit übersetzten Titeln
    const fullModule: TranslatedModuleContent = {
      ...moduleData,
      // Verwende übersetzte Felder falls verfügbar
      title:
        currentLanguage === "en" && moduleData.title_en
          ? moduleData.title_en
          : moduleData.title,
      description:
        currentLanguage === "en" && moduleData.description_en
          ? moduleData.description_en
          : moduleData.description,
      sections: [],
      exercise_steps: [],
      quiz_questions: [],
    };

    return fullModule;
  } catch (error) {
    console.error("Fehler beim Laden des übersetzten Moduls:", error);
    return null;
  }
};
