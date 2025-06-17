// src/lib/contentServicePatch.ts - Übersetzungs-Patch für den bestehenden contentService
import { supabase } from "./supabase";
import i18n from '../utils/i18n';

// Funktion zum Laden übersetzter Module Contents
export const loadTranslatedModules = async (stepId?: string) => {
  try {
    const currentLanguage = i18n.language || 'de';
    console.log('Loading translated modules for language:', currentLanguage);
    
    let query = supabase.from("translated_module_contents").select("*");
    
    if (stepId) {
      query = query.eq("module_id", stepId);
    }
    
    const { data: modules, error } = await query.order("order_index", { ascending: true });
    
    if (error) {
      console.error("Error loading translated modules:", error);
      return [];
    }
    
    if (!modules) return [];
    
    // Verwende übersetzte Felder falls verfügbar
    return modules.map(module => ({
      ...module,
      title: currentLanguage === 'en' && module.title_en ? module.title_en : module.title,
      description: currentLanguage === 'en' && module.description_en ? module.description_en : module.description,
    }));
    
  } catch (error) {
    console.error("Error in loadTranslatedModules:", error);
    return [];
  }
};

// Funktion zum Laden eines einzelnen übersetzten Moduls
export const loadTranslatedModuleContent = async (moduleId: string) => {
  try {
    const currentLanguage = i18n.language || 'de';
    
    const { data: moduleData, error: moduleError } = await supabase
      .from("translated_module_contents")
      .select("*")
      .eq("module_id", moduleId)
      .single();

    if (moduleError || !moduleData) {
      console.log("Translated module not found, fallback needed:", moduleError);
      return null;
    }

    return {
      ...moduleData,
      title: currentLanguage === 'en' && moduleData.title_en ? moduleData.title_en : moduleData.title,
      description: currentLanguage === 'en' && moduleData.description_en ? moduleData.description_en : moduleData.description,
    };
    
  } catch (error) {
    console.error("Error loading translated module content:", error);
    return null;
  }
};
