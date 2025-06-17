import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { performSimpleOAuth, checkOAuthSession } from '../lib/simpleOAuth';
import { supabase } from '../lib/supabase';

/**
 * Debug-Komponente für OAuth-Testing
 * Verwende diese Komponente temporär um OAuth zu testen
 */
export default function OAuthDebugPanel() {
  const [loading, setLoading] = useState(false);
  const [sessionInfo, setSessionInfo] = useState<string>('Noch nicht geprüft');

  const handleTestOAuth = async () => {
    setLoading(true);
    try {
      console.log('🧪 Testing simplified OAuth...');
      const result = await performSimpleOAuth('google');
      
      if (result.success) {
        Alert.alert('✅ OAuth Erfolgreich!', 'Browser sollte sich automatisch geschlossen haben');
        await updateSessionInfo();
      } else {
        Alert.alert('❌ OAuth Fehlgeschlagen', result.error?.message || 'Unbekannter Fehler');
      }
    } catch (error) {
      console.error('OAuth Test Error:', error);
      Alert.alert('❌ Test Fehler', error instanceof Error ? error.message : 'Unbekannter Fehler');
    } finally {
      setLoading(false);
    }
  };

  const updateSessionInfo = async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        setSessionInfo(`Fehler: ${error.message}`);
        return;
      }
      
      if (data?.session) {
        setSessionInfo(`✅ Aktive Session: ${data.session.user.email || 'Keine E-Mail'}`);
      } else {
        setSessionInfo('❌ Keine aktive Session');
      }
    } catch (error) {
      setSessionInfo(`Fehler beim Laden: ${error}`);
    }
  };

  const handleCheckSession = async () => {
    await updateSessionInfo();
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setSessionInfo('🚪 Abgemeldet');
      Alert.alert('🚪 Abmeldung', 'Du wurdest erfolgreich abgemeldet');
    } catch (error) {
      Alert.alert('Fehler', 'Fehler beim Abmelden');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧪 OAuth Debug Panel</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Session Status:</Text>
        <Text style={styles.sessionInfo}>{sessionInfo}</Text>
      </View>

      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={handleTestOAuth}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? '🔄 OAuth läuft...' : '🚀 Test Google OAuth'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleCheckSession}>
        <Text style={styles.buttonText}>🔍 Session prüfen</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleSignOut}>
        <Text style={styles.buttonText}>🚪 Abmelden</Text>
      </TouchableOpacity>

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>💡 Testing Tipps:</Text>
        <Text style={styles.infoText}>
          • Browser sollte sich automatisch schließen{'\n'}
          • Session sollte sofort erkannt werden{'\n'}
          • Bei Problemen: Session manuell prüfen{'\n'}
          • Console für Details beachten
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    margin: 10,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#007AFF',
  },
  section: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  sessionInfo: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoSection: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#e8f4fd',
    borderRadius: 5,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#007AFF',
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
});
