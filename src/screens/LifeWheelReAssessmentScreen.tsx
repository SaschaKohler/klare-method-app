// src/screens/LifeWheelReAssessmentScreen.tsx
// Schritt 2: Mit AI-Integration und Memory
import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  ViewStyle,
  TextInput,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/Colors";
import { Text, Button } from "../components/ui";
import { useUserStore } from "../store/useUserStore";
import { supabase } from "../lib/supabase";
import { AIService } from "../services/AIService";

interface LifeWheelArea {
  id: string;
  name: string;
  currentValue: number;
  targetValue: number;
  previousValue?: number;
  previousDate?: string;
  color: string;
}

interface LifeWheelSnapshot {
  created_at: string;
  snapshot_data: {
    areas: Array<{
      area_name: string;
      current_value: number;
      target_value: number;
    }>;
  };
}

export const LifeWheelReAssessmentScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useUserStore();

  const [currentAreaIndex, setCurrentAreaIndex] = useState(0);
  const [lifeWheelAreas, setLifeWheelAreas] = useState<LifeWheelArea[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [previousSnapshot, setPreviousSnapshot] = useState<LifeWheelSnapshot | null>(null);
  
  // AI Coaching States
  const [coachingQuestion, setCoachingQuestion] = useState<string>("");
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);

  useEffect(() => {
    loadLifeWheelData();
  }, []);

  useEffect(() => {
    if (lifeWheelAreas.length > 0 && user?.id) {
      loadCoachingQuestion();
    }
  }, [currentAreaIndex, lifeWheelAreas.length]);

  const loadLifeWheelData = async () => {
    if (!user?.id) return;

    try {
      // Mapping für deutsche Bereichsnamen
      const areaNameMapping: Record<string, string> = {
        health: "Gesundheit",
        career: "Beruf & Karriere",
        relationships: "Beziehungen",
        personal_growth: "Persönliche Entwicklung",
        finances: "Finanzen",
        fun_recreation: "Spaß & Freizeit",
        physical_environment: "Lebensumfeld",
        contribution: "Beitrag & Sinn",
        // Fallbacks für andere Varianten
        "Gesundheit": "Gesundheit",
        "Beruf": "Beruf & Karriere",
        "Beziehungen": "Beziehungen",
        "Persönliche Entwicklung": "Persönliche Entwicklung",
        "Finanzen": "Finanzen",
        "Freizeit": "Spaß & Freizeit",
        "Umfeld": "Lebensumfeld",
        "Sinn": "Beitrag & Sinn",
      };

      // Load current life wheel areas
      const { data: areas, error: areasError } = await supabase
        .from("life_wheel_areas")
        .select("*")
        .eq("user_id", user.id)
        .not("name", "is", null)
        .order("created_at", { ascending: true });

      if (areasError) throw areasError;

      console.log("📊 Loaded areas from DB:", areas);
      console.log("📊 Number of areas:", areas?.length);

      // Remove duplicates - keep only the first occurrence of each area name
      const uniqueAreas = areas?.filter((area, index, self) => 
        index === self.findIndex(a => a.name === area.name)
      ) || [];

      console.log("📊 Unique areas:", uniqueAreas.length);

      // Load latest snapshot for comparison
      const { data: snapshots, error: snapshotError } = await supabase
        .from("life_wheel_snapshots")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (snapshotError) throw snapshotError;

      const latestSnapshot = snapshots?.[0] || null;
      setPreviousSnapshot(latestSnapshot);

      // Map areas with previous values
      const mappedAreas: LifeWheelArea[] = uniqueAreas.map((area, index) => {
        const previousArea = latestSnapshot?.snapshot_data?.areas?.find(
          (a: any) => a.name === area.name
        );

        const areaKey = area.name || "";
        const displayName = areaNameMapping[areaKey] || areaKey;

        console.log(`📍 Area ${index}:`, {
          dbName: area.name,
          areaKey,
          displayName,
          currentValue: area.current_value,
        });

        return {
          id: areaKey || `area_${index}`,
          name: displayName,
          currentValue: area.current_value || 5,
          targetValue: area.target_value || 8,
          previousValue: previousArea?.current_value,
          previousDate: latestSnapshot?.created_at,
          color: Colors.klare[index % Colors.klare.length],
        };
      });

      setLifeWheelAreas(mappedAreas);
    } catch (error) {
      console.error("Error loading life wheel data:", error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const loadCoachingQuestion = async () => {
    if (!user?.id || lifeWheelAreas.length === 0) return;

    const currentArea = lifeWheelAreas[currentAreaIndex];
    setIsLoadingQuestion(true);

    try {
      console.log("🤖 Generating question for area:", {
        name: currentArea.name,
        id: currentArea.id,
        currentValue: currentArea.currentValue,
        targetValue: currentArea.targetValue,
      });

      // Generate question with memory of previous values
      const question = await AIService.generateLifeWheelCoachingQuestion({
        userId: user.id,
        areaName: currentArea.name,
        areaId: currentArea.id,
        currentValue: currentArea.currentValue,
        targetValue: currentArea.targetValue,
        // Memory: Pass previous assessment data
        previousValue: currentArea.previousValue,
        previousDate: currentArea.previousDate,
      });
      
      console.log("✅ Generated question:", question);
      setCoachingQuestion(question);
    } catch (error) {
      console.error("Error loading coaching question:", error);
      setCoachingQuestion("Was hat sich in diesem Bereich seit der letzten Einschätzung verändert?");
    } finally {
      setIsLoadingQuestion(false);
    }
  };

  const handleValueChange = (type: "current" | "target", value: number) => {
    setLifeWheelAreas((prev) =>
      prev.map((area, index) =>
        index === currentAreaIndex
          ? {
              ...area,
              [type === "current" ? "currentValue" : "targetValue"]: value,
            }
          : area
      )
    );
  };

  const handleNext = async () => {
    // Save current answer if provided
    if (userAnswer.trim() && user?.id) {
      const currentArea = lifeWheelAreas[currentAreaIndex];
      
      // Update notes in database
      await supabase
        .from("life_wheel_areas")
        .update({
          notes: userAnswer,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)
        .eq("area_name", currentArea.name);
    }

    setUserAnswer("");
    
    if (currentAreaIndex < lifeWheelAreas.length - 1) {
      setCurrentAreaIndex((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentAreaIndex > 0) {
      setCurrentAreaIndex((prev) => prev - 1);
    }
  };

  const handleComplete = async () => {
    if (!user?.id) return;

    try {
      // Save all updated values
      for (const area of lifeWheelAreas) {
        await supabase
          .from("life_wheel_areas")
          .update({
            current_value: area.currentValue,
            target_value: area.targetValue,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", user.id)
          .eq("area_name", area.name);
      }

      // Create new snapshot
      const snapshotData = {
        areas: lifeWheelAreas.map((area) => ({
          area_name: area.name,
          current_value: area.currentValue,
          target_value: area.targetValue,
        })),
      };

      await supabase.from("life_wheel_snapshots").insert({
        user_id: user.id,
        snapshot_data: snapshotData,
        snapshot_type: "re_assessment",
      });

      navigation.goBack();
    } catch (error) {
      console.error("Error completing re-assessment:", error);
    }
  };

  const renderValueSelector = (type: "current" | "target", value: number) => {
    const currentArea = lifeWheelAreas[currentAreaIndex];
    const title = type === "current" ? "Aktueller Wert" : "Zielwert";

    return (
      <View style={styles.valueSelector}>
        <Text variant="subtitle" style={styles.valueSelectorTitle}>
          {title}
        </Text>
        <Text variant="h2" style={[styles.valueDisplay, { color: currentArea.color }]}>
          {value}/10
        </Text>
        <View style={styles.sliderContainer}>
          {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => {
            const buttonStyle: ViewStyle =
              value === num
                ? { ...styles.sliderButton, backgroundColor: currentArea.color }
                : styles.sliderButton;

            return (
              <Button
                key={num}
                title={num.toString()}
                onPress={() => handleValueChange(type, num)}
                variant={value === num ? "primary" : "outline"}
                size="small"
                style={buttonStyle}
              />
            );
          })}
        </View>
      </View>
    );
  };

  if (isLoadingData) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text variant="body" style={styles.loadingText}>
            Lade Lebensbereiche...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (lifeWheelAreas.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={Colors.error} />
          <Text variant="h2" style={styles.errorText}>
            Keine Lebensbereiche gefunden
          </Text>
          <Button
            title="Zurück"
            onPress={() => navigation.goBack()}
            variant="primary"
          />
        </View>
      </SafeAreaView>
    );
  }

  const currentArea = lifeWheelAreas[currentAreaIndex];

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={[Colors.background, Colors.backgroundSecondary]}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.headerBar}>
          <Button
            title="Abbrechen"
            onPress={() => navigation.goBack()}
            variant="ghost"
            size="small"
          />
          <Text variant="subtitle" style={styles.headerTitle}>
            LifeWheel Re-Assessment
          </Text>
          <View style={{ width: 80 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Progress */}
          <View style={styles.progressContainer}>
            <Text variant="body" style={styles.progressText}>
              Bereich {currentAreaIndex + 1} von {lifeWheelAreas.length}
            </Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${((currentAreaIndex + 1) / lifeWheelAreas.length) * 100}%`,
                    backgroundColor: currentArea.color,
                  },
                ]}
              />
            </View>
          </View>

          {/* Current Area */}
          <View style={styles.currentAreaContainer}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: currentArea.color + "20" },
              ]}
            >
              <Ionicons name="analytics" size={36} color={currentArea.color} />
            </View>
            <Text
              variant="h2"
              style={[styles.currentAreaTitle, { color: currentArea.color }]}
            >
              {currentArea.name}
            </Text>

            {/* Previous Value Comparison */}
            {currentArea.previousValue !== undefined && (
              <View style={styles.comparisonContainer}>
                <Ionicons name="time-outline" size={20} color={Colors.textSecondary} />
                <View style={styles.comparisonTextContainer}>
                  <Text variant="body" style={styles.comparisonText}>
                    Vorherige Bewertung: {currentArea.previousValue}/10
                  </Text>
                  {currentArea.previousDate && (
                    <Text variant="body" style={styles.comparisonDate}>
                      vom {new Date(currentArea.previousDate).toLocaleDateString("de-DE")}
                    </Text>
                  )}
                </View>
              </View>
            )}
          </View>

          {/* Value Selectors */}
          <View style={styles.selectorsContainer}>
            {renderValueSelector("current", currentArea.currentValue)}
            {renderValueSelector("target", currentArea.targetValue)}
          </View>

          {/* AI Coaching with Memory */}
          <View style={styles.coachingContainer}>
            <View style={styles.coachingHeader}>
              <Ionicons
                name="sparkles"
                size={24}
                color={currentArea.color}
                style={styles.coachingIcon}
              />
              <Text variant="subtitle" style={styles.coachingTitle}>
                {previousSnapshot ? "AI-Coach Reflexion" : "AI-Coach Frage"}
              </Text>
            </View>

            {isLoadingQuestion ? (
              <View style={styles.loadingQuestionContainer}>
                <ActivityIndicator size="small" color={currentArea.color} />
                <Text variant="body" style={styles.loadingQuestionText}>
                  Generiere personalisierte Frage...
                </Text>
              </View>
            ) : (
              <>
                <Text variant="body" style={styles.coachingQuestion}>
                  {coachingQuestion}
                </Text>
                <TextInput
                  style={styles.answerInput}
                  placeholder="Deine Reflexion hierzu... (optional)"
                  placeholderTextColor={Colors.textSecondary}
                  value={userAnswer}
                  onChangeText={setUserAnswer}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
                <Button
                  title="Neue Frage generieren"
                  onPress={loadCoachingQuestion}
                  variant="ghost"
                  size="small"
                  style={styles.regenerateButton}
                />
              </>
            )}
          </View>
        </ScrollView>

        {/* Bottom Actions */}
        <View style={styles.bottomContainer}>
          <View style={styles.navigationContainer}>
            <Button
              title="Zurück"
              onPress={handlePrevious}
              variant="outline"
              size="large"
              style={styles.navButton}
              disabled={currentAreaIndex === 0}
            />

            <Button
              title={
                currentAreaIndex === lifeWheelAreas.length - 1
                  ? "Abschließen"
                  : "Weiter"
              }
              onPress={handleNext}
              variant="primary"
              size="large"
              style={{ ...styles.navButton, backgroundColor: currentArea.color } as ViewStyle}
            />
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
  },
  headerBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    color: Colors.text,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    color: Colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorText: {
    color: Colors.text,
    marginTop: 16,
    marginBottom: 24,
    textAlign: "center",
  },
  progressContainer: {
    marginVertical: 16,
  },
  progressText: {
    textAlign: "center",
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  currentAreaContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  currentAreaTitle: {
    textAlign: "center",
    marginBottom: 12,
  },
  comparisonContainer: {
    flexDirection: "row",
    backgroundColor: Colors.cardBackground,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
  },
  comparisonTextContainer: {
    marginLeft: 8,
    flex: 1,
  },
  comparisonText: {
    color: Colors.text,
    fontWeight: "600",
    fontSize: 14,
  },
  comparisonDate: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  selectorsContainer: {
    marginBottom: 24,
  },
  valueSelector: {
    marginBottom: 24,
  },
  valueSelectorTitle: {
    color: Colors.text,
    textAlign: "center",
    marginBottom: 8,
  },
  valueDisplay: {
    textAlign: "center",
    marginBottom: 16,
    fontWeight: "700",
  },
  sliderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  sliderButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    padding: 0,
    marginHorizontal: 2,
  },
  bottomContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  navigationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  navButton: {
    flex: 1,
  },
  coachingContainer: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  coachingHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  coachingIcon: {
    marginRight: 8,
  },
  coachingTitle: {
    color: Colors.text,
    fontWeight: "600",
  },
  loadingQuestionContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  loadingQuestionText: {
    marginLeft: 12,
    color: Colors.textSecondary,
  },
  coachingQuestion: {
    color: Colors.text,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
    fontStyle: "italic",
  },
  answerInput: {
    backgroundColor: Colors.inputBackground,
    borderRadius: 12,
    padding: 16,
    color: Colors.text,
    fontSize: 15,
    minHeight: 100,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  regenerateButton: {
    alignSelf: "flex-start",
  },
});
