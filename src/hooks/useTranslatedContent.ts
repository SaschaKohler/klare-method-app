// Beispielimplementierung für die Integration der Datenbankübersetzungen in das Frontend
// Diese Datei zeigt, wie die übersetzten Inhalte aus der Datenbank abgerufen werden können

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../utils/supabaseClient';

// Typ-Definitionen für die übersetzten Inhalte
interface TranslatedPracticalExercise {
  id: string;
  step_id: string;
  title: string;
  description: string | null;
  duration_minutes: number | null;
  sort_order: number;
}

// Hook zum Abrufen übersetzter Übungen
export function usePracticalExercises(stepId: string) {
  const { i18n } = useTranslation();
  const [exercises, setExercises] = useState<TranslatedPracticalExercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        setLoading(true);
        
        // Verwende die RPC-Funktion mit dem aktuellen Sprachcode
        const { data, error } = await supabase
          .rpc('get_translated_practical_exercises', {
            p_step_id: stepId,
            p_lang: i18n.language // Aktueller Sprachcode von i18next
          });
          
        if (error) throw error;
        
        setExercises(data || []);
      } catch (err) {
        console.error('Fehler beim Abrufen der Übungen:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, [stepId, i18n.language]); // Neu laden, wenn sich die Sprache ändert

  return { exercises, loading, error };
}

// Beispiel-Komponente, die übersetzte Inhalte verwendet
export function PracticalExercisesList({ stepId }: { stepId: string }) {
  const { t } = useTranslation();
  const { exercises, loading, error } = usePracticalExercises(stepId);

  if (loading) return <Text>{t('common:loading')}</Text>;
  if (error) return <Text>{t('common:error')}</Text>;
  
  return (
    <View>
      <Text style={styles.title}>{t('exercises:practicalExercises')}</Text>
      {exercises.map(exercise => (
        <View key={exercise.id} style={styles.exerciseItem}>
          <Text style={styles.exerciseTitle}>{exercise.title}</Text>
          {exercise.description && (
            <Text style={styles.exerciseDescription}>{exercise.description}</Text>
          )}
          {exercise.duration_minutes && (
            <Text style={styles.exerciseDuration}>
              {t('exercises:duration', { minutes: exercise.duration_minutes })}
            </Text>
          )}
        </View>
      ))}
    </View>
  );
}

// Beispiel für die direkte Verwendung der update_translations-Funktion
// Diese könnte in einem Admin-Bereich verwendet werden
export async function updateTranslation(
  tableName: string,
  schemaName: string,
  id: string,
  langCode: string,
  translations: Record<string, string>
) {
  try {
    const { data, error } = await supabase
      .rpc('update_translations', {
        p_table_name: tableName,
        p_schema_name: schemaName,
        p_id: id,
        p_lang_code: langCode,
        p_translations: translations
      });
      
    if (error) throw error;
    
    return { success: true };
  } catch (err) {
    console.error('Fehler beim Aktualisieren der Übersetzung:', err);
    return { success: false, error: err };
  }
}
