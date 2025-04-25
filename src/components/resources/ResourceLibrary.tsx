// src/components/resources/ResourceLibrary.tsx
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Text,
  TextInput,
} from "react-native";
import {
  Card,
  Title,
  Paragraph,
  Button,
  Chip,
  Divider,
  Surface,
  IconButton,
  Menu,
  ActivityIndicator,
  useTheme,
  Dialog,
  Portal,
} from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import {
  Resource,
  ResourceCategory,
  resourceLibraryService,
} from "../../services/ResourceLibraryService";
// import { useResourceStore } from "../../store/useResourceStore";
// import { useUserStore } from "../../store/useUserStore";
import EditResource from "../../screens/resources/EditResource";
import { useKlareStores } from "../../hooks";

interface ResourceLibraryProps {
  themeColor?: string;
  onAddResource?: () => void;
}

const ResourceLibrary = ({
  themeColor = "#8B5CF6",
  onAddResource,
}: ResourceLibraryProps) => {
  const theme = useTheme();
  const navigation = useNavigation();
  const { user, resources } = useKlareStores();
  const userId = user?.id || "guest";

  // Local state
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<ResourceCategory | null>(
    null,
  );
  const [viewMode, setViewMode] = useState<"all" | "recent" | "top">("all");
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(
    null,
  );
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [resourceMenuVisible, setResourceMenuVisible] = useState<string | null>(
    null,
  );

  // Filter resources by userId

  // Load resources on mount
  useEffect(() => {
    resources.loadResources(userId);
  }, [userId, resources.loadResources]);

  // Handle pull-to-refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await resources.loadResources(userId);
    setRefreshing(false);
  }, [userId, resources.loadResources]);

  // Handle resource activation
  const handleActivateResource = async (resourceId: string) => {
    try {
      await resources.activate(userId, resourceId);
    } catch (error) {
      console.error("Error activating resource:", error);
    }
  };

  // Handle resource deletion
  const handleDeleteResource = async () => {
    if (!selectedResource) return;

    try {
      await resources.delete(userId, selectedResource.id);
      setDeleteDialogVisible(false);
      setSelectedResource(null);
    } catch (error) {
      console.error("Error deleting resource:", error);
    }
  };

  // Get filtered resources based on current filters
  const getFilteredResources = (): Resource[] => {
    // First apply view mode filter
    let filteredResources: Resource[] = [];

    switch (viewMode) {
      case "recent":
        filteredResources = resources.getRecentlyActivated(5);
        break;
      case "top":
        filteredResources = resources.getTop(5);
        break;
      case "all":
      default:
        filteredResources = resources.all;
        break;
    }

    // Then apply category filter if set
    if (filterCategory) {
      filteredResources = resources.getByCategory(filterCategory);
    }

    // Then apply search filter if query exists
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filteredResources = resources.search(query);
    }

    return filteredResources;
  };

  // Get display resources with proper sorting
  const displayResources = getFilteredResources();

  // Get category label
  const getCategoryLabel = (category: ResourceCategory): string => {
    switch (category) {
      case ResourceCategory.ACTIVITY:
        return "Aktivität";
      case ResourceCategory.PERSONAL_STRENGTH:
        return "Persönliche Stärke";
      case ResourceCategory.RELATIONSHIP:
        return "Beziehung";
      case ResourceCategory.PLACE:
        return "Ort";
      case ResourceCategory.MEMORY:
        return "Erinnerung";
      case ResourceCategory.CUSTOM:
        return "Benutzerdefiniert";
      default:
        return "Sonstige";
    }
  };

  // Get category icon
  const getCategoryIcon = (category: ResourceCategory): string => {
    switch (category) {
      case ResourceCategory.ACTIVITY:
        return "flash-outline";
      case ResourceCategory.PERSONAL_STRENGTH:
        return "fitness-outline";
      case ResourceCategory.RELATIONSHIP:
        return "people-outline";
      case ResourceCategory.PLACE:
        return "location-outline";
      case ResourceCategory.MEMORY:
        return "heart-outline";
      case ResourceCategory.CUSTOM:
        return "star-outline";
      default:
        return "star-outline";
    }
  };

  // Get time since last activation
  const getTimeSinceActivation = (lastActivated?: string): string => {
    if (!lastActivated) return "Noch nicht aktiviert";

    const now = new Date();
    const activationDate = new Date(lastActivated);
    const diffInMs = now.getTime() - activationDate.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      if (diffInHours === 0) {
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        if (diffInMinutes === 0) {
          return "Gerade eben";
        }
        return `Vor ${diffInMinutes} Minuten`;
      }
      return `Vor ${diffInHours} Stunden`;
    }

    if (diffInDays === 1) {
      return "Gestern";
    }

    if (diffInDays < 7) {
      return `Vor ${diffInDays} Tagen`;
    }

    if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7);
      return `Vor ${weeks} ${weeks === 1 ? "Woche" : "Wochen"}`;
    }

    const months = Math.floor(diffInDays / 30);
    return `Vor ${months} ${months === 1 ? "Monat" : "Monaten"}`;
  };

  // Render empty state
  const renderEmptyState = () => {
    return (
      <Surface style={styles.emptyState}>
        <Ionicons name="battery-charging-outline" size={64} color="#ccc" />
        <Text style={styles.emptyStateTitle}>Keine Ressourcen gefunden</Text>
        <Text style={styles.emptyStateText}>
          Du hast noch keine Ressourcen in deiner Bibliothek gespeichert oder
          keine Ressourcen entsprechen deinen Filterkriterien.
        </Text>
        <Button
          mode="contained"
          onPress={() => {
            console.log("Empty state button pressed");
            if (onAddResource) {
              console.log("Using onAddResource callback");
              onAddResource();
            } else {
              console.log("onAddResource is undefined, using navigation");
              navigation.navigate("ResourceFinder" as never);
            }
          }}
          style={[styles.emptyStateButton, { backgroundColor: themeColor }]}
        >
          Ressource hinzufügen
        </Button>
      </Surface>
    );
  };

  // Render loading state
  const renderLoadingState = () => {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={themeColor} />
        <Text style={styles.loadingText}>Ressourcen werden geladen...</Text>
      </View>
    );
  };

  // Render resource item
  const renderResourceItem = (resource: Resource) => {
    const isMenu = resourceMenuVisible === resource.id;

    return (
      <Card key={resource.id} style={styles.resourceCard}>
        <Card.Content>
          <View style={styles.resourceHeader}>
            <View style={styles.resourceTitleContainer}>
              <Ionicons
                name={getCategoryIcon(resource.category)}
                size={20}
                color="#666"
              />
              <Title style={styles.resourceTitle}>{resource.name}</Title>
            </View>
            <Menu
              visible={isMenu}
              onDismiss={() => setResourceMenuVisible(null)}
              anchor={
                <IconButton
                  icon="dots-vertical"
                  size={20}
                  onPress={() => setResourceMenuVisible(resource.id)}
                />
              }
            >
              <Menu.Item
                icon="pencil-outline"
                onPress={() => {
                  setResourceMenuVisible(null);
                  navigation.navigate("EditResource", { resource });
                }}
                title="Bearbeiten"
              />
              <Menu.Item
                icon="trash-outline"
                onPress={() => {
                  setResourceMenuVisible(null);
                  setSelectedResource(resource);
                  setDeleteDialogVisible(true);
                }}
                title="Löschen"
              />
            </Menu>
          </View>

          <Chip style={styles.categoryChip}>
            {getCategoryLabel(resource.category)}
          </Chip>

          {resource.description ? (
            <Paragraph style={styles.resourceDescription}>
              {resource.description}
            </Paragraph>
          ) : null}

          <View style={styles.resourceDetails}>
            <View style={styles.resourceRating}>
              <Text style={styles.resourceRatingLabel}>Stärke:</Text>
              <View style={styles.ratingContainer}>
                {Array(10)
                  .fill(0)
                  .map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.ratingBubble,
                        index < resource.rating && {
                          backgroundColor: themeColor,
                        },
                      ]}
                    />
                  ))}
              </View>
            </View>

            {resource.lastActivated && (
              <Text style={styles.lastActivatedText}>
                Zuletzt aktiviert:{" "}
                {getTimeSinceActivation(resource.lastActivated)}
              </Text>
            )}

            {resource.activationTips && (
              <View style={styles.activationTipsContainer}>
                <Text style={styles.activationTipsLabel}>
                  Aktivierungsstrategie:
                </Text>
                <Text style={styles.activationTipsText}>
                  {resource.activationTips}
                </Text>
              </View>
            )}
          </View>
        </Card.Content>

        <Card.Actions style={styles.cardActions}>
          <Button
            mode="outlined"
            onPress={() => handleActivateResource(resource.id)}
            icon="flash-outline"
            style={styles.activateButton}
          >
            Aktivieren
          </Button>
        </Card.Actions>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header with search and filters */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#999"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Ressourcen durchsuchen..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <IconButton
              icon="close-circle"
              size={16}
              color="#999"
              onPress={() => setSearchQuery("")}
              style={styles.clearButton}
            />
          ) : null}
        </View>

        <View style={styles.headerButtons}>
          <Button
            icon="tune-vertical"
            mode="text"
            onPress={() => setMenuVisible(true)}
            compact
          >
            Filter
          </Button>
          <Button
            icon="plus"
            mode="contained"
            onPress={() => {
              console.log("Neu button pressed");
              if (onAddResource) {
                console.log("Using onAddResource callback");
                onAddResource();
              } else {
                console.log("onAddResource is undefined, using navigation");
                navigation.navigate("ResourceFinder" as never);
              }
            }}
            style={[styles.addButton, { backgroundColor: themeColor }]}
            compact
          >
            Neu
          </Button>
        </View>
      </View>

      {/* View mode tabs */}
      {resources.all.length > 0 ? (
        <View style={styles.viewModeTabs}>
          <TouchableOpacity
            style={[
              styles.viewModeTab,
              viewMode === "all" && [
                styles.activeTab,
                { borderBottomColor: themeColor },
              ],
            ]}
            onPress={() => setViewMode("all")}
          >
            <Text
              style={[
                styles.viewModeText,
                viewMode === "all" && [
                  styles.activeTabText,
                  { color: themeColor },
                ],
              ]}
            >
              Alle
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.viewModeTab,
              viewMode === "top" && [
                styles.activeTab,
                { borderBottomColor: themeColor },
              ],
            ]}
            onPress={() => setViewMode("top")}
          >
            <Text
              style={[
                styles.viewModeText,
                viewMode === "top" && [
                  styles.activeTabText,
                  { color: themeColor },
                ],
              ]}
            >
              Top 5
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.viewModeTab,
              viewMode === "recent" && [
                styles.activeTab,
                { borderBottomColor: themeColor },
              ],
            ]}
            onPress={() => setViewMode("recent")}
          >
            <Text
              style={[
                styles.viewModeText,
                viewMode === "recent" && [
                  styles.activeTabText,
                  { color: themeColor },
                ],
              ]}
            >
              Kürzlich
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}
      {/* Category filter chips (only shown when filter is active) */}
      {filterCategory && (
        <View style={styles.filterChipsContainer}>
          <Chip
            style={styles.filterChip}
            onClose={() => setFilterCategory(null)}
            icon={() => (
              <Ionicons
                name={getCategoryIcon(filterCategory)}
                size={16}
                color="#666"
              />
            )}
          >
            {getCategoryLabel(filterCategory)}
          </Chip>
        </View>
      )}

      {/* Resource list */}
      <ScrollView
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[themeColor]}
          />
        }
      >
        {resources.isLoading ? (
          renderLoadingState()
        ) : displayResources.length === 0 ? (
          renderEmptyState()
        ) : (
          <View style={styles.resourcesList}>
            {displayResources.map((resource) => renderResourceItem(resource))}
          </View>
        )}
      </ScrollView>

      {/* Filter menu */}
      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={{ x: 0, y: 0 }}
        style={styles.filterMenu}
      >
        <Menu.Item
          title="Alle Kategorien"
          onPress={() => {
            setFilterCategory(null);
            setMenuVisible(false);
          }}
          leadingIcon="filter-outline"
        />
        <Divider />
        {Object.values(ResourceCategory).map((category) => (
          <Menu.Item
            key={category}
            title={getCategoryLabel(category)}
            onPress={() => {
              setFilterCategory(category);
              setMenuVisible(false);
            }}
            leadingIcon={() => (
              <Ionicons
                name={getCategoryIcon(category)}
                size={20}
                color="#666"
              />
            )}
          />
        ))}
      </Menu>

      {/* Delete confirmation dialog */}
      <Portal>
        <Dialog
          visible={deleteDialogVisible}
          onDismiss={() => setDeleteDialogVisible(false)}
        >
          <Dialog.Title>Ressource löschen</Dialog.Title>
          <Dialog.Content>
            <Paragraph>
              Möchtest du die Ressource "{selectedResource?.name}" wirklich
              löschen? Diese Aktion kann nicht rückgängig gemacht werden.
            </Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>
              Abbrechen
            </Button>
            <Button onPress={handleDeleteResource}>Löschen</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingBottom: 8,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    paddingHorizontal: 8,
    marginRight: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 14,
  },
  clearButton: {
    margin: 0,
    padding: 0,
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  addButton: {
    marginLeft: 8,
    borderRadius: 4,
  },
  viewModeTabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#fff",
  },
  viewModeTab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  viewModeText: {
    fontSize: 14,
    color: "#666",
  },
  activeTabText: {
    fontWeight: "600",
  },
  filterChipsContainer: {
    flexDirection: "row",
    padding: 8,
    backgroundColor: "#fff",
  },
  filterChip: {
    marginRight: 8,
  },
  scrollContainer: {
    flex: 1,
  },
  resourcesList: {
    padding: 16,
  },
  resourceCard: {
    marginBottom: 16,
    borderRadius: 8,
  },
  resourceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  resourceTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  resourceTitle: {
    fontSize: 16,
    marginLeft: 8,
  },
  categoryChip: {
    alignSelf: "flex-start",
    marginTop: 8,
    marginBottom: 12,
  },
  resourceDescription: {
    marginTop: 8,
    marginBottom: 12,
  },
  resourceDetails: {
    marginTop: 8,
  },
  resourceRating: {
    marginBottom: 12,
  },
  resourceRatingLabel: {
    fontSize: 14,
    marginBottom: 4,
    color: "#666",
  },
  ratingContainer: {
    flexDirection: "row",
  },
  ratingBubble: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#eee",
    marginRight: 4,
  },
  lastActivatedText: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
  },
  activationTipsContainer: {
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  activationTipsLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 4,
  },
  activationTipsText: {
    fontSize: 13,
    lineHeight: 18,
  },
  cardActions: {
    justifyContent: "flex-end",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  activateButton: {
    borderRadius: 4,
  },
  emptyState: {
    padding: 32,
    margin: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 16,
  },
  emptyStateButton: {
    marginTop: 8,
  },
  loadingContainer: {
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: "#666",
  },
  filterMenu: {
    marginTop: 60,
    maxWidth: "80%",
  },
});

export default ResourceLibrary;
