// src/screens/JournalEditorScreen.tsx
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { useNavigation, useRoute } from "@react-navigation/native";
import { format, parseISO } from "date-fns";
import { de, enUS } from "date-fns/locale";
import { MotiView } from "moti";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import {
  ActivityIndicator,
  Appbar,
  Button,
  Chip,
  Dialog,
  Divider,
  IconButton,
  Menu,
  Portal,
  Surface,
  Text,
  useTheme,
} from "react-native-paper";
import { useTranslation } from "react-i18next";
import { createJournalEditorStyles } from "../constants/journalEditorStyles";
import { darkKlareColors, lightKlareColors } from "../constants/theme";
import { useKlareStores } from "../hooks";
import { supabase } from "../lib/supabase";
import { journalService } from "../services/JournalService";
import { useUserStore } from "../store/useUserStore";

// Typen für Tagebucheinträge
type JournalEntry = {
  id?: string;
  entry_date: string;
  entry_content: string;
  tags: string[];
  mood_rating?: number;
  clarity_rating?: number;
  category?: string;
  is_favorite?: boolean;
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

export default function JournalEditorScreen() {
  const { t, i18n } = useTranslation(["journal", "journalEditor"]);
  const navigation = useNavigation();
  const route = useRoute();
  const { entryId, templateId, date } = route.params || {};
  
  // Get date locale based on current language
  const dateLocale = i18n.language === "de" ? de : enUS;

  const klareStore = useKlareStores();
  const user = useUserStore((state) => state.user);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [discardDialogVisible, setDiscardDialogVisible] = useState(false);
  const [moodMenuVisible, setMoodMenuVisible] = useState(false);
  const [tagMenuVisible, setTagMenuVisible] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [entryChanged, setEntryChanged] = useState(false);

  // Entry state
  const [entry, setEntry] = useState<JournalEntry>({
    entry_date: date || new Date().toISOString(),
    entry_content: "",
    tags: [],
    mood_rating: 5,
    clarity_rating: 5,
    category: "general",
    is_favorite: false,
  });

  // Template state
  const [template, setTemplate] = useState<JournalTemplate | null>(null);
  const [usingTemplate, setUsingTemplate] = useState(false);

  // Theme handling
  const theme = useTheme();
  const isDarkMode = klareStore.theme.isDarkMode;
  const klareColors = isDarkMode ? darkKlareColors : lightKlareColors;
  const styles = useMemo(
    () => createJournalEditorStyles(theme, klareColors, isDarkMode),
    [theme, klareColors, isDarkMode],
  );

  // Reference zum TextInput für Autofokus
  const contentInputRef = useRef<TextInput>(null);

  // Lade einen bestehenden Eintrag oder eine Vorlage
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);

      if (entryId) {
        // Lade einen bestehenden Eintrag
        try {
          const existingEntry = await journalService.getUserEntries(user.id)
            .then(entries => entries.find(e => e.id === entryId));
          if (existingEntry) {
            setEntry({
              id: existingEntry.id,
              entry_date: existingEntry.entryDate,
              entry_content: existingEntry.entryContent,
              tags: existingEntry.tags || [],
              mood_rating: existingEntry.moodRating || 5,
              clarity_rating: existingEntry.clarityRating || 5,
              category: existingEntry.category || "general",
              is_favorite: existingEntry.isFavorite || false,
            });
          }
        } catch (error) {
          console.error("Error loading journal entry:", error);
        }
      } else if (templateId) {
        // Lade eine Vorlage
        try {
          const templates = await journalService.getTemplates(i18n.language);
          const template = templates.find(t => t.id === templateId);
          
          if (template) {
            setTemplate({
              id: template.id,
              title: template.title,
              description: template.description || '',
              prompt_questions: template.promptQuestions,
              category: template.category || 'general',
              order_index: template.orderIndex
            });
            setUsingTemplate(true);

            // Bereite den Inhalt vor, indem die Fragen als Überschriften eingefügt werden
            const content = template.promptQuestions
              .map((q) => `### ${q}\n\n`)
              .join("\n");

            setEntry({
              ...entry,
              entry_content: content,
              category: template.category,
            });
          }
        } catch (error) {
          console.error("Error loading template:", error);
        }
      }

      setIsLoading(false);
    };

    loadData();
  }, [entryId, templateId]);

  // Autofokus auf das TextInput
  useEffect(() => {
    if (!isLoading && contentInputRef.current) {
      const timer = setTimeout(() => {
        contentInputRef.current?.focus();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  // Aktualisiere den Entry-Status bei Änderungen
  useEffect(() => {
    setEntryChanged(true);
  }, [
    entry.entry_content,
    entry.tags,
    entry.mood_rating,
    entry.clarity_rating,
  ]);

  // Formatiere das Datum für die Anzeige
  const formatEntryDate = (dateString: string) => {
    const date =
      typeof dateString === "string" ? parseISO(dateString) : dateString;
    return format(date, "EEEE, dd. MMMM yyyy", { locale: dateLocale });
  };

  // Speichern eines Eintrags
  const saveEntry = async () => {
    try {
      // Validate input
      if (!entry.entry_content?.trim()) {
        Alert.alert(
          t("editor.contentMissing", { ns: "journalEditor", defaultValue: "Content Missing" }),
          t("editor.contentMissingMessage", { ns: "journalEditor", defaultValue: "Please enter a journal entry" })
        );
        return;
      }

      if (!user?.id) {
        Alert.alert(
          t("editor.userError", { ns: "journalEditor", defaultValue: "User Error" }),
          t("editor.userErrorMessage", { ns: "journalEditor", defaultValue: "No user ID found" })
        );
        return;
      }

      setIsSaving(true);

      // Prepare data with fallbacks
      const entryData = {
        id: entry.id || undefined, // undefined for new entries
        entryContent: entry.entry_content.trim(),
        entryDate: entry.entry_date || new Date().toISOString(),
        tags: entry.tags || [],
        moodRating: entry.mood_rating ?? 5,
        clarityRating: entry.clarity_rating ?? 5,
        category: entry.category || "general",
        isFavorite: entry.is_favorite || false,
      };

      // Save operation
      let result;
      if (entry.id) {
        result = await journalService.updateEntry(user.id, entry.id, entryData);
      } else {
        result = await journalService.addEntry(user.id, entryData);
        if (result?.id) {
          setEntry(prev => ({...prev, id: result.id}));
        }
      }

      if (!result) {
        throw new Error("Speichervorgang gab keine Rückmeldung");
      }

      // Only navigate if save was successful
      setEntryChanged(false);
      navigation.goBack();
    } catch (error) {
      console.error("Journal save error details:", {
        error: error instanceof Error ? error.message : String(error),
        entryData,
        userId: user?.id,
        supabaseStatus: error?.status,
        supabaseCode: error?.code
      });

      let errorDetails = "";
      if (error?.message) {
        errorDetails = `\n\n${t("editor.technicalError", { ns: "journalEditor", defaultValue: "Technical error" })}: ${error.message}`;
      } else if (error?.code) {
        errorDetails = `\n\n${t("editor.errorCode", { ns: "journalEditor", defaultValue: "Error code" })}: ${error.code}`;
      }

      Alert.alert(
        t("editor.saveError", { ns: "journalEditor", defaultValue: "Save Failed" }),
        `${t("editor.saveErrorMessage", { ns: "journalEditor", defaultValue: "The entry could not be saved. Please check your internet connection and try again." })}${errorDetails}`
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Tag hinzufügen
  const addTag = (tag: string) => {
    if (tag.trim() !== "" && !entry.tags.includes(tag)) {
      setEntry({
        ...entry,
        tags: [...entry.tags, tag],
      });
      setNewTag("");
    }
  };

  // Tag entfernen
  const removeTag = (tag: string) => {
    setEntry({
      ...entry,
      tags: entry.tags.filter((t) => t !== tag),
    });
  };

  // Toggle Favorit-Status
  const toggleFavorite = () => {
    setEntry({
      ...entry,
      is_favorite: !entry.is_favorite,
    });
  };

  // Rendere die Tags
  const renderTags = () => (
    <View style={styles.tagsContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {entry.tags.map((tag, index) => (
          <Chip
            key={`${tag}-${index}`}
            style={[styles.tagChip, { backgroundColor: `${klareColors.k}15` }]}
            textStyle={{ color: klareColors.k }}
            onClose={() => removeTag(tag)}
            onPress={() => {}}
          >
            {tag}
          </Chip>
        ))}

        <Menu
          visible={tagMenuVisible}
          onDismiss={() => setTagMenuVisible(false)}
          anchor={
            <Chip
              icon="plus"
              style={styles.addTagChip}
              textStyle={{ color: klareColors.textSecondary }}
              onPress={() => setTagMenuVisible(true)}
            >
              {t("editor.addTag", { ns: "journalEditor", defaultValue: "Add Tag" })}
            </Chip>
          }
          contentStyle={styles.tagMenuContent}
        >
          <View style={styles.tagInputContainer}>
            <TextInput
              style={[styles.tagInput, { color: theme.colors.text }]}
              value={newTag}
              onChangeText={setNewTag}
              placeholder={t("editor.newTag", { ns: "journalEditor", defaultValue: "New Tag..." })}
              placeholderTextColor={klareColors.textSecondary}
              onSubmitEditing={() => {
                addTag(newTag);
                setTagMenuVisible(false);
              }}
            />
            <IconButton
              icon="check"
              size={20}
              iconColor={klareColors.k}
              onPress={() => {
                addTag(newTag);
                setTagMenuVisible(false);
              }}
            />
          </View>
          <Divider />
          <View style={styles.suggestedTagsContainer}>
            <Text
              style={[styles.suggestedTagsTitle, { color: theme.colors.text }]}
            >
              {t("editor.suggestions", { ns: "journalEditor", defaultValue: "Suggestions" })}
            </Text>
            <View style={styles.suggestedTags}>
              {[
                "Klarheit",
                "Lebendigkeit",
                "Ausrichtung",
                "Realisierung",
                "Entfaltung",
                "Kongruenz",
              ].map((tag) => (
                <Chip
                  key={tag}
                  style={[
                    styles.suggestedTag,
                    { backgroundColor: `${klareColors.k}15` },
                  ]}
                  textStyle={{ color: klareColors.k }}
                  onPress={() => {
                    addTag(tag);
                    setTagMenuVisible(false);
                  }}
                >
                  {tag}
                </Chip>
              ))}
            </View>
          </View>
        </Menu>
      </ScrollView>
    </View>
  );

  // Rendere den Stimmungs-Slider
  const renderMoodSlider = () => (
    <View style={styles.sliderContainer}>
      <View style={styles.sliderLabelContainer}>
        <Ionicons
          name="sad-outline"
          size={24}
          color={klareColors.textSecondary}
        />
        <Text style={[styles.moodValue, { color: theme.colors.text }]}>
          {entry.mood_rating}/10
        </Text>
        <Ionicons
          name="happy-outline"
          size={24}
          color={klareColors.textSecondary}
        />
      </View>
      <Slider
        style={styles.slider}
        minimumValue={1}
        maximumValue={10}
        step={1}
        value={entry.mood_rating}
        onValueChange={(value) => setEntry({ ...entry, mood_rating: value })}
        minimumTrackTintColor={klareColors.k}
        maximumTrackTintColor={`${klareColors.k}50`}
        thumbTintColor={klareColors.k}
      />
    </View>
  );

  // Rendere den Klarheits-Slider
  const renderClaritySlider = () => (
    <View style={styles.sliderContainer}>
      <View style={styles.sliderLabelContainer}>
        <Ionicons
          name="bulb-outline"
          size={24}
          color={klareColors.textSecondary}
        />
        <Text style={[styles.moodValue, { color: theme.colors.text }]}>
          {entry.clarity_rating}/10
        </Text>
        <Ionicons
          name="flash-outline"
          size={24}
          color={klareColors.textSecondary}
        />
      </View>
      <Slider
        style={styles.slider}
        minimumValue={1}
        maximumValue={10}
        step={1}
        value={entry.clarity_rating}
        onValueChange={(value) => setEntry({ ...entry, clarity_rating: value })}
        minimumTrackTintColor={klareColors.k}
        maximumTrackTintColor={`${klareColors.k}50`}
        thumbTintColor={klareColors.k}
      />
    </View>
  );

  // Rendere den Dialog zum Bestätigen des Verwerfens
  const renderDiscardDialog = () => (
    <Portal>
      <Dialog
        visible={discardDialogVisible}
        onDismiss={() => setDiscardDialogVisible(false)}
        style={{ backgroundColor: theme.colors.surface }}
      >
        <Dialog.Title>{t("editor.discardTitle", { ns: "journal", defaultValue: "Discard changes?" })}</Dialog.Title>
        <Dialog.Content>
          <Text style={{ color: theme.colors.text }}>
            {t("editor.discardMessage", { 
              ns: "journal", 
              defaultValue: "Do you really want to discard this entry? All unsaved changes will be lost."
            })}
          </Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setDiscardDialogVisible(false)}>
            {t("editor.cancel", { ns: "journal", defaultValue: "Cancel" })}
          </Button>
          <Button
            onPress={() => {
              setDiscardDialogVisible(false);
              navigation.goBack();
            }}
          >
            {t("editor.discard", { ns: "journal", defaultValue: "Discard" })}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );

  if (isLoading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={klareColors.k} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <Appbar.Header style={{ backgroundColor: theme.colors.surface }}>
        <Appbar.BackAction
          onPress={() => {
            if (entryChanged) {
              setDiscardDialogVisible(true);
            } else {
              navigation.goBack();
            }
          }}
        />
        <Appbar.Content
          title={entry.id ? t("editor.editEntry", { ns: "journal", defaultValue: "Edit Entry" }) : 
                           t("editor.newEntry", { ns: "journal", defaultValue: "New Entry" })}
          subtitle={formatEntryDate(entry.entry_date)}
        />
        <Appbar.Action
          icon={entry.is_favorite ? "star" : "star-outline"}
          color={entry.is_favorite ? klareColors.r : theme.colors.text}
          onPress={toggleFavorite}
        />
        <Appbar.Action
          icon="content-save"
          onPress={saveEntry}
          disabled={isSaving || entry.entry_content.trim() === ""}
        />
      </Appbar.Header>

      <ScrollView
        style={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {template && (
          <MotiView
            from={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ type: "timing", duration: 300 }}
          >
            <Surface style={styles.templateInfoContainer}>
              <View style={styles.templateHeader}>
                <Text style={styles.templateTitle}>{template.title}</Text>
                <IconButton
                  icon="close"
                  size={16}
                  onPress={() => setUsingTemplate(false)}
                />
              </View>
              <Text style={styles.templateDescription}>
                {template.description}
              </Text>
            </Surface>
          </MotiView>
        )}

        <TextInput
          ref={contentInputRef}
          style={[styles.contentInput, { color: theme.colors.text }]}
          multiline
          value={entry.entry_content}
          onChangeText={(text) => setEntry({ ...entry, entry_content: text })}
          placeholder={t("editor.startWriting", { ns: "journalEditor", defaultValue: "Start writing..." })}
          placeholderTextColor={klareColors.textSecondary}
          autoFocus={false}
        />

        <View style={styles.metadataContainer}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {t("editor.tags", { ns: "journalEditor", defaultValue: "Tags" })}
          </Text>
          {renderTags()}

          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {t("editor.moodRating", { ns: "journalEditor", defaultValue: "Mood Rating" })}
          </Text>
          {renderMoodSlider()}

          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {t("editor.clarityRating", { ns: "journalEditor", defaultValue: "Clarity Level" })}
          </Text>
          {renderClaritySlider()}
        </View>
      </ScrollView>

      {renderDiscardDialog()}

      {isSaving && (
        <View style={styles.savingOverlay}>
          <ActivityIndicator size="large" color={klareColors.k} />
        </View>
      )}
    </KeyboardAvoidingView>
  );
}
