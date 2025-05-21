import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';

// Typen für LifeWheel-Bereiche
type LifeWheelArea = {
  id: string;
  user_id: string;
  name: string;
  current_value: number;
  target_value: number;
  created_at: string | null;
  updated_at: string | null;
};

/**
 * Custom Hook zum Abrufen übersetzter LifeWheel-Bereiche
 * @param userId Die ID des Benutzers
 * @returns Ein Objekt mit den übersetzten LifeWheel-Bereichen und Funktionen zum Laden und Aktualisieren
 */
export const useTranslatedLifeWheelAreas = (userId: string) => {
  const [areas, setAreas] = useState<LifeWheelArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { i18n } = useTranslation();
  
  // Funktion zum Laden der übersetzten LifeWheel-Bereiche
  const fetchAreas = async () => {
    try {
      setLoading(true);
      
      // Wenn keine userId vorhanden ist, frühzeitig beenden
      if (!userId) {
        setAreas([]);
        setLoading(false);
        return;
      }
      
      // Direkte Abfrage der Tabelle als Fallback-Lösung
      const fetchRegularQuery = async () => {
        console.log('Verwende reguläre Datenbankabfrage für LifeWheel-Bereiche');
        const { data, error } = await supabase
          .from('life_wheel_areas')
          .select('*')
          .eq('user_id', userId);
          
        if (error) throw new Error(error.message);
        return data;
      };
      
      // Versuche zuerst die RPC-Funktion, fallback zur regulären Abfrage
      try {
        console.log('Versuche RPC-Funktion mit Sprachcode:', i18n.language);
        const { data, error } = await supabase
          .rpc('get_translated_life_wheel_areas', {
            p_user_id: userId,
            p_lang: i18n.language
          });
          
        if (error) {
          console.warn('RPC-Fehler:', error.message);
          throw error;
        }
        
        setAreas(data || []);
      } catch (rpcError) {
        console.warn('Fallback zur regulären Abfrage nach RPC-Fehler');
        const regularData = await fetchRegularQuery();
        setAreas(regularData || []);
      }
      
    } catch (err) {
      console.error('Fehler beim Abrufen der LifeWheel-Bereiche:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  };
  
  // Funktion zum Aktualisieren eines LifeWheel-Bereichs
  const updateArea = async (
    id: string, 
    updates: { current_value?: number; target_value?: number; name?: string }
  ) => {
    try {
      // Optimistisches UI-Update: Sofort lokalen State aktualisieren
      setAreas(currentAreas => currentAreas.map(area => 
        area.id === id ? { ...area, ...updates } : area
      ));
      
      // Im Hintergrund mit der Datenbank synchronisieren
      const { error } = await supabase
        .from('life_wheel_areas')
        .update(updates)
        .eq('id', id);
        
      if (error) {
        console.error('Fehler beim Speichern, State bleibt erhalten:', error.message);
        // Bei einem Fehler könnten wir die Bereiche neu laden, um den tatsächlichen Datenbankstand zu zeigen
        // Hier wählen wir aber, den optimistisch aktualisierten Zustand beizubehalten
        return false;
      }
      
      // Keine vollständige Neuladung mehr nach dem Update
      // Das UI ist bereits aktualisiert, und wir vermeiden flackernde Neuladung
      
      return true;
    } catch (err) {
      console.error('Fehler beim Aktualisieren des LifeWheel-Bereichs:', err);
      // Bei einem schwerwiegenden Fehler könnten wir die Bereiche neu laden
      // fetchAreas();
      return false;
    }
  };
  
  // Funktion zum Hinzufügen eines neuen LifeWheel-Bereichs
  const addArea = async (name: string, currentValue: number = 5, targetValue: number = 5) => {
    try {
      // Temporäre ID für optimistisches UI-Update
      const tempId = `temp-${Date.now()}`;
      
      // Optimistisches UI-Update
      const newArea = {
        id: tempId,
        user_id: userId,
        name,
        current_value: currentValue,
        target_value: targetValue,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setAreas(currentAreas => [...currentAreas, newArea]);
      
      // Im Hintergrund mit der Datenbank synchronisieren
      const { data, error } = await supabase
        .from('life_wheel_areas')
        .insert({
          user_id: userId,
          name,
          current_value: currentValue,
          target_value: targetValue
        })
        .select();
        
      if (error) {
        // Bei einem Fehler den optimistisch hinzugefügten Bereich entfernen
        setAreas(currentAreas => currentAreas.filter(area => area.id !== tempId));
        console.error('Fehler beim Hinzufügen des Bereichs:', error.message);
        return null;
      }
      
      // Erfolgreiche Antwort: Die temporäre ID durch die echte ID ersetzen
      if (data && data.length > 0) {
        const realId = data[0].id;
        setAreas(currentAreas => 
          currentAreas.map(area => area.id === tempId ? { ...area, id: realId } : area)
        );
        return realId;
      }
      
      return null;
    } catch (err) {
      console.error('Fehler beim Hinzufügen des LifeWheel-Bereichs:', err);
      return null;
    }
  };
  
  // Funktion zum Löschen eines LifeWheel-Bereichs
  const deleteArea = async (id: string) => {
    try {
      // Optimistisches UI-Update: Sofort aus lokalem State entfernen
      setAreas(currentAreas => currentAreas.filter(area => area.id !== id));
      
      // Im Hintergrund mit der Datenbank synchronisieren
      const { error } = await supabase
        .from('life_wheel_areas')
        .delete()
        .eq('id', id);
        
      if (error) {
        // Bei einem Fehler alle Bereiche neu laden, um korrekten Zustand wiederherzustellen
        console.error('Fehler beim Löschen, lade aktuelle Daten:', error.message);
        fetchAreas();
        return false;
      }
      
      return true;
    } catch (err) {
      console.error('Fehler beim Löschen des LifeWheel-Bereichs:', err);
      // Bei einem schwerwiegenden Fehler die Bereiche neu laden
      fetchAreas();
      return false;
    }
  };
  
  // Bereiche beim ersten Laden und bei Sprachänderung neu laden
  useEffect(() => {
    if (userId) {
      fetchAreas();
    }
  }, [userId, i18n.language]);
  
  return {
    areas,
    loading,
    error,
    fetchAreas,
    updateArea,
    addArea,
    deleteArea
  };
};
