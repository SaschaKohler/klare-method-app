// src/screens/DebugScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Button, Card, Divider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import StorageDebugger from '../components/debug/StorageDebugger';
import { useTheme } from 'react-native-paper';

/**
 * Ein Entwickler-Bildschirm für Debugging und Testen
 * Nur im __DEV__-Modus verfügbar
 */
const DebugScreen = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  
  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Card style={styles.headerCard}>
        <Card.Title 
          title="KLARE Methode Debug" 
          subtitle="Entwickler-Tools"
        />
        <Card.Content>
          <Text style={styles.warningText}>
            Diese Funktionen sind nur für Entwickler gedacht und sollten mit Vorsicht verwendet werden.
          </Text>
        </Card.Content>
      </Card>
      
      <Divider style={styles.divider} />
      
      {/* Storage-Debugger integrieren */}
      <StorageDebugger />
      
      <Divider style={styles.divider} />
      
      <Card style={styles.card}>
        <Card.Title title="Navigation-Test" />
        <Card.Content>
          <Button
            mode="contained"
            onPress={() => navigation.goBack()}
            style={styles.button}
          >
            Zurück
          </Button>
        </Card.Content>
      </Card>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          App-Version: 1.0.0 • Build: DEV • Umgebung: {__DEV__ ? 'Development' : 'Production'}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerCard: {
    margin: 16,
    marginBottom: 8,
  },
  warningText: {
    color: '#f44336',
    fontWeight: 'bold',
    marginTop: 8,
  },
  divider: {
    marginVertical: 8,
  },
  card: {
    margin: 16,
    marginTop: 8,
  },
  button: {
    marginTop: 8,
  },
  footer: {
    margin: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
  },
});

export default DebugScreen;
