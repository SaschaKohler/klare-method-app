// src/screens/JournalScreen.tsx
import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Dimensions,
  Platform,
} from "react-native";
import {
  Text,
  Card,
  Title,
  Button,
  Divider,
  Searchbar,
  Chip,
  IconButton,
  Menu,
  FAB,
  useTheme,
  ActivityIndicator,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { format, isToday, isYesterday, parseISO, subDays } from "date-fns";
import { de } from "date-fns/locale";
import { MotiView } from "moti";
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { supabase } from "../lib/supabase";
import { lightKlareColors, darkKlareColors } from "../constants/theme";
import { useUserStore } from "../store/useUserStore";
import { useThemeStore } from "../store/useThemeStore";
import createStyles from "../constants/createStyles";
import CalendarStrip from "../components/CalendarStrip";
import { createJournalStyles } from "../constants/journalStyles";

const { width } = Dimensions.get("window");

// Typen für Tagebucheinträge
type JournalEntry = {
  id: string;
  entry_date: string;
  entry_content: string;
  tags: string[];
  mood_rating: number;
  clarity_rating: number;
  category: string;
  is_favorite: boolean;
  created_at: string;
};

// Typen für Vorlagen
type JournalTemplate = {
  id: string;
  title: string;
  description: string;
  prompt_questions: string[];
  category: string;
  order_index: number;
};

// Typen für Kategorien
type JournalTemplateCategory = {
  id: string;
  name: string;
  description: string;
  icon: string;
  order_index: number;
};

export default function JournalScreen() {
  const navigation = useNavigation();
  const user = useUserStore((state) => state.user);
  const scrollY = useSharedValue(0);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [menuVisible, setMenuVisible] = useState(false);
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [templates, setTemplates] = useState<JournalTemplate[]>([]);
  const [categories, setCategories] = useState<JournalTemplateCategory[]>([]);
  const [selectedTemplate, setSelectedTemplate] =
    useState<JournalTemplate | null>(null);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);

  // Theme handling
  const theme = useTheme();
  const { getActiveTheme } = useThemeStore();
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

  // Lade Tagebucheinträge
  const fetchEntries = async () => {
    try {
      setLoading(true);

      // Formatiere das Datum für die Datenbank-Abfrage (YYYY-MM-DD)
      const formattedDate = format(selectedDate, "yyyy-MM-dd");

      // Hole Einträge für den ausgewählten Tag
      const { data, error } = await supabase
        .from("user_journal_entries")
        .select("*")
        .eq("user_id", user?.id)
        .gte("entry_date", `${formattedDate}T00:00:00`)
        .lt("entry_date", `${formattedDate}T23:59:59`)
        .order("entry_date", { ascending: false });

      if (error) throw error;

      setEntries(data || []);
    } catch (error) {
      console.error("Error fetching journal entries:", error);
      // Hier könnte eine Fehlerbehandlung stattfinden
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Lade Vorlagen und Kategorien
  const fetchTemplates = async () => {
    try {
      // Vorlagen laden
      const { data: templateData, error: templateError } = await supabase
        .from("journal_templates")
        .select("*")
        .order("order_index", { ascending: true });

      if (templateError) throw templateError;

      setTemplates(templateData || []);

      // Kategorien laden
      const { data: categoryData, error: categoryError } = await supabase
        .from("journal_template_categories")
        .select("*")
        .order("order_index", { ascending: true });

      if (categoryError) throw categoryError;

      setCategories(categoryData || []);
    } catch (error) {
      console.error("Error fetching templates:", error);
    }
  };

  // Lade Daten beim Öffnen des Screens
  useFocusEffect(
    React.useCallback(() => {
      fetchEntries();
      fetchTemplates();
    }, [selectedDate, user?.id]),
  );

  // Refresh-Funktion
  const onRefresh = () => {
    setRefreshing(true);
    fetchEntries();
  };

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
  const createNewEntry = async (template?: JournalTemplate) => {
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
              {item.prompt_questions.slice(0, 2).map((question, index) => (
                <Text
                  key={index}
                  style={styles.templateQuestion}
                  numberOfLines={1}
                >
                  • {question}
                </Text>
              ))}
              {item.prompt_questions.length > 2 && (
                <Text style={styles.templateQuestionMore}>
                  +{item.prompt_questions.length - 2} weitere Fragen
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
                {formatEntryDate(item.entry_date)}
              </Text>
              {item.is_favorite && (
                <Ionicons name="star" size={16} color={klareColors.r} />
              )}
            </View>
            <Text style={styles.entryContent} numberOfLines={3}>
              {item.entry_content}
            </Text>

            {item.tags && item.tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {item.tags.map((tag, index) => renderTagChip(tag, index))}
              </View>
            )}

            <View style={styles.entryFooter}>
              {item.mood_rating && renderMoodRating(item.mood_rating)}
              {item.clarity_rating && (
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
                    {item.clarity_rating}/10
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
    </ScrollView>
  );

  // Rendere den Kalender-Strip
  const renderCalendarStrip = () => (
    <View style={styles.calendarContainer}>
      <CalendarStrip
        selectedDate={selectedDate}
        onDateSelected={setSelectedDate}
        startingDate={subDays(new Date(), 14)}
        highlightColor={klareColors.k}
        dayTextStyle={{ color: theme.colors.text }}
        dateTextStyle={{ color: theme.colors.text }}
        highlightDateTextStyle={{ color: "white" }}
        highlightDateContainerStyle={{ backgroundColor: klareColors.k }}
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

        {entries.length === 0 ? (
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
            data={entries}
            renderItem={renderEntry}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.entriesList}
            showsVerticalScrollIndicator={false}
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
