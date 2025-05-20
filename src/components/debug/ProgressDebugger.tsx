// src/components/debug/ProgressDebugger.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Switch,
  Alert 
} from 'react-native';
import { Card, Divider, List, Checkbox, Button, useTheme } from 'react-native-paper';
import { useProgressionStore } from '../../store/useProgressionStore';
import { progressionStages } from '../../data/progression';

// Informationen über Module für jeden KLARE-Schritt
const MODULE_IDS_BY_STEP = {
  K: [
    "k-intro",
    "k-theory",
    "k-lifewheel",
    "k-reality-check",
    "k-incongruence-finder",
    "k-reflection",
    "k-quiz",
  ],
  L: [
    "l-intro",
    "l-theory",
    "l-resource-finder",
    "l-vitality-moments",
    "l-energy-blockers",
    "l-embodiment",
    "l-quiz",
  ],
  A: [
    "a-intro",
    "a-theory",
    "a-values-hierarchy",
    "a-life-vision",
    "a-decision-alignment",
    "a-integration-check",
    "a-quiz",
  ],
  R: [
    "r-intro",
    "r-theory",
    "r-habit-builder",
    "r-micro-steps",
    "r-environment-design",
    "r-accountability",
    "r-quiz",
  ],
  E: [
    "e-intro",
    "e-theory",
    "e-integration-practice",
    "e-effortless-manifestation",
    "e-congruence-check",
    "e-sharing-wisdom",
    "e-quiz",
  ],
};

/**
 * Eine Komponente zum Debuggen des Content Drippings und Benutzerfortschritts
 */
const ProgressDebugger = () => {
  const theme = useTheme();
  const [daysOffset, setDaysOffset] = useState('0');
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [showAvailableOnly, setShowAvailableOnly] = useState(true);
  
  // Store-Hooks
  const {
    joinDate,
    completedModules,
    getDaysInProgram,
    getAvailableModules,
    isModuleAvailable,
    getDaysUntilUnlock,
    resetJoinDate,
    completeModule,
  } = useProgressionStore();

  // Simulieren eines Join-Dates
  const simulateJoinDate = () => {
    const offset = parseInt(daysOffset, 10) || 0;
    const newDate = new Date();
    newDate.setDate(newDate.getDate() - offset);
    
    // Setze das Join-Date im Store
    useProgressionStore.setState({ joinDate: newDate.toISOString() });
    
    Alert.alert('Join Date Simuliert', 
      `Benutzer tritt dem Programm vor ${offset} Tagen bei.\nNeues Join Date: ${newDate.toLocaleDateString()}`
    );
  };

  // Toggle für Sections
  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  // Modul als abgeschlossen markieren oder zurücksetzen
  const toggleModuleCompletion = async (moduleId: string) => {
    if (completedModules.includes(moduleId)) {
      // Modul aus der Liste entfernen
      useProgressionStore.setState({
        completedModules: completedModules.filter(id => id !== moduleId)
      });
      Alert.alert('Modul zurückgesetzt', `Modul ${moduleId} als nicht abgeschlossen markiert`);
    } else {
      // Modul als abgeschlossen markieren
      await completeModule(moduleId);
      Alert.alert('Modul abgeschlossen', `Modul ${moduleId} als abgeschlossen markiert`);
    }
  };

  // Verfügbare Module anzeigen
  const renderAvailableModules = () => {
    const availableModules = getAvailableModules();
    
    return (
      <View style={styles.moduleList}>
        <Text style={styles.subtitle}>Aktuell verfügbare Module: {availableModules.length}</Text>
        
        {availableModules.length === 0 ? (
          <Text style={styles.noData}>Keine Module verfügbar</Text>
        ) : (
          availableModules.map(moduleId => (
            <View key={moduleId} style={styles.moduleRow}>
              <Checkbox
                status={completedModules.includes(moduleId) ? 'checked' : 'unchecked'}
                onPress={() => toggleModuleCompletion(moduleId)}
              />
              <Text 
                style={[
                  styles.moduleText,
                  completedModules.includes(moduleId) && styles.completedText
                ]}
              >
                {moduleId}
              </Text>
            </View>
          ))
        )}
      </View>
    );
  };

  // Alle Progressionsstufen anzeigen
  const renderStages = () => {
    // Filtern der angezeigten Stufen basierend auf der Einstellung
    const filteredStages = showAvailableOnly 
      ? progressionStages.filter(stage => stage.requiredDays <= getDaysInProgram())
      : progressionStages;
    
    return (
      <View>
        {filteredStages.map(stage => {
          const daysUntilUnlock = stage.requiredDays - getDaysInProgram();
          const isUnlocked = daysUntilUnlock <= 0;
          
          return (
            <View 
              key={stage.id}
              style={[
                styles.stageItem,
                isUnlocked ? styles.unlockedStage : styles.lockedStage
              ]}
            >
              <View style={styles.stageHeader}>
                <Text style={styles.stageName}>{stage.name}</Text>
                <Text style={styles.stageDays}>
                  {isUnlocked ? 'Freigeschaltet' : `Wird freigeschaltet in ${daysUntilUnlock} Tagen`}
                </Text>
              </View>
              
              <Divider style={styles.divider} />
              
              <Text style={styles.listTitle}>Freigeschaltete Module:</Text>
              <View style={styles.moduleGrid}>
                {stage.unlocksModules.map(moduleId => (
                  <TouchableOpacity 
                    key={moduleId}
                    style={[
                      styles.moduleChip,
                      isModuleAvailable(moduleId) ? styles.availableChip : styles.unavailableChip,
                      completedModules.includes(moduleId) && styles.completedChip
                    ]}
                    onPress={() => toggleModuleCompletion(moduleId)}
                  >
                    <Text 
                      style={[
                        styles.moduleChipText,
                        completedModules.includes(moduleId) && styles.completedChipText
                      ]}
                    >
                      {moduleId}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              {stage.requiredModules.length > 0 && (
                <>
                  <Text style={styles.listTitle}>Voraussetzungen:</Text>
                  <View style={styles.moduleGrid}>
                    {stage.requiredModules.map(moduleId => (
                      <TouchableOpacity 
                        key={moduleId}
                        style={[
                          styles.moduleChip,
                          completedModules.includes(moduleId) ? styles.completedChip : styles.requiredChip
                        ]}
                        onPress={() => toggleModuleCompletion(moduleId)}
                      >
                        <Text 
                          style={[
                            styles.moduleChipText,
                            completedModules.includes(moduleId) && styles.completedChipText
                          ]}
                        >
                          {moduleId}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}
            </View>
          );
        })}
      </View>
    );
  };

  // Alle Module pro KLARE-Schritt anzeigen
  const renderModulesByStep = () => {
    return (
      <View>
        {Object.entries(MODULE_IDS_BY_STEP).map(([step, modules]) => (
          <View key={step} style={styles.stepSection}>
            <Text style={styles.stepTitle}>Schritt {step}</Text>
            <View style={styles.moduleGrid}>
              {modules.map(moduleId => (
                <TouchableOpacity 
                  key={moduleId}
                  style={[
                    styles.moduleChip,
                    isModuleAvailable(moduleId) ? styles.availableChip : styles.unavailableChip,
                    completedModules.includes(moduleId) && styles.completedChip
                  ]}
                  onPress={() => toggleModuleCompletion(moduleId)}
                >
                  <Text style={styles.moduleChipText}>
                    {moduleId}{' '}
                    <Text style={styles.smallText}>
                      {isModuleAvailable(moduleId) 
                        ? (completedModules.includes(moduleId) ? '✓' : '') 
                        : `(${getDaysUntilUnlock(moduleId)}d)`}
                    </Text>
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Title title="Content Dripping Debugger" subtitle="KLARE Methode Fortschritt" />
        <Card.Content>
          <View style={styles.infoRow}>
            <Text style={styles.infoText}>
              Join Date: {joinDate ? new Date(joinDate).toLocaleDateString() : 'Nicht gesetzt'}
            </Text>
            <Text style={styles.infoText}>
              Tage im Programm: {getDaysInProgram()}
            </Text>
          </View>
          
          <View style={styles.simulatorContainer}>
            <TextInput
              style={styles.input}
              value={daysOffset}
              onChangeText={setDaysOffset}
              keyboardType="number-pad"
              placeholder="Tage (z.B. 5, 18)"
            />
            
            <TouchableOpacity 
              style={styles.simulateButton}
              onPress={simulateJoinDate}
            >
              <Text style={styles.buttonText}>Beitritt simulieren</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.resetButton}
              onPress={() => {
                resetJoinDate();
                Alert.alert('Zurückgesetzt', 'Join Date auf heute zurückgesetzt');
              }}
            >
              <Text style={styles.buttonText}>Zurücksetzen</Text>
            </TouchableOpacity>
          </View>
        </Card.Content>
      </Card>
      
      <View style={styles.accordionContainer}>
        <List.Accordion
          title="Aktuelle verfügbare Module"
          expanded={expandedSection === 'available'}
          onPress={() => toggleSection('available')}
          style={styles.accordion}
        >
          {renderAvailableModules()}
        </List.Accordion>
        
        <List.Accordion
          title="Progression-Stufen"
          expanded={expandedSection === 'stages'}
          onPress={() => toggleSection('stages')}
          style={styles.accordion}
        >
          <View style={styles.filterContainer}>
            <Text>Nur verfügbare Stufen anzeigen</Text>
            <Switch
              value={showAvailableOnly}
              onValueChange={setShowAvailableOnly}
            />
          </View>
          {renderStages()}
        </List.Accordion>
        
        <List.Accordion
          title="Module nach KLARE-Schritten"
          expanded={expandedSection === 'steps'}
          onPress={() => toggleSection('steps')}
          style={styles.accordion}
        >
          {renderModulesByStep()}
        </List.Accordion>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 0,
    paddingVertical: 8,
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  infoText: {
    fontSize: 12,
  },
  simulatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
  },
  simulateButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
  },
  resetButton: {
    backgroundColor: '#E74C3C',
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  accordionContainer: {
    marginBottom: 100, // Extra space at bottom for scrolling
  },
  accordion: {
    backgroundColor: 'white',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  moduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  moduleText: {
    marginLeft: 8,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  noData: {
    fontStyle: 'italic',
    color: '#888',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  stageItem: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  unlockedStage: {
    borderColor: '#4CAF50',
    backgroundColor: '#F1F8E9',
  },
  lockedStage: {
    borderColor: '#9E9E9E',
    backgroundColor: '#F5F5F5',
  },
  stageHeader: {
    marginBottom: 8,
  },
  stageName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  stageDays: {
    fontSize: 12,
    color: '#666',
  },
  divider: {
    marginVertical: 8,
  },
  listTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  moduleList: {
    padding: 16,
  },
  moduleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  moduleChip: {
    margin: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  moduleChipText: {
    fontSize: 12,
  },
  smallText: {
    fontSize: 10,
  },
  availableChip: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
  },
  unavailableChip: {
    backgroundColor: '#EEEEEE',
    borderColor: '#9E9E9E',
  },
  completedChip: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  requiredChip: {
    backgroundColor: '#FFF3E0',
    borderColor: '#FF9800',
  },
  completedChipText: {
    color: '#4CAF50',
  },
  stepSection: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
});

export default ProgressDebugger;