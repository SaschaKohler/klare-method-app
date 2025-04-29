import { MMKV } from 'react-native-mmkv'

// Single MMKV instance with optimized configuration
// Add error handling wrapper
const createMMKV = () => {
  try {
    return new MMKV({
      id: 'klaremethode-storage',
      mode: MMKV.MULTI_PROCESS_MODE,
      // encryptionKey: 'your-encryption-key-here',
    });
  } catch (e) {
    console.error('MMKV initialization failed:', e);
    // Fallback to in-memory storage if needed
    return {
      set: () => {},
      getString: () => undefined,
      delete: () => {},
      clearAll: () => {},
    } as unknown as MMKV;
  }
};

export const mmkvStorage = createMMKV();
export enum StorageKeys {
  USER = 'klare-user-storage',
  LIFE_WHEEL = 'klare-life-wheel-storage',
  PROGRESSION = 'klare-progression-storage',
  THEME = 'klare-theme-storage',
  RESOURCES = 'klare-resources-storage',
  JOURNAL = 'klare-journal-storage',
  VISION_BOARD = 'klare-vision-board-storage',
  COMPLETED_MODULES = 'klare-completed-modules',
  JOIN_DATE = 'klare-join-date'
}
