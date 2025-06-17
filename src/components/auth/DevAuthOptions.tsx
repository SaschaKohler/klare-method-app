// DEVELOPMENT WORKAROUND: Magic Link statt OAuth
// src/components/auth/DevAuthOptions.tsx

import React, { useState } from 'react';
import { View, Alert, StyleSheet } from 'react-native';
import { Button, TextInput, Text } from 'react-native-paper';
import { sendMagicLink } from '../../lib/auth';

interface DevAuthOptionsProps {
  isDevelopment?: boolean;
}

export const DevAuthOptions: React.FC<DevAuthOptionsProps> = ({ 
  isDevelopment = __DEV__ 
}) => {
  const [email, setEmail] = useState('sascha.cloud.01@gmail.com');
  const [loading, setLoading] = useState(false);
  
  const handleMagicLink = async () => {
    if (!email.trim()) {
      Alert.alert('Fehler', 'Bitte E-Mail eingeben');
      return;
    }
    
    setLoading(true);
    try {
      await sendMagicLink(email);
      Alert.alert(
        'Magic Link gesendet!', 
        `Prüfe deine E-Mails (${email}) und klicke auf den Link.`
      );
    } catch (error) {
      console.error('Magic Link error:', error);
      Alert.alert('Fehler', 'Magic Link konnte nicht gesendet werden');
    } finally {
      setLoading(false);
    }
  };
  
  if (!isDevelopment) {
    return null;
  }
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔧 Development Auth</Text>
      <Text style={styles.subtitle}>
        OAuth hat Probleme mit Expo Dev Client. Verwende Magic Link:
      </Text>
      
      <TextInput
        label="E-Mail"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
      />
      
      <Button
        mode="contained"
        onPress={handleMagicLink}
        loading={loading}
        disabled={loading}
        style={styles.button}
      >
        Magic Link senden
      </Button>
      
      <Text style={styles.info}>
        💡 Der Magic Link öffnet sich direkt in der App (kein Browser-Problem)
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    margin: 20,
    borderRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginBottom: 12,
  },
  info: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
  },
});

export default DevAuthOptions;
