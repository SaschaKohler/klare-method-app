import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Button, ProgressBar, useTheme, Text, TextInput } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { lightKlareColors } from '../../constants/theme';
import { saveExerciseResult } from '../../lib/contentService';
import { useUserStore } from '../../store/useUserStore';

// Platzhalter für spezialisierte E-Modul-Komponenten
// import IntegrationPracticeComponent from './IntegrationPracticeComponent';

interface EModuleComponentProps {
  module: any;
  onComplete: () => void;
}

const EModuleComponent = ({ module, onComplete }: EModuleComponentProps) => {
  const theme = useTheme();
  const themeColor = lightKlareColors.e;

  const [currentStep, setCurrentStep] = useState(0);
  const [userResponses, setUserResponses] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const user = useUserStore((state) => state.user);

  // TODO: Spezialisierte Komponenten für E-Module implementieren
  const isIntegrationPracticeModule = module.module_id === 'e-integration-practice';

  const handleResponseChange = (stepId: string, response: string) => {
    setUserResponses({
      ...userResponses,
      [stepId]: response,
    });
  };

  const handleNextStep = async () => {
    if (currentStepData && user) {
      try {
        setLoading(true);
        const stepId = currentStepData.id;
        const response = userResponses[stepId] || '';

        if (response.trim().length > 0) {
          await saveExerciseResult(user.id, stepId, response);
        }

        if (module.exercise_steps && currentStep < module.exercise_steps.length - 1) {
          setCurrentStep(currentStep + 1);
        } else {
          onComplete();
        }
      } catch (error) {
        console.error('Fehler beim Speichern der Antwort:', error);
      } finally {
        setLoading(false);
      }
    } else {
      if (module.exercise_steps && currentStep < module.exercise_steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        onComplete();
      }
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const progress = module.exercise_steps ? (currentStep + 1) / module.exercise_steps.length : 0;
  const currentStepData = module.exercise_steps ? module.exercise_steps[currentStep] : null;

  const renderStep = () => {
    if (!currentStepData) return null;

    return (
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={[styles.title, { color: themeColor }]}>
            {currentStepData.title}
          </Text>
          <Text style={styles.paragraph}>
            {currentStepData.instructions}
          </Text>

          <View style={styles.textareaContainer}>
            <TextInput
              mode="outlined"
              multiline
              numberOfLines={8}
              style={styles.textInput}
              placeholder="Ihre Reflexionen zur Entfaltung..."
              value={userResponses[currentStepData.id] || ''}
              onChangeText={(text) => handleResponseChange(currentStepData.id, text)}
            />
          </View>
        </Card.Content>

        <Card.Actions style={styles.cardActions}>
          <Button mode="outlined" onPress={handlePrevStep} style={styles.outlinedButton} disabled={currentStep === 0}>
            Zurück
          </Button>
          <Button mode="contained" onPress={handleNextStep} style={[styles.button, { backgroundColor: themeColor }]} loading={loading}>
            {currentStep === (module.exercise_steps?.length || 1) - 1 ? 'Abschließen' : 'Weiter'}
          </Button>
        </Card.Actions>
      </Card>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text variant="titleMedium" style={[styles.moduleTitle, { color: themeColor }]}>
        {module.title || 'Entfaltung'}
      </Text>
      <Text style={styles.moduleDescription}>
        {module.content?.description || 'Übungen zur Integration und Entfaltung Ihrer Potenziale.'}
      </Text>

      <View style={styles.progressContainer}>
        <Text style={styles.stepText}>
          Schritt {currentStep + 1} von {module.exercise_steps?.length || 1}
        </Text>
        <ProgressBar progress={progress} color={themeColor} style={styles.progressBar} />
      </View>

      {renderStep()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  moduleTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  moduleDescription: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 24,
  },
  progressContainer: {
    marginBottom: 16,
  },
  stepText: {
    fontSize: 14,
    marginBottom: 4,
    color: '#666',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  card: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  cardActions: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  button: {
    paddingHorizontal: 16,
  },
  outlinedButton: {
    paddingHorizontal: 16,
  },
  textareaContainer: {
    marginTop: 8,
  },
  textInput: {
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
  },
});

export default EModuleComponent;
