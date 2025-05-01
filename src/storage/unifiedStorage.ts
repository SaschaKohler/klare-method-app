// src/storage/unifiedStorage.ts
import { MMKV } from "react-native-mmkv";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createJSONStorage } from "zustand/middleware";

/**
 * Enum for storage keys to maintain consistency across the app
 */
export enum StorageKeys {
  USER = "klare-user-storage",
  LIFE_WHEEL = "klare-life-wheel-storage",
  PROGRESSION = "klare-progression-storage",
  THEME = "klare-theme-storage",
  RESOURCES = "klare-resources-storage",
  JOURNAL = "klare-journal-storage",
  VISION_BOARD = "klare-vision-board-storage",
  COMPLETED_MODULES = "klare-completed-modules",
  JOIN_DATE = "klare-join-date",
  USER_RESOURCES = "klare-user-resources",
}

/**
 * Unified storage that automatically falls back to AsyncStorage when MMKV is unavailable
 */
class UnifiedStorage {
  private mmkv: MMKV | null = null;
  private isMMKVAvailable: boolean = false;
  private storageId: string;

  constructor(id: string = "klare-default-storage") {
    this.storageId = id;
    this.initializeStorage();
  }

  /**
   * Initialize storage and handle fallback
   */
  private initializeStorage(): void {
    try {
      this.mmkv = new MMKV({
        id: this.storageId,
      });

      // Test if MMKV is working - this will throw if JSI is unavailable
      this.mmkv.set("__test__", "test");
      this.mmkv.delete("__test__");

      this.isMMKVAvailable = true;
      console.log(`MMKV storage (${this.storageId}) initialized successfully`);
    } catch (error) {
      this.isMMKVAvailable = false;
      this.mmkv = null;
      console.log(
        `MMKV not available for ${this.storageId}, falling back to AsyncStorage`,
      );
      console.error("MMKV initialization failed:", error);
    }
  }

  /**
   * Set a string value in storage
   */
  set(key: string, value: string): void {
    try {
      if (this.isMMKVAvailable && this.mmkv) {
        this.mmkv.set(key, value);
      } else {
        // Schedule async operation but don't wait for it
        AsyncStorage.setItem(key, value).catch((e) =>
          console.error(`AsyncStorage setItem failed for ${key}:`, e),
        );
      }
    } catch (error) {
      console.error(`Storage set failed for ${key}:`, error);
      // Attempt AsyncStorage as last resort
      AsyncStorage.setItem(key, value).catch((e) =>
        console.error(`AsyncStorage fallback setItem failed for ${key}:`, e),
      );
    }
  }

  /**
   * Get a string value from storage
   */
  getString(key: string): string | undefined {
    try {
      if (this.isMMKVAvailable && this.mmkv) {
        return this.mmkv.getString(key);
      } else {
        // For synchronous APIs, we can't return AsyncStorage value directly
        // The caller should handle this case appropriately
        console.log(
          `Synchronous getString not available for ${key} in AsyncStorage fallback mode`,
        );
        return undefined;
      }
    } catch (error) {
      console.error(`Storage getString failed for ${key}:`, error);
      return undefined;
    }
  }

  /**
   * Get a string value asynchronously (works with both MMKV and AsyncStorage)
   */
  async getStringAsync(key: string): Promise<string | null> {
    try {
      if (this.isMMKVAvailable && this.mmkv) {
        return this.mmkv.getString(key) || null;
      } else {
        return await AsyncStorage.getItem(key);
      }
    } catch (error) {
      console.error(`Storage getStringAsync failed for ${key}:`, error);
      return null;
    }
  }

  /**
   * Delete a value from storage
   */
  delete(key: string): void {
    try {
      if (this.isMMKVAvailable && this.mmkv) {
        this.mmkv.delete(key);
      } else {
        // Schedule async operation but don't wait for it
        AsyncStorage.removeItem(key).catch((e) =>
          console.error(`AsyncStorage removeItem failed for ${key}:`, e),
        );
      }
    } catch (error) {
      console.error(`Storage delete failed for ${key}:`, error);
      // Attempt AsyncStorage as last resort
      AsyncStorage.removeItem(key).catch((e) =>
        console.error(`AsyncStorage fallback removeItem failed for ${key}:`, e),
      );
    }
  }

  /**
   * Clear all values in storage
   */
  clearAll(): void {
    try {
      if (this.isMMKVAvailable && this.mmkv) {
        this.mmkv.clearAll();
      } else {
        // Schedule async operation but don't wait for it
        AsyncStorage.clear().catch((e) =>
          console.error("AsyncStorage clear failed:", e),
        );
      }
    } catch (error) {
      console.error("Storage clearAll failed:", error);
      // Attempt AsyncStorage as last resort
      AsyncStorage.clear().catch((e) =>
        console.error("AsyncStorage fallback clear failed:", e),
      );
    }
  }

  /**
   * Create a Zustand-compatible storage object
   */
  createZustandStorage() {
    return createJSONStorage(() => ({
      setItem: (name: string, value: string) => {
        this.set(name, value);
      },
      getItem: (name: string) => {
        const value = this.getString(name);
        return value || null;
      },
      removeItem: (name: string) => {
        this.delete(name);
      },
    }));
  }

  /**
   * Check if MMKV is available
   */
  isAvailable(): boolean {
    return this.isMMKVAvailable;
  }

  /**
   * Get storage type for diagnostic purposes
   */
  getStorageType(): string {
    return this.isMMKVAvailable ? "MMKV" : "AsyncStorage";
  }
}

// Create the main storage instance
export const unifiedStorage = new UnifiedStorage("klare-app-storage");

// Export a function to create store-specific storage instances
export function createStoreStorage(storeKey: string) {
  const storage = new UnifiedStorage(`klare-${storeKey}-storage`);
  return storage.createZustandStorage();
}
