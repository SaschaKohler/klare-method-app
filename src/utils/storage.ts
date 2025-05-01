import { MMKV } from 'react-native-mmkv';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Storage utility that uses MMKV when available and falls back to AsyncStorage
 * when running in environments where MMKV isn't supported (like remote debugging)
 */
class Storage {
  private mmkv: MMKV | null = null;
  private isMMKVAvailable: boolean = false;

  constructor() {
    try {
      this.mmkv = new MMKV();
      this.isMMKVAvailable = true;
      console.log('MMKV storage initialized successfully');
    } catch (error) {
      this.isMMKVAvailable = false;
      console.log('MMKV not available, falling back to AsyncStorage');
    }
  }

  /**
   * Store a string value
   */
  async setString(key: string, value: string): Promise<void> {
    if (this.isMMKVAvailable && this.mmkv) {
      this.mmkv.set(key, value);
      return Promise.resolve();
    } else {
      return AsyncStorage.setItem(key, value);
    }
  }

  /**
   * Get a string value
   */
  async getString(key: string): Promise<string | null> {
    if (this.isMMKVAvailable && this.mmkv) {
      return this.mmkv.getString(key) || null;
    } else {
      return AsyncStorage.getItem(key);
    }
  }

  /**
   * Store a boolean value
   */
  async setBoolean(key: string, value: boolean): Promise<void> {
    if (this.isMMKVAvailable && this.mmkv) {
      this.mmkv.set(key, value);
      return Promise.resolve();
    } else {
      return AsyncStorage.setItem(key, JSON.stringify(value));
    }
  }

  /**
   * Get a boolean value
   */
  async getBoolean(key: string): Promise<boolean | null> {
    if (this.isMMKVAvailable && this.mmkv) {
      return this.mmkv.getBoolean(key) || null;
    } else {
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    }
  }

  /**
   * Store a number value
   */
  async setNumber(key: string, value: number): Promise<void> {
    if (this.isMMKVAvailable && this.mmkv) {
      this.mmkv.set(key, value);
      return Promise.resolve();
    } else {
      return AsyncStorage.setItem(key, value.toString());
    }
  }

  /**
   * Get a number value
   */
  async getNumber(key: string): Promise<number | null> {
    if (this.isMMKVAvailable && this.mmkv) {
      return this.mmkv.getNumber(key) || null;
    } else {
      const value = await AsyncStorage.getItem(key);
      return value ? parseFloat(value) : null;
    }
  }

  /**
   * Store an object value
   */
  async setObject(key: string, value: object): Promise<void> {
    const jsonValue = JSON.stringify(value);
    if (this.isMMKVAvailable && this.mmkv) {
      this.mmkv.set(key, jsonValue);
      return Promise.resolve();
    } else {
      return AsyncStorage.setItem(key, jsonValue);
    }
  }

  /**
   * Get an object value
   */
  async getObject<T>(key: string): Promise<T | null> {
    if (this.isMMKVAvailable && this.mmkv) {
      const jsonValue = this.mmkv.getString(key);
      return jsonValue ? JSON.parse(jsonValue) as T : null;
    } else {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue ? JSON.parse(jsonValue) as T : null;
    }
  }

  /**
   * Delete a value
   */
  async delete(key: string): Promise<void> {
    if (this.isMMKVAvailable && this.mmkv) {
      this.mmkv.delete(key);
      return Promise.resolve();
    } else {
      return AsyncStorage.removeItem(key);
    }
  }

  /**
   * Clear all stored values
   */
  async clearAll(): Promise<void> {
    if (this.isMMKVAvailable && this.mmkv) {
      this.mmkv.clearAll();
      return Promise.resolve();
    } else {
      return AsyncStorage.clear();
    }
  }
}

// Export a singleton instance
export default new Storage();
