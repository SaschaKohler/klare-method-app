// src/components/debug/StorageDebugger.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Button, Card, Divider, List } from 'react-native-paper';
import { StorageKeys, unifiedStorage } from '../../storage/unifiedStorage';
import { diagnoseMMKVProblems, resetAppStorage, testStorageKeys } from '../../utils/debugUtils';
import { syncStorageKeys } from '../../store/storeUtils';
import { useUserStore } from '../../store/useUserStore';

/**
 * Eine Komponente zur Diagnose und Reparatur von Storage-Problemen
 * Hauptsächlich für Entwickler gedacht
 */
const StorageDebugger = () => {
  const [diagnosticResults, setDiagnosticResults] = useState<Record<string, string>>({});
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  
  // Aktuelle Storage-Werte anzeigen
  const storageData = Object.values(StorageKeys).reduce((acc, key) => {
    try {
      const value = unifiedStorage.getString(key) || '';
      acc[key] = value.length > 100 ? value.substring(0, 100) + '...' : value;
    } catch (error) {
      acc[key] = `ERROR: ${error.message}`;
    }
    return acc;
  }, {} as Record<string, string>);
  
  // Diagnosefunktion
  const runDiagnostics = () => {
    try {
      console.log('Running storage diagnostics...');
      
      // Teste Storage-Schlüssel
      const testResults = testStorageKeys();
      
      // Ergebnisse anzeigen
      setDiagnosticResults({
        ...diagnosticResults,
        testResults: JSON.stringify(testResults, null, 2),
      });
      
      // Diagnose MMKV-Probleme ausführen
      diagnoseMMKVProblems();
      
      // Synchronisiere Storage-Keys, um Konsistenz zu gewährleisten
      syncStorageKeys();
      
      Alert.alert(
        'Diagnose abgeschlossen', 
        `Tests abgeschlossen: ${testResults.success} erfolgreich, ${testResults.failed} fehlgeschlagen.`
      );
    } catch (error) {
      console.error('Error during diagnostics:', error);
      Alert.alert(
        'Diagnosefehler',
        `Fehler bei der Diagnose: ${error.message}`
      );
    }
  };
  
  // Storage zurücksetzen
  const handleReset = () => {
    Alert.alert(
      'Storage zurücksetzen',
      'Sind Sie sicher, dass Sie alle lokalen Daten zurücksetzen möchten? Diese Aktion kann nicht rückgängig gemacht werden.',
      [
        {
          text: 'Abbrechen',
          style: 'cancel',
        },
        {
          text: 'Zurücksetzen',
          style: 'destructive',
          onPress: () => {
            resetAppStorage();
            Alert.alert(
              'Storage zurückgesetzt',
              'Alle lokalen Daten wurden zurückgesetzt. Bitte starten Sie die App neu, um die Änderungen vollständig zu übernehmen.'
            );
          },
        },
      ]
    );
  };
  
  // Key reparieren
  const fixKey = (key: string) => {
    try {
      // Überprüfe das Format des Werts
      const value = unifiedStorage.getString(key);
      if (value) {
        try {
          // Versuche zu parsen und wieder zu speichern
          const parsed = JSON.parse(value);
          const cleanValue = JSON.stringify(parsed);
          unifiedStorage.set(key, cleanValue);
          
          Alert.alert(
            'Reparatur erfolgreich',
            `Der Schlüssel ${key} wurde erfolgreich repariert.`
          );
        } catch (parseError) {
          // Wenn Parsen fehlschlägt, lösche den Wert
          unifiedStorage.delete(key);
          Alert.alert(
            'Ungültiger Wert gelöscht',
            `Der Wert für ${key} war ungültig und wurde gelöscht.`
          );
        }
      } else {
        Alert.alert(
          'Kein Wert vorhanden',
          `Für den Schlüssel ${key} ist kein Wert vorhanden.`
        );
      }
    } catch (error) {
      Alert.alert(
        'Reparaturfehler',
        `Fehler bei der Reparatur von ${key}: ${error.message}`
      );
    }
  };
  
  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };
  
  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Title title="Storage-Diagnose" subtitle="Für Entwickler" />
        <Card.Content>
          <Text style={styles.description}>
            Dieses Tool hilft bei der Diagnose und Reparatur von Storage-Problemen.
            Nur für Entwickler gedacht und sollte mit Vorsicht verwendet werden.
          </Text>
          
          <Button 
            mode="contained" 
            onPress={runDiagnostics}
            style={styles.button}
          >
            Diagnose durchführen
          </Button>
          
          <Button 
            mode="outlined" 
            onPress={handleReset}
            style={[styles.button, styles.dangerButton]}
          >
            Storage zurücksetzen
          </Button>
        </Card.Content>
      </Card>
      
      <Card style={styles.card}>
        <Card.Title title="Storage-Schlüssel" subtitle="Aktuelle Werte" />
        <Card.Content>
          <List.Accordion
            title="Storage-Schlüssel anzeigen"
            expanded={expandedSection === 'keys'}
            onPress={() => toggleSection('keys')}
          >
            {Object.entries(storageData).map(([key, value]) => (
              <View key={key} style={styles.keyItem}>
                <Text style={styles.keyName}>{key}:</Text>
                <Text 
                  style={styles.keyValue}
                  numberOfLines={2}
                >
                  {value || '<leer>'}
                </Text>
                <TouchableOpacity
                  style={styles.fixButton}
                  onPress={() => fixKey(key)}
                >
                  <Text style={styles.fixButtonText}>Reparieren</Text>
                </TouchableOpacity>
              </View>
            ))}
          </List.Accordion>
        </Card.Content>
      </Card>
      
      {Object.keys(diagnosticResults).length > 0 && (
        <Card style={styles.card}>
          <Card.Title title="Diagnoseergebnisse" />
          <Card.Content>
            <ScrollView
              horizontal
              style={styles.resultsContainer}
            >
              <Text style={styles.resultsText}>
                {Object.entries(diagnosticResults).map(([key, value]) => (
                  `${key}:\n${value}\n\n`
                ))}
              </Text>
            </ScrollView>
          </Card.Content>
        </Card>
      )}
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          StorageType: {unifiedStorage.getStorageType()}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  description: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
  dangerButton: {
    borderColor: 'red',
  },
  keyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  keyName: {
    flex: 1,
    fontWeight: 'bold',
  },
  keyValue: {
    flex: 2,
    marginHorizontal: 8,
  },
  fixButton: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  fixButtonText: {
    fontSize: 12,
  },
  resultsContainer: {
    maxHeight: 200,
    backgroundColor: '#f5f5f5',
    padding: 8,
    borderRadius: 4,
  },
  resultsText: {
    fontFamily: 'monospace',
    fontSize: 12,
  },
  footer: {
    marginTop: 16,
    marginBottom: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
  },
});

export default StorageDebugger;
