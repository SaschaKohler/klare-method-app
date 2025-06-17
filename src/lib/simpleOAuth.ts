// Vereinfachte OAuth-Implementierung ohne Magic Links
// src/lib/simpleOAuth.ts

import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { Platform } from 'react-native';
import { supabase } from './supabase';

// Wichtig: WebBrowser für iOS konfigurieren
WebBrowser.maybeCompleteAuthSession();

/**
 * Vereinfachte OAuth-Implementierung mit automatischem Browser-Schließen
 */
export const performSimpleOAuth = async (provider: 'google' = 'google') => {
  try {
    console.log(`🚀 Starting simplified ${provider} OAuth`);
    
    // OAuth URL von Supabase holen
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: 'klare-app://auth/callback',
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      console.error('Supabase OAuth error:', error);
      throw error;
    }

    console.log('📱 Opening OAuth URL:', data.url);

    // Verwende WebBrowser mit automatischem Schließen
    const result = await WebBrowser.openAuthSessionAsync(
      data.url,
      'klare-app://auth/callback',
      {
        // Browser schließt sich automatisch nach Redirect
        dismissButtonStyle: 'close',
        readerMode: false,
        enableBarCollapsing: false,
        showInRecents: false,
      }
    );

    console.log('🔍 WebBrowser result:', result);

    if (result.type === 'success') {
      const url = result.url;
      console.log('✅ OAuth successful, processing callback:', url);
      
      // Code aus URL extrahieren
      const urlObj = new URL(url);
      const code = urlObj.searchParams.get('code');
      
      if (code) {
        console.log('🔑 Exchanging code for session...');
        
        const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
        
        if (sessionError) {
          console.error('Session exchange error:', sessionError);
          throw sessionError;
        }
        
        if (sessionData?.session) {
          console.log('🎉 Session established successfully!');
          
          // User Store updaten
          const { useUserStore } = require('../store/useUserStore');
          await useUserStore.getState().createUserProfileIfNeeded();
          await useUserStore.getState().loadUserData();
          
          return { success: true, session: sessionData.session };
        }
      }
      
      throw new Error('No authorization code received');
    } else if (result.type === 'cancel') {
      console.log('❌ OAuth cancelled by user');
      return { success: false, error: new Error('OAuth cancelled by user') };
    } else {
      console.log('❌ OAuth failed:', result);
      throw new Error('OAuth process failed');
    }
    
  } catch (error) {
    console.error('❌ Simple OAuth error:', error);
    return { success: false, error };
  }
};

/**
 * Session-Check nach OAuth (Fallback)
 */
export const checkOAuthSession = async () => {
  try {
    const { data: sessionData, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Session check error:', error);
      return false;
    }
    
    if (sessionData?.session) {
      console.log('✅ Active session found');
      return true;
    }
    
    console.log('❌ No active session');
    return false;
  } catch (error) {
    console.error('Session check error:', error);
    return false;
  }
};
