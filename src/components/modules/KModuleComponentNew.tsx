// src/components/modules/KModuleComponentNew.tsx
// KLARE Schritt K (Klarheit) - Vollständige Transformationsreise
// 12 Phasen für ein umfassendes Transformationserlebnis

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { View, ScrollView, StyleSheet, Alert, TextInput } from "react-native";
import {
  Text,
  Button,
  Card,
  Chip,
  ProgressBar,
  useTheme,
  Surface,
  Divider,
  ActivityIndicator,
} from "react-native-paper";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import Markdown from "react-native-markdown-display";

import { ModuleContent, loadModuleContent } from "../../lib/contentService";
import { darkKlareColors, lightKlareColors } from "../../constants/theme";
import { useUserStore } from "../../store/useUserStore";
import { useProgressionStore } from "../../store/useProgressionStore";
import { useLifeWheelStore } from "../../store/useLifeWheelStore";
import useAIStore from "../../store/useAIStore";

import {
  KModuleAIService,
  AICoachResponse,
  MetaModelAnalysisResult,
} from "../../services/KModuleAIService";

interface KModuleComponentProps {
  module: ModuleContent;
  onComplete: () => void;
}

type KModulePhase =
  | "welcome"
  | "lifewheel_analysis"
  | "metamodel_intro"
  | "metamodel_level1"
  | "metamodel_level2"
  | "metamodel_level3"
  | "genius_gate"
  | "genius_gate_practice"
  | "incongruence_mapping"
  | "clarity_reflection"
  | "journal_setup"
  | "completion";

interface PhaseConfig {
  id: KModulePhase;
  title: string;
  description: string;
  icon: string;
  estimatedMinutes: number;
}

const PHASE_CONFIGS: PhaseConfig[] = [
  {
    id: "welcome",
    title: "Willkommen",
    description: "Einstimmung auf deine Klarheits-Reise",
    icon: "hand-wave",
    estimatedMinutes: 5,
  },
  {
    id: "lifewheel_analysis",
    title: "IST-Analyse",
    description: "Deine aktuelle Lebenssituation",
    icon: "analytics",
    estimatedMinutes: 15,
  },
  {
    id: "metamodel_intro",
    title: "Meta-Modell",
    description: "Einführung in präzise Kommunikation",
    icon: "chatbubbles",
    estimatedMinutes: 10,
  },
  {
    id: "metamodel_level1",
    title: "Level 1: Generalisierungen",
    description: "Universalquantoren erkennen",
    icon: "search",
    estimatedMinutes: 20,
  },
  {
    id: "metamodel_level2",
    title: "Level 2: Tilgungen",
    description: "Fehlende Informationen finden",
    icon: "search-circle",
    estimatedMinutes: 20,
  },
  {
    id: "metamodel_level3",
    title: "Level 3: Verzerrungen",
    description: "Vorannahmen hinterfragen",
    icon: "eye",
    estimatedMinutes: 20,
  },
  {
    id: "genius_gate",
    title: "Genius Gate",
    description: "Zugang zum Unbewussten",
    icon: "key",
    estimatedMinutes: 15,
  },
  {
    id: "genius_gate_practice",
    title: "Genius Gate Praxis",
    description: "Tiefe Selbsterkenntnis",
    icon: "bulb",
    estimatedMinutes: 25,
  },
  {
    id: "incongruence_mapping",
    title: "Inkongruenzen",
    description: "Innere Konflikte erkennen",
    icon: "git-branch",
    estimatedMinutes: 25,
  },
  {
    id: "clarity_reflection",
    title: "Reflexion",
    description: "Deine Erkenntnisse",
    icon: "journal",
    estimatedMinutes: 20,
  },
  {
    id: "journal_setup",
    title: "Klarheits-Tagebuch",
    description: "Tägliche Praxis etablieren",
    icon: "book",
    estimatedMinutes: 15,
  },
  {
    id: "completion",
    title: "Abschluss",
    description: "Dein Klarheits-Fundament",
    icon: "checkmark-circle",
    estimatedMinutes: 10,
  },
];

const PHASE_MODULE_MAP: Record<KModulePhase, string> = {
  welcome: "k-intro",
  lifewheel_analysis: "k-lifewheel",
  metamodel_intro: "k-meta-model",
  metamodel_level1: "k-metamodel-level1",
  metamodel_level2: "k-metamodel-level2",
  metamodel_level3: "k-metamodel-level3",
  genius_gate: "k-genius-gate",
  genius_gate_practice: "k-genius-gate",
  incongruence_mapping: "k-incongruence-finder",
  clarity_reflection: "k-clarity-reflection",
  journal_setup: "k-clarity-journal-setup",
  completion: "k-completion",
};

const DEFAULT_PHASE_CONTENT: Record<KModulePhase, ModuleContent | null> = {
  welcome: null,
  lifewheel_analysis: null,
  metamodel_intro: null,
  metamodel_level1: null,
  metamodel_level2: null,
  metamodel_level3: null,
  genius_gate: null,
  genius_gate_practice: null,
  incongruence_mapping: null,
  clarity_reflection: null,
  journal_setup: null,
  completion: null,
};

const getModuleMarkdown = (moduleContent?: ModuleContent | null): string => {
  if (!moduleContent) {
    return "";
  }
  const raw = moduleContent.content;
  if (typeof raw === "string") {
    const s = raw.trim();
    const looksJson =
      (s.startsWith("{") && s.endsWith("}")) ||
      (s.startsWith("[") && s.endsWith("]"));
    if (looksJson) {
      // Normalisiere typografische Anführungszeichen und tolerante JSON-Variante (Trailing Commas)
      const normalized = s
        .replace(/[“”„]/g, '"')
        .replace(/[‘’‚]/g, "'")
        .replace(/,(\s*[}\]])/g, "$1");
      try {
        const parsed: any = JSON.parse(normalized);
        if (typeof parsed === "string") return parsed;
        if (parsed?.markdown) return parsed.markdown;
        // Erzeuge Markdown aus strukturierten Feldern
        const parts: string[] = [];
        if (parsed?.intro_text) parts.push(String(parsed.intro_text));
        if (Array.isArray(parsed?.key_concepts) && parsed.key_concepts.length) {
          parts.push(
            [
              "## Schlüsselkonzepte",
              ...parsed.key_concepts.map((k: any) => `- ${String(k)}`),
            ].join("\n"),
          );
        }
        if (
          Array.isArray(parsed?.learning_objectives) &&
          parsed.learning_objectives.length
        ) {
          parts.push(
            [
              "## Lernziele",
              ...parsed.learning_objectives.map((k: any) => `- ${String(k)}`),
            ].join("\n"),
          );
        }
        // welcome_message optional einfügen, wenn nicht redundant
        if (
          parsed?.welcome_message &&
          (!parsed?.intro_text ||
            !String(parsed.welcome_message).includes(String(parsed.intro_text)))
        ) {
          parts.unshift(String(parsed.welcome_message));
        }
        return parts.join("\n\n");
      } catch {
        // String sah aus wie JSON, ließ sich aber nicht parsen -> nicht anzeigen
        return "";
      }
    }
    // Falls JSON in einen größeren Text eingebettet ist, extrahiere das erste JSON-Objekt
    if (s.includes("{") && s.includes("}")) {
      const start = s.indexOf("{");
      const end = s.lastIndexOf("}");
      if (end > start) {
        const candidate = s
          .slice(start, end + 1)
          .replace(/[“”„]/g, '"')
          .replace(/[‘’‚]/g, "'")
          .replace(/,(\s*[}\]])/g, "$1");
        try {
          const parsed: any = JSON.parse(candidate);
          if (typeof parsed === "string") return parsed;
          if (parsed?.markdown) return parsed.markdown;
          const parts: string[] = [];
          if (parsed?.intro_text) parts.push(String(parsed.intro_text));
          if (
            Array.isArray(parsed?.key_concepts) &&
            parsed.key_concepts.length
          ) {
            parts.push(
              [
                "## Schlüsselkonzepte",
                ...parsed.key_concepts.map((k: any) => `- ${String(k)}`),
              ].join("\n"),
            );
          }
          if (
            Array.isArray(parsed?.learning_objectives) &&
            parsed.learning_objectives.length
          ) {
            parts.push(
              [
                "## Lernziele",
                ...parsed.learning_objectives.map((k: any) => `- ${String(k)}`),
              ].join("\n"),
            );
          }
          if (
            parsed?.welcome_message &&
            (!parsed?.intro_text ||
              !String(parsed.welcome_message).includes(
                String(parsed.intro_text),
              ))
          ) {
            parts.unshift(String(parsed.welcome_message));
          }
          return parts.join("\n\n");
        } catch {
          // Ignoriere und zeige keinen Roh-JSON
          return "";
        }
      }
    }
    // Kein JSON, behandle als normalen Markdown/Text
    return raw;
  }
  const content: any = raw;
  // Wenn content.markdown vorhanden ist, aber wie JSON aussieht, wie oben parsen/formatieren
  if (content?.markdown) {
    const s = String(content.markdown).trim();
    const looksJson =
      (s.startsWith("{") && s.endsWith("}")) ||
      (s.startsWith("[") && s.endsWith("]"));
    if (looksJson) {
      const normalized = s
        .replace(/[“”„]/g, '"')
        .replace(/[‘’‚]/g, "'")
        .replace(/,(\s*[}\]])/g, "$1");
      try {
        const parsed: any = JSON.parse(normalized);
        if (typeof parsed === "string") return parsed;
        if (parsed?.markdown) return parsed.markdown;
        const parts: string[] = [];
        if (parsed?.intro_text) parts.push(String(parsed.intro_text));
        if (Array.isArray(parsed?.key_concepts) && parsed.key_concepts.length) {
          parts.push(
            [
              "## Schlüsselkonzepte",
              ...parsed.key_concepts.map((k: any) => `- ${String(k)}`),
            ].join("\n"),
          );
        }
        if (
          Array.isArray(parsed?.learning_objectives) &&
          parsed.learning_objectives.length
        ) {
          parts.push(
            [
              "## Lernziele",
              ...parsed.learning_objectives.map((k: any) => `- ${String(k)}`),
            ].join("\n"),
          );
        }
        if (
          parsed?.welcome_message &&
          (!parsed?.intro_text ||
            !String(parsed.welcome_message).includes(String(parsed.intro_text)))
        ) {
          parts.unshift(String(parsed.welcome_message));
        }
        return parts.join("\n\n");
      } catch {
        // Fallback: behandel es als normalen Markdown-Text
        return String(content.markdown);
      }
    }
    return String(content.markdown);
  }
  // Erzeuge Markdown direkt aus Objektfeldern, falls vorhanden
  const parts: string[] = [];
  if (content?.intro_text) parts.push(String(content.intro_text));
  if (Array.isArray(content?.key_concepts) && content.key_concepts.length) {
    parts.push(
      [
        "## Schlüsselkonzepte",
        ...content.key_concepts.map((k: any) => `- ${String(k)}`),
      ].join("\n"),
    );
  }
  if (
    Array.isArray(content?.learning_objectives) &&
    content.learning_objectives.length
  ) {
    parts.push(
      [
        "## Lernziele",
        ...content.learning_objectives.map((k: any) => `- ${String(k)}`),
      ].join("\n"),
    );
  }
  if (
    content?.welcome_message &&
    (!content?.intro_text ||
      !String(content.welcome_message).includes(String(content.intro_text)))
  ) {
    parts.unshift(String(content.welcome_message));
  }
  if (parts.length > 0) return parts.join("\n\n");
  return "";
};

const KModuleComponentNew: React.FC<KModuleComponentProps> = ({
  module,
  onComplete,
}) => {
  const { t, i18n } = useTranslation(["modules", "common"]);
  const theme = useTheme();
  const isDarkMode = theme.dark;
  const klareColors = isDarkMode ? darkKlareColors : lightKlareColors;
  const navigation = useNavigation<any>();

  const user = useUserStore((state) => state.user);
  const completedModules = useProgressionStore(
    (state) => state.completedModules,
  );
  const syncExternalSession = useAIStore((state) => state.syncExternalSession);
  const lifeWheelAreas = useLifeWheelStore((state) => state.lifeWheelAreas);
  const loadLifeWheelData = useLifeWheelStore(
    (state) => state.loadLifeWheelData,
  );

  // State Management
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [completedPhases, setCompletedPhases] = useState<KModulePhase[]>([]);
  const [phaseData, setPhaseData] = useState<Record<string, any>>({});
  const [userInput, setUserInput] = useState("");
  const [metaQuestions, setMetaQuestions] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [aiResponse, setAiResponse] = useState<AICoachResponse | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any[]>([]);
  const [phaseContent, setPhaseContent] = useState<
    Record<KModulePhase, ModuleContent | null>
  >(() => ({ ...DEFAULT_PHASE_CONTENT }));
  const [contentLoading, setContentLoading] = useState(false);

  // Inkongruenz-Mapping State
  const [incongruenceData, setIncongruenceData] = useState({
    cognitive: "",
    emotional: "",
    behavioral: "",
  });

  // Reflexions-State
  const [reflectionData, setReflectionData] = useState({
    keyInsights: "",
    patterns: "",
    biggestIncongruence: "",
    nextSteps: "",
  });

  const aiService = useMemo(
    () => new KModuleAIService(i18n.language),
    [i18n.language],
  );
  const styles = useMemo(
    () => createStyles(theme, klareColors),
    [theme, klareColors],
  );
  const markdownStyles = useMemo(
    () => ({
      body: {
        color: theme.colors.onSurface,
        fontSize: 15,
        lineHeight: 22,
      },
      heading1: {
        color: klareColors.k,
        fontSize: 24,
        fontWeight: "700" as const,
        marginBottom: 12,
      },
      heading2: {
        color: theme.colors.onSurface,
        fontSize: 20,
        fontWeight: "600" as const,
        marginTop: 16,
        marginBottom: 8,
      },
      heading3: {
        color: theme.colors.onSurface,
        fontSize: 18,
        fontWeight: "600" as const,
        marginTop: 12,
        marginBottom: 6,
      },
      bullet_list: {
        marginLeft: 8,
      },
      ordered_list: {
        marginLeft: 8,
      },
      list_item: {
        color: theme.colors.onSurface,
        fontSize: 15,
        lineHeight: 22,
      },
      paragraph: {
        marginBottom: 12,
      },
      strong: {
        fontWeight: "700" as const,
      },
      em: {
        fontStyle: "italic" as const,
      },
    }),
    [theme, klareColors],
  );

  const currentPhase = PHASE_CONFIGS[currentPhaseIndex];
  const totalPhases = PHASE_CONFIGS.length;

  // Dynamische Schrittberechnung basierend auf geladenen exercise_steps
  const getTotalStepsForPhase = useCallback(
    (phase: KModulePhase): number => {
      const content = phaseContent[phase];
      if (!content) return 1; // Fallback wenn kein Content geladen

      // Prüfe exercise_steps
      const exerciseSteps = content.exercise_steps?.length ?? 0;
      if (exerciseSteps > 0) return exerciseSteps;

      // Prüfe content_sections als Alternative
      const contentSections = content.sections?.length ?? 0;
      if (contentSections > 0) return contentSections;

      // Fallback auf PHASE_CONFIGS wenn keine dynamischen Daten
      return 1;
    },
    [phaseContent],
  );

  const currentPhaseSteps = getTotalStepsForPhase(currentPhase.id);
  const progressPercentage = ((currentPhaseIndex + 1) / totalPhases) * 100;

  // Initialize K-Module
  useEffect(() => {
    initializeKModule();
    if (user?.id) {
      loadLifeWheelData(user.id);
    }
  }, [user?.id]);

  const loadPhaseContents = useCallback(async () => {
    setContentLoading(true);
    try {
      const phases = Object.keys(PHASE_MODULE_MAP) as KModulePhase[];
      const results = await Promise.all(
        phases.map(async (phase) => {
          try {
            const content = await loadModuleContent(PHASE_MODULE_MAP[phase]);
            return [phase, content] as const;
          } catch (error) {
            console.error("K-Module content loading error:", error);
            return [phase, null] as const;
          }
        }),
      );
      setPhaseContent((prev) => {
        const updated = { ...prev } as Record<
          KModulePhase,
          ModuleContent | null
        >;
        results.forEach(([phase, content]) => {
          updated[phase] = content;
        });
        return updated;
      });
    } finally {
      setContentLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPhaseContents();
  }, [loadPhaseContents]);

  // Generate AI insights for LifeWheel phase
  useEffect(() => {
    if (
      currentPhase.id === "lifewheel_analysis" &&
      lifeWheelAreas.length > 0 &&
      !aiResponse
    ) {
      generateLifeWheelInsights();
    }
  }, [currentPhase.id, lifeWheelAreas.length]);

  useEffect(() => {
    const run = async () => {
      if (currentPhase.id !== "completion") return;
      if (!user?.id) return;
      setIsProcessing(true);
      try {
        const summary = await aiService.generatePersonalizedCoaching(
          "K-Modul Abschluss: Erstelle eine kurze, persönliche Zusammenfassung (max. 120 Wörter) mit 2-3 konkreten, klaren nächsten Schritten. Nutze einen wertschätzenden, aber klaren Ton.",
          { phasesCompleted: completedPhases },
          { userId: user.id },
        );
        setAiResponse(summary);
      } catch (e) {
      } finally {
        setIsProcessing(false);
      }
    };
    run();
  }, [currentPhase.id, user?.id]);

  useEffect(() => {
    if (!currentPhase.id.startsWith("metamodel_level")) return;
    const loadQuestions = async () => {
      const level = currentPhase.id.includes("level1")
        ? 1
        : currentPhase.id.includes("level2")
          ? 2
          : 3;
      const mainGoal = (user?.user_metadata?.primary_goals as string) || user?.user_metadata?.primary_challenge || "";
      const lowestAreas = [...lifeWheelAreas]
        .slice()
        .sort((a, b) => a.currentValue - b.currentValue)
        .slice(0, 2)
        .map((a) => a.name);
      setIsProcessing(true);
      try {
        const q = await aiService.getMetaModelQuestions(
          level,
          mainGoal,
          lowestAreas,
          { userId: user?.id },
        );
        setMetaQuestions(q.nextSteps || []);
        setAiResponse(q.message ? q : null);
        setCurrentQuestionIndex(0);
        setUserAnswer("");
      } catch (e) {
        setMetaQuestions([]);
      } finally {
        setIsProcessing(false);
      }
    };
    loadQuestions();
  }, [currentPhase.id]);
  

  const generateLifeWheelInsights = async () => {
    if (lifeWheelAreas.length === 0) return;

    setIsProcessing(true);
    try {
      const insights = await aiService.analyzeLifeWheel(
        lifeWheelAreas.map((area) => ({
          name: area.name,
          currentValue: area.currentValue,
          targetValue: area.targetValue,
        })),
        user?.id,
      );
      setAiResponse(insights);
    } catch (error) {
      console.error("LifeWheel insights error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Restore phase data when navigating back
  useEffect(() => {
    const savedData = phaseData[currentPhase.id];

    if (currentPhase.id === "clarity_reflection" && savedData) {
      setReflectionData(savedData);
    } else if (
      currentPhase.id === "genius_gate_practice" &&
      typeof savedData === "string"
    ) {
      setUserInput(savedData);
    } else if (
      currentPhase.id === "incongruence_mapping" &&
      savedData?.cognitive
    ) {
      setIncongruenceData(savedData);
    } else if (
      currentPhase.id.includes("metamodel_level") &&
      Array.isArray(savedData) &&
      savedData.length > 0
    ) {
      // Meta-Model Phasen haben bereits analysierte Aussagen
      // Wir setzen analysisResults nicht, aber zeigen im UI, dass Analyse erfolgt ist
    }
  }, [currentPhaseIndex, currentPhase.id]);

  const initializeKModule = useCallback(async () => {
    try {
      setIsProcessing(true);

      const userContext = {
        name: user?.user_metadata?.name || user?.email || "Teilnehmer",
        mainChallenge:
          user?.user_metadata?.primary_challenge ||
          "Klarheit in der Kommunikation",
        reflectionExperience: "Anfänger" as const,
        currentLifeAreas: user?.user_metadata?.focus_areas || [
          "career",
          "relationships",
        ],
      };

      const welcome = await aiService.startKSession(
        userContext,
        module.module_id || "k-intro",
        {
          userId: user?.id,
          completedModules,
        },
      );
      setAiResponse(welcome);

      const sessionInfo = aiService.getSessionInfo();
      if (sessionInfo.sessionId && sessionInfo.userId) {
        syncExternalSession({
          sessionId: sessionInfo.sessionId,
          conversationType: "coaching",
          isActive: true,
        });
      }
    } catch (error) {
      console.error("K-Module initialization error:", error);
      Alert.alert("Fehler", "Modul konnte nicht geladen werden");
    } finally {
      setIsProcessing(false);
    }
  }, [aiService, completedModules, user, syncExternalSession]);

  const handleNextPhase = useCallback(() => {
    // Validierung je nach Phase
    if (!validateCurrentPhase()) {
      return;
    }

    // Persistiere aktuelle Phase-Daten bevor wir weitergehen
    const updatedPhaseData = { ...phaseData };

    // Speichere Reflexionsdaten
    if (
      currentPhase.id === "clarity_reflection" &&
      reflectionData.keyInsights
    ) {
      updatedPhaseData.clarity_reflection = reflectionData;
    }

    // Speichere Genius Gate Daten
    if (currentPhase.id === "genius_gate_practice" && userInput.trim()) {
      updatedPhaseData.genius_gate_practice = userInput;
    }

    setPhaseData(updatedPhaseData);

    // Phase als abgeschlossen markieren
    setCompletedPhases((prev) => [...prev, currentPhase.id]);

    // Zur nächsten Phase oder Abschluss
    if (currentPhaseIndex < totalPhases - 1) {
      setCurrentPhaseIndex((prev) => prev + 1);
      setUserInput("");
      setAnalysisResults([]);
    } else {
      onComplete();
    }
  }, [
    currentPhaseIndex,
    currentPhase,
    totalPhases,
    onComplete,
    phaseData,
    reflectionData,
    userInput,
  ]);

  const handlePreviousPhase = useCallback(() => {
    if (currentPhaseIndex > 0) {
      setCurrentPhaseIndex((prev) => prev - 1);
    }
  }, [currentPhaseIndex]);

  const validateCurrentPhase = (): boolean => {
    switch (currentPhase.id) {
      case "lifewheel_analysis":
        if (lifeWheelAreas.length === 0) {
          Alert.alert("Hinweis", "Bitte bewerte zuerst dein Lebensrad.");
          return false;
        }
        return true;
      case "metamodel_level1":
      case "metamodel_level2":
      case "metamodel_level3":
        // Prüfe persistierte Daten in phaseData ODER aktuell angezeigte Ergebnisse
        const hasAnalyzedStatements =
          (phaseData[currentPhase.id] &&
            phaseData[currentPhase.id].length > 0) ||
          analysisResults.length > 0;

        if (!hasAnalyzedStatements) {
          Alert.alert("Hinweis", "Bitte analysiere mindestens eine Aussage.");
          return false;
        }
        return true;
      case "genius_gate_practice":
        if (!userInput.trim() && !phaseData.genius_gate_practice) {
          Alert.alert("Hinweis", "Bitte bearbeite die Genius-Gate-Übung.");
          return false;
        }
        return true;
      case "incongruence_mapping":
        const hasIncongruenceData =
          (phaseData.incongruence_mapping &&
            phaseData.incongruence_mapping.cognitive) ||
          (incongruenceData.cognitive &&
            incongruenceData.emotional &&
            incongruenceData.behavioral);

        if (!hasIncongruenceData) {
          Alert.alert("Hinweis", "Bitte fülle alle drei Ebenen aus.");
          return false;
        }
        return true;
      case "clarity_reflection":
        if (!reflectionData.keyInsights && !phaseData.clarity_reflection) {
          Alert.alert("Hinweis", "Bitte teile deine wichtigsten Erkenntnisse.");
          return false;
        }
        return true;
      case "metamodel_level1":
      case "metamodel_level2":
      case "metamodel_level3": {
        const answers = phaseData[currentPhase.id] as Array<{ q: string; a: string }> | undefined;
        if (!answers || answers.length < 3) {
          Alert.alert("Hinweis", "Beantworte bitte alle drei Fragen in dieser Phase.");
          return false;
        }
        return true;
      }
      default: {
        return true;
      }
    }
  };

  const handleMetaModelAnalysis = async () => {
    if (!userAnswer.trim()) {
      Alert.alert("Hinweis", "Bitte beantworte die Frage.");
      return;
    }

    setIsProcessing(true);
    try {
      const level = currentPhaseIndex - 3 + 1; // metamodel_level1 ist Index 3
      const challenge = currentPhase.id.includes("level1")
        ? "universalquantoren"
        : currentPhase.id.includes("level2")
          ? "tilgungen"
          : "verzerrungen";

      const result: MetaModelAnalysisResult = await aiService.analyzeMetaModel(
        userAnswer,
        level,
        challenge,
        { userId: user?.id },
      );

      setAnalysisResults(result.analysis);
      setAiResponse(result.coachResponse);
      setPhaseData((prev) => ({
        ...prev,
        [currentPhase.id]: [...(prev[currentPhase.id] || []), { q: metaQuestions[currentQuestionIndex], a: userAnswer }],
      }));

      if (currentQuestionIndex < (metaQuestions.length || 3) - 1) {
        setCurrentQuestionIndex((idx) => idx + 1);
        setUserAnswer("");
      }
    } catch (error: any) {
      console.error("Meta-Model analysis error:", error);
      Alert.alert("Fehler", error.message || "Analyse fehlgeschlagen");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleIncongruenceAnalysis = async () => {
    if (
      !incongruenceData.cognitive ||
      !incongruenceData.emotional ||
      !incongruenceData.behavioral
    ) {
      Alert.alert("Hinweis", "Bitte fülle alle drei Ebenen aus.");
      return;
    }

    setIsProcessing(true);
    try {
      // AI-Analyse der Inkongruenz
      const prompt = `Analysiere die Inkongruenz:\nDenken: ${incongruenceData.cognitive}\nFühlen: ${incongruenceData.emotional}\nHandeln: ${incongruenceData.behavioral}`;

      // Hier würde normalerweise ein AI-Service Call erfolgen
      // Für jetzt: Mock-Response
      setAiResponse({
        type: "analysis",
        message: `Ich erkenne eine Diskrepanz zwischen deinen Ebenen. Während du denkst "${incongruenceData.cognitive}", fühlst du "${incongruenceData.emotional}" und handelst "${incongruenceData.behavioral}". Diese Inkongruenz kann zu innerem Stress führen.`,
        encouragement:
          "Das Erkennen dieser Muster ist der erste Schritt zur Veränderung! 💡",
      });

      setPhaseData((prev) => ({
        ...prev,
        incongruence_mapping: incongruenceData,
      }));
    } catch (error) {
      console.error("Incongruence analysis error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const renderPhaseContent = () => {
    if (contentLoading && !phaseContent[currentPhase.id]) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator animating size="large" color={klareColors.k} />
        </View>
      );
    }
    switch (currentPhase.id) {
      case "welcome":
        return renderWelcomePhase();
      case "lifewheel_analysis":
        return renderLifeWheelPhase();
      case "metamodel_intro":
        return renderMetaModelIntro();
      case "metamodel_level1":
      case "metamodel_level2":
      case "metamodel_level3":
        return renderMetaModelPractice();
      case "genius_gate":
        return renderGeniusGateIntro();
      case "genius_gate_practice":
        return renderGeniusGatePractice();
      case "incongruence_mapping":
        return renderIncongruenceMapping();
      case "clarity_reflection":
        return renderClarityReflection();
      case "journal_setup":
        return renderJournalSetup();
      case "completion":
        return renderCompletion();
      default:
        return null;
    }
  };

  const renderWelcomePhase = () => (
    <View style={styles.phaseContainer}>
      <Card style={styles.welcomeCard} mode="elevated">
        <Card.Content>
          <View style={styles.iconHeader}>
            <Ionicons name="hand-left" size={48} color={klareColors.k} />
          </View>
          <Text style={styles.welcomeTitle}>
            {phaseContent.welcome?.title ?? "Willkommen zur Klarheit!"}
          </Text>
          <Text style={styles.welcomeText}>
            {phaseContent.welcome?.description ??
              "Klarheit ist das Fundament jeder nachhaltigen Veränderung. In diesem Modul lernst du:"}
          </Text>
          {!!getModuleMarkdown(phaseContent.welcome) && (
            <Markdown style={markdownStyles}>
              {getModuleMarkdown(phaseContent.welcome)}
            </Markdown>
          )}
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>
              ✓ Deine aktuelle Situation ehrlich zu erkennen
            </Text>
            <Text style={styles.bulletItem}>
              ✓ Präzise zu kommunizieren mit dem Meta-Modell
            </Text>
            <Text style={styles.bulletItem}>
              ✓ Innere Konflikte und Blockaden aufzudecken
            </Text>
            <Text style={styles.bulletItem}>
              ✓ Zugang zu deinem Unbewussten zu finden
            </Text>
          </View>
        </Card.Content>
      </Card>

      {aiResponse && (
        <Card style={styles.aiCoachCard} mode="elevated">
          <Card.Content>
            <View style={styles.coachHeader}>
              <Ionicons
                name="chatbubble-ellipses"
                size={24}
                color={klareColors.k}
              />
              <Text style={styles.coachTitle}>Dein Klarheits-Coach</Text>
            </View>
            <Text style={styles.coachMessage}>{aiResponse.message}</Text>
            {aiResponse.encouragement && (
              <Text style={styles.encouragement}>
                {aiResponse.encouragement}
              </Text>
            )}
          </Card.Content>
        </Card>
      )}

      {aiResponse?.nextSteps && aiResponse.nextSteps.length > 0 && (
        <Card style={styles.questionsCard} mode="outlined">
          <Card.Content>
            <Text style={styles.questionsTitle}>Gezielte Fragen</Text>
            {aiResponse.nextSteps.map((q, idx) => (
              <View key={idx} style={styles.questionItem}>
                <Ionicons
                  name="help-circle-outline"
                  size={20}
                  color={klareColors.k}
                />
                <Text style={styles.questionText}>{q}</Text>
              </View>
            ))}
          </Card.Content>
        </Card>
      )}

      <Card style={styles.infoCard} mode="outlined">
        <Card.Content>
          <Text style={styles.infoTitle}>📊 Deine Reise im Überblick</Text>
          <Text style={styles.infoText}>
            {totalPhases} Phasen • ca.{" "}
            {PHASE_CONFIGS.reduce((sum, p) => sum + p.estimatedMinutes, 0)}{" "}
            Minuten
          </Text>
          <Text style={styles.infoSubtext}>
            Du kannst jederzeit pausieren und später weitermachen.
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.ctaCard} mode="elevated">
        <Card.Content>
          <Text style={styles.ctaTitle}>Bereit für deine Klarheits-Reise?</Text>
          <Text style={styles.ctaText}>
            Lass uns mit deiner IST-Analyse beginnen. Wir schauen uns gemeinsam
            an, wo du gerade stehst.
          </Text>
          <Button
            mode="contained"
            onPress={handleNextPhase}
            buttonColor={klareColors.k}
            icon="arrow-right"
            contentStyle={{ flexDirection: "row-reverse" }}
            style={styles.ctaButton}
          >
            Jetzt starten
          </Button>
        </Card.Content>
      </Card>
    </View>
  );

  const renderLifeWheelPhase = () => (
    <View style={styles.phaseContainer}>
      <Card style={styles.contentCard} mode="elevated">
        <Card.Content>
          <Text style={styles.phaseTitle}>Deine aktuelle Lebenssituation</Text>
          <Text style={styles.phaseDescription}>
            Das Lebensrad zeigt dir auf einen Blick, wo du gerade stehst.
            Bewerte jeden Bereich ehrlich – ohne Beschönigung, aber auch ohne
            Selbstkritik.
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.lifeWheelCard} mode="outlined">
        <Card.Content>
          <Text style={styles.cardTitle}>📊 Dein Lebensrad</Text>
          {lifeWheelAreas.length > 0 ? (
            <View style={styles.lifeWheelSummary}>
              {lifeWheelAreas.slice(0, 3).map((area) => (
                <View key={area.id} style={styles.areaRow}>
                  <Text style={styles.areaName}>{area.name}</Text>
                  <View style={styles.ratingContainer}>
                    <Text style={styles.ratingText}>
                      IST: {area.currentValue}/10
                    </Text>
                    <Text style={styles.ratingText}>
                      SOLL: {area.targetValue}/10
                    </Text>
                  </View>
                </View>
              ))}
              <Button
                mode="outlined"
                onPress={() => navigation.navigate("LifeWheel")}
                style={styles.actionButton}
              >
                Lebensrad bearbeiten
              </Button>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons
                name="analytics-outline"
                size={48}
                color={theme.colors.outline}
              />
              <Text style={styles.emptyText}>
                Noch keine Bewertungen vorhanden
              </Text>
              <Button
                mode="contained"
                onPress={() => navigation.navigate("LifeWheel")}
                buttonColor={klareColors.k}
                style={styles.actionButton}
              >
                Jetzt bewerten
              </Button>
            </View>
          )}
        </Card.Content>
      </Card>

      {aiResponse && (
        <>
          <Card style={styles.aiCoachCard} mode="elevated">
            <Card.Content>
              <View style={styles.coachHeader}>
                <Ionicons name="analytics" size={24} color={klareColors.k} />
                <Text style={styles.coachTitle}>
                  AI-Insights zu deinem Lebensrad
                </Text>
              </View>
              <Text style={styles.coachMessage}>{aiResponse.message}</Text>
            </Card.Content>
          </Card>

          {aiResponse.exercises && aiResponse.exercises.length > 0 && (
            <Card style={styles.questionsCard} mode="outlined">
              <Card.Content>
                <Text style={styles.questionsTitle}>
                  🤔 Reflexionsfragen für dich
                </Text>
                {aiResponse.exercises.map((question, index) => (
                  <View key={index} style={styles.questionItem}>
                    <Ionicons
                      name="help-circle-outline"
                      size={20}
                      color={klareColors.k}
                    />
                    <Text style={styles.questionText}>{question}</Text>
                  </View>
                ))}
                <Text style={styles.questionHint}>
                  💡 Nimm dir Zeit, diese Fragen ehrlich zu beantworten. Sie
                  helfen dir, Klarheit über deine nächsten Schritte zu gewinnen.
                </Text>
              </Card.Content>
            </Card>
          )}

          {aiResponse.encouragement && (
            <Card style={styles.encouragementCard} mode="outlined">
              <Card.Content>
                <Text style={styles.encouragementText}>
                  {aiResponse.encouragement}
                </Text>
              </Card.Content>
            </Card>
          )}
        </>
      )}
    </View>
  );

  const renderMetaModelIntro = () => (
    <View style={styles.phaseContainer}>
      <Card style={styles.contentCard} mode="elevated">
        <Card.Content>
          <Text style={styles.phaseTitle}>
            {phaseContent.metamodel_intro?.title ??
              "Das Meta-Modell der Sprache"}
          </Text>
          <Text style={styles.phaseDescription}>
            {phaseContent.metamodel_intro?.description ??
              "Das Meta-Modell ist ein mächtiges Werkzeug aus dem NLP. Es hilft dir, unpräzise Sprache zu erkennen – sowohl bei anderen als auch bei dir selbst."}
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.theoryCard} mode="outlined">
        <Card.Content>
          <Text style={styles.cardTitle}>🎯 Die drei Hauptkategorien</Text>
          {!!getModuleMarkdown(phaseContent.metamodel_intro) && (
            <Markdown style={markdownStyles}>
              {getModuleMarkdown(phaseContent.metamodel_intro)}
            </Markdown>
          )}

          <View style={styles.categoryBox}>
            <Text style={styles.categoryTitle}>1. Generalisierungen</Text>
            <Text style={styles.categoryText}>
              Wörter wie "immer", "nie", "alle", "niemand" verallgemeinern
              Erfahrungen und schränken Möglichkeiten ein.
            </Text>
            <Text style={styles.exampleText}>
              Beispiel: "Ich schaffe das nie!" → "Wann genau hast du es nicht
              geschafft?"
            </Text>
          </View>

          <View style={styles.categoryBox}>
            <Text style={styles.categoryTitle}>2. Tilgungen</Text>
            <Text style={styles.categoryText}>
              Fehlende Informationen oder unvollständige Aussagen, die wichtige
              Details auslassen.
            </Text>
            <Text style={styles.exampleText}>
              Beispiel: "Man versteht mich nicht." → "Wer genau versteht dich
              nicht?"
            </Text>
          </View>

          <View style={styles.categoryBox}>
            <Text style={styles.categoryTitle}>3. Verzerrungen</Text>
            <Text style={styles.categoryText}>
              Ursache-Wirkung-Annahmen und Vorannahmen, die die Realität
              verzerren.
            </Text>
            <Text style={styles.exampleText}>
              Beispiel: "Du machst mich wütend." → "Wie genau mache ich das?"
            </Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.infoCard} mode="outlined">
        <Card.Content>
          <Text style={styles.infoTitle}>💡 Warum ist das wichtig?</Text>
          <Text style={styles.infoText}>
            Die Art, wie wir sprechen, spiegelt die Art, wie wir denken. Wenn du
            lernst, präziser zu kommunizieren, denkst du auch klarer – und
            triffst bessere Entscheidungen.
          </Text>
        </Card.Content>
      </Card>
    </View>
  );

  const renderMetaModelPractice = () => {
    const levelNumber = currentPhaseIndex - 3 + 1;
    const levelTitle = currentPhase.id.includes("level1")
      ? "Generalisierungen"
      : currentPhase.id.includes("level2")
        ? "Tilgungen"
        : "Verzerrungen";

    // Hole exercise_steps für diese Phase
    const currentContent = phaseContent[currentPhase.id];
    const exerciseSteps = currentContent?.exercise_steps || [];

    return (
      <View style={styles.phaseContainer}>
        <Card style={styles.levelCard} mode="elevated">
          <Card.Content>
            <View style={styles.levelHeader}>
              <Text style={styles.levelTitle}>
                Meta-Modell Level {levelNumber}
              </Text>
              <Chip
                mode="outlined"
                style={styles.levelChip}
                textStyle={{ color: klareColors.k }}
              >
                {levelTitle}
              </Chip>
            </View>
            <Text style={styles.levelDescription}>
              {currentPhase.description}
            </Text>
            {exerciseSteps.length > 0 && (
              <Text style={styles.levelSubtext}>
                📚 {exerciseSteps.length} Übungsschritte verfügbar
              </Text>
            )}
          </Card.Content>
        </Card>

        {/* Zeige exercise_steps wenn vorhanden */}
        {exerciseSteps.length > 0 && (
          <Card style={styles.exerciseStepsCard} mode="outlined">
            <Card.Content>
              <Text style={styles.cardTitle}>📋 Übungsschritte</Text>
              {exerciseSteps.map((step, index) => (
                <View key={step.id || index} style={styles.exerciseStepItem}>
                  <View style={styles.stepHeader}>
                    <Chip
                      mode="flat"
                      style={styles.stepTypeChip}
                      textStyle={{ fontSize: 11 }}
                    >
                      {step.step_type || "Übung"}
                    </Chip>
                    <Text style={styles.stepTitle}>{step.title}</Text>
                  </View>
                  {step.instructions && (
                    <Text style={styles.stepInstructions} numberOfLines={2}>
                      {step.instructions}
                    </Text>
                  )}
                  {index < exerciseSteps.length - 1 && (
                    <Divider style={styles.stepDivider} />
                  )}
                </View>
              ))}
            </Card.Content>
          </Card>
        )}

        <Card style={styles.inputCard} mode="outlined">
          <Card.Content>
            <Text style={styles.inputLabel}>Frage {currentQuestionIndex + 1} von {Math.max(metaQuestions.length, 3)}</Text>
            <Text style={styles.inputHint}>
              {metaQuestions[currentQuestionIndex] || (levelTitle === "Generalisierungen"
                ? "Formuliere dein konkretestes Ziel. Wo gab es zuletzt eine Ausnahme?"
                : levelTitle === "Tilgungen"
                ? "Was GENAU fehlt dir an Information? Wer ist konkret beteiligt?"
                : "Wie GENAU hängt Ursache und Wirkung zusammen? Woran machst du es fest?")}
            </Text>
            <TextInput
              style={styles.textInput}
              value={userAnswer}
              onChangeText={setUserAnswer}
              placeholder={"Deine Antwort"}
              multiline
              numberOfLines={3}
            />
            <Button
              mode="contained"
              onPress={handleMetaModelAnalysis}
              disabled={isProcessing || !userAnswer.trim()}
              loading={isProcessing}
              buttonColor={klareColors.k}
              style={styles.analyzeButton}
            >
              {currentQuestionIndex < Math.max(metaQuestions.length, 3) - 1 ? "Antwort senden" : "Analyse abschließen"}
            </Button>
          </Card.Content>
        </Card>

        {/* Zeige Analyse-Ergebnisse oder Bestätigung dass analysiert wurde */}
        {analysisResults.length > 0 ? (
          <Card style={styles.resultsCard} mode="elevated">
            <Card.Content>
              <Text style={styles.cardTitle}>🔍 Analyse-Ergebnisse</Text>
              {analysisResults.map((result, index) => (
                <View key={index} style={styles.resultItem}>
                  <Chip style={styles.patternChip}>{result.pattern_type}</Chip>
                  <Text style={styles.identifiedWord}>
                    Schlüsselwort: "{result.identified_word}"
                  </Text>
                  <View style={styles.questionBox}>
                    <Ionicons
                      name="help-circle"
                      size={20}
                      color={klareColors.k}
                    />
                    <Text style={styles.generatedQuestion}>
                      {result.generated_question}
                    </Text>
                  </View>
                  {index < analysisResults.length - 1 && (
                    <Divider style={styles.divider} />
                  )}
                </View>
              ))}
            </Card.Content>
          </Card>
        ) : phaseData[currentPhase.id] &&
          phaseData[currentPhase.id].length > 0 ? (
          <Card style={styles.completedCard} mode="outlined">
            <Card.Content>
              <View style={styles.completedHeader}>
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={klareColors.k}
                />
                <Text style={styles.completedTitle}>Analyse abgeschlossen</Text>
              </View>
              <Text style={styles.completedText}>
                Du hast {phaseData[currentPhase.id].length} Aussage(n)
                analysiert.
              </Text>
              <Text style={styles.completedSubtext}>
                Jede Analyse schärft deinen Bewusstseins-Muskel. Weiter so! 💪
              </Text>
            </Card.Content>
          </Card>
        ) : null}

        {aiResponse && (
          <Card style={styles.aiCoachCard} mode="elevated">
            <Card.Content>
              <View style={styles.coachHeader}>
                <Ionicons
                  name="chatbubble-ellipses"
                  size={24}
                  color={klareColors.k}
                />
                <Text style={styles.coachTitle}>Feedback</Text>
              </View>
              <Text style={styles.coachMessage}>{aiResponse.message}</Text>
              {aiResponse.encouragement && (
                <Text style={styles.encouragement}>
                  {aiResponse.encouragement}
                </Text>
              )}
            </Card.Content>
          </Card>
        )}

        {aiResponse?.nextSteps && aiResponse.nextSteps.length > 0 && (
          <Card style={styles.questionsCard} mode="outlined">
            <Card.Content>
              <Text style={styles.questionsTitle}>Gezielte Fragen</Text>
              {aiResponse.nextSteps.map((q, idx) => (
                <View key={idx} style={styles.questionItem}>
                  <Ionicons
                    name="help-circle-outline"
                    size={20}
                    color={klareColors.k}
                  />
                  <Text style={styles.questionText}>{q}</Text>
                </View>
              ))}
            </Card.Content>
          </Card>
        )}
      </View>
    );
  };

  const renderGeniusGateIntro = () => (
    <View style={styles.phaseContainer}>
      <Card style={styles.contentCard} mode="elevated">
        <Card.Content>
          <View style={styles.iconHeader}>
            <Ionicons name="key" size={40} color={klareColors.k} />
          </View>
          <Text style={styles.phaseTitle}>
            Genius Gate – Dein innerer Zugang
          </Text>
          <Text style={styles.phaseDescription}>
            Das Genius Gate ist eine Technik, um durch präzise Fragen zu tiefer
            Selbsterkenntnis zu gelangen. Du lernst, mit deinem Unbewussten zu
            kommunizieren und verborgene Blockaden aufzudecken.
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.theoryCard} mode="outlined">
        <Card.Content>
          <Text style={styles.cardTitle}>🔑 Die Genius-Gate-Methode</Text>
          <View style={styles.stepsList}>
            <Text style={styles.stepItem}>
              1. Wähle ein Thema oder eine Blockade
            </Text>
            <Text style={styles.stepItem}>
              2. Stelle präzise, tiefgehende Fragen
            </Text>
            <Text style={styles.stepItem}>
              3. Höre auf die ersten spontanen Antworten
            </Text>
            <Text style={styles.stepItem}>
              4. Gehe tiefer: "Und was ist darunter?"
            </Text>
            <Text style={styles.stepItem}>5. Erkenne die Kernüberzeugung</Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.infoCard} mode="outlined">
        <Card.Content>
          <Text style={styles.infoTitle}>💡 Wichtig</Text>
          <Text style={styles.infoText}>
            Sei ehrlich zu dir selbst. Die ersten Antworten, die dir in den Sinn
            kommen, sind oft die wahrhaftigsten.
          </Text>
        </Card.Content>
      </Card>
    </View>
  );

  const renderGeniusGatePractice = () => (
    <View style={styles.phaseContainer}>
      <Card style={styles.contentCard} mode="elevated">
        <Card.Content>
          <Text style={styles.phaseTitle}>Genius Gate in der Praxis</Text>
          <Text style={styles.phaseDescription}>
            Wähle ein Thema, das dich beschäftigt, und lass dich von den Fragen
            zu deinem inneren Kern führen.
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.inputCard} mode="outlined">
        <Card.Content>
          <Text style={styles.inputLabel}>Was beschäftigt dich gerade?</Text>
          <TextInput
            style={styles.textInput}
            value={userInput}
            onChangeText={setUserInput}
            placeholder="z.B. Ich fühle mich in meinem Job gefangen..."
            multiline
            numberOfLines={4}
          />
          <Text style={styles.inputHint}>
            Nimm dir Zeit und schreibe, was dir spontan in den Sinn kommt.
          </Text>
        </Card.Content>
      </Card>

      {aiResponse && (
        <Card style={styles.aiCoachCard} mode="elevated">
          <Card.Content>
            <View style={styles.coachHeader}>
              <Ionicons name="bulb" size={24} color={klareColors.k} />
              <Text style={styles.coachTitle}>Dein Coach</Text>
            </View>
            <Text style={styles.coachMessage}>{aiResponse.message}</Text>
          </Card.Content>
        </Card>
      )}
    </View>
  );

  const renderIncongruenceMapping = () => (
    <View style={styles.phaseContainer}>
      <Card style={styles.contentCard} mode="elevated">
        <Card.Content>
          <Text style={styles.phaseTitle}>Inkongruenzen kartieren</Text>
          <Text style={styles.phaseDescription}>
            Innere Konflikte entstehen, wenn Denken, Fühlen und Handeln nicht
            übereinstimmen. Lass uns diese Diskrepanzen sichtbar machen.
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.inputCard} mode="outlined">
        <Card.Content>
          <Text style={styles.cardTitle}>🧠 Drei Ebenen deines Erlebens</Text>

          <View style={styles.incongruenceSection}>
            <Text style={styles.incongruenceLabel}>Was denkst du?</Text>
            <Text style={styles.incongruenceHint}>
              Deine Gedanken und Überzeugungen
            </Text>
            <TextInput
              style={styles.textInput}
              value={incongruenceData.cognitive}
              onChangeText={(text) =>
                setIncongruenceData({ ...incongruenceData, cognitive: text })
              }
              placeholder="z.B. Ich sollte zufrieden sein..."
              multiline
            />
          </View>

          <View style={styles.incongruenceSection}>
            <Text style={styles.incongruenceLabel}>Was fühlst du?</Text>
            <Text style={styles.incongruenceHint}>Deine echten Emotionen</Text>
            <TextInput
              style={styles.textInput}
              value={incongruenceData.emotional}
              onChangeText={(text) =>
                setIncongruenceData({ ...incongruenceData, emotional: text })
              }
              placeholder="z.B. Ich fühle mich leer und unerfüllt..."
              multiline
            />
          </View>

          <View style={styles.incongruenceSection}>
            <Text style={styles.incongruenceLabel}>Was tust du?</Text>
            <Text style={styles.incongruenceHint}>
              Dein tatsächliches Verhalten
            </Text>
            <TextInput
              style={styles.textInput}
              value={incongruenceData.behavioral}
              onChangeText={(text) =>
                setIncongruenceData({ ...incongruenceData, behavioral: text })
              }
              placeholder="z.B. Ich mache weiter wie bisher..."
              multiline
            />
          </View>

          <Button
            mode="contained"
            onPress={handleIncongruenceAnalysis}
            disabled={isProcessing}
            loading={isProcessing}
            buttonColor={klareColors.k}
            style={styles.analyzeButton}
          >
            Inkongruenz analysieren
          </Button>
        </Card.Content>
      </Card>

      {aiResponse && (
        <Card style={styles.aiCoachCard} mode="elevated">
          <Card.Content>
            <View style={styles.coachHeader}>
              <Ionicons name="git-branch" size={24} color={klareColors.k} />
              <Text style={styles.coachTitle}>Deine Inkongruenz-Analyse</Text>
            </View>
            <Text style={styles.coachMessage}>{aiResponse.message}</Text>
            {aiResponse.encouragement && (
              <Text style={styles.encouragement}>
                {aiResponse.encouragement}
              </Text>
            )}
          </Card.Content>
        </Card>
      )}
    </View>
  );

  const renderClarityReflection = () => (
    <View style={styles.phaseContainer}>
      <Card style={styles.contentCard} mode="elevated">
        <Card.Content>
          <Text style={styles.phaseTitle}>Deine Klarheits-Erkenntnisse</Text>
          <Text style={styles.phaseDescription}>
            Zeit, innezuhalten und zu reflektieren. Was hast du über dich selbst
            gelernt?
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.inputCard} mode="outlined">
        <Card.Content>
          <View style={styles.reflectionSection}>
            <Text style={styles.reflectionLabel}>
              💡 Wichtigste Erkenntnisse
            </Text>
            <TextInput
              style={styles.textInput}
              value={reflectionData.keyInsights}
              onChangeText={(text) =>
                setReflectionData({ ...reflectionData, keyInsights: text })
              }
              placeholder="Was waren deine wichtigsten Aha-Momente?"
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.reflectionSection}>
            <Text style={styles.reflectionLabel}>🔄 Erkannte Muster</Text>
            <TextInput
              style={styles.textInput}
              value={reflectionData.patterns}
              onChangeText={(text) =>
                setReflectionData({ ...reflectionData, patterns: text })
              }
              placeholder="Welche wiederkehrenden Muster hast du entdeckt?"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.reflectionSection}>
            <Text style={styles.reflectionLabel}>⚡ Größte Inkongruenz</Text>
            <TextInput
              style={styles.textInput}
              value={reflectionData.biggestIncongruence}
              onChangeText={(text) =>
                setReflectionData({
                  ...reflectionData,
                  biggestIncongruence: text,
                })
              }
              placeholder="Wo ist der größte Widerspruch in deinem Leben?"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.reflectionSection}>
            <Text style={styles.reflectionLabel}>🎯 Nächste Schritte</Text>
            <TextInput
              style={styles.textInput}
              value={reflectionData.nextSteps}
              onChangeText={(text) =>
                setReflectionData({ ...reflectionData, nextSteps: text })
              }
              placeholder="Was möchtest du als Erstes verändern?"
              multiline
              numberOfLines={3}
            />
          </View>
        </Card.Content>
      </Card>
    </View>
  );

  const renderJournalSetup = () => (
    <View style={styles.phaseContainer}>
      <Card style={styles.contentCard} mode="elevated">
        <Card.Content>
          <View style={styles.iconHeader}>
            <Ionicons name="book" size={40} color={klareColors.k} />
          </View>
          <Text style={styles.phaseTitle}>Dein Klarheits-Tagebuch</Text>
          <Text style={styles.phaseDescription}>
            Klarheit ist keine einmalige Erkenntnis, sondern eine tägliche
            Praxis. Richte jetzt dein Klarheits-Tagebuch ein.
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.theoryCard} mode="outlined">
        <Card.Content>
          <Text style={styles.cardTitle}>📝 Tägliche Klarheits-Fragen</Text>
          <View style={styles.journalPrompts}>
            <Text style={styles.promptItem}>
              • Was war heute meine größte Erkenntnis?
            </Text>
            <Text style={styles.promptItem}>
              • Wo habe ich unpräzise kommuniziert?
            </Text>
            <Text style={styles.promptItem}>
              • Welche Inkongruenz habe ich bemerkt?
            </Text>
            <Text style={styles.promptItem}>
              • Was möchte ich morgen klarer sehen?
            </Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.infoCard} mode="outlined">
        <Card.Content>
          <Text style={styles.infoTitle}>⏰ Empfehlung</Text>
          <Text style={styles.infoText}>
            Nimm dir jeden Abend 5-10 Minuten Zeit für dein Klarheits-Tagebuch.
            Konsistenz ist wichtiger als Perfektion.
          </Text>
          <Button
            mode="outlined"
            onPress={() => navigation.navigate("Journal")}
            style={styles.actionButton}
          >
            Zum Journal
          </Button>
        </Card.Content>
      </Card>
    </View>
  );

  const renderCompletion = () => (
    <View style={styles.phaseContainer}>
      <Card style={styles.completionCard} mode="elevated">
        <Card.Content>
          <View style={styles.iconHeader}>
            <Ionicons name="checkmark-circle" size={64} color={klareColors.k} />
          </View>
          <Text style={styles.completionTitle}>
            {phaseContent.completion?.title ?? "Glückwunsch!"}
          </Text>
          <Text style={styles.completionText}>
            {phaseContent.completion?.description ??
              "Du hast das K-Modul (Klarheit) erfolgreich abgeschlossen. Du hast ein solides Fundament für deine Transformation gelegt."}
          </Text>
          {!!getModuleMarkdown(phaseContent.completion) && (
            <Markdown style={markdownStyles}>
              {getModuleMarkdown(phaseContent.completion)}
            </Markdown>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.summaryCard} mode="outlined">
        <Card.Content>
          <Text style={styles.cardTitle}>🎯 Was du erreicht hast</Text>
          <View style={styles.achievementsList}>
            <Text style={styles.achievementItem}>
              ✓ IST-Analyse mit dem Lebensrad
            </Text>
            <Text style={styles.achievementItem}>
              ✓ Meta-Modell in 3 Levels gemeistert
            </Text>
            <Text style={styles.achievementItem}>
              ✓ Genius Gate für Selbsterkenntnis genutzt
            </Text>
            <Text style={styles.achievementItem}>
              ✓ Inkongruenzen erkannt und kartiert
            </Text>
            <Text style={styles.achievementItem}>
              ✓ Klarheits-Tagebuch eingerichtet
            </Text>
          </View>
        </Card.Content>
      </Card>

      {aiResponse && (
        <Card style={styles.aiCoachCard} mode="elevated">
          <Card.Content>
            <View style={styles.coachHeader}>
              <Ionicons name="trophy" size={24} color={klareColors.k} />
              <Text style={styles.coachTitle}>
                Deine persönliche Zusammenfassung
              </Text>
            </View>
            <Text style={styles.coachMessage}>{aiResponse.message}</Text>
            {aiResponse.encouragement && (
              <Text style={styles.encouragement}>
                {aiResponse.encouragement}
              </Text>
            )}
          </Card.Content>
        </Card>
      )}

      <Card style={styles.nextStepCard} mode="outlined">
        <Card.Content>
          <Text style={styles.cardTitle}>
            🌱 Nächster Schritt: Lebendigkeit (L)
          </Text>
          <Text style={styles.nextStepText}>
            Jetzt, wo du Klarheit über deine Situation hast, ist es Zeit, deine
            natürliche Lebendigkeit wiederzuentdecken. Im L-Modul lernst du,
            deine Energie-Quellen zu finden und Blockaden aufzulösen.
          </Text>
        </Card.Content>
      </Card>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Progress Header */}
      <Surface style={styles.progressHeader}>
        <View style={styles.progressInfo}>
          <Text style={styles.progressTitle}>K-Modul: Klarheit</Text>
          <Text style={styles.progressSubtitle}>
            Phase {currentPhaseIndex + 1} von {totalPhases}:{" "}
            {currentPhase.title}
          </Text>
          {currentPhaseSteps > 1 && (
            <Text style={styles.progressSubtitle}>
              {currentPhaseSteps} Schritte in dieser Phase
            </Text>
          )}
        </View>
        <ProgressBar
          progress={progressPercentage / 100}
          color={klareColors.k}
          style={styles.progressBar}
        />
        <View style={styles.progressStats}>
          <Text style={styles.progressText}>
            {Math.round(progressPercentage)}% abgeschlossen
          </Text>
          <Text style={styles.progressText}>
            ~{currentPhase.estimatedMinutes} Min
          </Text>
        </View>
      </Surface>

      {/* Phase Content */}
      {renderPhaseContent()}

      {/* Navigation Buttons */}
      <View style={styles.navigationContainer}>
        {currentPhaseIndex > 0 && (
          <Button
            mode="outlined"
            onPress={handlePreviousPhase}
            style={styles.backButton}
            icon="arrow-left"
          >
            Zurück
          </Button>
        )}
        <Button
          mode="contained"
          onPress={handleNextPhase}
          style={styles.nextButton}
          buttonColor={klareColors.k}
          icon={
            currentPhaseIndex === totalPhases - 1 ? "checkmark" : "arrow-right"
          }
          contentStyle={{ flexDirection: "row-reverse" }}
        >
          {currentPhaseIndex === totalPhases - 1 ? "Abschließen" : "Weiter"}
        </Button>
      </View>

      {/* Phase Overview (collapsible) */}
      <Card style={styles.overviewCard} mode="outlined">
        <Card.Content>
          <Text style={styles.overviewTitle}>📋 Alle Phasen im Überblick</Text>
          {PHASE_CONFIGS.map((phase, index) => (
            <View
              key={phase.id}
              style={[
                styles.phaseItem,
                index === currentPhaseIndex && styles.phaseItemActive,
                completedPhases.includes(phase.id) && styles.phaseItemCompleted,
              ]}
            >
              <Ionicons
                name={
                  completedPhases.includes(phase.id)
                    ? "checkmark-circle"
                    : index === currentPhaseIndex
                      ? "radio-button-on"
                      : "radio-button-off"
                }
                size={20}
                color={
                  completedPhases.includes(phase.id) ||
                  index === currentPhaseIndex
                    ? klareColors.k
                    : theme.colors.outline
                }
              />
              <Text
                style={[
                  styles.phaseItemText,
                  index === currentPhaseIndex && styles.phaseItemTextActive,
                ]}
              >
                {index + 1}. {phase.title}
              </Text>
            </View>
          ))}
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const createStyles = (theme: any, klareColors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    progressHeader: {
      padding: 16,
      backgroundColor: theme.colors.surface,
      elevation: 2,
    },
    progressInfo: {
      marginBottom: 12,
    },
    progressTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.colors.onSurface,
    },
    progressSubtitle: {
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
      marginTop: 4,
    },
    progressBar: {
      height: 8,
      borderRadius: 4,
      marginBottom: 8,
    },
    progressStats: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    progressText: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
    },
    phaseContainer: {
      padding: 16,
      gap: 16,
    },
    loadingContainer: {
      padding: 32,
      alignItems: "center",
      justifyContent: "center",
    },

    // Welcome Phase
    welcomeCard: {
      backgroundColor: theme.colors.surface,
    },
    iconHeader: {
      alignItems: "center",
      marginBottom: 16,
    },
    welcomeTitle: {
      fontSize: 24,
      fontWeight: "700",
      color: theme.colors.onSurface,
      textAlign: "center",
      marginBottom: 12,
    },
    welcomeText: {
      fontSize: 15,
      lineHeight: 22,
      color: theme.colors.onSurface,
      marginBottom: 16,
    },
    bulletList: {
      gap: 8,
    },
    bulletItem: {
      fontSize: 14,
      color: theme.colors.onSurface,
      lineHeight: 20,
    },

    // AI Coach Card
    aiCoachCard: {
      backgroundColor: theme.colors.surface,
      borderLeftWidth: 4,
      borderLeftColor: klareColors.k,
    },
    coachHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 12,
    },
    coachTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: klareColors.k,
    },
    coachMessage: {
      fontSize: 15,
      lineHeight: 22,
      color: theme.colors.onSurface,
      marginBottom: 8,
    },
    encouragement: {
      fontSize: 14,
      fontStyle: "italic",
      color: klareColors.k,
      marginTop: 8,
    },

    // Content Cards
    contentCard: {
      backgroundColor: theme.colors.surface,
    },
    phaseTitle: {
      fontSize: 20,
      fontWeight: "600",
      color: theme.colors.onSurface,
      marginBottom: 12,
    },
    phaseDescription: {
      fontSize: 15,
      lineHeight: 22,
      color: theme.colors.onSurface,
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.onSurface,
      marginBottom: 12,
    },

    // Info Card
    infoCard: {
      backgroundColor: theme.colors.surfaceVariant,
    },
    infoTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: klareColors.k,
      marginBottom: 8,
    },
    infoText: {
      fontSize: 14,
      color: theme.colors.onSurface,
      lineHeight: 20,
      marginBottom: 8,
    },
    infoSubtext: {
      fontSize: 13,
      color: theme.colors.onSurfaceVariant,
      fontStyle: "italic",
    },

    // CTA Card (Call-to-Action)
    ctaCard: {
      backgroundColor: `${klareColors.k}15`,
      borderWidth: 2,
      borderColor: klareColors.k,
    },
    ctaTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: klareColors.k,
      marginBottom: 8,
      textAlign: "center",
    },
    ctaText: {
      fontSize: 15,
      lineHeight: 22,
      color: theme.colors.onSurface,
      marginBottom: 16,
      textAlign: "center",
    },
    ctaButton: {
      marginTop: 8,
    },

    // Questions Card (Reflexionsfragen)
    questionsCard: {
      backgroundColor: theme.colors.surface,
      borderLeftWidth: 4,
      borderLeftColor: klareColors.k,
    },
    questionsTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.onSurface,
      marginBottom: 16,
    },
    questionItem: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 12,
      marginBottom: 12,
      paddingVertical: 8,
    },
    questionText: {
      flex: 1,
      fontSize: 15,
      lineHeight: 22,
      color: theme.colors.onSurface,
    },
    questionHint: {
      fontSize: 13,
      fontStyle: "italic",
      color: theme.colors.onSurfaceVariant,
      marginTop: 8,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline,
    },

    // Encouragement Card
    encouragementCard: {
      backgroundColor: `${klareColors.k}10`,
      borderColor: klareColors.k,
      borderWidth: 1,
    },
    encouragementText: {
      fontSize: 15,
      fontWeight: "500",
      color: klareColors.k,
      textAlign: "center",
      lineHeight: 22,
    },

    // LifeWheel
    lifeWheelCard: {
      backgroundColor: theme.colors.surface,
    },
    lifeWheelSummary: {
      gap: 12,
    },
    areaRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 8,
    },
    areaName: {
      fontSize: 14,
      fontWeight: "500",
      color: theme.colors.onSurface,
    },
    ratingContainer: {
      flexDirection: "row",
      gap: 12,
    },
    ratingText: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
    },
    emptyState: {
      alignItems: "center",
      paddingVertical: 24,
      gap: 12,
    },
    emptyText: {
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
    },

    // Theory Card
    theoryCard: {
      backgroundColor: theme.colors.surface,
    },
    categoryBox: {
      marginBottom: 16,
      padding: 12,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: 8,
    },
    categoryTitle: {
      fontSize: 15,
      fontWeight: "600",
      color: theme.colors.onSurface,
      marginBottom: 8,
    },
    categoryText: {
      fontSize: 14,
      lineHeight: 20,
      color: theme.colors.onSurface,
      marginBottom: 8,
    },
    exampleText: {
      fontSize: 13,
      fontStyle: "italic",
      color: klareColors.k,
      lineHeight: 18,
    },

    // Meta-Model Practice
    levelCard: {
      backgroundColor: theme.colors.surface,
    },
    levelHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    levelTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.colors.onSurface,
    },
    levelChip: {
      borderColor: klareColors.k,
    },
    levelDescription: {
      fontSize: 14,
      color: theme.colors.onSurface,
    },

    // Input Card
    inputCard: {
      backgroundColor: theme.colors.surface,
    },
    inputLabel: {
      fontSize: 14,
      fontWeight: "500",
      color: theme.colors.onSurface,
      marginBottom: 8,
    },
    inputHint: {
      fontSize: 12,
      color: klareColors.k,
      marginBottom: 12,
      fontStyle: "italic",
    },
    textInput: {
      borderWidth: 1,
      borderColor: theme.colors.outline,
      borderRadius: 8,
      padding: 12,
      minHeight: 80,
      textAlignVertical: "top",
      fontSize: 15,
      color: theme.colors.onSurface,
      backgroundColor: theme.colors.background,
      marginBottom: 12,
    },
    analyzeButton: {
      alignSelf: "flex-end",
    },

    // Results Card
    resultsCard: {
      backgroundColor: theme.colors.surface,
    },
    resultItem: {
      marginBottom: 16,
    },
    patternChip: {
      alignSelf: "flex-start",
      marginBottom: 8,
      backgroundColor: `${klareColors.k}20`,
    },
    identifiedWord: {
      fontSize: 14,
      fontStyle: "italic",
      color: theme.colors.onSurfaceVariant,
      marginBottom: 8,
    },
    questionBox: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 8,
      backgroundColor: theme.colors.background,
      padding: 12,
      borderRadius: 8,
    },
    generatedQuestion: {
      fontSize: 14,
      color: theme.colors.onSurface,
      lineHeight: 20,
      flex: 1,
    },
    divider: {
      marginTop: 16,
    },

    // Exercise Steps Display
    levelSubtext: {
      fontSize: 13,
      color: theme.colors.onSurfaceVariant,
      marginTop: 8,
      fontStyle: "italic",
    },
    exerciseStepsCard: {
      backgroundColor: theme.colors.surface,
    },
    exerciseStepItem: {
      paddingVertical: 8,
    },
    stepHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 6,
    },
    stepTypeChip: {
      height: 24,
      backgroundColor: `${klareColors.k}15`,
    },
    stepTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.colors.onSurface,
      flex: 1,
    },
    stepInstructions: {
      fontSize: 13,
      color: theme.colors.onSurfaceVariant,
      lineHeight: 18,
      marginLeft: 8,
    },
    stepDivider: {
      marginTop: 8,
      backgroundColor: theme.colors.outlineVariant,
    },

    // Genius Gate
    stepsList: {
      gap: 8,
    },
    stepItem: {
      fontSize: 14,
      color: theme.colors.onSurface,
      lineHeight: 20,
    },

    // Incongruence Mapping
    incongruenceSection: {
      marginBottom: 20,
    },
    incongruenceLabel: {
      fontSize: 15,
      fontWeight: "600",
      color: theme.colors.onSurface,
      marginBottom: 4,
    },
    incongruenceHint: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
      marginBottom: 8,
    },

    // Reflection
    reflectionSection: {
      marginBottom: 20,
    },
    reflectionLabel: {
      fontSize: 15,
      fontWeight: "600",
      color: theme.colors.onSurface,
      marginBottom: 8,
    },

    // Journal Setup
    journalPrompts: {
      gap: 8,
    },
    promptItem: {
      fontSize: 14,
      color: theme.colors.onSurface,
      lineHeight: 20,
    },

    // Completion
    completionCard: {
      backgroundColor: theme.colors.surface,
    },
    completionTitle: {
      fontSize: 28,
      fontWeight: "700",
      color: klareColors.k,
      textAlign: "center",
      marginBottom: 16,
    },
    completionText: {
      fontSize: 16,
      lineHeight: 24,
      color: theme.colors.onSurface,
      textAlign: "center",
    },

    // Completed Card (für bereits abgeschlossene Analysen)
    completedCard: {
      backgroundColor: `${klareColors.k}10`,
      borderColor: klareColors.k,
      borderWidth: 1,
    },
    completedHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 8,
    },
    completedTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: klareColors.k,
    },
    completedText: {
      fontSize: 14,
      color: theme.colors.onSurface,
      marginBottom: 4,
    },
    completedSubtext: {
      fontSize: 13,
      fontStyle: "italic",
      color: theme.colors.onSurfaceVariant,
    },

    summaryCard: {
      backgroundColor: theme.colors.surface,
    },
    achievementsList: {
      gap: 8,
    },
    achievementItem: {
      fontSize: 14,
      color: theme.colors.onSurface,
      lineHeight: 20,
    },
    nextStepCard: {
      backgroundColor: theme.colors.surfaceVariant,
    },
    nextStepText: {
      fontSize: 14,
      lineHeight: 20,
      color: theme.colors.onSurface,
    },

    // Navigation
    navigationContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      padding: 16,
      gap: 12,
    },
    backButton: {
      flex: 1,
    },
    nextButton: {
      flex: 2,
    },
    actionButton: {
      marginTop: 12,
    },

    // Phase Overview
    overviewCard: {
      margin: 16,
      marginTop: 0,
      backgroundColor: theme.colors.surface,
    },
    overviewTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.colors.onSurface,
      marginBottom: 12,
    },
    phaseItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingVertical: 8,
    },
    phaseItemActive: {
      backgroundColor: `${klareColors.k}10`,
      paddingHorizontal: 8,
      borderRadius: 4,
    },
    phaseItemCompleted: {
      opacity: 0.6,
    },
    phaseItemText: {
      fontSize: 13,
      color: theme.colors.onSurface,
    },
    phaseItemTextActive: {
      fontWeight: "600",
      color: klareColors.k,
    },
  });

export default KModuleComponentNew;
