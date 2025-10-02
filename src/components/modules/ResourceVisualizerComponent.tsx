import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable, Animated } from "react-native";
import { Button, useTheme } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";

// ResourceVisualizer Komponente für den L-Schritt
// Visualisiert Energie-Ressourcen und Blocker
const ResourceVisualizerComponent = ({
  resources = [],
  blockers = [],
  themeColor = "#4CAF50",
  onResourcePress,
  onBlockerPress,
  editable = false,
  onAddResource,
  onAddBlocker,
}) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState("resources"); // 'resources' oder 'blockers'
  const [fadeAnim] = useState(new Animated.Value(1));

  // Stellt sicher, dass Ressourcen und Blocker ein Rating haben
  const normalizedResources = resources.map((r) => ({
    ...r,
    rating: r.rating || 0,
  }));

  const normalizedBlockers = blockers.map((b) => ({
    ...b,
    impact: b.impact || 0,
  }));

  // Sortierte Versionen nach Rating/Impact
  const sortedResources = [...normalizedResources].sort(
    (a, b) => b.rating - a.rating,
  );
  const sortedBlockers = [...normalizedBlockers].sort(
    (a, b) => b.impact - a.impact,
  );

  // Animation beim Tab-Wechsel
  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, [activeTab]);

  // Färbt Bewertungs-Balken basierend auf dem Wert ein
  const getBarColor = (value, isResource = true) => {
    if (isResource) {
      if (value >= 7) return theme.dark ? "#4da375" : "#4CAF50";
      if (value >= 4) return theme.dark ? "#d3a73f" : "#FFC107";
      return theme.dark ? "#cf6679" : "#F44336";
    } else {
      if (value >= 7) return theme.dark ? "#cf6679" : "#F44336";
      if (value >= 4) return theme.dark ? "#d3a73f" : "#FFC107";
      return theme.dark ? "#4da375" : "#4CAF50";
    }
  };

  const renderResourceItem = (item, index) => (
    <Pressable
      key={item.id || index}
      onPress={() => onResourcePress && onResourcePress(item)}
      style={({ pressed }) => [
        styles.itemContainer,
        { opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <View style={styles.itemHeader}>
        <Text style={styles.itemTitle}>{item.name}</Text>
        <View style={styles.ratingContainer}>
          <Text style={styles.ratingText}>{item.rating}/10</Text>
        </View>
      </View>

      <View style={styles.barContainer}>
        <View
          style={[
            styles.bar,
            {
              width: `${(item.rating / 10) * 100}%`,
              backgroundColor: getBarColor(item.rating),
            },
          ]}
        />
      </View>

      {item.description && (
        <Text style={styles.itemDescription}>{item.description}</Text>
      )}

      {item.activationTips && (
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>Aktivierungstipps:</Text>
          <Text style={styles.tipsText}>{item.activationTips}</Text>
        </View>
      )}
    </Pressable>
  );

  const renderBlockerItem = (item, index) => (
    <Pressable
      key={item.id || index}
      onPress={() => onBlockerPress && onBlockerPress(item)}
      style={({ pressed }) => [
        styles.itemContainer,
        { opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <View style={styles.itemHeader}>
        <Text style={styles.itemTitle}>{item.name}</Text>
        <View style={styles.ratingContainer}>
          <Text style={styles.ratingText}>{item.impact}/10</Text>
        </View>
      </View>

      <View style={styles.barContainer}>
        <View
          style={[
            styles.bar,
            {
              width: `${(item.impact / 10) * 100}%`,
              backgroundColor: getBarColor(item.impact, false),
            },
          ]}
        />
      </View>

      {item.description && (
        <Text style={styles.itemDescription}>{item.description}</Text>
      )}

      {item.transformationStrategy && (
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>Transformationsstrategie:</Text>
          <Text style={styles.tipsText}>{item.transformationStrategy}</Text>
        </View>
      )}
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <View style={styles.tabsContainer}>
        <Pressable
          style={[
            styles.tab,
            activeTab === "resources" && [
              styles.activeTab,
              { borderBottomColor: themeColor },
            ],
          ]}
          onPress={() => setActiveTab("resources")}
        >
          <Ionicons
            name="flash"
            size={18}
            color={activeTab === "resources" ? themeColor : theme.colors.text}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "resources" && [
                styles.activeTabText,
                { color: themeColor },
              ],
            ]}
          >
            Ressourcen ({normalizedResources.length})
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.tab,
            activeTab === "blockers" && [
              styles.activeTab,
              { borderBottomColor: themeColor },
            ],
          ]}
          onPress={() => setActiveTab("blockers")}
        >
          <Ionicons
            name="remove-circle"
            size={18}
            color={activeTab === "blockers" ? themeColor : theme.colors.text}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "blockers" && [
                styles.activeTabText,
                { color: themeColor },
              ],
            ]}
          >
            Blocker ({normalizedBlockers.length})
          </Text>
        </Pressable>
      </View>

      <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
        {activeTab === "resources" && (
          <>
            {sortedResources.length > 0 ? (
              sortedResources.map(renderResourceItem)
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons
                  name="battery-dead-outline"
                  size={48}
                  color={theme.colors.disabled}
                />
                <Text style={styles.emptyText}>Keine Ressourcen erfasst</Text>
              </View>
            )}

            {editable && (
              <Button
                mode="outlined"
                icon="add-circle"
                onPress={onAddResource}
                style={[styles.addButton, { borderColor: themeColor }]}
                labelStyle={{ color: themeColor }}
              >
                Ressource hinzufügen
              </Button>
            )}
          </>
        )}

        {activeTab === "blockers" && (
          <>
            {sortedBlockers.length > 0 ? (
              sortedBlockers.map(renderBlockerItem)
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons
                  name="ban-outline"
                  size={48}
                  color={theme.colors.disabled}
                />
                <Text style={styles.emptyText}>Keine Blocker erfasst</Text>
              </View>
            )}

            {editable && (
              <Button
                mode="outlined"
                icon="add-circle"
                onPress={onAddBlocker}
                style={[styles.addButton, { borderColor: themeColor }]}
                labelStyle={{ color: themeColor }}
              >
                Blocker hinzufügen
              </Button>
            )}
          </>
        )}
      </Animated.View>

      {(activeTab === "resources" && sortedResources.length > 0) ||
      (activeTab === "blockers" && sortedBlockers.length > 0) ? (
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            {activeTab === "resources"
              ? "Tippen Sie auf eine Ressource, um Details anzuzeigen und Aktivierungsstrategien zu entwickeln."
              : "Tippen Sie auf einen Blocker, um Details anzuzeigen und Transformationsstrategien zu entwickeln."}
          </Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginVertical: 10,
  },
  tabsContainer: {
    flexDirection: "row",
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  tabText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "500",
  },
  activeTabText: {
    fontWeight: "700",
  },
  contentContainer: {
    paddingTop: 8,
  },
  itemContainer: {
    backgroundColor: "#ffffff10",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#cccccc",
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  ratingContainer: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "600",
  },
  barContainer: {
    height: 8,
    backgroundColor: "#f0f0f0",
    borderRadius: 4,
    marginBottom: 12,
    overflow: "hidden",
  },
  bar: {
    height: "100%",
    borderRadius: 4,
  },
  itemDescription: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  tipsContainer: {
    backgroundColor: "#f8f8f8",
    padding: 12,
    borderRadius: 6,
  },
  tipsTitle: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 4,
  },
  tipsText: {
    fontSize: 13,
    lineHeight: 18,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: "#9e9e9e",
  },
  addButton: {
    marginTop: 16,
  },
  infoCard: {
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: "#666666",
    textAlign: "center",
  },
});

export default ResourceVisualizerComponent;
