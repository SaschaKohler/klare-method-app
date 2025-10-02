// =====================================================
// Unified Storage Adapter for KLARE App
// Provides a single interface across MMKV and AsyncStorage
// =====================================================

import { MMKV } from 'react-native-mmkv';
import AsyncStorage from '@react-native-async-storage/async-storage';

// -----------------------------------------------------
// Storage Keys Enum
// Keeps all persisted keys centralized for consistency
// -----------------------------------------------------
export enum StorageKeys {
  USER = 'user',
  LIFE_WHEEL = 'lifeWheel',
  PROGRESSION = 'progression',
  THEME = 'theme',
  RESOURCES = 'resources',
  JOURNAL = 'journal',
  JOURNAL_TEMPLATES = 'journalTemplates',
  JOURNAL_TEMPLATE_CATEGORIES = 'journalTemplateCategories',
  VISION_BOARD = 'visionBoard',
  AI_SETTINGS = 'aiSettings',
  ONBOARDING = 'onboarding',
}

type StorageBackend = 'mmkv' | 'async-storage';

// -----------------------------------------------------
// Unified Storage Implementation
// Exposes sync & async helpers plus metadata APIs
// -----------------------------------------------------
class UnifiedStorage {
  private mmkv: MMKV | null = null;
  private backend: StorageBackend = 'async-storage';

  constructor() {
    try {
      this.mmkv = new MMKV({ id: 'klare-unified' });
      this.backend = 'mmkv';
      console.log('✅ UnifiedStorage using MMKV backend');
    } catch (error) {
      this.mmkv = null;
      this.backend = 'async-storage';
      console.warn('⚠️ MMKV unavailable, falling back to AsyncStorage', error);
    }
  }

  // ---------- availability helpers ----------
  isAvailable(): boolean {
    if (this.backend === 'mmkv') {
      return !!this.mmkv;
    }
    return true;
  }

  getStorageType(): StorageBackend {
    return this.backend;
  }

  // ---------- synchronous API (best effort) ----------
  getString(key: string): string | null {
    if (this.backend === 'mmkv' && this.mmkv) {
      return this.mmkv.getString(key) ?? null;
    }
    console.warn(`⚠️ getString(${key}) called synchronously on AsyncStorage backend`);
    return null;
  }

  set(key: string, value: string): void {
    if (this.backend === 'mmkv' && this.mmkv) {
      this.mmkv.set(key, value);
      return;
    }
    void AsyncStorage.setItem(key, value);
  }

  delete(key: string): void {
    if (this.backend === 'mmkv' && this.mmkv) {
      this.mmkv.delete(key);
      return;
    }
    void AsyncStorage.removeItem(key);
  }

  clearAll(): void {
    if (this.backend === 'mmkv' && this.mmkv) {
      this.mmkv.clearAll();
      return;
    }
    void AsyncStorage.clear();
  }

  // ---------- asynchronous API (reliable across backends) ----------
  async getStringAsync(key: string): Promise<string | null> {
    if (this.backend === 'mmkv' && this.mmkv) {
      return this.mmkv.getString(key) ?? null;
    }
    return AsyncStorage.getItem(key);
  }

  async setAsync(key: string, value: string): Promise<void> {
    if (this.backend === 'mmkv' && this.mmkv) {
      this.mmkv.set(key, value);
      return;
    }
    await AsyncStorage.setItem(key, value);
  }

  async deleteAsync(key: string): Promise<void> {
    if (this.backend === 'mmkv' && this.mmkv) {
      this.mmkv.delete(key);
      return;
    }
    await AsyncStorage.removeItem(key);
  }

  async getAllKeys(): Promise<string[]> {
    if (this.backend === 'mmkv' && this.mmkv) {
      return [...this.mmkv.getAllKeys()];
    }
    const keys = await AsyncStorage.getAllKeys();
    return [...keys];
  }
}

export const unifiedStorage = new UnifiedStorage();

// -----------------------------------------------------
// Zustand `persist` Helper
// Ensures consistent key namespace and JSON wrapping
// -----------------------------------------------------
interface PersistStorageAdapter {
  getItem: (name: string) => Promise<string | null> | string | null;
  setItem: (name: string, value: string) => Promise<void> | void;
  removeItem: (name: string) => Promise<void> | void;
}

export const createStoreStorage = (storeKey: string): PersistStorageAdapter => {
  return {
    getItem: async (name) => {
      const key = resolveKey(name, storeKey);
      return unifiedStorage.getStringAsync(key);
    },
    setItem: async (name, value) => {
      const key = resolveKey(name, storeKey);
      await unifiedStorage.setAsync(key, value);
    },
    removeItem: async (name) => {
      const key = resolveKey(name, storeKey);
      await unifiedStorage.deleteAsync(key);
    },
  };
};

const resolveKey = (name: string, fallback: string): string => {
  if (!name || name === 'undefined') {
    return fallback;
  }
  return name;
};

// Convenience exports for backward compatibility with older code paths
export const storage = unifiedStorage;
export const sensitiveStorage = unifiedStorage;
export const privacyStorage = unifiedStorage;
