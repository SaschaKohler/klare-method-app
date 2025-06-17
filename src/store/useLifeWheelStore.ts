// src/store/useLifeWheelStore.ts - AI-Ready Schema Update (CORRECTED)

import { supabase } from "../lib/supabase";
import { createBaseStore, BaseState } from "./createBaseStore";

// Simple debounce implementation to avoid lodash dependency
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
// Types for AI-ready database schema (ACTUAL schema from migrations)
interface LifeWheelSnapshot {
  id: string;
  user_id: string;
  snapshot_data: any; // JSONB containing the actual snapshot
  snapshot_date: string;
  notes?: string;
  trigger_event: string;
  ai_analysis?: any;
  created_at: string;
}

interface LifeWheelArea {
  id: string;
  name: string;
  currentValue: number;
  targetValue: number;
  notes?: string;
  improvementActions?: string[];
}


interface LifeWheelState extends BaseState {
  // State
  lifeWheelAreas: LifeWheelArea[];
  currentSnapshot: LifeWheelSnapshot | null;
  loading: boolean;
  error: Error | null;
  lastSync: string | null;
  isDirty: boolean;

  // Actions
  loadLifeWheelData: (userId?: string) => Promise<void>;
  loadLatestSnapshot: (userId: string) => Promise<void>;
  updateLifeWheelArea: (areaId: string, updates: Partial<LifeWheelArea>) => Promise<void>;
  createSnapshot: (userId: string, title: string, description?: string) => Promise<string>;
  saveCurrentState: (userId: string) => Promise<void>;
  createDefaultAreas: (userId: string) => Promise<void>;
  reset: () => void;

  // Computed values
  calculateAverage: () => number;
  findLowestAreas: (count?: number) => LifeWheelArea[];
  saveLifeWheelData: (userId: string) => Promise<void>;
}


const initialState: Omit<LifeWheelState, keyof BaseState> = {
  lifeWheelAreas: [],
  currentSnapshot: null,
  loading: false,
  error: null,
  lastSync: null,
  isDirty: false,
};

// Simple debugLog replacement to avoid require cycle
const debugLog = (category: string, message: string, data?: any) => {
  if (__DEV__) {
    console.log(`[${category}] ${message}`, data ? JSON.stringify(data, null, 2) : '');
  }
};

// Helper function to get localized name;
const getLocalizedName = (name: string, translations?: any): string => {
  if (!translations) return name;
  
  const currentLang = 'de'; // Default fallback
  
  try {
    if (translations && typeof translations === 'object') {
      return translations[currentLang] || translations['de'] || translations['en'] || name;
    }
  } catch (error) {
    console.warn('Error parsing translations:', error);
  }
  
  return name;
};

export const useLifeWheelStore = createBaseStore<LifeWheelState>(
  {
    // Initial State
    ...initialState,
    metadata: {
      isLoading: false,
      lastSync: null,
      error: null,
      storageStatus: "initializing",
    },
  },
  (set, get) => {        // Debounced database sync - corrected for actual AI-ready schema
        const syncToDatabase = async () => {
          try {
            const state = get();
            if (!state.isDirty || state.lifeWheelAreas.length === 0) return;

            debugLog('LIFE_WHEEL', 'Syncing to database', { 
              areasCount: state.lifeWheelAreas.length 
            });

            // Update each area in the life_wheel_areas table
            for (const area of state.lifeWheelAreas) {
              const { error } = await supabase
                .from('life_wheel_areas')
                .update({
                  current_value: area.currentValue,
                  target_value: area.targetValue,
                  notes: area.notes || '',
                  improvement_actions: area.improvementActions || [],
                  updated_at: new Date().toISOString(),
                })
                .eq('name', area.id); // Use name as identifier

              if (error) {
                console.error(`Error updating area ${area.id}:`, error);
              }
            }

            // Reset dirty flag and update sync time
            set(state => ({ 
              ...state, 
              isDirty: false,
              metadata: {
                ...state.metadata,
                lastSync: new Date().toISOString(),
              },
            }));

            debugLog('LIFE_WHEEL', 'Database sync completed successfully');
          } catch (error) {
            console.error('Database sync error:', error);
          }
        };

        const debouncedSyncToDatabase = debounce(syncToDatabase, 1000);

        return {

          // Load life wheel data - updated for AI-ready schema
          loadLifeWheelData: async (userId?: string) => {
            try {
              set(state => ({ ...state, loading: true, error: null }));

              if (userId) {
                await get().loadLatestSnapshot(userId);
              } else {
                // No user ID, load from local storage only
                debugLog('LIFE_WHEEL', 'No userId provided, using local data only');
              }
            } catch (error) {
              console.error('Error loading life wheel data:', error);
              set(state => ({ 
                ...state, 
                error: error instanceof Error ? error : new Error(String(error))
              }));
            } finally {
              set(state => ({ ...state, loading: false }));
            }
          },
          // Load latest snapshot for user - CORRECTED for actual AI-ready schema
          loadLatestSnapshot: async (userId: string) => {
            try {
              // Timeout for network requests
              const timeout = new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Network timeout")), 5000)
              );

              // First, try to load current life wheel areas directly
              const areasPromise = supabase
                .from('life_wheel_areas')
                .select('*')
                .eq('user_id', userId);

              const areasResult = await Promise.race([areasPromise, timeout]);
              const { data: areas, error: areasError } = areasResult;

              if (areasError) throw areasError;

              if (!areas || areas.length === 0) {
                // No areas exist, create default areas
                debugLog('LIFE_WHEEL', 'No areas found, creating default areas');
                await get().createDefaultAreas(userId);
                return;
              }

              // Format data for store
              const formattedAreas: LifeWheelArea[] = areas.map(area => ({
                id: area.name, // Using name as ID for consistency
                name: getLocalizedName(area.name, area.translations),
                currentValue: area.current_value || 0,
                targetValue: area.target_value || 0,
                notes: area.notes,
                improvementActions: area.improvement_actions || [],
              }));

              set(state => ({
                ...state,
                lifeWheelAreas: formattedAreas,
                isDirty: false,
                metadata: {
                  ...state.metadata,
                  lastSync: new Date().toISOString(),
                },
              }));
              debugLog('LIFE_WHEEL', 'Areas loaded successfully', { 
                areasCount: formattedAreas.length 
              });

            } catch (error) {
              console.error('Error loading latest snapshot:', error);
              throw error;
            }
          },
          // Create default areas directly in life_wheel_areas table
          createDefaultAreas: async (userId: string) => {
            const defaultAreas = [
              { name: 'career', currentValue: 5, targetValue: 8 },
              { name: 'relationships', currentValue: 6, targetValue: 9 },
              { name: 'health', currentValue: 7, targetValue: 9 },
              { name: 'personal_development', currentValue: 6, targetValue: 8 },
              { name: 'fun_recreation', currentValue: 5, targetValue: 8 },
              { name: 'money', currentValue: 6, targetValue: 8 },
              { name: 'physical_environment', currentValue: 7, targetValue: 8 },
              { name: 'contribution', currentValue: 5, targetValue: 7 },
            ];

            // Insert directly into life_wheel_areas
            const areaInserts = defaultAreas.map(area => ({
              user_id: userId,
              name: area.name,
              current_value: area.currentValue,
              target_value: area.targetValue,
              notes: '',
              improvement_actions: [],
              // Remove barriers, strengths, translations - they don't exist in the schema
            }));

            const { error: areasError } = await supabase
              .from('life_wheel_areas')
              .insert(areaInserts);

            if (areasError) throw areasError;

            // Update store with new data
            const formattedAreas: LifeWheelArea[] = defaultAreas.map(area => ({
              id: area.name,
              name: area.name,
              currentValue: area.currentValue,
              targetValue: area.targetValue,
              notes: '',
              improvementActions: [],
            }));

            set(state => ({
              ...state,
              lifeWheelAreas: formattedAreas,
              isDirty: false,
            }));

            debugLog('LIFE_WHEEL', 'Default areas created', { 
              areasCount: defaultAreas.length 
            });
          },
          
          // Update life wheel area - corrected for actual schema
          updateLifeWheelArea: async (areaId: string, updates: Partial<LifeWheelArea>) => {
            // Update local state immediately
            set(state => ({
              ...state,
              lifeWheelAreas: state.lifeWheelAreas.map(area =>
                area.id === areaId ? { ...area, ...updates } : area
              ),
              isDirty: true,
            }));

            // Trigger debounced sync to database
            debouncedSyncToDatabase();
          },

          // Create new snapshot - simplified for actual schema
          createSnapshot: async (userId: string, title: string, description?: string) => {
            const state = get();
            
            const snapshotData = {
              areas: state.lifeWheelAreas.map(area => ({
                name: area.id,
                current_value: area.currentValue,
                target_value: area.targetValue,
                notes: area.notes,
              })),
              created_at: new Date().toISOString(),
            };

            const { data, error } = await supabase
              .from('life_wheel_snapshots')
              .insert({
                user_id: userId,
                snapshot_data: snapshotData,
                notes: description,
                trigger_event: 'manual',
                snapshot_date: new Date().toISOString(),
              })
              .select('id')
              .single();

            if (error || !data) {
              throw new Error(`Failed to create snapshot: ${error?.message}`);
            }

            return data.id;
          },

          
          // Save current state to database
          saveCurrentState: async (userId: string) => {
            try {
              await get().createSnapshot(
                userId,
                `Life Wheel - ${new Date().toLocaleDateString()}`,
                'Manual save'
              );

              await syncToDatabase();
              debugLog('LIFE_WHEEL', 'State saved successfully');
            } catch (error) {
              console.error('Error saving state:', error);
              throw error;
            }
          },

          // Reset
          reset: () => {
            set(state => ({
              ...state,
              ...initialState,
            }));
          },

          // Computed values
          calculateAverage: () => {
            const state = get();
            if (state.lifeWheelAreas.length === 0) return 0;
            
            const sum = state.lifeWheelAreas.reduce((total, area) => total + area.currentValue, 0);
            return Math.round((sum / state.lifeWheelAreas.length) * 10) / 10; // Round to 1 decimal
          },

          findLowestAreas: (count = 3) => {
            const state = get();
            return [...state.lifeWheelAreas]
              .sort((a, b) => a.currentValue - b.currentValue)
              .slice(0, count);
          },

          saveLifeWheelData: async (userId: string) => {
            try {
              await get().saveCurrentState(userId);
              return true;
            } catch (error) {
              console.error('Error saving life wheel data:', error);
              return false;
            }
          },
        };
      },
      "lifeWheel",
    );
