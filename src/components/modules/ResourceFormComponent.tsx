import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  TextInput,
  Button,
  Title,
  Paragraph,
  useTheme,
  Portal,
  Modal,
} from "react-native-paper";
import Slider from "@react-native-community/slider";
import { Ionicons } from "@expo/vector-icons";

// ResourceForm Komponente für den L-Schritt
// Ermöglicht das Hinzufügen und Bearbeiten von Ressourcen und Blockern
const ResourceFormComponent = ({
  initialData = null,
  isResource = true,
  themeColor = "#4CAF50",
  onSave,
  onCancel,
  visible,
}) => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    rating: 5, // für Ressourcen
    impact: 5, // für Blocker
    activationTips: "", // für Ressourcen
    transformationStrategy: "", // für Blocker
  });

  // Formular zurücksetzen oder mit initialData füllen, wenn sich visible oder initialData ändert
  useEffect(() => {
    if (visible) {
      if (initialData) {
        setFormData({
          ...initialData,
          rating: initialData.rating || 5,
          impact: initialData.impact || 5,
          activationTips: initialData.activationTips || "",
          transformationStrategy: initialData.transformationStrategy || "",
        });
      } else {
        setFormData({
          name: "",
          description: "",
          rating: 5,
          impact: 5,
          activationTips: "",
          transformationStrategy: "",
        });
      }
    }
  }, [visible, initialData]);

  const handleSave = () => {
    if (!formData.name.trim()) {
      // Alert könnte hier angezeigt werden
      return;
    }
    onSave(formData);
  };

  const getValueLabel = (value) => {
    if (isResource) {
      if (value <= 3) return "Niedrig";
      if (value <= 7) return "Mittel";
      return "Hoch";
    } else {
      if (value <= 3) return "Gering";
      if (value <= 7) return "Moderat";
      return "Stark";
    }
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onCancel}
        contentContainerStyle={styles.modalContainer}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardContainer}
        >
          <ScrollView>
            <Title style={styles.title}>
              {isResource
                ? initialData
                  ? "Ressource bearbeiten"
                  : "Neue Ressource"
                : initialData
                  ? "Blocker bearbeiten"
                  : "Neuer Blocker"}
            </Title>

            <TextInput
              label="Name"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              style={styles.input}
              mode="outlined"
            />

            <TextInput
              label="Beschreibung"
              value={formData.description}
              onChangeText={(text) =>
                setFormData({ ...formData, description: text })
              }
              style={styles.input}
              mode="outlined"
              multiline
              numberOfLines={3}
            />

            <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>
                {isResource
                  ? `Ressourcenstärke: ${formData.rating}/10 (${getValueLabel(formData.rating)})`
                  : `Blockadestärke: ${formData.impact}/10 (${getValueLabel(formData.impact)})`}
              </Text>
              <Slider
                minimumValue={1}
                maximumValue={10}
                step={1}
                value={isResource ? formData.rating : formData.impact}
                onValueChange={(value) => {
                  if (isResource) {
                    setFormData({ ...formData, rating: value });
                  } else {
                    setFormData({ ...formData, impact: value });
                  }
                }}
                minimumTrackTintColor={themeColor}
                maximumTrackTintColor="#EEEEEE"
              />
              <View style={styles.sliderMarkers}>
                <Text style={styles.sliderMarkerText}>1</Text>
                <Text style={styles.sliderMarkerText}>5</Text>
                <Text style={styles.sliderMarkerText}>10</Text>
              </View>
            </View>

            {isResource ? (
              <TextInput
                label="Aktivierungstipps"
                value={formData.activationTips}
                onChangeText={(text) =>
                  setFormData({ ...formData, activationTips: text })
                }
                style={styles.input}
                mode="outlined"
                multiline
                numberOfLines={4}
                placeholder="Wie können Sie diese Ressource aktivieren? (optional)"
              />
            ) : (
              <TextInput
                label="Transformationsstrategie"
                value={formData.transformationStrategy}
                onChangeText={(text) =>
                  setFormData({ ...formData, transformationStrategy: text })
                }
                style={styles.input}
                mode="outlined"
                multiline
                numberOfLines={4}
                placeholder="Wie können Sie diesen Blocker transformieren? (optional)"
              />
            )}

            <View style={styles.buttonContainer}>
              <Button mode="outlined" onPress={onCancel} style={styles.button}>
                Abbrechen
              </Button>
              <Button
                mode="contained"
                onPress={handleSave}
                style={[styles.button, { backgroundColor: themeColor }]}
              >
                Speichern
              </Button>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: "white",
    margin: 20,
    borderRadius: 8,
    padding: 20,
    maxHeight: "80%",
  },
  keyboardContainer: {
    flex: 1,
  },
  title: {
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    marginBottom: 12,
  },
  sliderContainer: {
    marginVertical: 20,
  },
  sliderLabel: {
    marginBottom: 8,
    textAlign: "center",
    fontWeight: "500",
  },
  sliderMarkers: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  sliderMarkerText: {
    fontSize: 12,
    color: "#666666",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    marginBottom: 8,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
});

export default ResourceFormComponent;
