import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import {
  Card,
  Title,
  Paragraph,
  Button,
  Chip,
  ActivityIndicator,
  useTheme,
} from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { loadModulesByStep } from "../../lib/contentService";
import { useProgressionStore } from "../../store";
import { lightKlareColors } from "../../constants/theme";

// Typen
interface ModuleData {
  id: string;
  module_id: string;
  content_type: string;
  title: string;
  description: string | null;
  order_index: number;
  content: any;
}

// L-Modul-Index Komponente
const LModuleIndexComponent = () => {
  const theme = useTheme();
  const themeColor = lightKlareColors.l;
  const navigation = useNavigation();

  const [modules, setModules] = useState<ModuleData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Zugriff auf den Progress-Store
  const { isModuleCompleted, isModuleAvailable } = useProgressionStore();

  // Module für den L-Schritt laden
  useEffect(() => {
    const fetchModules = async () => {
      setIsLoading(true);
      try {
        const lModules = await loadModulesByStep("L");
        setModules(lModules);
      } catch (err) {
        console.error("Failed to load L modules:", err);
        setError("Fehler beim Laden der Module");
      } finally {
        setIsLoading(false);
      }
    };

    fetchModules();
  }, []);

  // Zum ausgewählten Modul navigieren
  const navigateToModule = (moduleId: string) => {
    if (isModuleAvailable(moduleId)) {
      navigation.navigate(
        "ModuleScreen" as never,
        {
          stepId: "L",
          moduleId,
        } as never,
      );
    }
  };

  // Icon basierend auf dem Modul-Typ wählen
  const getModuleIcon = (moduleId: string, contentType: string) => {
    if (moduleId === "l-intro" || moduleId.includes("intro")) {
      return "information-circle";
    }
    if (moduleId === "l-theory" || moduleId.includes("theory")) {
      return "book";
    }
    if (moduleId === "l-resource-finder") {
      return "flash";
    }
    if (moduleId === "l-energy-blockers") {
      return "remove-circle";
    }
    if (moduleId === "l-vitality-moments") {
      return "sunny";
    }
    if (moduleId === "l-embodiment") {
      return "body";
    }
    if (moduleId === "l-quiz" || contentType === "quiz") {
      return "help-circle";
    }

    // Fallbacks basierend auf content_type
    if (contentType === "exercise") {
      return "fitness";
    }
    if (contentType === "video") {
      return "videocam";
    }

    return "document-text";
  };

  // Dauer formatieren (Minuten)
  const formatDuration = (module: ModuleData) => {
    if (!module.content || !module.content.duration) return "5 Min.";
    return `${module.content.duration} Min.`;
  };

  // Module nach Kategorien gruppieren
  const introModules = modules.filter(
    (m) => m.module_id === "l-intro" || m.module_id === "l-theory",
  );
  const exerciseModules = modules.filter(
    (m) =>
      m.content_type === "exercise" ||
      [
        "l-resource-finder",
        "l-energy-blockers",
        "l-vitality-moments",
        "l-embodiment",
      ].includes(m.module_id),
  );
  const quizModules = modules.filter(
    (m) => m.content_type === "quiz" || m.module_id === "l-quiz",
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={themeColor} />
        <Text style={styles.loadingText}>Module werden geladen...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color="#F44336" />
        <Text style={styles.errorText}>{error}</Text>
        <Button mode="contained" onPress={() => navigation.goBack()}>
          Zurück
        </Button>
      </View>
    );
  }

  const renderModuleItem = (module: ModuleData) => {
    const isCompleted = isModuleCompleted(module.module_id);
    const isAvailable = isModuleAvailable(module.module_id);

    return (
      <TouchableOpacity
        key={module.id}
        onPress={() => navigateToModule(module.module_id)}
        disabled={!isAvailable}
        style={({ pressed }) => [
          styles.moduleCard,
          pressed && isAvailable ? { opacity: 0.7 } : {},
          !isAvailable ? styles.lockedModule : {},
        ]}
      >
        <View style={styles.moduleIconContainer}>
          <Ionicons
            name={getModuleIcon(module.module_id, module.content_type) as any}
            size={24}
            color={isAvailable ? themeColor : theme.colors.disabled}
          />
        </View>

        <View style={styles.moduleContent}>
          <Text
            style={[styles.moduleTitle, !isAvailable ? styles.lockedText : {}]}
            numberOfLines={1}
          >
            {module.title}
          </Text>

          {module.description && (
            <Text
              style={[
                styles.moduleDescription,
                !isAvailable ? styles.lockedText : {},
              ]}
              numberOfLines={2}
            >
              {module.description}
            </Text>
          )}

          <View style={styles.moduleFooter}>
            <View style={styles.moduleDuration}>
              <Ionicons
                name="time-outline"
                size={14}
                color={isAvailable ? theme.colors.text : theme.colors.disabled}
              />
              <Text
                style={[
                  styles.moduleDurationText,
                  !isAvailable ? styles.lockedText : {},
                ]}
              >
                {formatDuration(module)}
              </Text>
            </View>

            {isCompleted && (
              <Chip
                mode="flat"
                style={[
                  styles.moduleChip,
                  { backgroundColor: `${themeColor}20` },
                ]}
                textStyle={{ color: themeColor, fontSize: 10 }}
              >
                Abgeschlossen
              </Chip>
            )}

            {!isAvailable && (
              <Chip
                mode="flat"
                style={styles.lockedChip}
                textStyle={styles.lockedChipText}
                icon="lock-closed"
              >
                Gesperrt
              </Chip>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.headerCard}>
        <Card.Content>
          <View style={styles.headerContent}>
            <View style={styles.headerTextContainer}>
              <Title style={[styles.headerTitle, { color: themeColor }]}>
                Lebendigkeit
              </Title>
              <Paragraph style={styles.headerDescription}>
                Entdecken Sie Ihre natürlichen Energiequellen und transformieren
                Sie Ihre Blockaden.
              </Paragraph>
            </View>

            <View
              style={[
                styles.headerIcon,
                { backgroundColor: `${themeColor}20` },
              ]}
            >
              <Ionicons name="flash" size={36} color={themeColor} />
            </View>
          </View>
        </Card.Content>
      </Card>

      {introModules.length > 0 && (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Einführung</Text>
          <View style={styles.modulesList}>
            {introModules.map(renderModuleItem)}
          </View>
        </View>
      )}

      {exerciseModules.length > 0 && (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Übungen</Text>
          <View style={styles.modulesList}>
            {exerciseModules.map(renderModuleItem)}
          </View>
        </View>
      )}

      {quizModules.length > 0 && (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Quiz</Text>
          <View style={styles.modulesList}>
            {quizModules.map(renderModuleItem)}
          </View>
        </View>
      )}

      <Card style={styles.tipsCard}>
        <Card.Content>
          <Title style={styles.tipsTitle}>Lebendigkeits-Tipps</Title>
          <View style={styles.tipsList}>
            <View style={styles.tipItem}>
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={themeColor}
                style={styles.tipIcon}
              />
              <Text style={styles.tipText}>
                Beginnen Sie mit dem Identifizieren Ihrer Ressourcen, bevor Sie
                sich mit Blockern befassen
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={themeColor}
                style={styles.tipIcon}
              />
              <Text style={styles.tipText}>
                Führen Sie die Verkörperungsübung regelmäßig durch, um Ihre
                Lebendigkeit körperlich zu verankern
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={themeColor}
                style={styles.tipIcon}
              />
              <Text style={styles.tipText}>
                Achten Sie bewusst auf Momente natürlicher Lebendigkeit in Ihrem
                Alltag
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          icon="chevron-left"
          onPress={() => navigation.goBack()}
          style={[styles.button, { backgroundColor: themeColor }]}
        >
          Zurück zur Übersicht
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    marginVertical: 12,
    fontSize: 16,
    color: "#F44336",
    textAlign: "center",
  },
  headerCard: {
    marginBottom: 20,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTextContainer: {
    flex: 1,
    paddingRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    marginBottom: 8,
  },
  headerDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  headerIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: "#333",
  },
  modulesList: {
    marginBottom: 8,
  },
  moduleCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#DDDDDD",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  moduleIconContainer: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  moduleContent: {
    flex: 1,
  },
  moduleTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  moduleDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  moduleFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  moduleDuration: {
    flexDirection: "row",
    alignItems: "center",
  },
  moduleDurationText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  moduleChip: {
    height: 24,
  },
  lockedModule: {
    opacity: 0.7,
    backgroundColor: "#F5F5F5",
  },
  lockedText: {
    color: "#999",
  },
  lockedChip: {
    backgroundColor: "#F0F0F0",
    height: 24,
  },
  lockedChipText: {
    color: "#999",
    fontSize: 10,
  },
  tipsCard: {
    marginBottom: 20,
  },
  tipsTitle: {
    fontSize: 18,
    marginBottom: 12,
  },
  tipsList: {
    marginTop: 8,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  tipIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  buttonContainer: {
    marginBottom: 32,
  },
  button: {
    paddingVertical: 8,
  },
});

export default LModuleIndexComponent;
