// ALTERNATIVE LÖSUNG: Native iOS Authentication Session
// src/lib/authSession.ts

import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';

// WebBrowser für bessere iOS Erfahrung konfigurieren
WebBrowser.maybeCompleteAuthSession();

/**
 * Verbesserte OAuth-Session mit automatischem Browser-Schließen
 */
export const createAuthSession = (authUrl: string, redirectUrl: string) => {
  if (Platform.OS === 'ios') {
    // iOS: Verwende AuthSession für native SFAuthenticationSession
    return AuthSession.AuthRequest.useAuthRequest(
      {
        responseType: AuthSession.ResponseType.Code,
        clientId: 'dummy', // Wird nicht verwendet, da wir die komplette URL haben
        redirectUri: redirectUrl,
        scopes: [],
      },
      {
        authorizationEndpoint: authUrl,
      }
    );
  } else {
    // Android: Standard WebBrowser mit verbesserter Konfiguration
    return null; // Fallback zu Standard-Implementierung
  }
};

/**
 * OAuth mit nativer iOS Authentication Session
 */
export const performNativeOAuth = async (authUrl: string, redirectUrl: string) => {
  console.log('🚀 Starting native OAuth session');
  console.log('Auth URL:', authUrl);
  console.log('Redirect URL:', redirectUrl);
  
  if (Platform.OS === 'ios') {
    try {
      // iOS: SFAuthenticationSession über AuthSession
      const result = await AuthSession.startAsync({
        authUrl,
        returnUrl: redirectUrl,
      });
      
      console.log('Native AuthSession result:', result);
      
      if (result.type === 'success') {
        console.log('✅ Native OAuth successful, browser closed automatically');
        return { success: true, url: result.url };
      } else if (result.type === 'cancel') {
        console.log('❌ OAuth cancelled by user');
        return { success: false, error: 'User cancelled' };
      } else {
        console.log('❌ OAuth failed:', result);
        return { success: false, error: 'OAuth failed' };
      }
    } catch (error) {
      console.error('Native OAuth error:', error);
      return { success: false, error };
    }
  } else {
    // Android: Verbesserte WebBrowser-Konfiguration
    try {
      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUrl, {
        // Android-spezifische Optimierungen
        dismissButtonStyle: 'cancel',
        readerMode: false,
        enableBarCollapsing: true,
        showInRecents: false,
        // Wichtig für Android
        createTask: false,
        showTitle: false,
        enableDefaultShare: false,
        // Browser-Package nicht spezifizieren für bessere Kompatibilität
        browserPackage: undefined,
      });
      
      console.log('Android WebBrowser result:', result);
      
      if (result.type === 'success') {
        console.log('✅ Android OAuth successful');
        
        // Android: Expliziter Browser-Dismiss-Versuch
        try {
          await WebBrowser.dismissBrowser();
        } catch (dismissError) {
          console.log('Browser dismiss not needed or failed:', dismissError);
        }
        
        return { success: true, url: result.url };
      } else {
        return { success: false, error: result.type };
      }
    } catch (error) {
      console.error('Android OAuth error:', error);
      return { success: false, error };
    }
  }
};

export default { createAuthSession, performNativeOAuth };
