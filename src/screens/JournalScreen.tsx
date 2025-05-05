// src/screens/JournalScreen.tsx - Updated to use JournalStore
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { format, isToday, isYesterday, parseISO, subDays } from "date-fns";
import { de } from "date-fns/locale";
import { MotiView } from "moti";
import React, { useEffect, useMemo, useState, useRef } from "react";
import {
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
import { JournalEntry, JournalTemplate } from "../services/JournalService";

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
  const [menuVisible, setMenuVisible] = useState(false);
  //FIX:
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  //FIX:
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

  // Header Animation
  const headerHeight = 140;
  const headerContainerStyle = useAnimatedStyle(() => {
    return {
      height: interpolate(
        scrollY.value,
        [0, headerHeight],
        [headerHeight, 60],
        Extrapolation.CLAMP,
      ),
    };
  });

  const headerTitleStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        scrollY.value,
        [headerHeight - 50, headerHeight - 10],
        [0, 1],
        Extrapolation.CLAMP,
      ),
    };
  });

  const headerContentStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        scrollY.value,
        [0, headerHeight - 40],
        [1, 0],
        Extrapolation.CLAMP,
      ),
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

  // Refresh-Funktion
  const onRefresh = async () => {
    setRefreshing(true);
    if (user?.id) {
      // Use the synchronize function to get the latest data
      await journalService.getUserEntries(user.id); // Lädt und synchronisiert die Daten
      const dateEntries = await journalService.getEntriesByDate(user.id, selectedDate);
      setEntriesForSelectedDate(dateEntries);
    }
    setRefreshing(false);
  };

  // Update entries when selected date changes
  useEffect(() => {
    const fetchEntriesForDate = async () => {
      if (user?.id) {
        setLoading(true);
        // Füge leere Einträge für die letzten 7 Tage hinzu, um Scrollen zu ermöglichen
        const dateEntries = await getEntriesByDate(user.id, selectedDate);
        
        // Wenn heute ausgewählt ist und keine Einträge existieren, zeige Platzhalter
        const isToday = isToday(selectedDate);
        const showEmptyToday = isToday && dateEntries.length === 0;
        
        setEntriesForSelectedDate(showEmptyToday 
          ? [{ id: 'today-placeholder', isEmpty: true } as any] 
          : dateEntries);
        setLoading(false);
        
        // Scroll zu heute wenn es der initiale Load ist
        if (isToday) {
          setTimeout(() => {
            flatListRef.current?.scrollToIndex({ index: 0, animated: true });
          }, 100);
        }
      }
    };

    fetchEntriesForDate();
  }, [selectedDate, user?.id]);

  // Ref für die FlatList
  const flatListRef = useRef<FlatList<JournalEntry>>(null);

  // Formatiere das Datum für die Anzeige
  const formatEntryDate = (dateString: string) => {
    const date = parseISO(dateString);

    if (isToday(date)) {
      return `Heute, ${format(date, "HH:mm")}`;
    } else if (isYesterday(date)) {
      return `Gestern, ${format(date, "HH:mm")}`;
    } else {
      return format(date, "dd. MMMM yyyy, HH:mm", { locale: de });
    }
  };

  // Erstelle einen neuen Eintrag
  const createNewEntry = (template?: JournalTemplate) => {
    try {
      // Wenn eine Vorlage ausgewählt wurde, öffne den Editor mit der Vorlage
      if (template) {
        navigation.navigate(
          "JournalEditor" as never,
          {
            templateId: template.id,
            date: selectedDate.toISOString(),
          } as never,
        );
      } else {
        // Andernfalls öffne einen leeren Editor
        navigation.navigate(
          "JournalEditor" as never,
          { date: selectedDate.toISOString() } as never,
        );
      }
    } catch (error) {
      console.error("Error navigating to editor:", error);
    }
  };

  // Öffne einen vorhandenen Eintrag
  const openEntry = (entry: JournalEntry) => {
    navigation.navigate(
      "JournalViewer" as never,
      { entryId: entry.id } as never,
    );
  };

  // Filtere Vorlagen nach Kategorie
  const filteredTemplates = useMemo(() => {
    if (!activeCategory) return templates;
    return templates.filter((template) => template.category === activeCategory);
  }, [templates, activeCategory]);

  // Rendere einen Tag-Chip
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

  // Rendere ein Mood-Rating
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

  // Rendere eine Vorlage
  const renderTemplate = ({ item }: { item: JournalTemplate }) => (
    <MotiView
      from={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "timing", duration: 300 }}
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

  // Rendere einen Tagebucheintrag
  const renderEntry = ({ item }: { item: JournalEntry }) => (
    <MotiView
      from={{ opacity: 0, translateX: -20 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{ type: "timing", duration: 300, delay: 100 }}
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

  // Rendere die Kategorieleiste
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

  // Rendere den Kalender-Strip
  const renderCalendarStrip = () => (
    <View style={styles.calendarContainer}>
      <CalendarStrip
        selectedDate={selectedDate}
        onDateSelected={setSelectedDate}
        startingDate={subDays(new Date(), 7)} // Nur 7 Tage zurück statt 14
        scrollToOnSetSelectedDate={true} // Scrollt automatisch zum ausgewählten Datum
        scrollerPaging={true} // Ermöglicht paging
        highlightColor={klareColors.k}
        dayTextStyle={{ color: theme.colors.text }}
        dateTextStyle={{ color: theme.colors.text }}
        highlightDateTextStyle={{ color: "white" }}
        highlightDateContainerStyle={{ backgroundColor: klareColors.k }}
        style={{height: 100}} // Etwas höher für bessere Sichtbarkeit
      />
    </View>
  );

  // Rendere den Inhalt basierend auf dem Zustand
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
            scrollEnabled={false}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.templatesList}
            showsVerticalScrollIndicator={false}
          />
        </>
      );
    }

    return (
      <>
        {renderCalendarStrip()}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {format(selectedDate, "EEEE, dd. MMMM yyyy", { locale: de })}
          </Text>
          <Button
            mode="text"
            onPress={() => setShowTemplateSelector(true)}
            labelStyle={{ color: klareColors.k }}
          >
            Vorlage wählen
          </Button>
        </View>

        {entriesForSelectedDate.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons
              name="book-outline"
              size={60}
              color={`${klareColors.k}50`}
            />
            <Text style={styles.emptyText}>
              Noch keine Einträge für diesen Tag
            </Text>
            <Button
              mode="contained"
              style={{ backgroundColor: klareColors.k, marginTop: 16 }}
              onPress={() => createNewEntry()}
            >
              Ersten Eintrag erstellen
            </Button>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={entriesForSelectedDate}
            renderItem={renderEntry}
            scrollEnabled={true}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.entriesList}
            showsVerticalScrollIndicator={false}
            initialScrollIndex={isToday(selectedDate) ? 0 : undefined}
            getItemLayout={(data, index) => (
              {length: 120, offset: 120 * index, index} // Feste Höhe für besseres Scrollverhalten
            )}
          />
        )}
      </>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Animated Header */}
      <Animated.View style={[styles.headerContainer, headerContainerStyle]}>
        <View style={styles.headerTop}>
          <Animated.Text style={[styles.headerTitle, headerTitleStyle]}>
            Klarheits-Tagebuch
          </Animated.Text>
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <IconButton
                icon="dots-vertical"
                size={24}
                onPress={() => setMenuVisible(true)}
                iconColor={theme.colors.text}
              />
            }
          >
            <Menu.Item
              onPress={() => {
                setMenuVisible(false);
                // Hier könnte eine Einstellungen-Navigation stattfinden
              }}
              title="Einstellungen"
              leadingIcon="cog"
            />
            <Menu.Item
              onPress={() => {
                setMenuVisible(false);
                // Hier könnte eine Exportfunktion implementiert werden
              }}
              title="Einträge exportieren"
              leadingIcon="export"
            />
            <Menu.Item
              onPress={() => {
                setMenuVisible(false);
                // Hier könnte eine Hilfe-Navigation stattfinden
              }}
              title="Hilfe"
              leadingIcon="help-circle"
            />
          </Menu>
        </View>

        <Animated.View style={[styles.headerContent, headerContentStyle]}>
          <Text style={styles.headerSlogan}>
            Tägliche Reflexion für mehr Klarheit und Kongruenz
          </Text>
          <Searchbar
            placeholder="Tagebucheinträge durchsuchen"
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
          />
        </Animated.View>
      </Animated.View>

      {/* Main Content */}
      <AnimatedScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[klareColors.k]}
            tintColor={klareColors.k}
          />
        }
      >
        {renderContent()}
      </AnimatedScrollView>

      {/* FAB für neuen Eintrag */}
      <FAB
        style={[styles.fab, { backgroundColor: klareColors.k }]}
        icon="pencil-plus"
        color="white"
        onPress={() => createNewEntry()}
      />
    </SafeAreaView>
  );
}
