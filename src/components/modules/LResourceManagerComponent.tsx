import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, Alert } from "react-native";
import {
  Button,
  Card,
  Title,
  Paragraph,
  useTheme,
  FAB,
  Snackbar,
} from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import uuid from "react-native-uuid";

// Importiere die eigenen Komponenten
import ResourceVisualizerComponent from "./ResourceVisualizerComponent";
import ResourceFormComponent from "./ResourceFormComponent";

// Typen
interface Resource {
  id: string;
  name: string;
  description?: string;
  rating: number;
  activationTips?: string;
  lastActivated?: string;
}

interface Blocker {
  id: string;
  name: string;
  description?: string;
  impact: number;
  transformationStrategy?: string;
  lastTransformed?: string;
}

// Hauptkomponente für L-Modul Ressourcenmanagement
const LResourceManagerComponent = ({
  navigation,
  route,
  themeColor = "#4CAF50",
}) => {
  const theme = useTheme();
  const [resources, setResources] = useState<Resource[]>([]);
  const [blockers, setBlockers] = useState<Blocker[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Formular-Zustand
  const [formVisible, setFormVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isResourceForm, setIsResourceForm] = useState(true);
  const [selectedItem, setSelectedItem] = useState<Resource | Blocker | null>(
    null,
  );

  // Snackbar Zustand
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  // Lade die Daten beim ersten Rendern und bei Fokus
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, []),
  );

  // Beispieldaten laden, wenn keine vorhanden sind
  const loadData = async () => {
    setIsLoading(true);
    try {
      const savedResources = await AsyncStorage.getItem("l_resources");
      const savedBlockers = await AsyncStorage.getItem("l_blockers");

      if (savedResources) {
        setResources(JSON.parse(savedResources));
      } else {
        // Beispieldaten
        setResources([
          {
            id: uuid.v4().toString(),
            name: "Naturverbindung",
            description:
              "Zeit in der Natur verbringen gibt mir Energie und Klarheit",
            rating: 8,
            activationTips:
              "Täglicher 10-minütiger Spaziergang im Park, Wochenendwanderungen",
          },
          {
            id: uuid.v4().toString(),
            name: "Kreative Ausdrucksformen",
            description:
              "Malen, Schreiben oder Musik machen lässt mich meine Lebendigkeit spüren",
            rating: 7,
            activationTips:
              "Morgens 15 Minuten freies Schreiben, abends Gitarre spielen",
          },
          {
            id: uuid.v4().toString(),
            name: "Tiefe Gespräche",
            description:
              "Bedeutungsvolle Gespräche mit Freunden energetisieren mich",
            rating: 9,
            activationTips:
              "Wöchentliches Treffen mit vertrauten Freunden einplanen",
          },
        ]);
      }

      if (savedBlockers) {
        setBlockers(JSON.parse(savedBlockers));
      } else {
        // Beispieldaten
        setBlockers([
          {
            id: uuid.v4().toString(),
            name: "Übermäßiger Medienkonsum",
            description:
              "Zu viel Zeit am Bildschirm verbraucht meine Energie und macht mich passiv",
            impact: 8,
            transformationStrategy:
              "Bildschirmfreie Zeiten definieren, besonders morgens und abends",
          },
          {
            id: uuid.v4().toString(),
            name: "Perfektionismus",
            description:
              "Der Drang, alles perfekt machen zu müssen, blockiert meine Spontaneität",
            impact: 7,
            transformationStrategy:
              '"Gutes Genug"-Prinzip anwenden, bewusst Experimente wagen',
          },
          {
            id: uuid.v4().toString(),
            name: "Energieraubende Beziehungen",
            description:
              "Bestimmte Personen in meinem Umfeld ziehen meine Energie ab",
            impact: 6,
            transformationStrategy:
              "Grenzen setzen, Kontakt reduzieren, Begegnungen vorbereiten",
          },
        ]);
      }
    } catch (error) {
      console.error("Fehler beim Laden der Daten:", error);
      setSnackbarMessage("Fehler beim Laden der Daten");
      setSnackbarVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Speichere Daten nach Änderungen
  const saveData = async () => {
    try {
      await AsyncStorage.setItem("l_resources", JSON.stringify(resources));
      await AsyncStorage.setItem("l_blockers", JSON.stringify(blockers));
    } catch (error) {
      console.error("Fehler beim Speichern der Daten:", error);
      setSnackbarMessage("Fehler beim Speichern der Daten");
      setSnackbarVisible(true);
    }
  };

  // Speichere Daten, wenn sich resources oder blockers ändern
  useEffect(() => {
    if (!isLoading) {
      saveData();
    }
  }, [resources, blockers]);

  // Formular-Funktionen
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

  const handleEditItem = (item: Resource | Blocker) => {
    // Prüfe, ob es eine Ressource oder ein Blocker ist
    const isResource = "rating" in item;
    setIsResourceForm(isResource);
    setIsEditing(true);
    setSelectedItem(item);
    setFormVisible(true);
  };

  const handleDeleteItem = (item: Resource | Blocker) => {
    const isResource = "rating" in item;
    const itemType = isResource ? "Ressource" : "Blocker";

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
              setResources(resources.filter((r) => r.id !== item.id));
              setSnackbarMessage("Ressource gelöscht");
            } else {
              setBlockers(blockers.filter((b) => b.id !== item.id));
              setSnackbarMessage("Blocker gelöscht");
            }
            setSnackbarVisible(true);
          },
        },
      ],
    );
  };

  const handleSaveForm = (data: any) => {
    if (isResourceForm) {
      if (isEditing && selectedItem) {
        // Ressource aktualisieren
        setResources(
          resources.map((r) =>
            r.id === selectedItem.id ? { ...data, id: selectedItem.id } : r,
          ),
        );
        setSnackbarMessage("Ressource aktualisiert");
      } else {
        // Neue Ressource hinzufügen
        const newResource: Resource = {
          ...data,
          id: uuid.v4().toString(),
        };
        setResources([...resources, newResource]);
        setSnackbarMessage("Neue Ressource hinzugefügt");
      }
    } else {
      if (isEditing && selectedItem) {
        // Blocker aktualisieren
        setBlockers(
          blockers.map((b) =>
            b.id === selectedItem.id ? { ...data, id: selectedItem.id } : b,
          ),
        );
        setSnackbarMessage("Blocker aktualisiert");
      } else {
        // Neuen Blocker hinzufügen
        const newBlocker: Blocker = {
          ...data,
          id: uuid.v4().toString(),
        };
        setBlockers([...blockers, newBlocker]);
        setSnackbarMessage("Neuer Blocker hinzugefügt");
      }
    }

    setFormVisible(false);
    setSnackbarVisible(true);
  };

  // Aktivieren einer Ressource oder Transformieren eines Blockers
  const handleActivateResource = (resource: Resource) => {
    const updatedResources = resources.map((r) => {
      if (r.id === resource.id) {
        return { ...r, lastActivated: new Date().toISOString() };
      }
      return r;
    });

    setResources(updatedResources);
    setSnackbarMessage(`Ressource "${resource.name}" aktiviert`);
    setSnackbarVisible(true);
  };

  const handleTransformBlocker = (blocker: Blocker) => {
    const updatedBlockers = blockers.map((b) => {
      if (b.id === blocker.id) {
        return { ...b, lastTransformed: new Date().toISOString() };
      }
      return b;
    });

    setBlockers(updatedBlockers);
    setSnackbarMessage(`Blocker "${blocker.name}" transformiert`);
    setSnackbarVisible(true);
  };

  // Ressourcen und Blocker für ResourceVisualizer vorbereiten
  const handleResourcePress = (resource: Resource) => {
    Alert.alert(resource.name, resource.description || "Keine Beschreibung", [
      {
        text: "Löschen",
        style: "destructive",
        onPress: () => handleDeleteItem(resource),
      },
      { text: "Bearbeiten", onPress: () => handleEditItem(resource) },
      {
        text: "Aktivieren",
        style: "default",
        onPress: () => handleActivateResource(resource),
      },
      { text: "Schließen", style: "cancel" },
    ]);
  };

  const handleBlockerPress = (blocker: Blocker) => {
    Alert.alert(blocker.name, blocker.description || "Keine Beschreibung", [
      {
        text: "Löschen",
        style: "destructive",
        onPress: () => handleDeleteItem(blocker),
      },
      { text: "Bearbeiten", onPress: () => handleEditItem(blocker) },
      {
        text: "Transformieren",
        style: "default",
        onPress: () => handleTransformBlocker(blocker),
      },
      { text: "Schließen", style: "cancel" },
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        <Card style={styles.infoCard}>
          <Card.Content>
            <Title style={{ color: themeColor }}>Lebendigkeit</Title>
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
            <Text style={styles.statNumber}>
              {resources.length > 0
                ? (
                    resources.reduce((sum, r) => sum + r.rating, 0) /
                    resources.length
                  ).toFixed(1)
                : "-"}
            </Text>
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

        <Card style={[styles.tipsCard, { marginTop: 16 }]}>
          <Card.Content>
            <Title style={styles.tipsTitle}>Tipps zur Lebendigkeit</Title>
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
            <View style={styles.tipItem}>
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={themeColor}
                style={styles.tipIcon}
              />
              <Text style={styles.tipText}>
                Verkörpern Sie Lebendigkeit durch bewusste Körperhaltung und
                Atmung
              </Text>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      <ResourceFormComponent
        initialData={selectedItem}
        isResource={isResourceForm}
        themeColor={themeColor}
        onSave={handleSaveForm}
        onCancel={() => setFormVisible(false)}
        visible={formVisible}
      />

      <FAB
        style={[styles.fab, { backgroundColor: themeColor }]}
        icon="add"
        onPress={() => {
          // Einfache Wechsel zwischen Ressource und Blocker hinzufügen
          if (resources.length <= blockers.length) {
            handleAddResource();
          } else {
            handleAddBlocker();
          }
        }}
      />

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
    marginBottom: 16,
    elevation: 2,
  },
  tipsTitle: {
    fontSize: 16,
    marginBottom: 8,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
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
});

export default LResourceManagerComponent;
