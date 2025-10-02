import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from "react-native";
import {
  Button,
  Card,
  Title,
  Paragraph,
  useTheme,
  FAB,
  Snackbar,
  ActivityIndicator,
  Divider,
} from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import * as Haptics from "expo-haptics";

// Import components and store
import ResourceVisualizerComponent from "./ResourceVisualizerComponent";
import ResourceFormComponent from "./ResourceFormComponent";
import { useResourceStore } from "../../store/useResourceStore";

// Props type
interface ResourceManagerProps {
  navigation?: any; // Optional navigation prop
  themeColor?: string;
}

// ResourceManager component
const ResourceManager = ({
  navigation,
  themeColor = "#8B5CF6", // Default color for "L" section
}: ResourceManagerProps) => {
  const theme = useTheme();

  // Form state
  const [formVisible, setFormVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isResourceForm, setIsResourceForm] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);

  // Snackbar state
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  // Get resources and actions from store
  const {
    resources,
    blockers,
    isLoading,
    loadResources,
    addResource,
    updateResource,
    deleteResource,
    activateResource,
    addBlocker,
    updateBlocker,
    deleteBlocker,
    transformBlocker,
  } = useResourceStore();

  // Load data on focus
  useFocusEffect(
    React.useCallback(() => {
      loadResources();
    }, []),
  );

  // Form handlers
  const handleAddResource = () => {
    setIsResourceForm(true);
    setIsEditing(false);
    setSelectedItem(null);
    setFormVisible(true);
  };

  const handleAddBlocker = () => {
    setIsResourceForm(false);
    setIsEditing(false);
    setSelectedItem(null);
    setFormVisible(true);
  };

  const handleSaveForm = (data) => {
    if (isResourceForm) {
      if (isEditing && selectedItem) {
        // Update resource
        updateResource(selectedItem.id, data);
        setSnackbarMessage("Ressource aktualisiert");
      } else {
        // Add new resource
        addResource(data);
        setSnackbarMessage("Neue Ressource hinzugefügt");
      }
    } else {
      if (isEditing && selectedItem) {
        // Update blocker
        updateBlocker(selectedItem.id, data);
        setSnackbarMessage("Blocker aktualisiert");
      } else {
        // Add new blocker
        addBlocker(data);
        setSnackbarMessage("Neuer Blocker hinzugefügt");
      }
    }

    // Haptic feedback
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    setFormVisible(false);
    setSnackbarVisible(true);
  };

  // Item action handlers
  const handleEditItem = (item) => {
    const isResource = "rating" in item;
    setIsResourceForm(isResource);
    setIsEditing(true);
    setSelectedItem(item);
    setFormVisible(true);
  };

  const handleDeleteItem = (item) => {
    const isResource = "rating" in item;
    const itemType = isResource ? "Ressource" : "Blocker";

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    Alert.alert(
      `${itemType} löschen`,
      `Möchten Sie "${item.name}" wirklich löschen?`,
      [
        { text: "Abbrechen", style: "cancel" },
        {
          text: "Löschen",
          style: "destructive",
          onPress: () => {
            if (isResource) {
              deleteResource(item.id);
              setSnackbarMessage("Ressource gelöscht");
            } else {
              deleteBlocker(item.id);
              setSnackbarMessage("Blocker gelöscht");
            }
            setSnackbarVisible(true);
          },
        },
      ],
    );
  };

  const handleActivateResource = (resource) => {
    activateResource(resource.id);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSnackbarMessage(`Ressource "${resource.name}" aktiviert`);
    setSnackbarVisible(true);
  };

  const handleTransformBlocker = (blocker) => {
    transformBlocker(blocker.id);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSnackbarMessage(`Blocker "${blocker.name}" transformiert`);
    setSnackbarVisible(true);
  };

  // Handle resource press
  const handleResourcePress = (resource) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    Alert.alert(resource.name, resource.description || "Keine Beschreibung", [
      {
        text: "Löschen",
        style: "destructive",
        onPress: () => handleDeleteItem(resource),
      },
      {
        text: "Bearbeiten",
        onPress: () => handleEditItem(resource),
      },
      {
        text: "Aktivieren",
        style: "default",
        onPress: () => handleActivateResource(resource),
      },
      { text: "Schließen", style: "cancel" },
    ]);
  };

  // Handle blocker press
  const handleBlockerPress = (blocker) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    Alert.alert(blocker.name, blocker.description || "Keine Beschreibung", [
      {
        text: "Löschen",
        style: "destructive",
        onPress: () => handleDeleteItem(blocker),
      },
      {
        text: "Bearbeiten",
        onPress: () => handleEditItem(blocker),
      },
      {
        text: "Transformieren",
        style: "default",
        onPress: () => handleTransformBlocker(blocker),
      },
      { text: "Schließen", style: "cancel" },
    ]);
  };

  // Calculate average resource rating
  const getAverageResourceRating = () => {
    if (resources.length === 0) return "-";

    const sum = resources.reduce(
      (total, resource) => total + resource.rating,
      0,
    );
    return (sum / resources.length).toFixed(1);
  };

  // Calculate average blocker impact
  const getAverageBlockerImpact = () => {
    if (blockers.length === 0) return "-";

    const sum = blockers.reduce((total, blocker) => total + blocker.impact, 0);
    return (sum / blockers.length).toFixed(1);
  };

  // Show loading indicator
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={themeColor} />
        <Text style={styles.loadingText}>Ressourcen werden geladen...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        <Card style={styles.infoCard}>
          <Card.Content>
            <Text variant="titleMedium" style={{ color: themeColor }}>Lebendigkeit</Text>
            <Paragraph>
              Lebendigkeit ist Ihr natürlicher Zustand von Energie und
              Authentizität. Identifizieren Sie Ihre Ressourcen, die
              Lebendigkeit fördern, und Blocker, die sie behindern.
            </Paragraph>
          </Card.Content>
        </Card>

        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { borderColor: themeColor }]}>
            <Ionicons name="flash" size={24} color={themeColor} />
            <Text style={styles.statNumber}>{resources.length}</Text>
            <Text style={styles.statLabel}>Ressourcen</Text>
          </View>

          <View style={[styles.statCard, { borderColor: themeColor }]}>
            <Ionicons name="remove-circle" size={24} color={themeColor} />
            <Text style={styles.statNumber}>{blockers.length}</Text>
            <Text style={styles.statLabel}>Blocker</Text>
          </View>

          <View style={[styles.statCard, { borderColor: themeColor }]}>
            <Ionicons name="pulse" size={24} color={themeColor} />
            <Text style={styles.statNumber}>{getAverageResourceRating()}</Text>
            <Text style={styles.statLabel}>Ø Stärke</Text>
          </View>
        </View>

        <ResourceVisualizerComponent
          resources={resources}
          blockers={blockers}
          themeColor={themeColor}
          onResourcePress={handleResourcePress}
          onBlockerPress={handleBlockerPress}
          editable={true}
          onAddResource={handleAddResource}
          onAddBlocker={handleAddBlocker}
        />

        <Card style={styles.tipsCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.tipsTitle}>Tipps zur Lebendigkeit</Text>
            <View style={styles.tipItem}>
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={themeColor}
                style={styles.tipIcon}
              />
              <Text style={styles.tipText}>
                Aktivieren Sie Ihre Ressourcen regelmäßig, am besten täglich
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
                Transformieren Sie Blocker schrittweise, beginnend mit den
                stärksten
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
                Achten Sie auf Muster: Wann fühlen Sie sich besonders lebendig?
              </Text>
            </View>
          </Card.Content>
        </Card>

        {resources.length === 0 && blockers.length === 0 && (
          <Card style={styles.emptyStateCard}>
            <Card.Content style={styles.emptyStateContent}>
              <Ionicons name="bulb-outline" size={48} color="#999" />
              <Text style={styles.emptyStateTitle}>
                Keine Einträge vorhanden
              </Text>
              <Text style={styles.emptyStateText}>
                Fügen Sie Ihre ersten Ressourcen und Blocker hinzu, um Ihre
                Lebendigkeit zu steigern
              </Text>
              <Button
                mode="contained"
                onPress={handleAddResource}
                style={[
                  styles.emptyStateButton,
                  { backgroundColor: themeColor },
                ]}
              >
                Erste Ressource hinzufügen
              </Button>
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      {/* Form component */}
      <ResourceFormComponent
        initialData={selectedItem}
        isResource={isResourceForm}
        themeColor={themeColor}
        onSave={handleSaveForm}
        onCancel={() => setFormVisible(false)}
        visible={formVisible}
      />

      {/* FAB for adding resources or blockers */}
      <FAB
        style={[styles.fab, { backgroundColor: themeColor }]}
        icon="add"
        onPress={() => {
          // Haptic feedback
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

          // Simple toggle between adding resources and blockers
          if (resources.length <= blockers.length) {
            handleAddResource();
          } else {
            handleAddBlocker();
          }
        }}
      />

      {/* Snackbar for notifications */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: "OK",
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContainer: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  infoCard: {
    marginBottom: 16,
    elevation: 2,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    padding: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1,
    elevation: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
    color: "#666666",
  },
  tipsCard: {
    marginTop: 16,
    marginBottom: 24,
    elevation: 2,
  },
  tipsTitle: {
    fontSize: 16,
    marginBottom: 12,
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
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
  },
  emptyStateCard: {
    marginVertical: 24,
    padding: 8,
  },
  emptyStateContent: {
    alignItems: "center",
    padding: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    textAlign: "center",
    color: "#666",
    marginBottom: 24,
    lineHeight: 20,
  },
  emptyStateButton: {
    paddingHorizontal: 16,
  },
});

export default ResourceManager;
