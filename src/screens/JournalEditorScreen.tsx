// src/screens/JournalEditorScreen.tsx
import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  View,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  Text,
  Appbar,
  Chip,
  Divider,
  Button,
  IconButton,
  Portal,
  Dialog,
  Menu,
  Surface,
  useTheme,
  ActivityIndicator,
} from "react-native-paper";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { format, parseISO } from "date-fns";
import { de } from "date-fns/locale";
import Slider from "@react-native-community/slider";
import { supabase } from "../lib/supabase";
import { lightKlareColors, darkKlareColors } from "../constants/theme";
import { useUserStore } from "../store/useUserStore";
import { useThemeStore } from "../store/useThemeStore";
import { createJournalEditorStyles } from "../constants/journalEditorStyles";
import { useKlareStores } from "../hooks";

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
  const navigation = useNavigation();
  const route = useRoute();
  const { entryId, templateId, date } = route.params || {};

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
          const { data, error } = await supabase
            .from("user_journal_entries")
            .select("*")
            .eq("id", entryId)
            .single();

          if (error) throw error;

          if (data) {
            setEntry({
              id: data.id,
              entry_date: data.entry_date,
              entry_content: data.entry_content,
              tags: data.tags || [],
              mood_rating: data.mood_rating || 5,
              clarity_rating: data.clarity_rating || 5,
              category: data.category || "general",
              is_favorite: data.is_favorite || false,
            });
          }
        } catch (error) {
          console.error("Error loading journal entry:", error);
        }
      } else if (templateId) {
        // Lade eine Vorlage
        try {
          const { data, error } = await supabase
            .from("journal_templates")
            .select("*")
            .eq("id", templateId)
            .single();

          if (error) throw error;

          if (data) {
            setTemplate(data);
            setUsingTemplate(true);

            // Bereite den Inhalt vor, indem die Fragen als Überschriften eingefügt werden
            const content = data.prompt_questions
              .map((q) => `### ${q}\n\n`)
              .join("\n");

            setEntry({
              ...entry,
              entry_content: content,
              category: data.category,
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
    return format(date, "EEEE, dd. MMMM yyyy", { locale: de });
  };

  // Speichern eines Eintrags
  const saveEntry = async () => {
    if (entry.entry_content.trim() === "") {
      return; // Verhindere das Speichern leerer Einträge
    }

    setIsSaving(true);

    try {
      if (entry.id) {
        // Aktualisiere einen bestehenden Eintrag
        const { error } = await supabase
          .from("user_journal_entries")
          .update({
            entry_content: entry.entry_content,
            tags: entry.tags,
            mood_rating: entry.mood_rating,
            clarity_rating: entry.clarity_rating,
            category: entry.category,
            is_favorite: entry.is_favorite,
            updated_at: new Date().toISOString(),
          })
          .eq("id", entry.id);

        if (error) throw error;
      } else {
        // Erstelle einen neuen Eintrag
        const { error } = await supabase.from("user_journal_entries").insert({
          user_id: user?.id,
          entry_date: entry.entry_date,
          entry_content: entry.entry_content,
          tags: entry.tags,
          mood_rating: entry.mood_rating,
          clarity_rating: entry.clarity_rating,
          category: entry.category,
          is_favorite: entry.is_favorite,
        });

        if (error) throw error;
      }

      setEntryChanged(false);
      navigation.goBack();
    } catch (error) {
      console.error("Error saving journal entry:", error);
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
              Tag hinzufügen
            </Chip>
          }
          contentStyle={styles.tagMenuContent}
        >
          <View style={styles.tagInputContainer}>
            <TextInput
              style={[styles.tagInput, { color: theme.colors.text }]}
              value={newTag}
              onChangeText={setNewTag}
              placeholder="Neuer Tag..."
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
              Vorschläge
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

  // Dialog zum Bestätigen des Verwerfens
  const renderDiscardDialog = () => (
    <Portal>
      <Dialog
        visible={discardDialogVisible}
        onDismiss={() => setDiscardDialogVisible(false)}
        style={{ backgroundColor: theme.colors.surface }}
      >
        <Dialog.Title>Änderungen verwerfen?</Dialog.Title>
        <Dialog.Content>
          <Text style={{ color: theme.colors.text }}>
            Möchten Sie diesen Eintrag wirklich verwerfen? Alle ungespeicherten
            Änderungen gehen verloren.
          </Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setDiscardDialogVisible(false)}>
            Abbrechen
          </Button>
          <Button
            onPress={() => {
              setDiscardDialogVisible(false);
              navigation.goBack();
            }}
          >
            Verwerfen
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
          title={entry.id ? "Eintrag bearbeiten" : "Neuer Eintrag"}
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
          placeholder="Beginne zu schreiben..."
          placeholderTextColor={klareColors.textSecondary}
          autoFocus={false}
        />

        <View style={styles.metadataContainer}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Tags
          </Text>
          {renderTags()}

          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Stimmung
          </Text>
          {renderMoodSlider()}

          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Klarheits-Level
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
