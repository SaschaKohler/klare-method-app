// src/components/KlareMethodCards.tsx
import React from "react";
import {
  ScrollView,
  TouchableOpacity,
  View,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Text, ProgressBar, useTheme } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import { useTranslation } from "react-i18next"; // Import für i18n

const { width } = Dimensions.get("window");

// Define the type for a KLARE step
type KlareStep = {
  id: string;
  title: string;
  description: string; // Neu: Beschreibung hinzugefügt
  iconName: string;
  color: string;
};

// Define the type for step progress
type StepProgress = {
  [key: string]: number;
};

// Props type for the component
type KlareMethodCardsProps = {
  klareSteps: KlareStep[];
  stepProgress: StepProgress;
};

type KlareMethodNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "KlareMethod"
>;

const KlareMethodCards: React.FC<KlareMethodCardsProps> = ({
  klareSteps,
  stepProgress,
}) => {
  const navigation = useNavigation<KlareMethodNavigationProp>();
  const theme = useTheme();
  const { t } = useTranslation(["modules", "common"]); // i18n Hook für Übersetzungen

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.klareScrollContainer}
    >
      {klareSteps.map((step) => (
        <TouchableOpacity
          key={step.id}
          style={[
            styles.klareStepCard,
            {
              backgroundColor: `${step.color}50`,
              borderColor: `${step.color}90`,
            },
          ]}
          testID={`klare-step-${step.id.toLowerCase()}`}
          onPress={() => {
            // Type assertion to match the expected type
            navigation.navigate("KlareMethod", {
              step: step.id as "K" | "L" | "A" | "R" | "E",
            });
          }}
        >
          <View style={styles.klareStepHeader}>
            <View
              style={[
                styles.klareStepIconContainer,
                { backgroundColor: `${step.color}25` },
              ]}
            >
              <Ionicons
                name={step.iconName as any}
                size={24}
                color={step.color}
              />
            </View>
            <Text style={[styles.klareStepLetter, { color: step.color }]}>
              {t(`common:logo.${step.id}`)}
            </Text>
          </View>
          <Text style={[styles.klareStepName, { color: theme.colors.text }]}>
            {step.title}
          </Text>
          {/* Beschreibung hinzugefügt */}
          <Text
            style={[styles.klareStepDescription, { color: theme.colors.text }]}
          >
            {step.description}
          </Text>
          <View style={styles.klareStepProgress}>
            <ProgressBar
              progress={stepProgress[step.id]}
              color={step.color}
              style={styles.klareStepProgressBar}
            />
            <Text style={[styles.progressText, { color: step.color }]}>
              {Math.round(stepProgress[step.id] * 100)}%
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  klareScrollContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
  },
  klareStepCard: {
    width: width * 0.65, // Etwas breiter für mehr Platz
    aspectRatio: 0.85, // Etwas höher für die Beschreibung
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  klareStepHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  klareStepIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  klareStepLetter: {
    fontSize: 20,
    fontWeight: "bold",
  },
  klareStepName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  klareStepDescription: {
    fontSize: 12,
    marginBottom: 12,
    opacity: 0.8,
  },
  klareStepProgress: {
    marginTop: "auto",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  klareStepProgressBar: {
    height: 4,
    borderRadius: 2,
    flex: 1,
  },
  progressText: {
    fontSize: 10,
    fontWeight: "bold",
  },
});

export default KlareMethodCards;
