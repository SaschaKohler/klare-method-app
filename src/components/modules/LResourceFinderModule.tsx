import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

// Import components
import ResourceFinder from "./ResourceFinder";
import ResourceManager from "./ResourceManager";
import { lightKlareColors } from "../../constants/theme";

// Props interface
interface LResourceFinderModuleProps {
  module: any;
  onComplete: () => void;
}

/**
 * LResourceFinderModule - A module component for discovering and managing personal resources
 *
 * This module is part of the "L" (Lebendigkeit/Liveliness) section of the KLARE method.
 * It helps users identify their energizing resources and energy-draining blockers.
 */
const LResourceFinderModule = ({
  module,
  onComplete,
}: LResourceFinderModuleProps) => {
  const navigation = useNavigation();
  const [step, setStep] = useState<"finder" | "manager">("finder");

  // The theme color for the "L" section from KLARE method
  const themeColor = lightKlareColors.l;

  // When the resource finder completes, move to the manager
  const handleFinderComplete = () => {
    setStep("manager");
  };

  // When user has completed the module
  const handleComplete = () => {
    onComplete();
  };

  return (
    <View style={styles.container}>
      {step === "finder" ? (
        <ResourceFinder
          onComplete={handleFinderComplete}
          themeColor={themeColor}
        />
      ) : (
        <ResourceManager navigation={navigation} themeColor={themeColor} />
      )}

      {/* Only show the complete button when in manager view */}
      {step === "manager" && (
        <View style={styles.completeButtonContainer}>
          {/* Complete button could be added here if needed */}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  completeButtonContainer: {
    padding: 16,
    paddingBottom: 32,
  },
});

export default LResourceFinderModule;
