// Updatete JournalService-Funktionen

// src/services/JournalService.ts

// Füge am Ende der Klasse diese Methoden hinzu:

// getTemplates mit Sprachunterstützung überschreiben
async getTemplates(language?: string): Promise<JournalTemplate[]> {
  try {
    // Verwende die übergebene Sprache oder die Standard-Sprache
    const currentLanguage = language || 'de';
    
    // Cache-Logik (hier könnte man sprachspezifisches Caching implementieren)
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
          const templates: JournalTemplate[] = data.map(item => {
            // Hole Übersetzungen aus dem JSONB-Feld
            const translations = item.translations || {};
            const langData = translations[currentLanguage] || {};
            
            return {
              id: item.id,
              title: langData.title || item.title, // Fallback auf Originalsprache
              description: langData.description || item.description,
              promptQuestions: Array.isArray(langData.promptQuestions) 
                ? langData.promptQuestions 
                : item.prompt_questions,
              category: item.category,
              orderIndex: item.order_index,
            };
          });

          // Cache aktualisieren - sprachspezifisch
          const currentLanguage = language || 'de';
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

// getTemplateCategories mit Sprachunterstützung überschreiben
async getTemplateCategories(language?: string): Promise<JournalTemplateCategory[]> {
  try {
    // Verwende die übergebene Sprache oder die Standard-Sprache
    const currentLanguage = language || 'de';
    
    // Cache-Logik
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
          const categories: JournalTemplateCategory[] = data.map(item => {
            // Hole Übersetzungen aus dem JSONB-Feld
            const translations = item.translations || {};
            const langData = translations[currentLanguage] || {};
            
            return {
              id: item.id,
              name: langData.name || item.name, // Fallback auf Originalsprache
              description: langData.description || item.description,
              icon: item.icon,
              orderIndex: item.order_index,
            };
          });

          // Cache aktualisieren
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

// clearCache erweitern, um auch bei Sprachänderungen zu funktionieren
clearCache(userId?: string, language?: string): void {
  if (userId) {
    delete this.entriesCache[userId];
  } else {
    this.entriesCache = {};
  }
  
  // Cache immer leeren, wenn eine Sprachänderung stattfindet
  this.templatesCache = {};
  this.categoriesCache = null;
}
