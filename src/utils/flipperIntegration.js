// flipperIntegration.js
import { Platform } from 'react-native';
import { addPlugin } from 'react-native-flipper';
import { MMKV } from 'react-native-mmkv';

// Nur im Debug-Modus ausführen
if (__DEV__) {
  try {
    console.log('[Flipper] Initialisiere Integration...');
    
    // MMKV Integration
    if (global.nativeFlipper) {
      console.log('[Flipper] Native Flipper gefunden, füge MMKV Plugin hinzu');
      
      // Stelle sicher, dass wir die MMKV-Instanz haben, die du in deiner App verwendest
      // Passe dies an, wenn du eine andere MMKV-Instanz verwendest
      const storage = new MMKV();
      
      // Dynamisch das MMKV Plugin importieren
      import('flipper-plugin-react-native-mmkv').then(
        (module) => {
          const MMKVFlipper = module.default;
          addPlugin(new MMKVFlipper(storage));
          console.log('[Flipper] MMKV Plugin erfolgreich hinzugefügt');
        }
      ).catch(err => {
        console.log('[Flipper] Fehler beim Laden des MMKV-Plugins:', err);
      });
    } else {
      console.log('[Flipper] Native Flipper nicht gefunden - stelle sicher, dass die App im Debug-Modus läuft');
    }
    
    // Expo DevServer Integration 
    if (Platform.OS === 'ios') {
      import('expo-community-flipper/src/plugins/SonarDevServerClient').then(
        (module) => {
          const SonarDevServerClient = module.SonarDevServerClient;
          addPlugin(new SonarDevServerClient());
          console.log('[Flipper] Expo DevServer Plugin erfolgreich hinzugefügt');
        }
      ).catch(err => {
        console.log('[Flipper] Fehler beim Laden des Expo DevServer Plugins:', err);
      });
    }
    
  } catch (error) {
    console.log('[Flipper] Fehler bei der Integration:', error);
  }
}
