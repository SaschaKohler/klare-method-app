import * as Linking from "expo-linking";
import { Platform } from "react-native";
import { supabase } from "./supabase";
import { performOAuth as supabaseOAuth, getOAuthRedirectUrl } from "./supabase";
import * as WebBrowser from 'expo-web-browser';

// Wichtig: WebBrowser für iOS konfigurieren
WebBrowser.maybeCompleteAuthSession();

// Für Web wichtig - nur wenn erforderlich
if (Platform.OS === "web") {
  // Web-spezifische Initialisierung hier
}

// Einheitliche Redirect-URI, die für die Plattform geeignet ist
export const redirectTo = Platform.OS === "web" 
  ? `${process.env.SUPABASE_URL}/auth/v1/callback`
  : "klare-app://auth/callback";

/**
 * OAuth-Anmeldung mit verschiedenen Providern
 * Verwenden der vereinheitlichten Implementierung aus supabase.ts
 */
export const performOAuth = supabaseOAuth;

/**
 * Führt den Google Sign-In-Prozess durch.
 * Basiert auf der vereinfachten OAuth-Implementierung mit automatischem Browser-Schließen.
 */
export const performGoogleSignIn = async () => {
  try {
    console.log(`🚀 Starting simplified google OAuth`);
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
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

    const result = await WebBrowser.openAuthSessionAsync(
      data.url,
      redirectTo,
      {
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
    console.error('❌ Google Sign-In error:', error);
    return { success: false, error };
  }
};

/**
 * E-Mail-Anmeldung mit One-Time-Password (Magic Link)
 */
export const sendMagicLink = async (email: string) => {
  try {
    console.log("Sending magic link to:", email);
    
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
      },
    });
    
    if (error) {
      console.error("Error sending magic link:", error);
      throw error;
    }
    
    console.log("Magic link email sent successfully");
    return true;
  } catch (error) {
    console.error("Error in sendMagicLink:", error);
    throw error;
  }
};

/**
 * E-Mail-Bestätigungslink erneut senden
 */
export const resendConfirmationEmail = async (email: string) => {
  try {
    console.log("Resending confirmation email to:", email);
    console.log("Using redirect URL:", redirectTo);
    
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: redirectTo,
      },
    });
    
    if (error) {
      console.error("Error resending confirmation email:", error);
      throw error;
    }
    
    console.log("Confirmation email resent successfully");
    return true;
  } catch (error) {
    console.error("Error in resendConfirmationEmail:", error);
    throw error;
  }
};
