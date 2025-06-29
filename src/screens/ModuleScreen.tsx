// src/screens/ModuleScreen.tsx
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Button,
  IconButton,
  Text,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

// Import content service functions
import {
  loadModuleContent,
  loadModulesByStep,
  ModuleContent,
} from "../lib/contentService";

// Import user store
import { useUserStore } from "../store/useUserStore";

// Import module-specific components
import { LModuleComponent, AModuleComponent } from "../components/modules";
import KModuleComponent from "../components/modules/KModuleComponent";
import ModuleContentComponent from "../components/modules/ModuleContent";
import ModuleExercise from "../components/modules/ModuleExercise";
import ModuleQuiz from "../components/modules/ModuleQuiz";
import createModuleScreenStyles from "../constants/moduleScreenStyles";
import { darkKlareColors, lightKlareColors } from "../constants/theme";
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

    // Prüfe, ob es ein K-Modul ist (Klarheit)
    if (
      moduleData.module_id.startsWith("k-") &&
      (moduleData.content_type === "exercise" ||
        moduleData.module_id === "k-intro" ||
        moduleData.module_id === "k-meta-model" ||
        moduleData.module_id === "k-clarity")
    ) {
      return (
        <KModuleComponent
          module={moduleData}
          onComplete={handleModuleComplete}
        />
      );
    }

    // Prüfe, ob es ein L-Modul ist
    if (
      moduleData.module_id.startsWith("l-") &&
      (moduleData.content_type === "exercise" ||
        moduleData.module_id === "l-resource-finder" ||
        moduleData.module_id === "l-energy-blockers" ||
        moduleData.module_id === "l-vitality-moments" ||
        moduleData.module_id === "l-embodiment")
    ) {
      return (
        <LModuleComponent
          module={moduleData}
          onComplete={handleModuleComplete}
        />
      );
    }

    // Prüfe, ob es ein A-Modul ist
    if (
      moduleData.module_id.startsWith("a-") &&
      (moduleData.content_type === "exercise" ||
        moduleData.module_id === "a-values-hierarchy" ||
        moduleData.module_id === "a-life-vision" ||
        moduleData.module_id === "a-decision-alignment" ||
        moduleData.module_id === "a-integration-check")
    ) {
      return (
        <AModuleComponent
          module={moduleData}
          onComplete={handleModuleComplete}
        />
      );
    }

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
          <View style={styles.centeredContainer}>
            <Text>Video module support is coming soon</Text>
            <Button mode="contained" onPress={handleModuleComplete}>
              Continue
            </Button>
          </View>
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
        Wähle Module für Schritt {(stepId || "K").toUpperCase()}
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
          {module.title}
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

export default ModuleScreen;
