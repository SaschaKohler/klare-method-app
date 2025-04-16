// src/screens/resources/EditResource.tsx
import { type } from "@testing-library/react-native/build/user-event/type";
import React, { useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Chip, TextInput, useTheme } from "react-native-paper";
import createStyles from "../../constants/createStyles";
import {
  darkKlareColors,
  klareColors,
  lightKlareColors,
} from "../../constants/theme";
import { ResourceCategory } from "../../services/ResourceLibraryService";
import { useThemeStore } from "../../store";
import { useResourceStore } from "../../store/useResourceStore";
import { useUserStore } from "../../store/useUserStore";

const KLARE_STAGES = [
  "Klarheit",
  "Lebendigkeit",
  "Ausrichtung",
  "Realisierung",
  "Entfaltung",
];

const RESOURCE_TYPES = [
  "Audio",
  "Video",
  "Übung",
  "Meditation",
  "Artikel",
  "Buch",
];

// Type for resource finder questions
interface ResourceQuestion {
  id: string;
  question: string;
  helpText?: string;
  category: ResourceCategory;
}

// Fixed set of precise questions for resource discovery
const RESOURCE_QUESTIONS: ResourceQuestion[] = [
  {
    id: "activity_energy",
    question: "Welche Aktivität gibt dir sofort mehr Energie?",
    helpText: "Denke an Tätigkeiten, nach denen du dich lebendiger fühlst.",
    category: ResourceCategory.ACTIVITY,
  },
  {
    id: "personal_strength",
    question: "Welche persönliche Stärke wird von anderen an dir geschätzt?",
    helpText:
      "Eine Fähigkeit oder Eigenschaft, die andere an dir bemerken und schätzen.",
    category: ResourceCategory.PERSONAL_STRENGTH,
  },
  {
    id: "relationship_support",
    question: "Welche Beziehung gibt dir Halt und Unterstützung?",
    helpText: "Eine Person oder Gruppe, die dich stärkt und unterstützt.",
    category: ResourceCategory.RELATIONSHIP,
  },
  {
    id: "place_recharge",
    question: "An welchem Ort kannst du am besten auftanken?",
    helpText:
      "Ein physischer Ort, an dem du dich besonders wohl und lebendig fühlst.",
    category: ResourceCategory.PLACE,
  },
  {
    id: "memory_strength",
    question: "Welche Erinnerung gibt dir Kraft in schwierigen Zeiten?",
    helpText:
      "Ein Erlebnis, das dir Mut, Freude oder Stärke gibt, wenn du daran denkst.",
    category: ResourceCategory.MEMORY,
  },
];

const EditResource = ({ route, navigation }) => {
  const { resource } = route.params;
  const { user } = useUserStore();
  const { updateResource } = useResourceStore();

  const [name, setName] = useState(resource.name);
  const [description, setDescription] = useState(resource.description || "");

  // Theme handling
  const theme = useTheme();
  const { getActiveTheme } = useThemeStore();
  const isDarkMode = getActiveTheme();
  const klareColors = isDarkMode ? darkKlareColors : lightKlareColors;

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [resourceName, setResourceName] = useState("");
  const [resourceDescription, setResourceDescription] = useState("");
  const [resourceCategory, setResourceCategory] = useState<ResourceCategory>(
    ResourceCategory.ACTIVITY,
  );
  const [resourceRating, setResourceRating] = useState(7);
  const [resourceTips, setResourceTips] = useState("");
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);

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
  const handleSave = async () => {
    if (user?.id) {
      await updateResource(user.id, resource.id, {
        name,
        description,
      });
      navigation.goBack();
    }
  };

  return (
    <ScrollView style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.questionsScroll}
      >
        {RESOURCE_QUESTIONS.map((question, index) => (
          <Chip
            key={question.id}
            selected={selectedQuestionIndex === index}
            onPress={() => setSelectedQuestionIndex(index)}
            style={[
              styles.questionChip,
              selectedQuestionIndex === index && {
                backgroundColor: `${klareColors.textSecondary}20`,
              },
              answers[question.id] ? styles.answeredChip : {},
            ]}
            textStyle={
              selectedQuestionIndex === index ? { color: klareColors.text } : {}
            }
          >
            {getCategoryLabel(question.category)}
            {answers[question.id] ? " ✓" : ""}
          </Chip>
        ))}
      </ScrollView>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          style={styles.input}
          placeholder="Ressourcen-Name"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Beschreibung</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          style={[styles.input, styles.multilineInput]}
          multiline
          numberOfLines={4}
          placeholder="Beschreibe die Ressource"
        />
      </View>

      {/* <View style={styles.inputContainer}> */}
      {/*   <Text style={styles.label}>URL</Text> */}
      {/*   <TextInput */}
      {/*     value={url} */}
      {/*     onChangeText={setUrl} */}
      {/*     style={styles.input} */}
      {/*     placeholder="Link zur Ressource" */}
      {/*   /> */}
      {/* </View> */}

      {/* <View style={styles.inputContainer}> */}
      {/*   <Text style={styles.label}>Ressourcentyp</Text> */}
      {/*   <View style={styles.pickerContainer}> */}
      {/*     <Picker */}
      {/*       selectedValue={type} */}
      {/*       onValueChange={(itemValue) => setType(itemValue)} */}
      {/*       style={styles.picker} */}
      {/*     > */}
      {/*       <Picker.Item label="Typ wählen" value="" /> */}
      {/*       {RESOURCE_TYPES.map((resourceType) => ( */}
      {/*         <Picker.Item */}
      {/*           key={resourceType} */}
      {/*           label={resourceType} */}
      {/*           value={resourceType} */}
      {/*         /> */}
      {/*       ))} */}
      {/*     </Picker> */}
      {/*   </View> */}
      {/* </View> */}

      {/* <View style={styles.inputContainer}> */}
      {/*   <Text style={styles.label}>KLARE-Phase</Text> */}
      {/*   <View style={styles.pickerContainer}> */}
      {/*     <Picker */}
      {/*       selectedValue={stage} */}
      {/*       onValueChange={(itemValue) => setStage(itemValue)} */}
      {/*       style={styles.picker} */}
      {/*     > */}
      {/*       <Picker.Item label="Phase wählen" value="" /> */}
      {/*       {KLARE_STAGES.map((stageOption) => ( */}
      {/*         <Picker.Item */}
      {/*           key={stageOption} */}
      {/*           label={stageOption} */}
      {/*           value={stageOption} */}
      {/*         /> */}
      {/*       ))} */}
      {/*     </Picker> */}
      {/*   </View> */}
      {/* </View> */}

      {/* <View style={styles.inputContainer}> */}
      {/*   <Text style={styles.label}>Dauer (Minuten)</Text> */}
      {/*   <TextInput */}
      {/*     value={duration} */}
      {/*     onChangeText={setDuration} */}
      {/*     style={styles.input} */}
      {/*     keyboardType="numeric" */}
      {/*     placeholder="Dauer in Minuten" */}
      {/*   /> */}
      {/* </View> */}

      {/* <View style={styles.inputContainer}> */}
      {/*   <Text style={styles.label}>Tags (kommagetrennt)</Text> */}
      {/*   <TextInput */}
      {/*     value={tags} */}
      {/*     onChangeText={setTags} */}
      {/*     style={styles.input} */}
      {/*     placeholder="Kommagetrennte Tags" */}
      {/*   /> */}
      {/* </View> */}

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Speichern</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    marginTop: 8,
    marginBottom: 8,
    fontSize: 18,
    fontWeight: "bold",
  },
  questionChip: {
    marginRight: 8,
    paddingVertical: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    padding: 0,
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
    fontSize: 16,
  },
  multilineInput: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 12,
    minHeight: 120,
    backgroundColor: "#f9f9f9",
    textAlignVertical: "top",
    fontSize: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
  },
  picker: {
    height: 50,
    width: "100%",
  },
  saveButton: {
    backgroundColor: "#007bff",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
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
    maxWidth: "80%",
  },
});

export default EditResource;
