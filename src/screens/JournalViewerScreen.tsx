// src/screens/JournalViewerScreen.tsx
import React, { useState, useEffect, useMemo } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Share,
  Alert,
  Platform,
  TouchableOpacity,
} from "react-native";
import {
  Text,
  Appbar,
  Chip,
  Divider,
  Button,
  useTheme,
  Surface,
  ActivityIndicator,
  IconButton,
  Menu,
  Dialog,
  Portal,
  FAB,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { MotiView, MotiText } from "moti";
import { format, parseISO } from "date-fns";
import { de, he } from "date-fns/locale";
import { supabase } from "../lib/supabase";
import { lightKlareColors, darkKlareColors } from "../constants/theme";
import { useThemeStore } from "../store/useThemeStore";
import createStyles from "../constants/createStyles";
import Markdown from "react-native-markdown-display";

// Types for journal entries
type JournalEntry = {
  id: string;
  entry_date: string;
  entry_content: string;
  tags: string[];
  mood_rating?: number;
  clarity_rating?: number;
  category?: string;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
};

export default function JournalViewerScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { entryId } = route.params || {};

  const [isLoading, setIsLoading] = useState(true);
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Theme handling
  const theme = useTheme();
  const { getActiveTheme } = useThemeStore();
  const isDarkMode = getActiveTheme();
  const klareColors = isDarkMode ? darkKlareColors : lightKlareColors;
  const styles = useMemo(
    () => createJournalViewerStyles(theme, klareColors),
    [theme, klareColors],
  );

  const getColorForCategory = (category: string) => {
    const firstLetter = category.toLowerCase()[0];
    const colorKey = ["k", "l", "a", "r", "e"].includes(firstLetter)
      ? firstLetter
      : "k"; // default to 'k' if no match

    return {
      background: `${klareColors[colorKey]}15`,
      text: klareColors[colorKey],
    };
  };

  // Load entry data
  useEffect(() => {
    const fetchEntry = async () => {
      if (!entryId) {
        navigation.goBack();
        return;
      }

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("user_journal_entries")
          .select("*")
          .eq("id", entryId)
          .single();

        if (error) throw error;

        if (data) {
          setEntry(data);
        } else {
          Alert.alert("Fehler", "Eintrag nicht gefunden");
          navigation.goBack();
        }
      } catch (error) {
        console.error("Error loading journal entry:", error);
        Alert.alert("Fehler", "Eintrag konnte nicht geladen werden");
        navigation.goBack();
      } finally {
        setIsLoading(false);
      }
    };

    fetchEntry();
  }, [entryId, navigation]);

  // Format date for display
  const formatEntryDate = (dateString: string) => {
    const date = parseISO(dateString);
    return format(date, "EEEE, dd. MMMM yyyy, HH:mm", { locale: de });
  };

  // Share entry
  const shareEntry = async () => {
    if (!entry) return;

    try {
      const formattedDate = formatEntryDate(entry.entry_date);
      const moodRating = entry.mood_rating
        ? `Stimmung: ${entry.mood_rating}/10\n`
        : "";
      const clarityRating = entry.clarity_rating
        ? `Klarheit: ${entry.clarity_rating}/10\n`
        : "";
      const tags =
        entry.tags.length > 0 ? `Tags: ${entry.tags.join(", ")}\n` : "";

      const shareContent = `KLARE Tagebucheintrag vom ${formattedDate}\n\n${tags}${moodRating}${clarityRating}\n${entry.entry_content}`;

      await Share.share({
        message: shareContent,
        title: `Tagebucheintrag vom ${formattedDate.split(",")[0]}`,
      });
    } catch (error) {
      console.error("Error sharing entry:", error);
    }
  };

  // Edit entry
  const editEntry = () => {
    navigation.navigate(
      "JournalEditor" as never,
      { entryId: entry?.id } as never,
    );
  };

  // Delete entry
  const deleteEntry = async () => {
    if (!entry) return;

    try {
      setIsDeleting(true);
      const { error } = await supabase
        .from("user_journal_entries")
        .delete()
        .eq("id", entry.id);

      if (error) throw error;

      setDeleteDialogVisible(false);
      navigation.goBack();
    } catch (error) {
      console.error("Error deleting entry:", error);
      Alert.alert("Fehler", "Eintrag konnte nicht gelöscht werden");
    } finally {
      setIsDeleting(false);
    }
  };

  // Toggle favorite status
  const toggleFavorite = async () => {
    if (!entry) return;

    try {
      const updatedFavoriteStatus = !entry.is_favorite;

      const { error } = await supabase
        .from("user_journal_entries")
        .update({ is_favorite: updatedFavoriteStatus })
        .eq("id", entry.id);

      if (error) throw error;

      setEntry({
        ...entry,
        is_favorite: updatedFavoriteStatus,
      });
    } catch (error) {
      console.error("Error updating favorite status:", error);
    }
  };

  // Render tags
  const renderTags = () => {
    if (!entry?.tags || entry.tags.length === 0) return null;

    return (
      <MotiView
        from={{ opacity: 0, translateY: 10 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 400, delay: 200 }}
      >
        <View style={styles.tagsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {entry.tags.map((tag, index) => (
              <Chip
                key={`${tag}-${index}`}
                style={[
                  styles.tagChip,
                  {
                    backgroundColor: getColorForCategory(entry.category)
                      .background,
                  },
                ]}
                textStyle={{ color: getColorForCategory(entry.category).text }}
              >
                {tag}
              </Chip>
            ))}
          </ScrollView>
        </View>
      </MotiView>
    );
  };

  // Render mood and clarity ratings
  const renderRatings = () => {
    if (!entry?.mood_rating && !entry?.clarity_rating) return null;

    return (
      <MotiView
        from={{ opacity: 0, translateY: 10 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 400, delay: 300 }}
      >
        <Surface style={styles.ratingsCard}>
          {entry.mood_rating && (
            <View style={styles.ratingContainer}>
              <View style={styles.ratingHeader}>
                <Ionicons
                  name={
                    entry.mood_rating >= 7
                      ? "happy-outline"
                      : entry.mood_rating >= 4
                        ? "happy-outline"
                        : "sad-outline"
                  }
                  size={24}
                  color={klareColors.k}
                />
                <Text
                  style={[styles.ratingTitle, { color: theme.colors.text }]}
                >
                  Stimmung
                </Text>
              </View>
              <View style={styles.ratingBarContainer}>
                <View
                  style={[
                    styles.ratingBar,
                    { backgroundColor: `${klareColors.k}30` },
                  ]}
                >
                  <View
                    style={[
                      styles.ratingBarFill,
                      {
                        width: `${(entry.mood_rating / 10) * 100}%`,
                        backgroundColor: klareColors.k,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.ratingValue, { color: klareColors.k }]}>
                  {entry.mood_rating}/10
                </Text>
              </View>
            </View>
          )}

          {entry.clarity_rating && (
            <View style={styles.ratingContainer}>
              <View style={styles.ratingHeader}>
                <Ionicons name="bulb-outline" size={24} color={klareColors.k} />
                <Text
                  style={[styles.ratingTitle, { color: theme.colors.text }]}
                >
                  Klarheit
                </Text>
              </View>
              <View style={styles.ratingBarContainer}>
                <View
                  style={[
                    styles.ratingBar,
                    { backgroundColor: `${klareColors.k}30` },
                  ]}
                >
                  <View
                    style={[
                      styles.ratingBarFill,
                      {
                        width: `${(entry.clarity_rating / 10) * 100}%`,
                        backgroundColor: klareColors.k,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.ratingValue, { color: klareColors.k }]}>
                  {entry.clarity_rating}/10
                </Text>
              </View>
            </View>
          )}
        </Surface>
      </MotiView>
    );
  };

  // Delete confirmation dialog
  const renderDeleteDialog = () => (
    <Portal>
      <Dialog
        visible={deleteDialogVisible}
        onDismiss={() => setDeleteDialogVisible(false)}
        style={{ backgroundColor: theme.colors.surface }}
      >
        <Dialog.Title>Eintrag löschen</Dialog.Title>
        <Dialog.Content>
          <Text style={{ color: theme.colors.text }}>
            Möchtest Du diesen Tagebucheintrag wirklich löschen? Diese Aktion
            kann nicht rückgängig gemacht werden.
          </Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setDeleteDialogVisible(false)}>
            Abbrechen
          </Button>
          <Button
            onPress={deleteEntry}
            textColor={theme.colors.error}
            loading={isDeleting}
            disabled={isDeleting}
          >
            Löschen
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={klareColors.k} />
      </View>
    );
  }

  if (!entry) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text style={{ color: theme.colors.text }}>Eintrag nicht gefunden</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header style={{ backgroundColor: theme.colors.surface }}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content
          title="Tagebucheintrag"
          subtitle={formatEntryDate(entry.entry_date)}
        />
        <Appbar.Action
          icon={entry.is_favorite ? "star" : "star-outline"}
          color={entry.is_favorite ? klareColors.r : theme.colors.text}
          onPress={toggleFavorite}
        />
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <Appbar.Action
              icon="dots-vertical"
              onPress={() => setMenuVisible(true)}
            />
          }
        >
          <Menu.Item
            onPress={() => {
              setMenuVisible(false);
              editEntry();
            }}
            title="Bearbeiten"
            leadingIcon="pencil"
          />
          <Menu.Item
            onPress={() => {
              setMenuVisible(false);
              shareEntry();
            }}
            title="Teilen"
            leadingIcon="share"
          />
          <Divider />
          <Menu.Item
            onPress={() => {
              setMenuVisible(false);
              setDeleteDialogVisible(true);
            }}
            title="Löschen"
            leadingIcon="delete"
          />
        </Menu>
      </Appbar.Header>

      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={styles.contentContainer}
      >
        <MotiView
          from={{ opacity: 0, translateY: -20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 500 }}
        >
          {entry.category && (
            <Chip
              style={[
                styles.categoryChip,
                {
                  backgroundColor: getColorForCategory(entry.category)
                    .background,
                },
              ]}
              textStyle={{
                color: getColorForCategory(entry.category).text,
              }}
            >
              {entry.category}
            </Chip>
          )}

          <View style={styles.dateContainer}>
            <Text
              style={[styles.dateText, { color: klareColors.textSecondary }]}
            >
              {formatEntryDate(entry.entry_date)}
            </Text>
            {entry.is_favorite && (
              <Ionicons name="star" size={16} color={klareColors.r} />
            )}
          </View>
        </MotiView>

        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: "timing", duration: 600, delay: 100 }}
          style={styles.contentTextContainer}
        >
          <Markdown
            style={{
              body: { color: theme.colors.text, fontSize: 16, lineHeight: 24 },
              heading1: {
                color: theme.colors.text,
                fontSize: 24,
                marginVertical: 12,
              },
              heading2: {
                color: theme.colors.text as string,
                fontSize: 20,
                marginVertical: 10,
              },
              heading3: {
                color: theme.colors.text,
                fontSize: 18,
                marginVertical: 8,
              },
              paragraph: { marginBottom: 16 },
              strong: { fontWeight: "bold" },
              em: { fontStyle: "italic" },
              blockquote: {
                backgroundColor: `${klareColors.k}10`,
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderLeftWidth: 4,
                borderLeftColor: klareColors.k,
                marginVertical: 8,
              },
              bullet_list: { marginVertical: 8 },
              ordered_list: { marginVertical: 8 },
              list_item: { marginBottom: 4, flexDirection: "row" },
              hr: {
                backgroundColor: theme.colors.disabled,
                height: 1,
                marginVertical: 16,
              },
            }}
          >
            {entry.entry_content}
          </Markdown>
        </MotiView>

        {renderTags()}

        {renderRatings()}

        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 400, delay: 400 }}
          style={styles.metadataContainer}
        >
          <Text
            style={[styles.metadataText, { color: klareColors.textSecondary }]}
          >
            Erstellt: {format(parseISO(entry.created_at), "dd.MM.yyyy, HH:mm")}
          </Text>
          {entry.updated_at && entry.updated_at !== entry.created_at && (
            <Text
              style={[
                styles.metadataText,
                { color: klareColors.textSecondary },
              ]}
            >
              Zuletzt bearbeitet:{" "}
              {format(parseISO(entry.updated_at), "dd.MM.yyyy, HH:mm")}
            </Text>
          )}
        </MotiView>
      </ScrollView>

      <FAB
        style={[styles.fab, { backgroundColor: klareColors.k }]}
        icon="pencil"
        color="#FFFFFF"
        onPress={editEntry}
      />

      {renderDeleteDialog()}
    </SafeAreaView>
  );
}

// Styles for JournalViewerScreen
const createJournalViewerStyles = (theme: any, klareColors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    loadingContainer: {
      justifyContent: "center",
      alignItems: "center",
    },
    scrollContent: {
      flex: 1,
    },
    contentContainer: {
      padding: 16,
      paddingBottom: 80,
    },
    categoryChip: {
      alignSelf: "flex-start",
      marginBottom: 8,
    },
    dateContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 16,
    },
    dateText: {
      fontSize: 14,
    },
    contentTextContainer: {
      marginBottom: 24,
    },
    tagsContainer: {
      marginBottom: 24,
    },
    tagChip: {
      marginRight: 8,
      marginBottom: 8,
    },
    ratingsCard: {
      padding: 16,
      borderRadius: 12,
      marginBottom: 24,
      backgroundColor: theme.colors.surface,
      elevation: 1,
    },
    ratingContainer: {
      marginBottom: 12,
    },
    ratingHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },
    ratingTitle: {
      fontSize: 16,
      fontWeight: "500",
      marginLeft: 8,
    },
    ratingBarContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    ratingBar: {
      flex: 1,
      height: 8,
      borderRadius: 4,
      overflow: "hidden",
    },
    ratingBarFill: {
      height: "100%",
      borderRadius: 4,
    },
    ratingValue: {
      marginLeft: 8,
      fontSize: 14,
      fontWeight: "bold",
    },
    metadataContainer: {
      marginTop: 8,
    },
    metadataText: {
      fontSize: 12,
      marginBottom: 4,
    },
    fab: {
      position: "absolute",
      margin: 16,
      right: 0,
      bottom: 0,
    },
  });
