// src/store/persistManager.ts
import { mmkvStorage } from "./mmkvStorage.ts.old";
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
        const data = mmkvStorage.getString(key);
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
          mmkvStorage.set(key, JSON.stringify(data));
        } catch (error) {
          console.error(`Failed to restore ${key}:`, error);
        }
      }
    }

    // Stores neu laden
    return true;
  }

  // Alle Store-Daten exportieren (für Cloud-Sync)
  static exportStoreData(userId: string) {
    const backup = this.createBackup();
    return {
      userId,
      storeData: backup,
      exportedAt: new Date().toISOString(),
    };
  }

  // Store-Daten aus Cloud importieren
  static importStoreData(cloudData: any) {
    // Validation and restoration
    return this.restoreBackup(cloudData.storeData);
  }

  // Alle lokalen Daten löschen (z.B. bei Abmeldung)
  static async clearAllData() {
    const storeKeys = Object.values(storePersistConfigs).map(
      (config) => config.name,
    );

    for (const key of storeKeys) {
      try {
        mmkvStorage.delete(key);
      } catch (error) {
        console.error(`Failed to clear ${key}:`, error);
      }
    }
  }
}
