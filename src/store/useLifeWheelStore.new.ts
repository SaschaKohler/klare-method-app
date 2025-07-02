import { LifeWheelArea, BaseState } from '../types/store';
import { createStore } from './createStore';
import { supabase } from '../lib/supabase';

// Typen für den LifeWheel Store
interface LifeWheelState extends BaseState {
  areas: LifeWheelArea[];
  currentSnapshot: any | null;
  isDirty: boolean;
}

interface LifeWheelActions {
  loadAreas: (userId: string) => Promise<void>;
  updateArea: (areaId: string, updates: Partial<LifeWheelArea>) => void;
  saveAreas: (userId: string) => Promise<boolean>;
  resetAreas: () => void;
  calculateAverage: () => { current: number; target: number };
  findLowestAreas: (count?: number) => LifeWheelArea[];
}

export type LifeWheelStore = LifeWheelState & LifeWheelActions;

// Initialer State
const initialState: LifeWheelState = {
  areas: [],
  currentSnapshot: null,
  isDirty: false,
  isLoading: false,
  error: null,
  lastSyncTime: null,
};

// Erstelle den Store mit der neuen Architektur
export const useLifeWheelStore = createStore<LifeWheelState, LifeWheelActions>(
  'lifeWheel',
  initialState,
  (set, get) => ({
    // Lade die Bereiche für einen Benutzer
    loadAreas: async (userId: string) => {
      const { setLoading, setError, updateLastSync } = get();
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('life_wheel_areas')
          .select('*')
          .eq('user_id', userId);
          
        if (error) throw error;
        
        set({
          areas: data || [],
          isDirty: false,
        });
        
        updateLastSync();
      } catch (error) {
        console.error('Fehler beim Laden der LifeWheel-Bereiche:', error);
        setError(error as Error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    
    // Aktualisiere einen Bereich
    updateArea: (areaId: string, updates: Partial<LifeWheelArea>) => {
      set((state) => ({
        areas: state.areas.map(area => 
          area.id === areaId ? { ...area, ...updates } : area
        ),
        isDirty: true,
      }));
    },
    
    // Speichere die Änderungen
    saveAreas: async (userId: string) => {
      const { setLoading, setError, updateLastSync, areas } = get();
      try {
        setLoading(true);
        
        const { error } = await supabase
          .from('life_wheel_areas')
          .upsert(
            areas.map(area => ({
              ...area,
              user_id: userId,
              updated_at: new Date().toISOString(),
            })),
            { onConflict: 'id,user_id' }
          );
          
        if (error) throw error;
        
        set({ isDirty: false });
        updateLastSync();
        return true;
      } catch (error) {
        console.error('Fehler beim Speichern der LifeWheel-Bereiche:', error);
        setError(error as Error);
        return false;
      } finally {
        setLoading(false);
      }
    },
    
    // Setze die Bereiche zurück
    resetAreas: () => {
      set(initialState);
    },
    
    // Berechne den Durchschnitt der aktuellen und Zielwerte
    calculateAverage: () => {
      const { areas } = get();
      if (areas.length === 0) return { current: 0, target: 0 };
      
      const sum = areas.reduce(
        (acc, area) => ({
          current: acc.current + (area.currentValue || 0),
          target: acc.target + (area.targetValue || 0),
        }),
        { current: 0, target: 0 }
      );
      
      return {
        current: Math.round((sum.current / areas.length) * 10) / 10,
        target: Math.round((sum.target / areas.length) * 10) / 10,
      };
    },
    
    // Finde die Bereiche mit den niedrigsten Werten
    findLowestAreas: (count = 3) => {
      return [...get().areas]
        .sort((a, b) => (a.currentValue || 0) - (b.currentValue || 0))
        .slice(0, count);
    },
  })
);
