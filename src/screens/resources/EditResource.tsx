// src/screens/resources/EditResource.tsx
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  Platform,
} from "react-native";
import {
  Chip,
  TextInput,
  useTheme,
  Button,
  IconButton,
} from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { darkKlareColors, lightKlareColors } from "../../constants/theme";
import { ResourceCategory } from "../../services/ResourceLibraryService";
import { useThemeStore } from "../../store";
import { useResourceStore } from "../../store/useResourceStore";
import { useUserStore } from "../../store/useUserStore";
import Slider from "@react-native-community/slider";
import * as Haptics from "expo-haptics";
import CustomHeader from "../../components/CustomHeader";

const EditResource = ({ route, navigation }) => {
  const { resource } = route.params;
  const { user } = useUserStore();
  const { updateResource } = useResourceStore();

  // Theme handling
  const theme = useTheme();
  const { getActiveTheme } = useThemeStore();
  const isDarkMode = getActiveTheme();
  const klareColors = isDarkMode ? darkKlareColors : lightKlareColors;
  const themeColor = klareColors.l;

  // State für alle Resource-Eigenschaften
  const [name, setName] = useState(resource.name);
  const [description, setDescription] = useState(resource.description || "");
  const [category, setCategory] = useState(resource.category);
  const [rating, setRating] = useState(resource.rating);
  const [activationTips, setActivationTips] = useState(
    resource.activationTips || "",
  );

  // Kategorie-Utility-Funktionen
  const getCategoryLabel = (category: ResourceCategory): string => {
    switch (category) {
      case ResourceCategory.ACTIVITY:
        return "Aktivität";
      case ResourceCategory.PERSONAL_STRENGTH:
        return "Persönliche Stärke";
      case ResourceCategory.RELATIONSHIP:
        return "Beziehung";
      case ResourceCategory.PLACE:
        return "Ort";
      case ResourceCategory.MEMORY:
        return "Erinnerung";
      case ResourceCategory.CUSTOM:
        return "Benutzerdefiniert";
      default:
        return "Sonstige";
    }
  };

  const getCategoryIcon = (category: ResourceCategory): string => {
    switch (category) {
      case ResourceCategory.ACTIVITY:
        return "flash-outline";
      case ResourceCategory.PERSONAL_STRENGTH:
        return "fitness-outline";
      case ResourceCategory.RELATIONSHIP:
        return "people-outline";
      case ResourceCategory.PLACE:
        return "location-outline";
      case ResourceCategory.MEMORY:
        return "heart-outline";
      case ResourceCategory.CUSTOM:
        return "star-outline";
      default:
        return "star-outline";
    }
  };

  // Get rating label based on value
  const getRatingLabel = (value: number): string => {
    if (value <= 3) return "Schwach";
    if (value <= 5) return "Mittelmäßig";
    if (value <= 7) return "Gut";
    if (value <= 9) return "Stark";
    return "Sehr stark";
  };

  // Validierung der Eingaben und Speichern
  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert(
        "Unvollständige Daten",
        "Bitte gib einen Namen für deine Ressource ein.",
      );
      return;
    }

    if (user?.id) {
      try {
        await updateResource(user.id, resource.id, {
          name,
          description,
          category,
          rating,
          activationTips,
        });

        // Haptisches Feedback
        if (Platform.OS !== "web") {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }

        Alert.alert(
          "Gespeichert",
          "Die Ressource wurde erfolgreich aktualisiert.",
          [{ text: "OK", onPress: () => navigation.goBack() }],
        );
      } catch (error) {
        console.error("Fehler beim Speichern der Ressource:", error);
        Alert.alert(
          "Fehler",
          "Die Ressource konnte nicht gespeichert werden. Bitte versuche es erneut.",
        );
      }
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerSection}>
        <View style={styles.headerIconContainer}>
          <Ionicons
            name={getCategoryIcon(category)}
            size={32}
            color={themeColor}
          />
        </View>
        <Text style={[styles.headerTitle, { color: themeColor }]}>
          Ressource bearbeiten
        </Text>
        <Text style={styles.headerSubtitle}>
          Passe deine Energiequelle an und mache sie noch wertvoller für dich.
        </Text>
      </View>

      {/* Name */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          style={styles.input}
          placeholder="Ressourcen-Name"
          mode="outlined"
          outlineColor="#e0e0e0"
          activeOutlineColor={themeColor}
        />
      </View>

      {/* Kategorie */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Kategorie</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
        >
          {Object.values(ResourceCategory).map((cat) => (
            <Chip
              key={cat}
              selected={category === cat}
              onPress={() => setCategory(cat)}
              style={[
                styles.categoryChip,
                category === cat && {
                  backgroundColor: `${themeColor}20`,
                },
              ]}
              textStyle={category === cat ? { color: themeColor } : {}}
              icon={() => (
                <Ionicons
                  name={getCategoryIcon(cat)}
                  size={16}
                  color={category === cat ? themeColor : "#666"}
                />
              )}
            >
              {getCategoryLabel(cat)}
            </Chip>
          ))}
        </ScrollView>
      </View>

      {/* Beschreibung */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Beschreibung</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          style={styles.multilineInput}
          multiline
          numberOfLines={4}
          placeholder="Beschreibe, wie diese Ressource dir Lebendigkeit gibt..."
          mode="outlined"
          outlineColor="#e0e0e0"
          activeOutlineColor={themeColor}
        />
      </View>

      {/* Rating */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Stärke</Text>
        <Text style={styles.sliderLabel}>
          Aktuelle Stärke: {rating}/10 ({getRatingLabel(rating)})
        </Text>
        <Slider
          minimumValue={1}
          maximumValue={10}
          step={1}
          value={rating}
          onValueChange={setRating}
          minimumTrackTintColor={themeColor}
          maximumTrackTintColor="#EEEEEE"
          style={styles.slider}
        />
        <View style={styles.sliderMarkers}>
          <Text style={styles.sliderMarkerText}>Schwach</Text>
          <Text style={styles.sliderMarkerText}>Mittel</Text>
          <Text style={styles.sliderMarkerText}>Stark</Text>
        </View>
      </View>

      {/* Aktivierungstipps */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Aktivierungsstrategie</Text>
        <TextInput
          value={activationTips}
          onChangeText={setActivationTips}
          style={styles.multilineInput}
          multiline
          numberOfLines={4}
          placeholder="Wie kannst du diese Ressource regelmäßig aktivieren? Z.B. tägliche 10-minütige Meditation, wöchentlicher Waldspaziergang..."
          mode="outlined"
          outlineColor="#e0e0e0"
          activeOutlineColor={themeColor}
        />
      </View>

      <View style={styles.activationTips}>
        <Text style={styles.tipsTitle}>Tipps zur Ressourcenaktivierung:</Text>
        <Text style={styles.tipItem}>
          • Plane konkrete Zeiten für die Aktivierung
        </Text>
        <Text style={styles.tipItem}>
          • Verbinde die Ressource mit bestehenden Gewohnheiten
        </Text>
        <Text style={styles.tipItem}>
          • Beginne mit kleinen, leicht umsetzbaren Schritten
        </Text>
        <Text style={styles.tipItem}>
          • Notiere dir die positiven Effekte nach der Aktivierung
        </Text>
      </View>

      {/* Speichern & Abbrechen */}
      <View style={styles.buttonContainer}>
        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          style={styles.cancelButton}
        >
          Abbrechen
        </Button>
        <Button
          mode="contained"
          onPress={handleSave}
          style={[styles.saveButton, { backgroundColor: themeColor }]}
          icon="content-save-outline"
        >
          Speichern
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  headerSection: {
    alignItems: "center",
    marginBottom: 20,
    padding: 16,
  },
  headerIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#444",
  },
  input: {
    backgroundColor: "#f9f9f9",
  },
  multilineInput: {
    minHeight: 120,
    backgroundColor: "#f9f9f9",
    textAlignVertical: "top",
  },
  categoriesScroll: {
    flexDirection: "row",
    marginBottom: 8,
  },
  categoryChip: {
    marginRight: 8,
    paddingVertical: 2,
  },
  slider: {
    height: 40,
    marginVertical: 8,
  },
  sliderLabel: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  sliderMarkers: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: -8,
  },
  sliderMarkerText: {
    fontSize: 12,
    color: "#666",
  },
  activationTips: {
    backgroundColor: "#f7f7f7",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 20,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  tipItem: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 4,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  saveButton: {
    flex: 2,
  },
});

export default EditResource;
