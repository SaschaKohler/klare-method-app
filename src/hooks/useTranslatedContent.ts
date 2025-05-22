// Internationalisierungs-Hook für die Klare-Methode-App
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
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
        
        const { data, error } = await supabase
          .rpc('get_translated_practical_exercises', {
            p_step_id: stepId,
            p_lang: i18n.language
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
  }, [stepId, i18n.language]);

  return { exercises, loading, error };
}
// Funktion zum Aktualisieren von Übersetzungen
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

// Beispiel-Komponente für übersetzte Übungen
interface PracticalExercisesListProps {
  stepId: string;
}

export function PracticalExercisesList({ stepId }: PracticalExercisesListProps) {
  const { t } = useTranslation();
  const { exercises, loading, error } = usePracticalExercises(stepId);

  if (loading) return <Text style={styles.loadingText}>{t('common:loading')}</Text>;
  if (error) return <Text style={styles.errorText}>{t('common:error')}</Text>;
  
  return (
    <View style={styles.container}>
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

// Styles für die Komponenten
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  exerciseItem: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  exerciseTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#222',
  },
  exerciseDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
    color: '#666',
  },
  exerciseDuration: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    color: '#d32f2f',
  },
});
