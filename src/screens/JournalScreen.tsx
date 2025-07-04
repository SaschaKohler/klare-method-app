// src/screens/JournalScreen.tsx - Updated to use JournalStore and i18n
import { Ionicons } from "@expo/vector-icons";
import { NavigationProp, useFocusEffect, useNavigation } from "@react-navigation/native";
import { format, isToday, isYesterday, parseISO, subDays } from "date-fns";
import { de, enUS } from "date-fns/locale";

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

import { SafeAreaView } from "react-native-safe-area-context";
import CalendarStrip from "../components/CalendarStrip";
import { createJournalStyles } from "../constants/journalStyles";
import { darkKlareColors, lightKlareColors } from "../constants/theme";
import { useTranslation } from "react-i18next";

// Import useKlareStores instead of individual stores
import { useKlareStores } from "../hooks";
import { RootStackParamList } from "../navigation/types";
import {
  JournalEntry,
  JournalTemplate,
  journalService,
} from "../services/JournalService";

export default function JournalScreen() {
  const { t, i18n } = useTranslation(["journal"]);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const klareStore = useKlareStores();
  const { user } = klareStore;
  const {
    categories,
    templates,
    loadEntries,
    loadTemplates,
    loadCategories,
    getEntriesByDate,
  } = klareStore.journal;

  const [refreshing, setRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [entriesForSelectedDate, setEntriesForSelectedDate] = useState<
    JournalEntry[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [menuVisible, setMenuVisible] = useState(false);
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);

  // Get date locale based on current language
  const dateLocale = i18n.language === "de" ? de : enUS;

  // Theme handling
  const theme = useTheme();
  const { isDarkMode } = klareStore.theme;
  const klareColors = isDarkMode ? darkKlareColors : lightKlareColors;
  const styles = useMemo(
    () => createJournalStyles(theme, klareColors, isDarkMode),
    [theme, klareColors, isDarkMode],
  );





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

            // Debug log for loaded data
            if (__DEV__) {
              console.log('JournalScreen loaded data:', {
                templatesCount: templates.length,
                categoriesCount: categories.length,
                currentLanguage: i18n.language,
                templateTitles: templates.map(t => t.title),
                categoryNames: categories.map(c => c.name)
              });
              
              // Warning if no data loaded
              if (templates.length === 0) {
                console.warn('⚠️ No journal templates loaded. Check network connection or clear cache.');
              }
              if (categories.length === 0) {
                console.warn('⚠️ No journal categories loaded. Check network connection or clear cache.');
              }
            }

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
    }, [user?.id, selectedDate, i18n.language]), // Re-run when user ID, selected date, or language changes
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
      return t("calendar.invalidDate", { ns: "journal", defaultValue: "Unknown Date" });
    }
    
    try {
      const date = parseISO(dateString);
      
      if (isToday(date)) {
        return `${t("calendar.today", { ns: "journal" })}, ${format(date, "HH:mm")}`;
      } else if (isYesterday(date)) {
        return `${t("calendar.yesterday", { ns: "journal" })}, ${format(date, "HH:mm")}`;
      } else {
        return format(date, "dd. MMMM yyyy, HH:mm", { locale: dateLocale });
      }
    } catch (error) {
      console.error("Error formatting date:", error);
      return t("calendar.invalidDate", { ns: "journal", defaultValue: "Invalid Date" });
    }
  };

  // Create a new entry
  const createNewEntry = (template?: JournalTemplate) => {
    navigation.navigate("JournalEditor", {
      templateId: template?.id,
      date: selectedDate.toISOString(),
    });
  };

  // Open an existing entry
  const openEntry = (entry: JournalEntry) => {
    navigation.navigate("JournalViewer", { entryId: entry.id });
  };

  // Helper function to check if a category is valid for current language
  const isCategoryValidForLanguage = (categoryName: string, language: string) => {
    // Categories that don't exist in CLEAR method (English version)
    // Only filter out categories that are purely KLARE-specific method steps
    const germanOnlyCategories = [
      'Ausrichtung',     // KLARE-specific step with no CLEAR equivalent
      'Entfaltung',      // KLARE-specific step with no CLEAR equivalent
      // English translations that should also be filtered
      'Alignment',       // KLARE-specific
      'Unfolding'        // KLARE-specific
    ];

    // Note: 'Abend Reflexion'/'Evening Reflection' and 'Werte Reflexion'/'Values Reflection' 
    // are universal reflection concepts, not KLARE-specific, so they should be available in both languages

    // If we're in English mode, filter out only KLARE-specific categories
    if (language === 'en') {
      // Check both original name and potential translations
      const isGermanOnly = germanOnlyCategories.some(germanCat => {
        if (categoryName === germanCat) return true;
        
        // Check if this is a translation of a German-only category
        const category = categories.find(cat => cat.name === categoryName);
        if (category?.translations?.de?.name && 
            germanOnlyCategories.includes(category.translations.de.name)) {
          return true;
        }
        
        return false;
      });
      
      return !isGermanOnly;
    }
    
    // In German mode, all categories are valid
    return true;
  };

  // Filter categories by language appropriateness
  const filteredCategories = useMemo(() => {
    const currentLanguage = i18n.language || 'de';
    
    return categories.filter(category => 
      isCategoryValidForLanguage(category.name, currentLanguage)
    );
  }, [categories, i18n.language]);

  // Helper function to get category names for filtering (updated to use filtered categories)
  const getCategoryNamesForFiltering = (displayedCategoryName: string): string[] => {
    // Create a mapping from any display name (DE or EN) to the internal category name
    const categoryMapping: Record<string, string> = categories.reduce(
      (acc, category) => {
        if (category.translations) {
          acc[category.translations.de.name] = category.name;
          acc[category.translations.en.name] = category.name;
        }
        acc[category.name] = category.name; // Also map the internal name to itself
        return acc;
      },
      {} as Record<string, string>,
    );

    // Find the internal category name from the provided display name
    const internalName = categoryMapping[displayedCategoryName];
    if (!internalName) {
      return [displayedCategoryName]; // Fallback if no mapping is found
    }

    // Find all display names that map to the same internal name
    return Object.keys(categoryMapping).filter(
      (key) => categoryMapping[key] === internalName,
    );
  };

  // Filter templates by category (updated to work with language-filtered categories)
  const filteredTemplates = useMemo(() => {
    if (!activeCategory) {
      // When no category is selected, still filter templates by language appropriateness
      const currentLanguage = i18n.language || 'de';
      
      return templates.filter(template => {
        if (!template.category) return true; // Include templates without category
        return isCategoryValidForLanguage(template.category, currentLanguage);
      });
    }
    
    // Get all possible names for this category
    const categoryNames = getCategoryNamesForFiltering(activeCategory);
    
    const filtered = templates.filter(
      (template) =>
        template.category && categoryNames.includes(template.category),
    );
    
    // Debug log
    if (__DEV__) {
      console.log('Template filtering:', {
        activeCategory,
        categoryNames,
        totalTemplates: templates.length,
        filteredCount: filtered.length,
        templateCategories: templates.map(t => t.category),
        availableCategories: filteredCategories.map(c => ({ name: c.name, translations: c.translations })),
        language: i18n.language
      });
      
      // Check for empty filter results
      if (filtered.length === 0 && templates.length > 0) {
        console.warn('⚠️ No templates found for category:', activeCategory);
        console.log('Available template categories:', [...new Set(templates.map(t => t.category))]);
        console.log('Searching for category names:', categoryNames);
      }
    }
    
    return filtered;
  }, [templates, activeCategory, filteredCategories, i18n.language]);

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

  // Render a journal template
  const renderTemplate = ({ item }: { item: JournalTemplate }) => (
    <TouchableOpacity onPress={() => createNewEntry(item)}>
      <Card style={styles.entryCard}>
        <Card.Content>
          <Title>{item.title}</Title>
          {item.description && <Text numberOfLines={2}>{item.description}</Text>}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );



  // Render a journal entry
  const renderEntry = ({ item }: { item: JournalEntry }) => (
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
            {t("templateSelector.allCategories", { ns: "journal" })}
          </Text>
        </TouchableOpacity>

        {filteredCategories.map((category) => {
          const currentLanguage = i18n.language as 'de' | 'en';
          const displayName = category.translations?.[currentLanguage]?.name || category.name;

          return (
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
                {displayName}
              </Text>
            </TouchableOpacity>
          );
        })}
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
                {format(date, 'E', { locale: dateLocale })}
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
            <Text style={styles.sectionTitle}>
              {t("templateSelector.title", { ns: "journal" })}
            </Text>
            <Button
              mode="text"
              onPress={() => setShowTemplateSelector(false)}
              labelStyle={{ color: klareColors.k }}
            >
              {t("templateSelector.back", { ns: "journal" })}
            </Button>
          </View>
          <View style={styles.stickyHeaderContainer}>
            {renderCategoryTabs()}
          </View>
          <FlatList
            data={filteredTemplates}
            renderItem={renderTemplate}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.templatesList}
            showsVerticalScrollIndicator={false}
            style={styles.templatesListContainer}
          />
        </>
      );
    }

    return (
      <>
        {/* Date display and day selector */}
        <View style={styles.dateContainer}>
          <Text style={styles.currentMonthYear}>
            {format(selectedDate, "MMMM yyyy", { locale: dateLocale })}
          </Text>
          {renderDaySelector()}
        </View>

        {entriesForSelectedDate.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <View>
              <View style={styles.emptyIconContainer}>
                <Ionicons
                  name="book-outline"
                  size={48}
                  color={`${klareColors.k}80`}
                />
              </View>
              <Text style={styles.emptyTitle}>
                {t("emptyState.title", { 
                  ns: "journal", 
                  date: isToday(selectedDate) 
                    ? t("emptyState.today", { ns: "journal" }) 
                    : format(selectedDate, "dd. MMMM", { locale: dateLocale }) 
                })}
              </Text>
              <Text style={styles.emptySubtitle}>
                {t("emptyState.subtitle", { ns: "journal" })}
              </Text>
              
              {/* Quick action buttons */}
              <View style={styles.quickActionsContainer}>
                <TouchableOpacity
                  style={[styles.quickActionButton, { backgroundColor: klareColors.k }]}
                  onPress={() => createNewEntry()}
                >
                  <Ionicons name="create-outline" size={20} color="white" />
                  <Text style={styles.quickActionText}>
                    {t("emptyState.freeEntry", { ns: "journal" })}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.quickActionButton, styles.secondaryButton]}
                  onPress={() => setShowTemplateSelector(true)}
                >
                  <Ionicons name="list-outline" size={20} color={klareColors.k} />
                  <Text style={[styles.quickActionText, { color: klareColors.k }]}>
                    {t("emptyState.withTemplate", { ns: "journal" })}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={entriesForSelectedDate}
            renderItem={renderEntry}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.entriesList}
            showsVerticalScrollIndicator={false}
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
      edges={['top', 'left', 'right']}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.headerTop}>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>
              {t('title', { ns: 'journal' })}
            </Text>
          </View>

          <View style={styles.headerActions}>
            <IconButton
              icon="magnify"
              size={24}
              onPress={() => setShowSearch(!showSearch)}
              iconColor={klareColors.text}
            />
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <IconButton
                  icon="dots-vertical"
                  size={24}
                  onPress={() => setMenuVisible(true)}
                  iconColor={klareColors.text}
                />
              }
              contentStyle={{ backgroundColor: klareColors.surface }}
            >
              <Menu.Item
                onPress={() => {
                  setMenuVisible(false);
                  // TODO: Navigate to settings
                }}
                title={t('menu.settings', { ns: 'journal' })}
                leadingIcon="cog"
              />
              <Menu.Item
                onPress={() => {
                  setMenuVisible(false);
                  // TODO: Implement export functionality
                }}
                title={t('menu.export', { ns: 'journal' })}
                leadingIcon="export"
              />
              <Menu.Item
                onPress={() => {
                  setMenuVisible(false);
                  if (user?.id) {
                    Alert.alert(
                      t("diagnose.startTitle", { ns: "journal" }),
                      t("diagnose.startDescription", { ns: "journal" }),
                      [
                        {
                          text: t("diagnose.cancel", { ns: "journal" }),
                          style: "cancel",
                        },
                        {
                          text: t("diagnose.start", { ns: "journal" }),
                          onPress: async () => {
                            try {
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
                                Alert.alert(
                                  t("diagnose.issueTitle", { ns: "journal" }),
                                  t("diagnose.issueDescription", { ns: "journal" })
                                );
                              } else {
                                Alert.alert(
                                  t("diagnose.successTitle", { ns: "journal" }),
                                  t("diagnose.successDescription", { ns: "journal" })
                                );
                              }
                            } catch (error) {
                              const errorMessage = error instanceof Error ? error.message : String(error);
                              Alert.alert(
                                t("diagnose.errorTitle", { ns: "journal" }),
                                t("diagnose.errorDescription", {
                                  ns: "journal",
                                  errorMessage,
                                }),
                              );
                            }
                          },
                        },
                      ],
                    );
                  }
                }}
                title={t("menu.diagnose", { ns: "journal" })}
                leadingIcon="doctor"
              />
              <Menu.Item
                onPress={() => {
                  setMenuVisible(false);
                  // TODO: Navigate to help screen
                }}
                title={t("menu.help", { ns: "journal" })}
                leadingIcon="help-circle"
              />
            </Menu>
          </View>
        </View>

        {showSearch && (
          <View style={styles.searchContainer}>
            <Searchbar
              placeholder={t("search.placeholder", { ns: "journal" })}
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchbar}
              iconColor={klareColors.k}
              onIconPress={() => setShowSearch(false)}
              onClearIconPress={() => setSearchQuery("")}
              elevation={1}
            />
          </View>
        )}
      </View>

      {/* Main Content */}
      <View style={styles.contentContainer}>{renderContent()}</View>

      {/* FAB to toggle template selector */}
      <FAB
        icon={showTemplateSelector ? "close" : "pencil-plus-outline"}
        style={[styles.fab, { backgroundColor: klareColors.k }]}
        onPress={() => setShowTemplateSelector(!showTemplateSelector)}
        color={isDarkMode ? darkKlareColors.text : lightKlareColors.background}
        visible={!loading}
      />
    </SafeAreaView>
  );
}
