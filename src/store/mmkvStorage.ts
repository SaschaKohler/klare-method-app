import { MMKV } from 'react-native-mmkv'

// Single MMKV instance with optimized configuration
export const mmkvStorage = new MMKV({
  id: 'klaremethode-storage',
  mode: MMKV.MULTI_PROCESS_MODE,
  // encryptionKey: 'your-encryption-key-here', // Optional für Produktion
  // debug: false // Explicitly disable debug logs if needed
})
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
