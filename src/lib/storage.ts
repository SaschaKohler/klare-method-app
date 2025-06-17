// =====================================================
// Privacy-Aware Storage Architecture
// Multiple Storage Levels for Different Sensitivity
// =====================================================

import { MMKV } from 'react-native-mmkv';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Base storage class with automatic MMKV/AsyncStorage fallback
 */
class BaseStorage {
  private mmkv: MMKV | null = null;
  private isMMKVAvailable: boolean = false;
  private storageId: string;

  constructor(storageId: string = 'default') {
    this.storageId = storageId;
    try {
      this.mmkv = new MMKV({ id: storageId });
      this.isMMKVAvailable = true;
      console.log(`MMKV storage initialized for ${storageId}`);
    } catch (error) {
      this.isMMKVAvailable = false;
      console.log(`MMKV not available for ${storageId}, falling back to AsyncStorage`);
    }
  }

  async setString(key: string, value: string): Promise<void> {
    if (this.isMMKVAvailable && this.mmkv) {
      this.mmkv.set(key, value);
      return Promise.resolve();
    } else {
      return AsyncStorage.setItem(`${this.storageId}_${key}`, value);
    }
  }

  async getString(key: string): Promise<string | null> {
    if (this.isMMKVAvailable && this.mmkv) {
      return this.mmkv.getString(key) || null;
    } else {
      return AsyncStorage.getItem(`${this.storageId}_${key}`);
    }
  }

  async setObject(key: string, value: object): Promise<void> {
    const jsonValue = JSON.stringify(value);
    return this.setString(key, jsonValue);
  }

  async getObject<T>(key: string): Promise<T | null> {
    const jsonValue = await this.getString(key);
    return jsonValue ? JSON.parse(jsonValue) as T : null;
  }

  async setBoolean(key: string, value: boolean): Promise<void> {
    if (this.isMMKVAvailable && this.mmkv) {
      this.mmkv.set(key, value);
      return Promise.resolve();
    } else {
      return AsyncStorage.setItem(`${this.storageId}_${key}`, JSON.stringify(value));
    }
  }

  async getBoolean(key: string): Promise<boolean | null> {
    if (this.isMMKVAvailable && this.mmkv) {
      return this.mmkv.getBoolean(key) || null;
    } else {
      const value = await AsyncStorage.getItem(`${this.storageId}_${key}`);
      return value ? JSON.parse(value) : null;
    }
  }

  async setNumber(key: string, value: number): Promise<void> {
    if (this.isMMKVAvailable && this.mmkv) {
      this.mmkv.set(key, value);
      return Promise.resolve();
    } else {
      return AsyncStorage.setItem(`${this.storageId}_${key}`, value.toString());
    }
  }

  async getNumber(key: string): Promise<number | null> {
    if (this.isMMKVAvailable && this.mmkv) {
      return this.mmkv.getNumber(key) || null;
    } else {
      const value = await AsyncStorage.getItem(`${this.storageId}_${key}`);
      return value ? parseFloat(value) : null;
    }
  }

  async delete(key: string): Promise<void> {
    if (this.isMMKVAvailable && this.mmkv) {
      this.mmkv.delete(key);
      return Promise.resolve();
    } else {
      return AsyncStorage.removeItem(`${this.storageId}_${key}`);
    }
  }

  async clearAll(): Promise<void> {
    if (this.isMMKVAvailable && this.mmkv) {
      this.mmkv.clearAll();
      return Promise.resolve();
    } else {
      // For AsyncStorage, we need to get all keys with our prefix and remove them
      const keys = await AsyncStorage.getAllKeys();
      const keysToRemove = keys.filter(key => key.startsWith(`${this.storageId}_`));
      return AsyncStorage.multiRemove(keysToRemove);
    }
  }

  async getAllKeys(): Promise<string[]> {
    if (this.isMMKVAvailable && this.mmkv) {
      return this.mmkv.getAllKeys();
    } else {
      const keys = await AsyncStorage.getAllKeys();
      return keys
        .filter(key => key.startsWith(`${this.storageId}_`))
        .map(key => key.replace(`${this.storageId}_`, ''));
    }
  }
}

// =====================================================
// Privacy-Aware Storage Instances
// =====================================================

/**
 * General storage for non-sensitive data
 * Can be cached, shared, and used for analytics
 */
export const storage = new BaseStorage('klare-general');

/**
 * Sensitive storage for personal but not intimate data
 * Limited sharing, local-first with selective cloud sync
 */
export const sensitiveStorage = new BaseStorage('klare-sensitive');

/**
 * Privacy storage for highly intimate/personal data
 * Local-only, encrypted, never shared
 */
export const privacyStorage = new BaseStorage('klare-privacy');

// =====================================================
// Storage Level Helper Functions
// =====================================================

export type StorageLevel = 'general' | 'sensitive' | 'privacy';

export const getStorageForLevel = (level: StorageLevel): BaseStorage => {
  switch (level) {
    case 'general':
      return storage;
    case 'sensitive':
      return sensitiveStorage;
    case 'privacy':
      return privacyStorage;
    default:
      return storage;
  }
};

export const determineStorageLevel = (content: string): StorageLevel => {
  const sensitiveKeywords = [
    'personal', 'private', 'relationship', 'family', 'health', 
    'fear', 'anxiety', 'depression', 'trauma', 'therapy'
  ];
  
  const privacyKeywords = [
    'secret', 'intimate', 'sexual', 'suicidal', 'abuse', 'addiction',
    'affair', 'illegal', 'confidential', 'embarrassing'
  ];

  const lowerContent = content.toLowerCase();
  
  if (privacyKeywords.some(keyword => lowerContent.includes(keyword))) {
    return 'privacy';
  }
  
  if (sensitiveKeywords.some(keyword => lowerContent.includes(keyword))) {
    return 'sensitive';
  }
  
  return 'general';
};

// =====================================================
// Export Default Storage (for backward compatibility)
// =====================================================
export default storage;
