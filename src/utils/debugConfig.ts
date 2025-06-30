// src/utils/debugConfig.ts
export const DEBUG_CONFIG = {
  // Storage debugging
  STORAGE_DIAGNOSTICS: false, // Set to true only when debugging storage
  STORAGE_LOGS: false,
  
  // Store debugging  
  STORE_HYDRATION: false, // Set to true only when debugging stores
  STORE_METADATA: false,

  // Auth debugging
  AUTH_LOGS: true, // Set to true for auth flow debugging
  
  // Internationalization debugging
  I18N_DEBUG: false, // Set to true only when debugging translations
  
  // Performance debugging
  RENDER_LOGS: false,
  NAVIGATION_LOGS: false,
  
  // General app debugging
  APP_LIFECYCLE: false,
  ONBOARDING_LOGS: true, // Keep this for onboarding testing
};

// Helper to check if any debug flags are enabled
export const isDebugging = () => {
  return Object.values(DEBUG_CONFIG).some(Boolean);
};

// Conditional logger
export const debugLog = (category: keyof typeof DEBUG_CONFIG, ...args: any[]) => {
  if (__DEV__ && DEBUG_CONFIG[category]) {
    console.log(`[${category}]`, ...args);
  }
};

export default DEBUG_CONFIG;