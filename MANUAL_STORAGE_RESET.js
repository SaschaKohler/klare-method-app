// MANUAL STORAGE RESET - Run this once to clear all local data
// Add this import and function to your App.tsx temporarily

import { MMKV } from 'react-native-mmkv';

// 🚨 TEMPORARY FUNCTION - Add this to your App.tsx inside the component
const clearAllLocalStorage = () => {
  console.log('🧹 Starting manual storage reset...');
  
  const storageKeys = [
    'klare-user-storage',
    'klare-lifeWheel-storage', 
    'klare-progression-storage',
    'klare-theme-storage',
    'klare-resources-storage',
    'klare-journal-storage',
    'klare-visionBoard-storage',
    'onboarding-storage',
    'klare-app-storage',
    'klare-general',
    'klare-sensitive',
    'klare-privacy'
  ];

  storageKeys.forEach(key => {
    try {
      const storage = new MMKV({ id: key });
      storage.clearAll();
      console.log(`✅ Cleared: ${key}`);
    } catch (error) {
      console.log(`⚠️ Could not clear ${key}:`, error);
    }
  });

  console.log('🎉 All local storage cleared! Please restart the app.');
};

// 🚨 TEMPORARY: Call this function once in useEffect
useEffect(() => {
  // UNCOMMENT THIS LINE TO RUN THE RESET:
  // clearAllLocalStorage();
}, []);
