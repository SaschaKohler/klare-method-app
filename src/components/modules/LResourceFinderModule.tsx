// src/components/modules/LResourceFinderModule.tsx
import React from "react";
import { View, StyleSheet } from "react-native";
import ResourceModule from "./ResourceModule";
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
  return (
    <View style={styles.container}>
      <ResourceModule module={module} onComplete={onComplete} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
});

export default LResourceFinderModule;
