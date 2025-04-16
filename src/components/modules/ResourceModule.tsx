// src/components/modules/ResourceModule.tsx
import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { lightKlareColors } from "../../constants/theme";
import { useUserStore } from "../../store/useUserStore";
import { useResourceStore } from "../../store/useResourceStore";

// Import components
import ResourceFinder from "../resources/ResourceFinder";
import ResourceLibrary from "../resources/ResourceLibrary";

// Props interface
interface ResourceModuleProps {
  module: any;
  onComplete: () => void;
}

/**
 * ResourceModule - A module component for discovering and managing personal resources
 *
 * This module is part of the "L" (Lebendigkeit/Liveliness) section of the KLARE method.
 * It helps users identify their energizing resources and energy-draining blockers.
 */
const ResourceModule = ({ module, onComplete }: ResourceModuleProps) => {
  const navigation = useNavigation();
  const { user } = useUserStore();
  const { resources, loadResources } = useResourceStore();

  // Current view state
  const [view, setView] = useState<"library" | "finder">("library");

  // The theme color for the "L" section from KLARE method
  const themeColor = lightKlareColors.l;

  // Load resources on mount
  useEffect(() => {
    if (user?.id) {
      loadResources(user.id);
    }
  }, [user, loadResources]);

  // When the resource finder completes, move back to the library
  const handleFinderComplete = () => {
    setView("library");
  };

  // When user wants to add a new resource
  const handleAddResource = () => {
    setView("finder");
  };

  // Handle module completion
  const handleComplete = () => {
    onComplete();
  };

  return (
    <View style={styles.container}>
      {view === "library" ? (
        <ResourceLibrary
          themeColor={themeColor}
          onAddResource={handleAddResource}
        />
      ) : (
        <ResourceFinder
          onComplete={handleFinderComplete}
          themeColor={themeColor}
          module={module}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
});

export default ResourceModule;
