// src/storage/unifiedStorage.ts
import { debugLog } from "../utils/debugConfig";
import { MMKV } from "react-native-mmkv";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createJSONStorage } from "zustand/middleware";

/**
 * Enum for storage keys to maintain consistency across the app
 */
export enum StorageKeys {
  USER = "klare-user-storage",
  LIFE_WHEEL = "klare-lifeWheel-storage",
  PROGRESSION = "klare-progression-storage",
  THEME = "klare-theme-storage",
  RESOURCES = "klare-resources-storage",
  JOURNAL = "klare-journal-storage",
  JOURNAL_TEMPLATES = "klare-journal-templates-storage",
  JOURNAL_TEMPLATE_CATEGORIES = "klare-journal-template-categories-storage",
  VISION_BOARD = "klare-visionBoard-storage",
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
  // Track storage availability after initialization
  private storageAvailable: boolean = false;

  constructor(id: string = "klare-app-storage") {
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
      this.storageAvailable = true;
      console.log(`MMKV storage (${this.storageId}) initialized successfully`);
    } catch (error) {
      this.isMMKVAvailable = false;
      this.mmkv = null;
      console.log(
        `MMKV not available for ${this.storageId}, falling back to AsyncStorage`,
      );
      console.error("MMKV initialization failed:", error);

      // Verify AsyncStorage is available
      this.checkAsyncStorageAvailability();
    }
  }

  /**
   * Check if AsyncStorage is available as fallback
   */
  private async checkAsyncStorageAvailability(): Promise<void> {
    try {
      await AsyncStorage.setItem("__storage_test__", "test");
      await AsyncStorage.removeItem("__storage_test__");
      this.storageAvailable = true;
      console.log("Storage check passed using AsyncStorage");
    } catch (e) {
      this.storageAvailable = false;
      console.error("AsyncStorage is not available:", e);
    }
  }

  /**
   * Set a string value in storage
   */
  set(key: string, value: string): void {
    try {
      if (this.isMMKVAvailable && this.mmkv) {
        this.mmkv.set(key, value);
      } else if (this.storageAvailable) {
        // Schedule async operation but don't wait for it
        AsyncStorage.setItem(key, value).catch((e) =>
          console.error(`AsyncStorage setItem failed for ${key}:`, e),
        );
      }
    } catch (error) {
      console.error(`Storage set failed for ${key}:`, error);
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
      } else if (this.storageAvailable) {
        return await AsyncStorage.getItem(key);
      }
      return null;
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
      } else if (this.storageAvailable) {
        // Schedule async operation but don't wait for it
        AsyncStorage.removeItem(key).catch((e) =>
          console.error(`AsyncStorage removeItem failed for ${key}:`, e),
        );
      }
    } catch (error) {
      console.error(`Storage delete failed for ${key}:`, error);
    }
  }

  /**
   * Clear all values in storage
   */
  clearAll(): void {
    try {
      if (this.isMMKVAvailable && this.mmkv) {
        this.mmkv.clearAll();
      } else if (this.storageAvailable) {
        // Schedule async operation but don't wait for it
        AsyncStorage.clear().catch((e) =>
          console.error("AsyncStorage clear failed:", e),
        );
      }
    } catch (error) {
      console.error("Storage clearAll failed:", error);
    }
  }

  /**
   * Create a Zustand-compatible storage object that uses async methods with fallbacks
   */
  createZustandStorage() {
    return createJSONStorage<unknown>(() => ({
      setItem: (name: string, value: string) => {
        // Prüfen, ob name definiert ist, bevor wir versuchen zu speichern
        if (name === undefined || name === "undefined") {
          console.warn(
            `Attempting to save to undefined storage key. Value: ${value.substring(0, 50)}...`,
          );
          return;
        }
        // Clean storage debug logging
        debugLog('STORAGE_LOGS', `Set ${name}`, {
          size: value.length > 100 ? `${value.length} chars` : value.substring(0, 50)
        });
        this.set(name, value);
      },
      getItem: (name: string) => {
        // Prüfen, ob name definiert ist, bevor wir versuchen zu laden
        if (name === undefined || name === "undefined") {
          console.warn(`Attempting to get from undefined storage key`);
          return Promise.resolve(null);
        }

        const value = this.getString(name);

        // Return a Promise that will always resolve (even if with null)
        // This prevents Zustand from getting stuck waiting for an undefined Promise
        if (this.isMMKVAvailable) {
          return Promise.resolve(value || null);
        } else if (this.storageAvailable) {
          return AsyncStorage.getItem(name).catch((err) => {
            console.error(`Error getting ${name} from AsyncStorage:`, err);
            return null;
          });
        } else {
          return Promise.resolve(null);
        }
      },
      removeItem: (name: string) => {
        // Prüfen, ob name definiert ist, bevor wir versuchen zu löschen
        if (name === undefined || name === "undefined") {
          console.warn(`Attempting to remove undefined storage key`);
          return;
        }
        this.delete(name);
      },
    }));
  }

  /**
   * Check if MMKV is available
   */
  isAvailable(): boolean {
    return this.isMMKVAvailable || this.storageAvailable;
  }

  /**
   * Get storage type for diagnostic purposes
   */
  getStorageType(): string {
    return this.isMMKVAvailable
      ? "MMKV"
      : this.storageAvailable
        ? "AsyncStorage"
        : "None";
  }
}

// Create the main storage instance
export const unifiedStorage = new UnifiedStorage("klare-app-storage");

// Export a function to create store-specific storage instances
export function createStoreStorage(storeKey: string) {
  console.log(`Creating store storage with key: ${storeKey}`);

  // Ensure the storeKey is valid and corresponds to a StorageKey
  let storageId: string;

  // Map string keys to enum values, handle both full enum and simple string mapping
  switch (storeKey) {
    case "progression":
      storageId = StorageKeys.PROGRESSION;
      break;
    case "user":
      storageId = StorageKeys.USER;
      break;
    case "lifeWheel":
      storageId = StorageKeys.LIFE_WHEEL;
      break;
    case "theme":
      storageId = StorageKeys.THEME;
      break;
    case "resources":
      storageId = StorageKeys.RESOURCES;
      break;
    case "journal":
      storageId = StorageKeys.JOURNAL;
      break;
    case "visionBoard":
      storageId = StorageKeys.VISION_BOARD;
      break;
    default:
      // Überprüfen, ob der storeKey selbst bereits ein StorageKey ist
      const isStorageKey = Object.values(StorageKeys).includes(
        storeKey as StorageKeys,
      );
      if (isStorageKey) {
        storageId = storeKey;
      } else {
        console.warn(
          `Unknown storage key: ${storeKey}, falling back to default`,
        );
        storageId = `klare-${storeKey}-storage`;
      }
      break;
  }

  console.log(`Mapped key '${storeKey}' to storage ID: ${storageId}`);
  const storage = new UnifiedStorage(storageId);
  return storage.createZustandStorage();
}
