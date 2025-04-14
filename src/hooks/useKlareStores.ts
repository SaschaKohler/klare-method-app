// src/hooks/useKlareStores.ts
import { useUserStore, useLifeWheelStore, useProgressionStore } from '../store';
import { useCallback } from 'react';

/**
 * Custom hook that provides combined access to all KLARE method stores
 * and offers convenient methods for common operations
 */
export const useKlareStores = () => {
  // Access to individual stores
  const user = useUserStore(state => state.user);
  const isLoading = useUserStore(state => state.isLoading);
  const saveUserData = useUserStore(state => state.saveUserData);
  
  // LifeWheel selectors
  const lifeWheelAreas = useLifeWheelStore(state => state.lifeWheelAreas);
  const updateLifeWheelArea = useLifeWheelStore(state => state.updateLifeWheelArea);
  const calculateAverage = useLifeWheelStore(state => state.calculateAverage);
  const findLowestAreas = useLifeWheelStore(state => state.findLowestAreas);
  const saveLifeWheelData = useLifeWheelStore(state => state.saveLifeWheelData);
  
  // Progression selectors
  const completedModules = useProgressionStore(state => state.completedModules);
  const completeModule = useProgressionStore(state => state.completeModule);
  const getModuleProgress = useProgressionStore(state => state.getModuleProgress);
  const getDaysInProgram = useProgressionStore(state => state.getDaysInProgram);
  const getCurrentStage = useProgressionStore(state => state.getCurrentStage);
  const getNextStage = useProgressionStore(state => state.getNextStage);
  const getAvailableModules = useProgressionStore(state => state.getAvailableModules);
  const isModuleAvailable = useProgressionStore(state => state.isModuleAvailable);
  const saveProgressionData = useProgressionStore(state => state.saveProgressionData);
  
  // Calculate total progress across all KLARE steps
  const calculateTotalProgress = useCallback(() => {
    // Berechne den Fortschritt für jeden KLARE-Schritt
    const kProgress = getModuleProgress("K");
    const lProgress = getModuleProgress("L");
    const aProgress = getModuleProgress("A");
    const rProgress = getModuleProgress("R");
    const eProgress = getModuleProgress("E");

    // Gesamtfortschritt als gewichteter Durchschnitt
    return Math.round(
      ((kProgress + lProgress + aProgress + rProgress + eProgress) / 5) * 100,
    );
  }, [getModuleProgress]);
  
  // Convenience method to save all data at once
  const saveAllData = useCallback(async () => {
    if (!user) return false;
    
    try {
      // Save all data in parallel
      const [userResult, lifeWheelResult, progressionResult] = await Promise.all([
        saveUserData(),
        saveLifeWheelData(user.id),
        saveProgressionData(user.id)
      ]);
      
      return userResult && lifeWheelResult && progressionResult;
    } catch (error) {
      console.error('Error saving all data:', error);
      return false;
    }
  }, [user, saveUserData, saveLifeWheelData, saveProgressionData]);
  
  // Get progress for a specific step as a percentage
  const getStepProgressPercentage = useCallback((step: "K" | "L" | "A" | "R" | "E") => {
    return Math.round(getModuleProgress(step) * 100);
  }, [getModuleProgress]);
  
  return {
    // User data
    user,
    isLoading,
    
    // LifeWheel methods
    lifeWheelAreas,
    updateLifeWheelArea,
    calculateAverage,
    findLowestAreas,
    
    // Progression methods
    completedModules,
    completeModule,
    getModuleProgress,
    getDaysInProgram,
    getCurrentStage,
    getNextStage,
    getAvailableModules,
    isModuleAvailable,
    
    // Convenience methods
    calculateTotalProgress,
    saveAllData,
    getStepProgressPercentage
  };
};

export default useKlareStores;
