// src/store/persistManager.ts
// import AsyncStorage from "@react-native-async-storage/async-storage";
import { storePersistConfigs } from "./persistConfig";

export class PersistManager {
  // Speichere alle Store-Daten in ein Backup-Format
  static async createBackup() {
    const storeKeys = Object.values(storePersistConfigs).map(
      (config) => config.name,
    );
    const backup: Record<string, any> = {};

    for (const key of storeKeys) {
      try {
        const data = await AsyncStorage.getItem(key);
        if (data) {
          backup[key] = JSON.parse(data);
        }
      } catch (error) {
        console.error(`Failed to backup ${key}:`, error);
      }
    }

    // Füge Metadaten hinzu
    backup.metadata = {
      version: "1.0",
      createdAt: new Date().toISOString(),
      appVersion: "1.0.0", // aus App-Konfiguration beziehen
    };

    return backup;
  }

  // Stelle ein Backup wieder her
  static async restoreBackup(backup: Record<string, any>) {
    if (!backup || !backup.metadata) {
      throw new Error("Invalid backup format");
    }

    // Optional: Versionsprüfung durchführen

    for (const [key, data] of Object.entries(backup)) {
      if (key !== "metadata") {
        try {
          await AsyncStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
          console.error(`Failed to restore ${key}:`, error);
        }
      }
    }

    // Stores neu laden
    return true;
  }

  // Alle Store-Daten exportieren (für Cloud-Sync)
  static async exportStoreData(userId: string) {
    const backup = await this.createBackup();
    return {
      userId,
      storeData: backup,
      exportedAt: new Date().toISOString(),
    };
  }

  // Store-Daten aus Cloud importieren
  static async importStoreData(cloudData: any) {
    // Validierung und dann Wiederherstellung
    return this.restoreBackup(cloudData.storeData);
  }

  // Alle lokalen Daten löschen (z.B. bei Abmeldung)
  static async clearAllData() {
    const storeKeys = Object.values(storePersistConfigs).map(
      (config) => config.name,
    );

    for (const key of storeKeys) {
      try {
        await AsyncStorage.removeItem(key);
      } catch (error) {
        console.error(`Failed to clear ${key}:`, error);
      }
    }
  }
}
