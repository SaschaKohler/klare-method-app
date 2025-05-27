// Erweiterung für JournalService.ts

import { useTranslation } from 'react-i18next';
import i18n from '../utils/i18n';

// Neue Hilfsfunktionen für die Übersetzung von Journal-Templates

/**
 * Gibt ein übersetztes Template basierend auf der aktuellen Sprache zurück
 */
private getLocalizedTemplate(template: any, language: string): JournalTemplate {
  if (!template) return null;
  
  try {
    const translations = template.translations || {};
    const languageData = translations[language] || {};
    
    return {
      id: template.id,
      title: languageData.title || template.title,
      description: languageData.description || template.description,
      promptQuestions: Array.isArray(languageData.promptQuestions) 
        ? languageData.promptQuestions 
        : template.prompt_questions,
      category: template.category,
      orderIndex: template.order_index,
    };
  } catch (error) {
    console.error("Error localizing template:", error);
    // Fallback auf Original-Template
    return {
      id: template.id,
      title: template.title,
      description: template.description,
      promptQuestions: template.prompt_questions,
      category: template.category,
      orderIndex: template.order_index,
    };
  }
}

/**
 * Gibt eine übersetzte Kategorie basierend auf der aktuellen Sprache zurück
 */
private getLocalizedCategory(category: any, language: string): JournalTemplateCategory {
  if (!category) return null;
  
  try {
    const translations = category.translations || {};
    const languageData = translations[language] || {};
    
    return {
      id: category.id,
      name: languageData.name || category.name,
      description: languageData.description || category.description,
      icon: category.icon,
      orderIndex: category.order_index,
    };
  } catch (error) {
    console.error("Error localizing category:", error);
    // Fallback auf Original-Kategorie
    return {
      id: category.id,
      name: category.name,
      description: category.description,
      icon: category.icon,
      orderIndex: category.order_index,
    };
  }
}

// Modifizierte getTemplates Funktion
async getTemplates(language?: string): Promise<JournalTemplate[]> {
  try {
    // Verwende die aktuelle Sprache aus i18n, wenn keine angegeben wurde
    const currentLanguage = language || i18n.language || 'de';
    
    // Prüfe Cache - hier könnten wir später eine Erweiterung für
    // sprachspezifisches Caching hinzufügen
    if (this.templatesCache) {
      return this.templatesCache;
    }

    // Wenn online, hole vom Server
    const { data: session } = await supabase.auth.getSession();
    if (session?.session) {
      try {
        const { data, error } = await supabase
          .from("journal_templates")
          .select("*")
          .order("order_index", { ascending: true });

        if (!error && data) {
          // Transformiere Server-Daten und wende Übersetzungen an
          const templates: JournalTemplate[] = data.map(
            (item: any) => this.getLocalizedTemplate(item, currentLanguage)
          ).filter(Boolean); // Entferne null-Werte

          // Update language-specific cache
          this.templatesCache[currentLanguage] = templates;

          return templates;
        }
      } catch (error) {
        console.error("Error fetching journal templates:", error);
      }
    }

    // Leeres Array zurückgeben, wenn fehlgeschlagen
    return [];
  } catch (error) {
    console.error("Error loading journal templates:", error);
    return [];
  }
}

// Modifizierte getTemplateCategories Funktion
async getTemplateCategories(language?: string): Promise<JournalTemplateCategory[]> {
  try {
    // Verwende die aktuelle Sprache aus i18n, wenn keine angegeben wurde
    const currentLanguage = language || i18n.language || 'de';
    
    // Prüfe Cache
    if (this.categoriesCache) {
      return this.categoriesCache;
    }

    // Wenn online, hole vom Server
    const { data: session } = await supabase.auth.getSession();
    if (session?.session) {
      try {
        const { data, error } = await supabase
          .from("journal_template_categories")
          .select("*")
          .order("order_index", { ascending: true });

        if (!error && data) {
          // Transformiere Server-Daten und wende Übersetzungen an
          const categories: JournalTemplateCategory[] = data.map(
            (item: any) => this.getLocalizedCategory(item, currentLanguage)
          ).filter(Boolean); // Entferne null-Werte

          // Update Cache
          this.categoriesCache = categories;

          return categories;
        }
      } catch (error) {
        console.error("Error fetching template categories:", error);
      }
    }

    // Leeres Array zurückgeben, wenn fehlgeschlagen
    return [];
  } catch (error) {
    console.error("Error loading template categories:", error);
    return [];
  }
}

// Cache-Erweiterung für Sprachänderungen
clearCache(userId?: string, language?: string): void {
  if (userId) {
    delete this.entriesCache[userId];
  } else {
    this.entriesCache = {};
  }
  
  // Lösche den Cache bei Sprachänderungen explizit
  this.templatesCache = {};
  this.categoriesCache = null;
}
