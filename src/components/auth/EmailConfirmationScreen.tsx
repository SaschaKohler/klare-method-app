import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Button, Card, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { darkKlareColors, lightKlareColors } from '../../constants/theme';
import KlareLogo from '../KlareLogo';
import { MotiView, MotiText } from 'moti';
// Importiere die createSessionFromUrl Funktion aus auth.ts
import { createSessionFromUrl } from '../../lib/auth';

interface EmailConfirmationScreenProps {
  email: string;
  onResendConfirmation: () => Promise<void>;
  onSignOut: () => Promise<void>;
}

const EmailConfirmationScreen: React.FC<EmailConfirmationScreenProps> = ({
  email,
  onResendConfirmation,
  onSignOut
}) => {
  const theme = useTheme();
  const isDarkMode = theme.dark;
  const themeColors = isDarkMode ? darkKlareColors : lightKlareColors;
  const [loading, setLoading] = useState(false);
  const [checkingVerification, setCheckingVerification] = useState(false);
  const [autoCheckCount, setAutoCheckCount] = useState(0);
  
  // Automatische Überprüfung des Verifizierungsstatus
  useEffect(() => {
    // Beim Laden prüfen
    checkEmailVerification();
    
    // Automatische Überprüfung alle 10 Sekunden für bis zu 5 Minuten
    const interval = setInterval(() => {
      setAutoCheckCount(prev => {
        const newCount = prev + 1;
        // Nach 30 Versuchen (= 5 Minuten) stoppen
        if (newCount > 30) {
          clearInterval(interval);
          return 30;
        }
        
        // Neue Überprüfung
        checkEmailVerification();
        return newCount;
      });
    }, 10000); // Alle 10 Sekunden

    return () => clearInterval(interval);
  }, []);
  
  // Überprüft, ob die E-Mail-Adresse bestätigt wurde
  const checkEmailVerification = async () => {
    try {
      setCheckingVerification(true);
      console.log("Überprüfe E-Mail-Verifizierungsstatus...");
      
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (sessionData?.session) {
        // Prüfen, ob E-Mail bestätigt wurde
        const isVerified = sessionData.session.user.email_confirmed_at !== null;
        
        console.log("Email verification status:", isVerified ? "Verified" : "Not verified", 
                  "Timestamp:", sessionData.session.user.email_confirmed_at);
        
        if (isVerified) {
          console.log("E-Mail wurde bestätigt! Konto wird aktiviert...");
          // Benutzerdaten im Store aktualisieren
          const { useUserStore } = require("../../store/useUserStore");
          await useUserStore.getState().loadUserData();
          
          // Force-Update-State
          Alert.alert(
            "E-Mail bestätigt!",
            "Deine E-Mail-Adresse wurde erfolgreich bestätigt. Du wirst jetzt angemeldet.",
            [
              {
                text: "OK",
                onPress: () => {
                  // Forciere ein Update des Navigators durch einen Zustands-Reset
                  useUserStore.setState({
                    isLoading: false,
                    user: {
                      id: sessionData.session.user.id,
                      name: sessionData.session.user.user_metadata?.name || 'Benutzer',
                      email: sessionData.session.user.email || '',
                      progress: 0,
                      streak: 0,
                      lastActive: new Date().toISOString(),
                      joinDate: new Date().toISOString(),
                      completedModules: []
                    }
                  });
                }
              }
            ]
          );
        } else {
          // Wenn nicht verifiziert, Hinweis anzeigen
          Alert.alert(
            "E-Mail noch nicht bestätigt",
            "Deine E-Mail-Adresse wurde noch nicht bestätigt. Bitte klicke auf den Link in der Bestätigungs-E-Mail und versuche es erneut."
          );
        }
      }
    } catch (error) {
      console.error("Fehler bei der Überprüfung des Verifizierungsstatus:", error);
      Alert.alert(
        "Fehler",
        "Bei der Überprüfung des Verifizierungsstatus ist ein Fehler aufgetreten. Bitte versuche es später erneut."
      );
    } finally {
      setCheckingVerification(false);
    }
  };

  const handleResendConfirmation = async () => {
    try {
      setLoading(true);
      await onResendConfirmation();
      Alert.alert(
        'E-Mail gesendet',
        'Wir haben dir eine neue Bestätigungs-E-Mail gesendet. Bitte überprüfe dein E-Mail-Postfach und klicke auf den Bestätigungslink.\n\nHinweis: Nach der Bestätigung wirst du automatisch zur App weitergeleitet. Falls nicht, melde dich bitte erneut an.',
      );
    } catch (error) {
      console.error('Fehler beim erneuten Senden der Bestätigungs-E-Mail:', error);
      Alert.alert(
        'Fehler',
        'Beim erneuten Senden der Bestätigungs-E-Mail ist ein Fehler aufgetreten. Bitte versuche es später noch einmal.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <MotiView 
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 600 }}
        style={styles.content}
      >
        <View style={styles.logoContainer}>
          <KlareLogo
            size={60}
            spacing={5}
            animated={true}
            pulsate={true}
          />
        </View>
        
        <MotiText
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 600, delay: 300 }}
          style={[styles.title, { color: themeColors.text }]}
        >
          Bitte bestätige deine E-Mail-Adresse
        </MotiText>
        
        <Card style={[styles.card, { backgroundColor: themeColors.cardBackground }]}>
          <Card.Content style={styles.cardContent}>
            <Ionicons name="mail" size={60} color={themeColors.k} style={styles.icon} />
            
            <Text style={[styles.description, { color: themeColors.text }]}>
              Wir haben eine Bestätigungs-E-Mail an{' '}
              <Text style={[styles.emailText, { color: themeColors.k }]}>
                {email}
              </Text>{' '}
              gesendet.
            </Text>
            
            <Text style={[styles.instructionText, { color: themeColors.textSecondary }]}>
              Bitte öffne diese E-Mail und klicke auf den Bestätigungslink, um deine Registrierung abzuschließen. Du wirst automatisch zur App weitergeleitet, sobald deine E-Mail-Adresse bestätigt wurde.
            </Text>
            
            <View style={styles.buttonContainer}>
              <Button
                mode="contained"
                onPress={handleResendConfirmation}
                style={[styles.button, { backgroundColor: themeColors.k }]}
                loading={loading}
                disabled={loading}
              >
                Bestätigungslink erneut senden
              </Button>
              
              <Button
                mode="outlined"
                onPress={checkEmailVerification}
                style={[styles.button, { borderColor: themeColors.border }]}
                textColor={themeColors.text}
                loading={checkingVerification}
                disabled={checkingVerification}
              >
                Verifizierungsstatus prüfen
              </Button>
              
              <Button
                mode="outlined"
                onPress={onSignOut}
                style={[styles.button, { borderColor: themeColors.border }]}
                textColor={themeColors.text}
              >
                Abmelden
              </Button>
            </View>
          </Card.Content>
        </Card>
        
        <Text style={[styles.noteText, { color: themeColors.textSecondary }]}>
          Falls du keine E-Mail erhalten hast, überprüfe bitte deinen Spam-Ordner oder klicke auf "Bestätigungslink erneut senden".
          {autoCheckCount > 0 && (
            <Text style={{ fontStyle: 'italic' }}>
              {'\n\n'}Die App überprüft automatisch deinen Verifizierungsstatus ({autoCheckCount}/30 Checks).
            </Text>
          )}
        </Text>
      </MotiView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  card: {
    width: '100%',
    marginBottom: 20,
    borderRadius: 12,
    elevation: 4,
  },
  cardContent: {
    alignItems: 'center',
    padding: 16,
  },
  icon: {
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 24,
  },
  emailText: {
    fontWeight: 'bold',
  },
  instructionText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  button: {
    width: '100%',
    borderRadius: 8,
    marginBottom: 12,
  },
  noteText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 20,
    marginHorizontal: 20,
  },
});

export default EmailConfirmationScreen;