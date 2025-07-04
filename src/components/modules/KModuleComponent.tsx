// src/components/modules/KModuleComponent.tsx
// KLARE Schritt K (Klarheit) - Spezialisierte Komponente
// Fokus: Meta-Modell der Sprache als Haupttool für IST-Analyse

import React, { useState, useEffect, useMemo } from 'react';
import { View, ScrollView, StyleSheet, Alert, TextInput } from 'react-native';
import {
  Text,
  Button,
  Card,
  Chip,
  ProgressBar,
  useTheme,
  Surface,
  Divider,
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { ModuleContent } from '../../lib/contentService';
import { darkKlareColors, lightKlareColors } from '../../constants/theme';

// Mock AI Service für K-Module (später Claude API)
import { KModuleAIService } from '../../services/KModuleAIService';
import { supabase } from '../../lib/supabase';

interface KModuleComponentProps {
  module: ModuleContent;
  onComplete: () => void;
}

interface MetaModelProgress {
  level: number;
  totalLevels: number;
  completedExercises: string[];
  currentChallenge: string | null;
}

interface AICoachResponse {
  type: 'welcome' | 'analysis' | 'guidance' | 'feedback';
  message: string;
  exercises?: any[];
  nextSteps?: string[];
  encouragement?: string;
}

// Typen für die KI-Analyse
interface AnalysisResult {
  pattern_type: string;
  identified_word: string;
  generated_question: string;
}

interface ApiResponse {
  analysis: AnalysisResult[];
}

const KModuleComponent: React.FC<KModuleComponentProps> = ({
  module,
  onComplete,
}) => {
  const { t, i18n } = useTranslation(['modules', 'common']);
  const theme = useTheme();
  const isDarkMode = theme.dark;
  const klareColors = isDarkMode ? darkKlareColors : lightKlareColors;

  // State Management
  const [currentStep, setCurrentStep] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[] | null>(null); // Neuer State
  const [metaModelProgress, setMetaModelProgress] = useState<MetaModelProgress>({
    level: 1,
    totalLevels: 5,
    completedExercises: [],
    currentChallenge: null,
  });
  const [aiResponse, setAiResponse] = useState<AICoachResponse | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // AI Mock Service
  const aiService = useMemo(() => new KModuleAIService(i18n.language), [i18n.language]);

  // Component Styles
  const styles = useMemo(() => createStyles(theme, klareColors), [theme, klareColors]);

  // Initialize component
  useEffect(() => {
    initializeKModule();
  }, [module]);

  const initializeKModule = async () => {
    try {
      setIsProcessing(true);
      
      // Lade User-spezifischen Kontext (Mock)
      const userContext = {
        name: 'User', // TODO: Aus UserStore laden
        mainChallenge: 'Klarheit in der Kommunikation',
        reflectionExperience: 'Anfänger' as const,
        currentLifeAreas: ['career', 'relationships'],
      };

      // Initialisiere AI-Coach für K-Schritt
      if (!module.module_id) {
        throw new Error("Modul-ID ist für die Initialisierung erforderlich.");
      }
      const welcome = await aiService.startKSession(userContext, module.module_id);
      setAiResponse(welcome);

      // Lade Meta-Model Progress
      const progress = await loadMetaModelProgress();
      setMetaModelProgress(progress);

    } catch (error) {
      console.error('K-Module initialization error:', error);
      Alert.alert('Fehler', 'Module konnte nicht geladen werden');
    } finally {
      setIsProcessing(false);
    }
  };

  const loadMetaModelProgress = async (): Promise<MetaModelProgress> => {
    // TODO: Aus Database laden
    // Mock Progress für Demo
    return {
      level: 1,
      totalLevels: 5,
      completedExercises: [],
      currentChallenge: 'universalquantoren',
    };
  };

  const handleMetaModelExercise = async (userStatement: string) => {
    if (!userStatement.trim()) return;

    setIsProcessing(true);
    setAnalysisResults(null); // Alte Ergebnisse zurücksetzen
    setAiResponse(null); // Ggf. alte Coach-Antworten zurücksetzen

    try {
      const { data, error: functionError } = await supabase.functions.invoke<ApiResponse>('meta-modell-analyse', {
        body: { inputText: userStatement },
      });

      if (functionError) {
        throw new Error(`Fehler von der Funktion: ${functionError.message}`);
      }

      if (!data || !data.analysis) {
        throw new Error('Die Analyse hat ein unerwartetes Format zurückgegeben.');
      }

      setAnalysisResults(data.analysis);

    } catch (e: any) {
      console.error('Fehler bei der Analyse:', e);
      Alert.alert(t('common:error'), e.message || t('modules:k-module.analysisError'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNextStep = () => {
    if (currentStep < getTotalSteps() - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const getTotalSteps = () => {
    switch (module.module_id) {
      case 'k-intro':
        return 3; // Intro, Reflexion, Zusammenfassung
      case 'k-meta-model':
        return 5; // 5 Meta-Model Levels
      default:
        return 2;
    }
  };

  const renderModuleContent = () => {
    switch (module.module_id) {
      case 'k-intro':
        return renderKIntroModule();
      case 'k-meta-model':
        return renderMetaModelModule();
      default:
        return renderGenericKModule();
    }
  };

  const renderKIntroModule = () => (
    <View style={styles.moduleContainer}>
      {/* AI Coach Welcome */}
      {aiResponse && (
        <Card style={styles.aiCoachCard} mode="elevated">
          <Card.Content>
            <View style={styles.coachHeader}>
              <Ionicons name="chatbubble-ellipses" size={24} color={klareColors.k} />
              <Text style={styles.coachTitle}>Dein Klarheits-Coach</Text>
            </View>
            <Text style={styles.coachMessage}>{aiResponse.message}</Text>
            {aiResponse.encouragement && (
              <Text style={styles.encouragement}>{aiResponse.encouragement}</Text>
            )}
          </Card.Content>
        </Card>
      )}

      {/* Schritt-Progress */}
      <Surface style={styles.progressSurface}>
        <Text style={styles.progressLabel}>
          Schritt {currentStep + 1} von {getTotalSteps()}: {getStepTitle()}
        </Text>
        <ProgressBar
          progress={(currentStep + 1) / getTotalSteps()}
          color={klareColors.k}
          style={styles.progressBar}
        />
      </Surface>

      {/* Schritt-Content */}
      {renderIntroStepContent()}
    </View>
  );

  const renderMetaModelModule = () => (
    <View style={styles.moduleContainer}>
      {/* Meta-Model Level Progress */}
      <Card style={styles.levelCard} mode="elevated">
        <Card.Content>
          <View style={styles.levelHeader}>
            <Text style={styles.levelTitle}>Meta-Modell der Sprache</Text>
            <Chip
              mode="outlined"
              style={[styles.levelChip, { borderColor: klareColors.k }]}
              textStyle={{ color: klareColors.k }}
            >
              Level {metaModelProgress.level}/{metaModelProgress.totalLevels}
            </Chip>
          </View>
          <Text style={styles.levelDescription}>
            {getMetaModelLevelDescription(metaModelProgress.level)}
          </Text>
          <ProgressBar
            progress={metaModelProgress.level / metaModelProgress.totalLevels}
            color={klareColors.k}
            style={styles.progressBar}
          />
        </Card.Content>
      </Card>

      {/* AI Coach für Meta-Model */}
      {aiResponse && (
        <Card style={styles.aiCoachCard} mode="elevated">
          <Card.Content>
            <View style={styles.coachHeader}>
              <Ionicons name="search" size={24} color={klareColors.k} />
              <Text style={styles.coachTitle}>Meta-Modell Analyse</Text>
            </View>
            <Text style={styles.coachMessage}>{aiResponse.message}</Text>
            {aiResponse.exercises && aiResponse.exercises.length > 0 && (
              <View style={styles.exerciseContainer}>
                {aiResponse.exercises.map((exercise, index) => (
                  <Text key={index} style={styles.exerciseText}>
                    {index + 1}. {exercise}
                  </Text>
                ))}
              </View>
            )}
          </Card.Content>
        </Card>
      )}

      {/* Input für User-Aussage */}
      <Card style={styles.inputCard} mode="outlined">
        <Card.Content>
          <Text style={styles.inputLabel}>
            Gib eine Aussage ein, die du mit dem Meta-Modell analysieren möchtest:
          </Text>
          <Text style={styles.inputSubtext}>
            💡 Tipp: Prüfe auch deine eigenen Gedanken und Überzeugungen - die Sprache im Außen spiegelt das Denken im Inneren wider.
          </Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              value={userInput}
              onChangeText={setUserInput}
              placeholder="z.B. 'Ich bin immer zu langsam' oder 'Alle Menschen sind egoistisch'"
              multiline
              numberOfLines={3}
            />
            <Button
              mode="contained"
              onPress={() => handleMetaModelExercise(userInput)}
              disabled={isProcessing || !userInput.trim()}
              loading={isProcessing}
              style={styles.analyzeButton}
              buttonColor={klareColors.k}
            >
              Analysieren
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* Anzeige der Analyse-Ergebnisse */}
      {analysisResults && (
        <Card style={styles.resultsCard} mode="elevated">
          <Card.Title title={t('modules:k-module.meta-model.resultsTitle', 'Analyse-Ergebnisse')} />
          <Card.Content>
            {analysisResults.map((item, index) => (
              <View key={index} style={styles.resultItem}>
                <Chip style={styles.patternChip}>{item.pattern_type}</Chip>
                <Text style={styles.identifiedWord}>
                  {t('modules:k-module.meta-model.keyword', 'Schlüsselwort')}: "{item.identified_word}"
                </Text>
                <View style={styles.questionContainer}>
                  <Ionicons name="chatbox-ellipses-outline" size={20} color={klareColors.k} />
                  <Text style={styles.generatedQuestion}>{item.generated_question}</Text>
                </View>
                {index < analysisResults.length - 1 && <Divider style={styles.resultDivider} />}
              </View>
            ))}
          </Card.Content>
        </Card>
      )}

      {/* Completed Exercises */}
      {metaModelProgress.completedExercises.length > 0 && (
        <Card style={styles.historyCard} mode="outlined">
          <Card.Content>
            <Text style={styles.historyTitle}>Analysierte Aussagen:</Text>
            <View style={styles.historyChipsContainer}>
              {metaModelProgress.completedExercises.slice(-3).map((exercise, index) => (
                <Chip
                  key={index}
                  style={styles.historyChip}
                  textStyle={styles.historyChipText}
                >
                  {exercise.substring(0, 30)}...
                </Chip>
              ))}
            </View>
          </Card.Content>
        </Card>
      )}
    </View>
  );

  const renderGenericKModule = () => (
    <View style={styles.moduleContainer}>
      <Text style={styles.moduleTitle}>{module.title}</Text>
      <Text style={styles.moduleContent}>
        {typeof module.content === 'string' ? module.content : JSON.stringify(module.content)}
      </Text>
    </View>
  );

  const renderIntroStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Card style={styles.contentCard} mode="elevated">
            <Card.Content>
              <Text style={styles.stepTitle}>Willkommen zur Klarheit!</Text>
              <Text style={styles.stepContent}>
                Im ersten Schritt der KLARE-Methode geht es um bewusste Wahrnehmung und 
                Standortbestimmung. Du lernst, deine aktuelle Situation klar zu erkennen 
                und präzise zu kommunizieren.
              </Text>
              <View style={styles.objectivesList}>
                <Text style={styles.objectivesTitle}>Deine Ziele:</Text>
                <Text style={styles.objective}>• Bewusste Wahrnehmung entwickeln</Text>
                <Text style={styles.objective}>• Kommunikation präzisieren</Text>
                <Text style={styles.objective}>• Meta-Modell der Sprache erlernen</Text>
              </View>
            </Card.Content>
          </Card>
        );
      case 1:
        return (
          <Card style={styles.contentCard} mode="elevated">
            <Card.Content>
              <Text style={styles.stepTitle}>Deine aktuelle Standortbestimmung</Text>
              <Text style={styles.stepContent}>
                Bevor wir mit der Arbeit beginnen, lass uns gemeinsam schauen, 
                wo du gerade stehst.
              </Text>
            </Card.Content>
          </Card>
        );
      case 2:
        return (
          <Card style={styles.contentCard} mode="elevated">
            <Card.Content>
              <Text style={styles.stepTitle}>Bereit für das Meta-Modell</Text>
              <Text style={styles.stepContent}>
                Perfekt! Du bist jetzt bereit, das Meta-Modell der Sprache zu erlernen. 
                Dieses mächtige Werkzeug hilft dir dabei, präziser zu kommunizieren 
                und mehr Klarheit in deinen Gesprächen zu schaffen.
              </Text>
            </Card.Content>
          </Card>
        );
      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 0: return 'Einführung';
      case 1: return 'Standortbestimmung';
      case 2: return 'Vorbereitung';
      default: return 'Schritt';
    }
  };

  const getMetaModelLevelDescription = (level: number) => {
    const levels = t('k-modules:metamodel.levels', { returnObjects: true }) as Record<string, string>;
    const key = String(level);
    return levels[key] || 'Beschreibung nicht gefunden.';
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {renderModuleContent()}

      {/* Navigation Buttons */}
      <View style={styles.navigationContainer}>
        {currentStep > 0 && (
          <Button
            mode="outlined"
            onPress={() => setCurrentStep(prev => prev - 1)}
            style={styles.backButton}
          >
            Zurück
          </Button>
        )}
        <Button
          mode="contained"
          onPress={handleNextStep}
          style={styles.nextButton}
          buttonColor={klareColors.k}
        >
          {currentStep < getTotalSteps() - 1 ? 'Weiter' : 'Abschließen'}
        </Button>
      </View>
    </ScrollView>
  );
};

const createStyles = (theme: any, klareColors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    moduleContainer: {
      padding: 16,
      gap: 16,
    },
    
    // AI Coach Styles
    aiCoachCard: {
      backgroundColor: theme.colors.surface,
      borderLeftWidth: 4,
      borderLeftColor: klareColors.k,
    },
    coachHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
      gap: 8,
    },
    coachTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: klareColors.k,
    },
    coachMessage: {
      fontSize: 15,
      lineHeight: 22,
      color: theme.colors.onSurface,
      marginBottom: 8,
    },
    encouragement: {
      fontSize: 14,
      fontStyle: 'italic',
      color: klareColors.k,
      marginTop: 8,
    },

    // Progress Styles
    progressSurface: {
      padding: 16,
      borderRadius: 12,
      backgroundColor: theme.colors.surface,
    },
    progressLabel: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.onSurface,
      marginBottom: 8,
    },
    progressBar: {
      height: 8,
      borderRadius: 4,
    },

    // Level Card Styles
    levelCard: {
      backgroundColor: theme.colors.surface,
    },
    levelHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    levelTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.onSurface,
      flex: 1,
    },
    levelChip: {
      backgroundColor: 'transparent',
    },
    levelDescription: {
      fontSize: 14,
      color: theme.colors.onSurface,
      marginBottom: 16,
      lineHeight: 20,
    },

    // Input Styles
    inputCard: {
      backgroundColor: theme.colors.surface,
    },
    inputLabel: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.onSurface,
      marginBottom: 8,
    },
    inputSubtext: {
      fontSize: 12,
      color: klareColors.k,
      marginBottom: 12,
      fontStyle: 'italic',
      lineHeight: 18,
    },
    inputContainer: {
      gap: 12,
    },
    textInput: {
      borderWidth: 1,
      borderColor: theme.colors.outline,
      borderRadius: 8,
      padding: 12,
      minHeight: 80,
      textAlignVertical: 'top',
      fontSize: 15,
      color: theme.colors.onSurface,
      backgroundColor: theme.colors.background,
    },
    analyzeButton: {
      alignSelf: 'flex-end',
    },

    // Exercise Styles
    exerciseContainer: {
      marginTop: 12,
      padding: 12,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: 8,
    },
    exerciseText: {
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
      marginBottom: 4,
    },

    // History Styles
    historyCard: {
      backgroundColor: theme.colors.surface,
    },
    historyTitle: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.onSurface,
      marginBottom: 8,
    },
    historyChipsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    historyChip: {
      marginRight: 0,
      marginBottom: 0,
    },
    historyChipText: {
      fontSize: 12,
    },

    // Content Styles
    contentCard: {
      backgroundColor: theme.colors.surface,
    },
    stepTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: theme.colors.onSurface,
      marginBottom: 12,
    },
    stepContent: {
      fontSize: 15,
      lineHeight: 22,
      color: theme.colors.onSurface,
      marginBottom: 16,
    },
    objectivesList: {
      marginTop: 8,
    },
    objectivesTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: klareColors.k,
      marginBottom: 8,
    },
    objective: {
      fontSize: 14,
      color: theme.colors.onSurface,
      marginBottom: 4,
    },

    // Navigation Styles
    navigationContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: 16,
      gap: 12,
    },
    backButton: {
      flex: 1,
    },
    nextButton: {
      flex: 2,
    },

    // Generic Styles
    moduleTitle: {
      fontSize: 24,
      fontWeight: '600',
      color: theme.colors.onSurface,
      marginBottom: 16,
    },
    moduleContent: {
      fontSize: 15,
      lineHeight: 22,
      color: theme.colors.onSurface,
    },

    // NEU: Styles für Analyse-Ergebnisse
    resultsCard: {
      marginTop: 20,
      backgroundColor: theme.colors.surface,
    },
    resultItem: {
      marginBottom: 16,
    },
    patternChip: {
      alignSelf: 'flex-start',
      marginBottom: 12,
      backgroundColor: `${klareColors.k}20`,
    },
    identifiedWord: {
      fontSize: 15,
      fontStyle: 'italic',
      color: theme.colors.onSurfaceVariant,
      marginBottom: 8,
    },
    questionContainer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 8,
      backgroundColor: theme.colors.background,
      padding: 12,
      borderRadius: 8,
    },
    generatedQuestion: {
      fontSize: 15,
      color: theme.colors.onSurface,
      lineHeight: 22,
      flex: 1,
    },
    resultDivider: {
      marginTop: 16,
    },
  });

export default KModuleComponent;
