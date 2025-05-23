// src/screens/JournalScreen.tsx - Updated to use JournalStore
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { format, isToday, isYesterday, parseISO, subDays } from "date-fns";
import { de } from "date-fns/locale";
import { MotiView } from "moti";
import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  Alert,
  FlatList,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import {
  ActivityIndicator,
  Button,
  Card,
  Chip,
  FAB,
  IconButton,
  Menu,
  Searchbar,
  Text,
  Title,
  useTheme,
} from "react-native-paper";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import CalendarStrip from "../components/CalendarStrip";
import { createJournalStyles } from "../constants/journalStyles";
import { darkKlareColors, lightKlareColors } from "../constants/theme";

// Import useKlareStores instead of individual stores
import { useKlareStores } from "../hooks";
import {
  JournalEntry,
  JournalTemplate,
  journalService,
} from "../services/JournalService";

export default function JournalScreen() {
  const navigation = useNavigation();
  const klareStore = useKlareStores();
  const { user } = klareStore;
  const {
    categories,
    templates,
    isLoading: journalLoading,
    loadEntries,
    loadTemplates,
    loadCategories,
    getEntriesByDate,
  } = klareStore.journal;

  const scrollY = useSharedValue(0);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTemplate, setSelectedTemplate] =
    useState<JournalTemplate | null>(null);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [entriesForSelectedDate, setEntriesForSelectedDate] = useState<
    JournalEntry[]
  >([]);
  const [loading, setLoading] = useState(true);

  // Theme handling
  const theme = useTheme();
  const { getActiveTheme } = klareStore.theme;
  const isDarkMode = getActiveTheme();
  const klareColors = isDarkMode ? darkKlareColors : lightKlareColors;
  const styles = useMemo(
    () => createJournalStyles(theme, klareColors, isDarkMode),
    [theme, klareColors, isDarkMode],
  );

  const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

  // Header Animation - More compact and subtle
  const headerHeight = 60; // Reduced height for a more compact UI
  const headerContainerStyle = useAnimatedStyle(() => {
    return {
      height: interpolate(
        scrollY.value,
        [0, headerHeight],
        [headerHeight, 50], 
        Extrapolation.CLAMP,
      ),
      opacity: interpolate(
        scrollY.value,
        [headerHeight - 40, headerHeight * 3],
        [1, 0.95],
        Extrapolation.CLAMP,
      ),
    };
  });

  const headerTitleStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        scrollY.value,
        [headerHeight - 40, headerHeight - 10],
        [0, 1],
        Extrapolation.CLAMP,
      ),
      transform: [
        {
          translateY: interpolate(
            scrollY.value,
            [0, headerHeight],
            [10, 0],
            Extrapolation.CLAMP,
          ),
        },
      ],
    };
  });

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Load journal data when the screen is focused
  useFocusEffect(
    React.useCallback(() => {
      const loadJournalData = async () => {
        setLoading(true);
        try {
          if (user?.id) {
            // Load all required data
            await Promise.all([
              loadEntries(user.id),
              loadTemplates(),
              loadCategories(),
            ]);

            // Get entries for the selected date
            const dateEntries = await getEntriesByDate(user.id, selectedDate);
            setEntriesForSelectedDate(dateEntries);
          }
        } catch (error) {
          console.error("Error loading journal data:", error);
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      };

      loadJournalData();
    }, [user?.id, selectedDate]), // Re-run when user ID or selected date changes
  );

  // Refresh function
  const onRefresh = async () => {
    setRefreshing(true);
    if (user?.id) {
      try {
        // Run diagnostic check
        const diagnosticReport = await journalService.diagnoseJournalStorage(
          user.id,
        );
        console.log("Journal storage diagnosis:", diagnosticReport);

        // If issues detected, attempt repair
        if (
          diagnosticReport.localDataParseCheck !== "valid array" ||
          diagnosticReport.localStorageStatus === "empty"
        ) {
          console.log("Journal storage issues detected, attempting repair...");
          const repaired = await journalService.repairJournalStorage(user.id);

          if (repaired) {
            console.log("Journal storage successfully repaired");
          } else {
            console.warn("Journal storage repair failed");
          }
        }

        // Update data
        await journalService.getUserEntries(user.id); // Loads and syncs data
        const dateEntries = await journalService.getEntriesByDate(
          user.id,
          selectedDate,
        );
        setEntriesForSelectedDate(dateEntries);
      } catch (error) {
        console.error("Error during journal refresh:", error);
      } finally {
        setRefreshing(false);
      }
    } else {
      setRefreshing(false);
    }
  };

  // Update entries when selected date changes
  useEffect(() => {
    const fetchEntriesForDate = async () => {
      if (user?.id) {
        setLoading(true);
        const dateEntries = await getEntriesByDate(user.id, selectedDate);

        // If today is selected and no entries exist, show placeholder
        const isCurrentDay = isToday(selectedDate);
        const showEmptyToday = isCurrentDay && dateEntries.length === 0;

        setEntriesForSelectedDate(
          showEmptyToday
            ? [{ id: "today-placeholder", isEmpty: true } as any]
            : dateEntries,
        );
        setLoading(false);

        // Scroll to today if it's the initial load
        if (isCurrentDay) {
          setTimeout(() => {
            flatListRef.current?.scrollToIndex({ index: 0, animated: true });
          }, 100);
        }
      }
    };

    fetchEntriesForDate();
  }, [selectedDate, user?.id]);

  // Ref for the FlatList
  const flatListRef = useRef<FlatList<JournalEntry>>(null);

  // Format date for display
  const formatEntryDate = (dateString: string) => {
    // Guard against undefined or invalid dateString
    if (!dateString) {
      return "Unbekanntes Datum";
    }
    
    try {
      const date = parseISO(dateString);
      
      if (isToday(date)) {
        return `Heute, ${format(date, "HH:mm")}`;
      } else if (isYesterday(date)) {
        return `Gestern, ${format(date, "HH:mm")}`;
      } else {
        return format(date, "dd. MMMM yyyy, HH:mm", { locale: de });
      }
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Ungültiges Datum";
    }
  };

  // Create a new entry
  const createNewEntry = (template?: JournalTemplate) => {
    try {
      // If a template is selected, open the editor with the template
      if (template) {
        navigation.navigate(
          "JournalEditor" as never,
          {
            templateId: template.id,
            date: selectedDate.toISOString(),
          } as never,
        );
      } else {
        // Otherwise open an empty editor
        navigation.navigate(
          "JournalEditor" as never,
          { date: selectedDate.toISOString() } as never,
        );
      }
    } catch (error) {
      console.error("Error navigating to editor:", error);
    }
  };

  // Open an existing entry
  const openEntry = (entry: JournalEntry) => {
    navigation.navigate(
      "JournalViewer" as never,
      { entryId: entry.id } as never,
    );
  };

  // Filter templates by category
  const filteredTemplates = useMemo(() => {
    if (!activeCategory) return templates;
    return templates.filter((template) => template.category === activeCategory);
  }, [templates, activeCategory]);

  // Render a tag chip
  const renderTagChip = (tag: string, index: number) => (
    <Chip
      key={`${tag}-${index}`}
      style={[styles.tagChip, { backgroundColor: `${klareColors.k}15` }]}
      textStyle={{ color: klareColors.k }}
      compact
    >
      {tag}
    </Chip>
  );

  // Render mood rating
  const renderMoodRating = (rating: number) => {
    const iconName =
      rating >= 7 ? "happy" : rating >= 4 ? "happy-outline" : "sad-outline";

    return (
      <View style={styles.ratingContainer}>
        <Ionicons name={iconName as any} size={16} color={klareColors.k} />
        <Text style={[styles.ratingText, { color: klareColors.textSecondary }]}>
          {rating}/10
        </Text>
      </View>
    );
  };

  // Render a template
  const renderTemplate = ({ item }: { item: JournalTemplate }) => (
    <MotiView
      from={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "timing", duration: 250 }}
    >
      <TouchableOpacity
        onPress={() => {
          setSelectedTemplate(item);
          createNewEntry(item);
        }}
      >
        <Card style={styles.templateCard}>
          <Card.Content>
            <Title style={styles.templateTitle}>{item.title}</Title>
            <Text style={styles.templateDescription}>{item.description}</Text>
            <View style={styles.templateQuestionsPreview}>
              {item.promptQuestions.slice(0, 2).map((question, index) => (
                <Text
                  key={index}
                  style={styles.templateQuestion}
                  numberOfLines={1}
                >
                  • {question}
                </Text>
              ))}
              {item.promptQuestions.length > 2 && (
                <Text style={styles.templateQuestionMore}>
                  +{item.promptQuestions.length - 2} weitere Fragen
                </Text>
              )}
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    </MotiView>
  );

  // Render a journal entry
  const renderEntry = ({ item }: { item: JournalEntry }) => (
    <MotiView
      from={{ opacity: 0, translateY: 5 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 250 }}
    >
      <TouchableOpacity onPress={() => openEntry(item)}>
        <Card style={styles.entryCard}>
          <Card.Content>
            <View style={styles.entryHeader}>
              <Text style={styles.entryDate}>
                {formatEntryDate(item.entryDate)}
              </Text>
              {item.isFavorite && (
                <Ionicons name="star" size={16} color={klareColors.r} />
              )}
            </View>
            <Text style={styles.entryContent} numberOfLines={3}>
              {item.entryContent}
            </Text>

            {item.tags && item.tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {item.tags.map((tag, index) => renderTagChip(tag, index))}
              </View>
            )}

            <View style={styles.entryFooter}>
              {item.moodRating && renderMoodRating(item.moodRating)}
              {item.clarityRating && (
                <View style={styles.ratingContainer}>
                  <Ionicons
                    name="bulb-outline"
                    size={16}
                    color={klareColors.k}
                  />
                  <Text
                    style={[
                      styles.ratingText,
                      { color: klareColors.textSecondary },
                    ]}
                  >
                    {item.clarityRating}/10
                  </Text>
                </View>
              )}
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    </MotiView>
  );

  // Render category tabs
  const renderCategoryTabs = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.categoriesContainer}
    >
      <View style={styles.categoryTabsRow}>
        <TouchableOpacity
          style={[
            styles.categoryTab,
            !activeCategory && styles.activeCategoryTab,
          ]}
          onPress={() => setActiveCategory(null)}
        >
          <Text
            style={[
              styles.categoryText,
              !activeCategory && { color: klareColors.k },
            ]}
          >
            Alle
          </Text>
        </TouchableOpacity>

        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryTab,
              activeCategory === category.name && styles.activeCategoryTab,
            ]}
            onPress={() => setActiveCategory(category.name)}
          >
            <Ionicons
              name={category.icon as any}
              size={16}
              color={
                activeCategory === category.name
                  ? klareColors.k
                  : klareColors.textSecondary
              }
              style={{ marginRight: 4 }}
            />
            <Text
              style={[
                styles.categoryText,
                activeCategory === category.name && { color: klareColors.k },
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  // Render compact day selector
  const renderDaySelector = () => (
    <View style={styles.daySelectorContainer}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.dayButtonsContainer}
      >
        {Array.from({ length: 10 }, (_, i) => {
          const date = subDays(new Date(), 9 - i);
          const isSelected = format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
          
          return (
            <TouchableOpacity 
              key={i} 
              style={[
                styles.dayButton,
                isSelected && styles.selectedDayButton
              ]}
              onPress={() => setSelectedDate(date)}
            >
              <Text style={[
                styles.dayName, 
                isSelected && styles.selectedDayText
              ]}>
                {format(date, 'E', { locale: de })}
              </Text>
              <Text style={[
                styles.dayNumber, 
                isSelected && styles.selectedDayText
              ]}>
                {format(date, 'd')}
              </Text>
              {isToday(date) && (
                <View style={styles.todayIndicator} />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  // Render content based on state
  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={klareColors.k} />
        </View>
      );
    }

    if (showTemplateSelector) {
      return (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Vorlage auswählen</Text>
            <Button
              mode="text"
              onPress={() => setShowTemplateSelector(false)}
              labelStyle={{ color: klareColors.k }}
            >
              Zurück
            </Button>
          </View>
          {renderCategoryTabs()}
          <FlatList
            data={filteredTemplates}
            renderItem={renderTemplate}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.templatesList}
            showsVerticalScrollIndicator={false}
          />
        </>
      );
    }

    return (
      <>
        {/* Date display and day selector */}
        <View style={styles.dateContainer}>
          <Text style={styles.currentMonthYear}>
            {format(selectedDate, "MMMM yyyy", { locale: de })}
          </Text>
          {renderDaySelector()}
        </View>

        {entriesForSelectedDate.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <MotiView
              from={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", damping: 15 }}
            >
              <View style={styles.emptyIconContainer}>
                <Ionicons
                  name="book-outline"
                  size={48}
                  color={`${klareColors.k}80`}
                />
              </View>
              <Text style={styles.emptyTitle}>
                Noch keine Einträge für{" "}
                {isToday(selectedDate) ? "heute" : format(selectedDate, "dd. MMMM", { locale: de })}
              </Text>
              <Text style={styles.emptySubtitle}>
                Reflektiere deinen Tag und schaffe mehr Klarheit
              </Text>
              
              {/* Quick action buttons */}
              <View style={styles.quickActionsContainer}>
                <TouchableOpacity
                  style={[styles.quickActionButton, { backgroundColor: klareColors.k }]}
                  onPress={() => createNewEntry()}
                >
                  <Ionicons name="create-outline" size={20} color="white" />
                  <Text style={styles.quickActionText}>
                    Freier Eintrag
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.quickActionButton, styles.secondaryButton]}
                  onPress={() => setShowTemplateSelector(true)}
                >
                  <Ionicons name="list-outline" size={20} color={klareColors.k} />
                  <Text style={[styles.quickActionText, { color: klareColors.k }]}>
                    Mit Vorlage
                  </Text>
                </TouchableOpacity>
              </View>
            </MotiView>
          </View>
        ) : (
          <Animated.FlatList
            ref={flatListRef}
            data={entriesForSelectedDate}
            renderItem={renderEntry}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.entriesList}
            showsVerticalScrollIndicator={false}
            onScroll={scrollHandler}
            scrollEventThrottle={16}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[klareColors.k]}
                tintColor={klareColors.k}
              />
            }
          />
        )}
      </>
    );
  };

  return (
    <SafeAreaView
      edges={["left", "right"]} // Only apply safe area to left and right edges
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Streamlined header */}
      <Animated.View style={[styles.headerContainer, headerContainerStyle]}>
        <View style={styles.headerTop}>
          <View style={styles.headerTitleContainer}>
            <Animated.Text style={[styles.headerTitle, headerTitleStyle]}>
              Journal
            </Animated.Text>
          </View>
          
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.searchToggle}
              onPress={() => setShowSearch(!showSearch)}
            >
              <Ionicons name="search-outline" size={22} color={theme.colors.text} />
            </TouchableOpacity>
            
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <IconButton
                  icon="dots-vertical"
                  size={22}
                  onPress={() => setMenuVisible(true)}
                  iconColor={theme.colors.text}
                />
              }
            >
              <Menu.Item
                onPress={() => {
                  setMenuVisible(false);
                }}
                title="Einstellungen"
                leadingIcon="cog"
              />
              <Menu.Item
                onPress={() => {
                  setMenuVisible(false);
                }}
                title="Einträge exportieren"
                leadingIcon="export"
              />
              <Menu.Item
                onPress={() => {
                  setMenuVisible(false);

                  if (user?.id) {
                    // Start diagnostic tool for developers
                    Alert.alert(
                      "Storage Diagnose starten",
                      "Diese Funktion prüft den Journal-Storage auf Probleme und versucht, diese zu beheben.",
                      [
                        {
                          text: "Abbrechen",
                          style: "cancel",
                        },
                        {
                          text: "Diagnose starten",
                          onPress: async () => {
                            try {
                              // Perform diagnosis
                              const result =
                                await journalService.diagnoseJournalStorage(
                                  user.id,
                                );
                              console.log("Diagnose-Ergebnis:", result);

                              if (
                                result.localDataParseCheck !== "valid array" ||
                                result.localStorageStatus === "empty" ||
                                result.keysMatch !== "match"
                              ) {
                                // Problems found, offer repair
                                Alert.alert(
                                  "Probleme gefunden",
                                  `Speicherzustand: ${result.localStorageStatus}\nFormat: ${result.localDataParseCheck}\nKeyMapping: ${result.keysMatch}\n\nMöchten Sie eine Reparatur versuchen?`,
                                  [
                                    {
                                      text: "Abbrechen",
                                      style: "cancel",
                                    },
                                    {
                                      text: "Reparieren",
                                      onPress: async () => {
                                        const repaired =
                                          await journalService.repairJournalStorage(
                                            user.id,
                                          );

                                        if (repaired) {
                                          Alert.alert(
                                            "Reparatur erfolgreich",
                                            "Der Journal-Storage wurde erfolgreich repariert. Die App wird jetzt die Daten neu laden.",
                                            [
                                              {
                                                text: "OK",
                                                onPress: () => onRefresh(),
                                              },
                                            ],
                                          );
                                        } else {
                                          Alert.alert(
                                            "Reparatur fehlgeschlagen",
                                            "Die Reparatur konnte nicht durchgeführt werden. Bitte versuchen Sie, die App neu zu starten.",
                                          );
                                        }
                                      },
                                    },
                                  ],
                                );
                              } else {
                                // No problem found
                                Alert.alert(
                                  "Diagnose abgeschlossen",
                                  "Keine Probleme im Journal-Storage gefunden.\n\nStorage: " +
                                    `${result.storageType}\nEntries lokal: ${result.localEntryCount}\nServer: ${result.serverStatus}\nEntries Server: ${result.serverEntryCount}`,
                                  [{ text: "OK" }],
                                );
                              }
                            } catch (error) {
                              console.error("Diagnose-Fehler:", error);
                              Alert.alert(
                                "Fehler",
                                "Bei der Diagnose ist ein Fehler aufgetreten: " +
                                  error.message,
                              );
                            }
                          },
                        },
                      ],
                    );
                  }
                }}
                title="Storage-Diagnose"
                leadingIcon="doctor"
              />
              <Menu.Item
                onPress={() => {
                  setMenuVisible(false);
                }}
                title="Hilfe"
                leadingIcon="help-circle"
              />
            </Menu>
          </View>
        </View>
        
        {/* Search bar - conditionally rendered */}
        {showSearch && (
          <Searchbar
            placeholder="Einträge durchsuchen..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchBar}
            inputStyle={styles.searchInput}
            iconColor={klareColors.textSecondary}
          />
        )}
      </Animated.View>

      {/* Main Content */}
      <View style={styles.contentContainer}>
        {renderContent()}
      </View>

      {/* FAB for new entry */}
      <FAB
        style={[styles.fab, { backgroundColor: klareColors.k }]}
        icon="pencil-plus"
        color="white"
        onPress={() => createNewEntry()}
      />
    </SafeAreaView>
  );
}
