// src/components/modules/ModuleExercise.tsx
import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text, Card, Button, TextInput, ProgressBar, useTheme } from "react-native-paper";
import Markdown from "react-native-markdown-display";
import { ExerciseStep } from "../../lib/contentService";
import Slider from "@react-native-community/slider";
import { useUserStore } from "../../store/useUserStore";
import { saveExerciseResult } from "../../lib/contentService";

interface ModuleExerciseProps {
  title: string;
  content: any;
  exerciseSteps?: ExerciseStep[];
  moduleId: string;
  onComplete: () => void;
}

const ModuleExercise: React.FC<ModuleExerciseProps> = ({ 
  title, 
  content, 
  exerciseSteps = [],
  moduleId,
  onComplete
}) => {
  const theme = useTheme();
  const user = useUserStore((state) => state.user);
  
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({});
  const [journalText, setJournalText] = useState("");
  const [sliderValue, setSliderValue] = useState(5);
  const [isCompleting, setIsCompleting] = useState(false);
  
  const currentStep = exerciseSteps[currentStepIndex];
  const isLastStep = currentStepIndex === exerciseSteps.length - 1;
  const progress = (currentStepIndex + 1) / exerciseSteps.length;
  
  const handleNextStep = async () => {
    if (!currentStep) return;
    
    // Aktuelle Antwort speichern
    let answer: any = null;
    
    if (currentStep.step_type === 'journal') {
      answer = journalText;
      
      // Speichern für den Benutzer
      if (user) {
        await saveExerciseResult(user.id, currentStep.id, answer);
      }
      
      // Für die nächste Frage vorbereiten
      setJournalText("");
    } 
    else if (currentStep.step_type === 'input' && currentStep.options?.input_type === 'slider') {
      answer = sliderValue;
      
      // Speichern für den Benutzer
      if (user) {
        await saveExerciseResult(user.id, currentStep.id, answer);
      }
      
      // Für die nächste Frage vorbereiten
      const nextDefaultValue = currentStep.options?.default_value || 5;
      setSliderValue(nextDefaultValue);
    }
    
    // Antwort in lokalen State speichern
    setUserAnswers(prev => ({
      ...prev,
      [currentStep.id]: answer
    }));
    
    if (isLastStep) {
      // Übung abschließen
      setIsCompleting(true);
      onComplete();
    } else {
      // Zur nächsten Frage gehen
      setCurrentStepIndex(prevIndex => prevIndex + 1);
    }
  };
  
  const renderStepContent = () => {
    if (!currentStep) return null;
    
    return (
      <View>
        <Text style={styles.stepTitle}>{currentStep.title}</Text>
        
        <Markdown style={{
          body: { color: theme.colors.onBackground, fontSize: 16, lineHeight: 24 },
          heading1: { fontSize: 24, fontWeight: 'bold', color: theme.colors.primary },
          heading2: { fontSize: 20, fontWeight: 'bold', color: theme.colors.primary },
          heading3: { fontSize: 18, fontWeight: 'bold', color: theme.colors.onBackground },
          paragraph: { marginBottom: 16 },
          bullet_list: { marginVertical: 8 },
          bullet_list_item: { marginLeft: 8, flexDirection: 'row' },
          bullet_list_icon: { marginRight: 8, fontWeight: 'bold' },
        }}>
          {currentStep.instructions}
        </Markdown>
        
        {renderInputComponent()}
      </View>
    );
  };
  
  const renderInputComponent = () => {
    if (!currentStep) return null;
    
    switch (currentStep.step_type) {
      case 'reflection':
        // Reflexionsfragen benötigen keine Benutzereingabe
        return null;
        
      case 'journal':
        return (
          <View style={styles.inputContainer}>
            <TextInput
              mode="outlined"
              multiline
              numberOfLines={6}
              value={journalText}
              onChangeText={setJournalText}
              placeholder={currentStep.options?.placeholder || "Ihre Antwort hier..."}
              style={styles.journalInput}
            />
            {currentStep.options?.min_length && (
              <Text style={styles.helperText}>
                Minimale Länge: {currentStep.options.min_length} Zeichen 
                ({Math.max(0, journalText.length - currentStep.options.min_length)} verbleibend)
              </Text>
            )}
          </View>
        );
        
      case 'input':
        if (currentStep.options?.input_type === 'slider') {
          return (
            <View style={styles.sliderContainer}>
              <View style={styles.sliderValueContainer}>
                <Text style={styles.sliderValueText}>{sliderValue}</Text>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={currentStep.options.min_value || 1}
                maximumValue={currentStep.options.max_value || 10}
                step={currentStep.options.step || 1}
                value={sliderValue}
                onValueChange={setSliderValue}
                minimumTrackTintColor={theme.colors.primary}
                maximumTrackTintColor={theme.colors.surfaceVariant}
                thumbTintColor={theme.colors.primary}
              />
              <View style={styles.sliderLabels}>
                <Text>Min</Text>
                <Text>Max</Text>
              </View>
            </View>
          );
        }
        return null;
        
      default:
        return null;
    }
  };
  
  const isNextButtonDisabled = () => {
    if (!currentStep) return true;
    
    switch (currentStep.step_type) {
      case 'journal':
        return journalText.length < (currentStep.options?.min_length || 0);
      case 'input':
        // Für Slider immer aktiviert
        return false;
      case 'reflection':
        // Keine Eingabe erforderlich
        return false;
      default:
        return false;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{title}</Text>
        
        {content.intro_text && (
          <Text style={styles.introText}>{content.intro_text}</Text>
        )}
        
        <Card style={styles.progressCard}>
          <Card.Content>
            <Text style={styles.progressText}>
              Schritt {currentStepIndex + 1} von {exerciseSteps.length}
            </Text>
            <ProgressBar
              progress={progress}
              color={theme.colors.primary}
              style={styles.progressBar}
            />
          </Card.Content>
        </Card>
        
        <Card style={styles.exerciseCard}>
          <Card.Content>
            {renderStepContent()}
          </Card.Content>
          <Card.Actions style={styles.cardActions}>
            <Button
              mode="contained"
              onPress={handleNextStep}
              disabled={isNextButtonDisabled() || isCompleting}
              loading={isCompleting}
            >
              {isLastStep ? "Abschließen" : "Weiter"}
            </Button>
          </Card.Actions>
        </Card>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  introText: {
    fontSize: 16,
    marginBottom: 24,
    lineHeight: 24,
  },
  progressCard: {
    marginBottom: 16,
  },
  progressText: {
    marginBottom: 8,
    textAlign: "center",
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  exerciseCard: {
    marginBottom: 24,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  inputContainer: {
    marginTop: 16,
  },
  journalInput: {
    minHeight: 120,
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
    alignSelf: "flex-end",
  },
  sliderContainer: {
    marginTop: 24,
    marginBottom: 16,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: -8,
  },
  sliderValueContainer: {
    alignItems: "center",
    marginBottom: 8,
  },
  sliderValueText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  cardActions: {
    justifyContent: "flex-end",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
});

export default ModuleExercise;
