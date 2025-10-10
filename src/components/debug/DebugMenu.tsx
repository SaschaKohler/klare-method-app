// src/components/debug/DebugMenu.tsx
import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Text, Button } from "../ui";
import { Colors } from "../../constants/Colors";
import { useUserStore } from "../../store/useUserStore";
import { useOnboardingStore } from "../../store/onboardingStore";
import { supabase } from "../../lib/supabase";

interface DebugMenuProps {
  visible: boolean;
  onClose: () => void;
}

export const DebugMenu: React.FC<DebugMenuProps> = ({ visible, onClose }) => {
  const { user, signOut } = useUserStore();
  const { resetOnboarding: resetOnboardingStore } = useOnboardingStore();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);

  const resetOnboarding = async () => {
    if (!user?.id) return;

    Alert.alert(
      "Onboarding zurücksetzen",
      "Möchtest du das Onboarding wirklich zurücksetzen? Dies setzt nur den Status zurück, keine Daten werden gelöscht.",
      [
        { text: "Abbrechen", style: "cancel" },
        {
          text: "Zurücksetzen",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              // Reset onboarding_completed_at timestamp in user_profiles
              const { error } = await supabase
                .from("user_profiles")
                .update({ 
                  onboarding_completed_at: null,
                  updated_at: new Date().toISOString(),
                })
                .eq("user_id", user.id);

              if (error) throw error;

              // Reset local onboarding store
              resetOnboardingStore();

              // Close debug menu
              onClose();
              
              // Sign out and sign back in to trigger onboarding
              Alert.alert(
                "Erfolg",
                "Onboarding wurde zurückgesetzt. Die App wird jetzt neu geladen...",
                [
                  {
                    text: "OK",
                    onPress: async () => {
                      // Signing out will trigger a re-render and the OnboardingWrapper
                      // will detect the reset onboarding status
                      await signOut();
                    },
                  },
                ]
              );
            } catch (error) {
              console.error("Error resetting onboarding:", error);
              Alert.alert("Fehler", "Onboarding konnte nicht zurückgesetzt werden.");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const createLifeWheelSnapshot = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      // Get current life wheel areas
      const { data: areas, error: areasError } = await supabase
        .from("life_wheel_areas")
        .select("*")
        .eq("user_id", user.id);

      if (areasError) throw areasError;

      if (!areas || areas.length === 0) {
        Alert.alert("Info", "Keine Lebensbereiche gefunden.");
        return;
      }

      // Create snapshot
      const snapshotData = {
        areas: areas.map((area) => ({
          area_name: area.area_name,
          current_value: area.current_value,
          target_value: area.target_value,
          notes: area.notes,
        })),
      };

      const { error: snapshotError } = await supabase
        .from("life_wheel_snapshots")
        .insert({
          user_id: user.id,
          snapshot_data: snapshotData,
          snapshot_type: "manual",
        });

      if (snapshotError) throw snapshotError;

      Alert.alert("Erfolg", "LifeWheel Snapshot wurde erstellt.");
    } catch (error) {
      console.error("Error creating snapshot:", error);
      Alert.alert("Fehler", "Snapshot konnte nicht erstellt werden.");
    } finally {
      setLoading(false);
    }
  };

  const viewLifeWheelHistory = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const { data: snapshots, error } = await supabase
        .from("life_wheel_snapshots")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;

      const count = snapshots?.length || 0;
      const latestDate = snapshots?.[0]?.created_at
        ? new Date(snapshots[0].created_at).toLocaleDateString("de-DE")
        : "N/A";

      Alert.alert(
        "LifeWheel Historie",
        `${count} Snapshots gefunden.\nNeuester: ${latestDate}`,
        [{ text: "OK" }]
      );
    } catch (error) {
      console.error("Error fetching history:", error);
      Alert.alert("Fehler", "Historie konnte nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  };

  const testAIService = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const { AIService } = await import("../../services/AIService");
      
      const health = await AIService.healthCheck();
      
      Alert.alert(
        "AI Service Status",
        `Status: ${health.status}\n\nDatabase: ${health.services.database ? '✅' : '❌'}\nAI Generation: ${health.services.aiGeneration ? '✅' : '❌'}\nPrompts: ${health.services.promptTemplates ? '✅' : '❌'}\nInsights: ${health.services.insights ? '✅' : '❌'}`,
        [{ text: "OK" }]
      );
    } catch (error) {
      console.error("Error testing AI service:", error);
      Alert.alert("Fehler", "AI Service Test fehlgeschlagen.");
    } finally {
      setLoading(false);
    }
  };

  const navigateToReAssessment = () => {
    onClose();
    (navigation as any).navigate("LifeWheelReAssessment");
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text variant="h2" style={styles.title}>
              🛠️ Debug Menu
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            <View style={styles.section}>
              <Text variant="subtitle" style={styles.sectionTitle}>
                Onboarding
              </Text>
              <Button
                title="Onboarding zurücksetzen"
                onPress={resetOnboarding}
                variant="outline"
                style={styles.button}
                disabled={loading}
              />
            </View>

            <View style={styles.section}>
              <Text variant="subtitle" style={styles.sectionTitle}>
                LifeWheel
              </Text>
              <Button
                title="Neues LifeWheel Assessment"
                onPress={navigateToReAssessment}
                variant="primary"
                style={styles.button}
              />
              <Button
                title="Snapshot erstellen"
                onPress={createLifeWheelSnapshot}
                variant="outline"
                style={styles.button}
                disabled={loading}
              />
              <Button
                title="Historie anzeigen"
                onPress={viewLifeWheelHistory}
                variant="outline"
                style={styles.button}
                disabled={loading}
              />
            </View>

            <View style={styles.section}>
              <Text variant="subtitle" style={styles.sectionTitle}>
                AI Services
              </Text>
              <Button
                title="AI Health Check"
                onPress={testAIService}
                variant="outline"
                style={styles.button}
                disabled={loading}
              />
            </View>

            <View style={styles.section}>
              <Text variant="body" style={styles.info}>
                User ID: {user?.id?.substring(0, 8)}...
              </Text>
              <Text variant="body" style={styles.info}>
                Environment: Development
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    color: Colors.text,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: Colors.text,
    marginBottom: 12,
    fontWeight: "600",
  },
  button: {
    marginBottom: 8,
  },
  info: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginBottom: 4,
  },
});
