// src/screens/resources/ResourceLibraryScreen.tsx
import React, { useState } from "react";
import { View, StyleSheet, StatusBar, Platform } from "react-native";
import { useTheme, FAB } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import ResourceLibrary from "../../components/resources/ResourceLibrary";
import CustomHeader from "../../components/CustomHeader";
import { darkKlareColors, lightKlareColors } from "../../constants/theme";
import ResourceFinder from "../../components/resources/ResourceFinder";
import { useKlareStores } from "../../hooks";

/**
 * Bildschirm, der die vollständige Ressourcenbibliothek anzeigt und den Zugriff auf
 * den Ressourcen-Finder ermöglicht.
 */
export default function ResourceLibraryScreen() {
  const navigation = useNavigation();
  const { theme } = useKlareStores();
  const paperTheme = useTheme();
  const isDarkMode = theme.isDarkMode;
  const klareColors = isDarkMode ? darkKlareColors : lightKlareColors;

  // State für den Ressourcen-Finder-Modal
  const [isResourceFinderVisible, setIsResourceFinderVisible] = useState(false);

  // Callback für das Hinzufügen einer neuen Ressource
  const handleAddResource = () => {
    console.log("Ressource hinzufügen Handler wurde aufgerufen");
    setIsResourceFinderVisible(true);
  };

  // Callback für das Abschließen des Ressourcen-Finders
  const handleResourceFinderComplete = () => {
    setIsResourceFinderVisible(false);
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: paperTheme.colors.background },
      ]}
    >
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={isDarkMode ? paperTheme.colors.background : "#ffffff"}
      />

      {/* Header */}
      <CustomHeader
        title="Ressourcen-Bibliothek"
        showBack
        noTopPadding={true}
        onBackPress={() => navigation.goBack()}
      />

      {/* Ressourcen-Bibliothek */}
      {!isResourceFinderVisible && (
        <View style={styles.libraryContainer}>
          <ResourceLibrary
            themeColor={klareColors.l} // Resource Library gibt es erst ab L wie Lebendigkeit
            onAddResource={handleAddResource}
          />
        </View>
      )}

      {/* Ressourcen-Finder Modal */}
      {isResourceFinderVisible && (
        <View style={styles.finderContainer}>
          <ResourceFinder
            onComplete={handleResourceFinderComplete}
            paperThemeColor={klareColors.l}
          />
        </View>
      )}

      {/* FAB zum Hinzufügen einer neuen Ressource */}
      {!isResourceFinderVisible && (
        <FAB
          style={[styles.fab, { backgroundColor: klareColors.l }]}
          icon="pencil-plus"
          color="white"
          onPress={handleAddResource}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  libraryContainer: {
    flex: 1,
  },
  finderContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: Platform.OS === "ios" ? 16 : 16,
  },
});
