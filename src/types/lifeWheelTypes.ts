import { Database } from './supabase';

// Hinzufügen der Translations-Spalte zu den LifeWheelArea-Typen
// Diese Datei muss nach der nächsten Generierung der Supabase-Typen angepasst werden

// Erweiterter Typ für JSONB
export type LifeWheelTranslations = {
  [lang: string]: {
    name?: string;
    [otherFields: string]: string | undefined;
  };
};

// Erweitert die bestehenden life_wheel_areas Typen
export type LifeWheelAreaWithTranslations = Database['public']['Tables']['life_wheel_areas']['Row'] & {
  translations: LifeWheelTranslations | null;
};

// Für neue Einträge
export type LifeWheelAreaInsertWithTranslations = Database['public']['Tables']['life_wheel_areas']['Insert'] & {
  translations?: LifeWheelTranslations | null;
};

// Für Updates
export type LifeWheelAreaUpdateWithTranslations = Database['public']['Tables']['life_wheel_areas']['Update'] & {
  translations?: LifeWheelTranslations | null;
};

// Bis der Supabase-Typ aktualisiert ist, können wir diese Typen verwenden
