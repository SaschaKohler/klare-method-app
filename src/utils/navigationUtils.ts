// src/utils/navigationUtils.ts
import { NavigationContainerRef } from '@react-navigation/native';
import { Alert } from 'react-native';

/**
 * Utility-Funktionen für die Navigation
 */

// Navigation-Referenz (wird in App.tsx gesetzt)
let _navigator: NavigationContainerRef<any> | null = null;

// Navigation-Referenz setzen
export function setTopLevelNavigator(navigatorRef: NavigationContainerRef<any>) {
  _navigator = navigatorRef;
}

// Sichere Navigation zu einem Screen
export function navigateWithFallback(routeName: string, params?: object) {
  try {
    if (_navigator && _navigator.isReady()) {
      // Prüfen, ob der Screen existiert
      if (!_navigator.getRootState().routeNames.includes(routeName)) {
        console.warn(`Route "${routeName}" nicht gefunden!`);
        return false;
      }
      
      // Navigieren
      _navigator.navigate(routeName as never, params as never);
      return true;
    } else {
      console.warn('Navigator ist nicht bereit für Navigation!');
      return false;
    }
  } catch (error) {
    console.error('Navigation-Fehler:', error);
    Alert.alert(
      'Navigation-Fehler',
      `Es ist ein Fehler bei der Navigation aufgetreten: ${error.message}`
    );
    return false;
  }
}

// Prüfen, ob ein Screen existiert
export function canNavigateTo(routeName: string): boolean {
  try {
    if (_navigator && _navigator.isReady()) {
      return _navigator.getRootState().routeNames.includes(routeName);
    }
    return false;
  } catch (error) {
    console.error('Fehler bei der Prüfung der Route:', error);
    return false;
  }
}

// Aktuellen Screen-Namen abrufen
export function getCurrentRouteName(): string | null {
  try {
    if (_navigator && _navigator.isReady()) {
      const route = _navigator.getCurrentRoute();
      return route?.name || null;
    }
    return null;
  } catch (error) {
    console.error('Fehler beim Abrufen des aktuellen Screen-Namens:', error);
    return null;
  }
}
