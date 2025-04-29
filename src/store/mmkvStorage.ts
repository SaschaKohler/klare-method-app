import { MMKV } from 'react-native-mmkv'

export const mmkvStorage = new MMKV({
  id: 'klaremethode-storage',
  // encryptionKey: 'optional-encryption-key' // Optional aktivieren für sichere Speicherung
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
