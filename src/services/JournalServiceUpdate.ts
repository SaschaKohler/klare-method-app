import { JournalService } from "./JournalService";
import type {
  JournalTemplate,
  JournalTemplateCategory,
} from "./JournalService";
import { supabase } from "../lib/supabase";

class JournalServiceExtended extends JournalService {
  async getTemplates(language?: string): Promise<JournalTemplate[]> {
    const currentLanguage = language || "de";
    // @ts-ignore
    if (this.templatesCache[currentLanguage]) {
      // @ts-ignore
      return this.templatesCache[currentLanguage];
    }

    const { data, error } = await supabase
      .from("journal_templates")
      .select("*")
      .order("order_index", { ascending: true });

    if (error || !data) {
      console.error("Error fetching journal templates:", error);
      return [];
    }

    const templates: JournalTemplate[] = data.map((item) => {
      const translations = item.translations || {};
      // @ts-ignore
      const langData = translations[currentLanguage] || {};

      return {
        id: item.id,
        title: langData.title || item.title,
        description: langData.description || item.description,
        promptQuestions: Array.isArray(langData.promptQuestions)
          ? langData.promptQuestions
          : item.prompt_questions,
        category: item.category,
        orderIndex: item.order_index,
      };
    });
    // @ts-ignore
    this.templatesCache[currentLanguage] = templates;
    return templates;
  }

  async getTemplateCategories(
    language?: string,
  ): Promise<JournalTemplateCategory[]> {
    const currentLanguage = language || "de";
    // @ts-ignore
    if (this.categoriesCache[currentLanguage]) {
      // @ts-ignore
      return this.categoriesCache[currentLanguage];
    }

    const { data, error } = await supabase
      .from("journal_template_categories")
      .select("*")
      .order("order_index", { ascending: true });

    if (error || !data) {
      console.error("Error fetching template categories:", error);
      return [];
    }

    const categories: JournalTemplateCategory[] = data.map((item) => {
      const translations = item.translations || {};
      // @ts-ignore
      const langData = translations[currentLanguage] || {};
      return {
        id: item.id,
        name: langData.name || item.name,
        description: langData.description || item.description,
        icon: item.icon,
        orderIndex: item.order_index,
      };
    });
    // @ts-ignore
    this.categoriesCache[currentLanguage] = categories;
    return categories;
  }

  clearCache(userId?: string, language?: string): void {
    super.clearCache(userId);
    if (language) {
      // @ts-ignore
      delete this.templatesCache[language];
      // @ts-ignore
      delete this.categoriesCache[language];
    }
  }
}

export default new JournalServiceExtended();
