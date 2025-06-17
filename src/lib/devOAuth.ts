// EXPO DEV CLIENT OAUTH BYPASS
// src/lib/devOAuth.ts

import { Platform, Alert, Linking } from 'react-native';
import { supabase } from './supabase';

/**
 * Development-optimierte OAuth-Lösung
 * Umgeht das Expo Dev Client Redirect-Problem
 */
export const performDevOAuth = async (provider: 'google' = 'google') => {
  if (!__DEV__) {
    console.log('DevOAuth only available in development');
    return { success: false, error: 'Not in development mode' };
  }
  
  try {
    console.log('🔧 DEV OAUTH: Starting development OAuth workaround');
    
    // Verwende Web-ähnlichen Flow für Development
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        // TRICK: Verwende Web-Redirect aber fange es ab
        redirectTo: 'https://awqavfvsnqhubvbfaccv.supabase.co/auth/v1/callback',
        skipBrowserRedirect: false,
      },
    });
    
    if (error) {
      console.error('DevOAuth Supabase error:', error);
      return { success: false, error };
    }
    
    console.log('🌐 Opening OAuth URL in browser:', data.url);
    
    // Öffne in externem Browser (Safari/Chrome)
    const supported = await Linking.canOpenURL(data.url);
    
    if (supported) {
      await Linking.openURL(data.url);
      
      // Zeige Instruktionen
      Alert.alert(
        '🔧 Development OAuth',
        'Nach der Anmeldung:\n\n1. Kopiere die URL aus dem Browser\n2. Komm zur App zurück\n3. Die App erkennt die Session automatisch',
        [
          {
            text: 'Session prüfen',
            onPress: () => checkSessionAfterOAuth()
          },
          {
            text: 'OK',
            style: 'default'
          }
        ]
      );
      
      // Auto-Check nach 10 Sekunden
      setTimeout(() => {
        checkSessionAfterOAuth();
      }, 10000);
      
      return { success: true };
    } else {
      throw new Error('Cannot open OAuth URL');
    }
    
  } catch (error) {
    console.error('DevOAuth error:', error);
    return { success: false, error };
  }
};

/**
 * Prüft Session nach externem OAuth
 */
const checkSessionAfterOAuth = async () => {
  try {
    console.log('🔍 Checking session after external OAuth...');
    
    const { data: sessionData, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Session check error:', error);
      return;
    }
    
    if (sessionData?.session) {
      console.log('✅ Session found after external OAuth!');
      
      // Trigger app refresh
      const { useUserStore } = require('../store/useUserStore');
      await useUserStore.getState().loadUserData();
      
      Alert.alert('✅ Anmeldung erfolgreich!', 'Du bist jetzt eingeloggt.');
    } else {
      console.log('❌ No session found yet');
      Alert.alert(
        'Noch keine Session', 
        'Bitte stelle sicher, dass du dich in dem Browser-Tab angemeldet hast.'
      );
    }
  } catch (error) {
    console.error('Session check error:', error);
  }
};

/**
 * Manual Session Trigger für Development
 */
export const triggerManualSessionCheck = () => {
  if (__DEV__) {
    checkSessionAfterOAuth();
  }
};

export default { performDevOAuth, triggerManualSessionCheck };
