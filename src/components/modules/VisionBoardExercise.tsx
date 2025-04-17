// src/components/modules/VisionBoardExercise.tsx
import React, { useState, useEffect } from "react";
import { View, StyleSheet, useWindowDimensions, Alert } from "react-native";
import { Button, Text, useTheme } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { supabase } from "../../lib/supabase";
import { useUserStore } from "../../store";
import { ExerciseStepProps } from "./ExerciseStep";
import { VisionBoardEditor } from "../vision-board";
import { klareColors } from "../../constants/theme";

interface VisionBoard {
  id?: string;
  title: string;
  description?: string;
  background_type: "color" | "gradient" | "image";
  background_value: string;
  layout_type: "grid" | "freeform" | "circle";
  items: any[];
}

const VisionBoardExercise: React.FC<ExerciseStepProps> = ({
  step,
  onComplete,
  stepIndex,
  isLastStep,
}) => {
  const theme = useTheme();
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const user = useUserStore((state) => state.user);

  const [board, setBoard] = useState<VisionBoard>({
    title: "Mein Vision Board",
    description: "Meine persönliche Lebensvision",
    background_type: "gradient",
    background_value: "gradient_blue",
    layout_type: "grid",
    items: [],
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Lebensbereiche aus den Übungsoptionen
  const lifeAreas = step.options?.life_areas || [
    "Karriere/Berufung",
    "Beziehungen/Familie",
    "Gesundheit/Wohlbefinden",
    "Persönliches Wachstum",
    "Finanzen/Wohlstand",
    "Spiritualität/Sinn",
    "Wohnumfeld/Lebensraum",
    "Freizeit/Hobbies",
  ];

  // Speichern des Vision Boards
  const saveVisionBoard = async (boardToSave: VisionBoard) => {
    if (!user?.id) {
      Alert.alert(
        "Fehler",
        "Sie müssen angemeldet sein, um ein Vision Board zu speichern.",
      );
      return;
    }

    setIsSaving(true);
    try {
      // Vision Board in der Datenbank speichern
      const { data: newBoard, error: boardError } = await supabase
        .from("vision_boards")
        .insert([
          {
            user_id: user.id,
            title: boardToSave.title,
            description: boardToSave.description,
            background_type: boardToSave.background_type,
            background_value: boardToSave.background_value,
            layout_type: boardToSave.layout_type,
            is_active: true,
          },
        ])
        .select()
        .single();

      if (boardError) throw boardError;

      // Wenn es Items gibt, speichere sie auch
      if (boardToSave.items && boardToSave.items.length > 0) {
        const itemsToInsert = boardToSave.items.map((item) => ({
          user_id: user.id,
          vision_board_id: newBoard.id,
          life_area: item.life_area,
          title: item.title,
          description: item.description || "",
          image_url: item.image_url || null,
          position_x: item.position_x,
          position_y: item.position_y,
          width: item.width,
          height: item.height,
          scale: item.scale,
          rotation: item.rotation,
          color: item.color || null,
        }));

        const { error: itemsError } = await supabase
          .from("vision_board_items")
          .insert(itemsToInsert);

        if (itemsError) throw itemsError;
      }

      // Speichere die Übungsantwort mit Referenz auf das Vision Board
      await onComplete({
        vision_board_id: newBoard.id,
        completion_text: `Vision Board "${boardToSave.title}" mit ${boardToSave.items.length} Elementen erstellt.`,
      });

      Alert.alert(
        "Vision Board gespeichert",
        "Ihr Vision Board wurde erfolgreich gespeichert und ist über den Vision Board Bereich zugänglich.",
        [
          {
            text: "OK",
            onPress: () => {
              // Wenn es der letzte Schritt ist, benachrichtigen wir die Übung über den Abschluss
              if (isLastStep) {
                onComplete({
                  vision_board_id: newBoard.id,
                  completion_text: `Vision Board erstellt: ${boardToSave.title}`,
                });
              }
            },
          },
        ],
      );
    } catch (error) {
      console.error("Fehler beim Speichern des Vision Boards:", error);
      Alert.alert(
        "Fehler",
        "Das Vision Board konnte nicht gespeichert werden.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Digitales Vision Board</Text>
      <Text style={styles.description}>
        Erstellen Sie eine visuelle Repräsentation Ihrer Lebensvision mit diesem
        digitalen Vision Board. Fügen Sie für jeden Lebensbereich Elemente
        hinzu, die Ihre Ziele und Wünsche repräsentieren.
      </Text>

      <View style={styles.editorContainer}>
        <VisionBoardEditor
          initialBoard={board}
          lifeAreas={lifeAreas}
          onSave={saveVisionBoard}
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={() => {
            // Bestätigung, wenn man direkt überspringen will
            Alert.alert(
              "Übung überspringen?",
              "Möchten Sie wirklich ohne ein Vision Board fortzufahren?",
              [
                {
                  text: "Abbrechen",
                  style: "cancel",
                },
                {
                  text: "Überspringen",
                  onPress: () => {
                    // Springe zur nächsten Übung
                    onComplete({
                      completion_text: "Vision Board übersprungen",
                    });
                  },
                },
              ],
            );
          }}
          style={[styles.button, styles.skipButton]}
          labelStyle={styles.skipButtonLabel}
        >
          Überspringen
        </Button>

        <Button
          mode="contained"
          onPress={() => saveVisionBoard(board)}
          style={[styles.button, { backgroundColor: klareColors.a }]}
          loading={isSaving}
          disabled={isSaving}
        >
          Vision Board speichern
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  description: {
    marginBottom: 16,
    lineHeight: 20,
  },
  editorContainer: {
    flex: 1,
    marginBottom: 16,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#f5f5f5",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
  skipButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  skipButtonLabel: {
    color: "#666",
  },
});

export default VisionBoardExercise;
