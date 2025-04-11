// src/screens/ModuleScreen.tsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import {
  Text,
  useTheme,
  Button,
  IconButton,
  ActivityIndicator,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";

// Import content service functions
import {
  loadModuleContent,
  loadModulesByStep,
  ModuleContent,
} from "../lib/contentService";

// Import user store
import { useUserStore } from "../store/useUserStore";

// Import module-specific components
import ModuleContentComponent from "../components/modules/ModuleContent";
import ModuleExercise from "../components/modules/ModuleExercise";
import ModuleQuiz from "../components/modules/ModuleQuiz";
import { darkKlareColors, lightKlareColors } from "../constants/theme";
import createModuleScreenStyles from "../constants/moduleScreenStyles";
// import ModuleVideoComponent from "../components/modules/ModuleVideo";

const ModuleScreen = () => {
  // Hooks
  const navigation = useNavigation();
  const route = useRoute();
  const theme = useTheme();
  const isDarkMode = theme.dark;
  const klareColors = isDarkMode ? darkKlareColors : lightKlareColors;

  const styles = useMemo(
    () => createModuleScreenStyles(theme, klareColors),
    [theme, klareColors],
  );
  // Extract route parameters
  const { stepId, moduleId } = route.params as {
    stepId?: string;
    moduleId?: string;
  };

  // State management
  const [loading, setLoading] = useState(true);
  const [moduleData, setModuleData] = useState<ModuleContent | null>(null);
  const [availableModules, setAvailableModules] = useState<ModuleContent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showModuleSelector, setShowModuleSelector] = useState(false);

  // User store
  const completeModule = useUserStore((state) => state.completeModule);
  const user = useUserStore((state) => state.user);

  // Load module content
  const loadModuleData = useCallback(
    async (specificModuleId?: string) => {
      setLoading(true);
      setError(null);

      try {
        // Determine module ID to load
        const targetModuleId =
          specificModuleId ||
          moduleId ||
          `${(stepId || "k").toLowerCase()}-intro`;

        console.log("Loading Module:", targetModuleId);

        // Fetch full module content
        const moduleContent = await loadModuleContent(targetModuleId);

        if (!moduleContent) {
          throw new Error("Module could not be loaded");
        }

        setModuleData(moduleContent);
      } catch (err: any) {
        console.error("Module Loading Error:", err);
        setError(err.message || "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    },
    [stepId, moduleId],
  );

  // Load modules for current step
  const loadStepModules = useCallback(async () => {
    try {
      const currentStepId = (stepId || "k").toUpperCase() as
        | "K"
        | "L"
        | "A"
        | "R"
        | "E";
      const modules = await loadModulesByStep(currentStepId);
      setAvailableModules(modules);
    } catch (err) {
      console.error("Error loading step modules:", err);
    }
  }, [stepId]);

  // Effects
  useEffect(() => {
    loadModuleData();
    loadStepModules();
  }, [loadModuleData, loadStepModules]);

  // Module completion handler
  const handleModuleComplete = useCallback(async () => {
    if (!moduleData || !user) return;

    try {
      await completeModule(moduleData.module_id);

      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } catch (err) {
      console.error("Module Completion Error:", err);
    }
  }, [moduleData, user, completeModule, navigation]);

  // Render module content based on type
  const renderModuleContent = () => {
    if (!moduleData) return null;

    switch (moduleData.content_type) {
      case "intro":
      case "theory":
      case "text":
        return (
          <ModuleContentComponent
            title={moduleData.title}
            content={moduleData.content}
            sections={moduleData.sections}
            onComplete={handleModuleComplete}
          />
        );

      case "exercise":
        return (
          <ModuleExercise
            title={moduleData.title}
            content={moduleData.content}
            exerciseSteps={moduleData.exercise_steps}
            moduleId={moduleData.module_id}
            onComplete={handleModuleComplete}
          />
        );

      case "quiz":
        return (
          <ModuleQuiz
            title={moduleData.title}
            content={moduleData.content}
            quizQuestions={moduleData.quiz_questions}
            moduleId={moduleData.module_id}
            onComplete={handleModuleComplete}
          />
        );

      case "video":
        return (
          <ModuleVideoComponent
            title={moduleData.title}
            content={moduleData.content}
            onComplete={handleModuleComplete}
          />
        );

      default:
        return (
          <View style={styles.centeredContainer}>
            <Text>Unsupported module type</Text>
          </View>
        );
    }
  };

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <IconButton icon="arrow-left" onPress={() => navigation.goBack()} />
          <Text style={styles.headerTitle}>Loading Module...</Text>
        </View>
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <IconButton icon="arrow-left" onPress={() => navigation.goBack()} />
          <Text style={styles.headerTitle}>Error</Text>
        </View>
        <View style={styles.centeredContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Button mode="contained" onPress={() => loadModuleData()}>
            Retry
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  // Module selector
  const renderModuleSelector = () => (
    <ScrollView style={styles.moduleSelector}>
      <Text style={styles.moduleSelectorTitle}>
        Select Module for Step {(stepId || "K").toUpperCase()}
      </Text>
      {availableModules.map((module) => (
        <Button
          key={module.id}
          mode="outlined"
          style={styles.moduleSelectorButton}
          onPress={() => {
            loadModuleData(module.module_id);
            setShowModuleSelector(false);
          }}
        >
          {module.title} ({module.content_type})
        </Button>
      ))}
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <IconButton icon="arrow-left" onPress={() => navigation.goBack()} />
        <Text style={styles.headerTitle}>{moduleData?.title || "Module"}</Text>
        <IconButton
          icon="dots-vertical"
          onPress={() => setShowModuleSelector(!showModuleSelector)}
        />
      </View>

      {showModuleSelector ? (
        renderModuleSelector()
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {renderModuleContent()}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "bold",
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "red",
    marginBottom: 16,
  },
  scrollContent: {
    flexGrow: 1,
  },
  moduleSelector: {
    flex: 1,
    padding: 16,
  },
  moduleSelectorTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  moduleSelectorButton: {
    marginBottom: 8,
  },
});

export default ModuleScreen;
