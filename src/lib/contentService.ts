// src/lib/contentService.ts
import { supabase } from "./supabase";

import { Database } from "../types/supabase";

type ModuleContentRow = Database["public"]["Tables"]["module_contents"]["Row"];
type ContentSectionRow =
  Database["public"]["Tables"]["content_sections"]["Row"];
type ExerciseStepRow = Database["public"]["Tables"]["exercise_steps"]["Row"];
type QuizQuestionRow = Database["public"]["Tables"]["quiz_questions"]["Row"];

// Interface-Definitionen, die mit den Datenbanktypen übereinstimmen
export interface ContentSection extends ContentSectionRow {}

export interface ExerciseStep extends ExerciseStepRow {
  step_type: "reflection" | "practice" | "input" | "selection" | "journal";
}

export interface QuizQuestion extends QuizQuestionRow {}

export interface ExerciseOptions {
  inputType?: "text" | "number" | "choice";
  choices?: string[];
  allowMultiple?: boolean;
  minLength?: number;
  maxLength?: number;
  placeholder?: string;
  [key: string]: unknown;
}

export interface QuizQuestion
  extends Omit<QuizQuestionRow, "options" | "correct_answer"> {
  question_type: "single_choice" | "multiple_choice" | "text" | "true_false";
  options: string[];
  correct_answer: string | string[]; // Für Mehrfachauswahl
}
export interface ModuleContent extends Omit<ModuleContentRow, "content"> {
  content_type: "intro" | "theory" | "text" | "video" | "exercise" | "quiz";
  content: ModuleContentData;
  sections?: ContentSection[];
  exercise_steps?: ExerciseStep[];
  quiz_questions?: QuizQuestion[];
}

export interface ModuleContentData {
  intro_text?: string;
  key_points?: string[];
  description?: string;
  video_url?: string;
  media_url?: string;
  content?: string; // Für Video-Module
  [key: string]: unknown; // Für andere Inhalte
}
// Funktion zum Laden eines Moduls mit allen zugehörigen Inhalten
export const loadModuleContent = async (
  moduleId: string,
): Promise<ModuleContent | null> => {
  try {
    // Modul-Hauptinformationen abrufen
    const { data: moduleData, error: moduleError } = await supabase
      .from("module_contents")
      .select("*")
      .eq("module_id", moduleId)
      .single();

    // Wenn das Modul nicht in Supabase gefunden wurde oder ein Fehler auftritt,
    // versuchen wir, lokale Daten zu verwenden
    if (moduleError || !moduleData) {
      console.log(
        "Modul nicht in Supabase gefunden, verwende lokale Daten:",
        moduleId,
      );
      //TODO: lokal Fallback | return createLocalModuleContent(moduleId);
    }

    // Vollständiges Modul-Objekt erstellen
    const fullModule: ModuleContent = {
      ...moduleData,
      sections: [],
      exercise_steps: [],
      quiz_questions: [],
    };

    // Inhaltsabschnitte laden (für text-basierte Module)
    if (["intro", "theory", "text"].includes(moduleData.content_type)) {
      const { data: sectionsData, error: sectionsError } = await supabase
        .from("content_sections")
        .select("*")
        .eq("module_content_id", moduleData.id)
        .order("order_index", { ascending: true });

      if (!sectionsError && sectionsData) {
        fullModule.sections = sectionsData;
      }
    }

    // Übungsschritte laden (für exercise-Module)
    if (moduleData.content_type === "exercise") {
      const { data: stepsData, error: stepsError } = await supabase
        .from("exercise_steps")
        .select("*")
        .eq("module_content_id", moduleData.id)
        .order("order_index", { ascending: true });

      if (!stepsError && stepsData) {
        fullModule.exercise_steps = stepsData.map((step) => ({
          ...step,
          options: (step.options as ExerciseOptions) || {}, // Standardwert für options setzen
          step_type: (step.step_type as ExerciseStep["step_type"]) || "input", // Standardwert für step_type setzen
        }));
      }
    }

    // Quiz-Fragen laden (für quiz-Module)
    if (moduleData.content_type === "quiz") {
      const { data: questionsData, error: questionsError } = await supabase
        .from("quiz_questions")
        .select("*")
        .eq("module_content_id", moduleData.id)
        .order("order_index", { ascending: true });

      if (!questionsError && questionsData) {
        fullModule.quiz_questions = questionsData;
      }
    }

    return fullModule;
  } catch (error) {
    console.error("Fehler beim Laden des Moduls:", error);
    return null;
  }
};

// Funktion zum Laden aller Module für einen KLARE-Schritt
export const loadModulesByStep = async (
  stepId: "K" | "L" | "A" | "R" | "E",
): Promise<ModuleContent[]> => {
  try {
    const prefix = stepId.toLowerCase() + "-";

    const { data, error } = await supabase
      .from("module_contents")
      .select("*")
      .ilike("module_id", `${prefix}%`)
      .order("order_index", { ascending: true });

    if (error) {
      console.error(`Error loading modules for step ${stepId}:`, error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error(
      `Unexpected error loading modules for step ${stepId}:`,
      error,
    );
    return [];
  }
};

// Speichern von Übungsergebnissen
export const saveExerciseResult = async (
  exerciseId: string,
  moduleId: string,
  answer: any,
): Promise<boolean> => {
  try {
    // Check if answer is a JSON string with currentValue and targetValue
    if (typeof answer === "string") {
      try {
        // Try to parse the answer if it's a JSON string
        const parsedAnswer = JSON.parse(answer);

        // If it has currentValue and targetValue properties, handle appropriately
        if (
          parsedAnswer &&
          (parsedAnswer.currentValue !== undefined ||
            parsedAnswer.targetValue !== undefined)
        ) {
          // Store as stringified JSON to avoid type issues
          answer = JSON.stringify(parsedAnswer);
        }
      } catch (e) {
        // Not a valid JSON string, keep as is
      }
    } else if (typeof answer === "object" && answer !== null) {
      // If it's already an object with the properties, stringify it
      if (
        answer.currentValue !== undefined ||
        answer.targetValue !== undefined
      ) {
        answer = JSON.stringify(answer);
      }
    }

    const { data, error } = await supabase.from("user_exercise_results").upsert(
      {
        exercise_id: exerciseId,
        module_id: moduleId,
        answer: answer,
        created_at: new Date().toISOString(),
      },
      { onConflict: "exercise_id, module_id" },
    );

    if (error) {
      console.error("Fehler beim Speichern des Übungsergebnisses:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Fehler beim Speichern des Übungsergebnisses:", error);
    return false;
  }
};

// Speichern von Quiz-Antworten
export const saveQuizAnswer = async (
  userId: string,
  questionId: string,
  userAnswer: any,
  isCorrect: boolean,
): Promise<boolean> => {
  try {
    const { error } = await supabase.from("user_quiz_answers").insert({
      user_id: userId,
      question_id: questionId,
      user_answer: userAnswer,
      is_correct: isCorrect,
      completed_at: new Date().toISOString(),
    });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Fehler beim Speichern der Quiz-Antwort:", error);
    return false;
  }
};

// Hilfsfunktion zur Erstellung von Modulinhalten aus lokalen Daten
// const createLocalModuleContent = (moduleId: string): ModuleContent | null => {
//   // Modul-Metadaten abrufen
//   const moduleInfo = getModuleById(moduleId);
//   if (!moduleInfo) {
//     console.error("Kein lokales Modul mit dieser ID gefunden:", moduleId);
//     return null;
//   }
//
//   // Generiere eine eindeutige lokale ID
//   const localContentId = `local-${moduleId}-${Date.now()}`;
//
//   // Inhaltstyp und zugehörige Daten bestimmen
//   let contentType: string;
//   let contentData: any = {};
//   let sections: ContentSection[] = [];
//   let exerciseSteps: ExerciseStep[] = [];
//   let quizQuestions: QuizQuestion[] = [];
//   const currentTime = new Date().toISOString();
//
//   console.log(
//     `Creating local content for module: ${moduleId}, type: ${moduleInfo.type}`,
//   );
//
//   // Text-basierte Module
//   if (moduleId.includes("-theory") || moduleId.includes("-intro")) {
//     contentType = moduleId.includes("-intro") ? "intro" : "theory";
//
//     // Theorie-Inhalt aus lokalen Daten laden
//     const textKey = moduleId.replace("-", "_") + "_text";
//     console.log(`Looking for theory content with key: ${textKey}`);
//
//     if (theoryContent[textKey]) {
//       // Markdown-Text in Abschnitte aufteilen
//       const markdownText = theoryContent[textKey];
//
//       // Grundlegenden Inhalt mit Einführungstext erstellen
//       contentData = {
//         intro_text: `Dies ist ein lokaler Inhalt für das Modul "${moduleInfo.title}".`,
//         key_points: [
//           "Wichtiger Punkt 1",
//           "Wichtiger Punkt 2",
//           "Wichtiger Punkt 3",
//         ],
//       };
//
//       // Einen Hauptabschnitt erstellen
//       sections = [
//         {
//           id: `section-${moduleId}-1`,
//           title: moduleInfo.title,
//           content: markdownText,
//           media_url: null,
//           order_index: 1,
//           module_content_id: localContentId,
//           created_at: currentTime,
//           updated_at: currentTime,
//         },
//       ];
//       console.log(
//         `Created theory content for ${moduleId} with ${sections.length} sections`,
//       );
//     } else {
//       console.warn(`No theory content found for key: ${textKey}`);
//     }
//   }
//   // Übungen
//   else if (
//     moduleId.includes("-lifewheel") ||
//     moduleId.includes("-reality-check") ||
//     moduleId.includes("-incongruence") ||
//     moduleId.includes("exercise") ||
//     moduleInfo.type === "exercise"
//   ) {
//     contentType = "exercise";
//
//     // Übungsdaten aus lokalen Daten laden
//     let exerciseKey = moduleId.replace("-", "_");
//
//     // Zusätzliche Mapping für bestimmte Module
//     const exerciseMapping: Record<string, string> = {
//       k_lifewheel: "k_lifewheel_exercise",
//       k_reality_check: "k_reality_check_exercise",
//       k_incongruence_finder: "k_incongruence_finder",
//       k_reflection: "k_reflection_exercise",
//     };
//
//     if (exerciseMapping[exerciseKey]) {
//       exerciseKey = exerciseMapping[exerciseKey];
//     }
//
//     console.log(`Looking for exercise content with key: ${exerciseKey}`);
//
//     if (exerciseContent[exerciseKey]) {
//       const exercise = exerciseContent[exerciseKey];
//
//       contentData = {
//         description: exercise.description,
//       };
//
//       // Übungsschritte erstellen
//       exerciseSteps = [
//         ...exercise.steps.map((step, index) => ({
//           id: `step-${moduleId}-${index + 1}`,
//           title: `Schritt ${index + 1}`,
//           instructions: step,
//           step_type: "practice",
//           options: {},
//           order_index: index + 1,
//           module_content_id: localContentId,
//           created_at: currentTime,
//           updated_at: currentTime,
//         })),
//         ...exercise.reflection.map((reflection, index) => ({
//           id: `reflection-${moduleId}-${index + 1}`,
//           title: `Reflexion ${index + 1}`,
//           instructions: reflection,
//           step_type: "reflection",
//           options: {},
//           order_index: exercise.steps.length + index + 1,
//           module_content_id: localContentId,
//           created_at: currentTime,
//           updated_at: currentTime,
//         })),
//       ];
//       console.log(
//         `Created exercise content for ${moduleId} with ${exerciseSteps.length} steps`,
//       );
//     } else {
//       console.warn(`No exercise content found for key: ${exerciseKey}`);
//     }
//   }
//   // Quiz
//   else if (moduleId.includes("-quiz") || moduleInfo.type === "quiz") {
//     contentType = "quiz";
//
//     // Quiz-Daten aus lokalen Daten laden
//     const quizKey = moduleId.replace("-", "_") + "_content";
//     console.log(`Looking for quiz content with key: ${quizKey}`);
//
//     if (quizContent[quizKey]) {
//       const quiz = quizContent[quizKey];
//
//       contentData = {
//         introduction: `Dies ist ein Quiz zum Thema "${moduleInfo.title}"`,
//       };
//
//       // Quiz-Fragen erstellen
//       quizQuestions = quiz.questions.map((q, index) => ({
//         id: `question-${moduleId}-${index + 1}`,
//         question: q.question,
//         question_type: "single_choice",
//         options: q.options,
//         correct_answer: q.correctAnswer,
//         explanation: q.explanation,
//         order_index: index + 1,
//         module_content_id: localContentId,
//         created_at: currentTime,
//         updated_at: currentTime,
//       }));
//       console.log(
//         `Created quiz content for ${moduleId} with ${quizQuestions.length} questions`,
//       );
//     } else {
//       console.warn(`No quiz content found for key: ${quizKey}`);
//     }
//   }
//   // Video oder anderer Typ
//   else {
//     contentType = moduleInfo.type === "video" ? "video" : "text";
//     contentData = {
//       intro_text: `Dies ist ein lokaler Platzhalter für das "${moduleInfo.type}"-Modul "${moduleInfo.title}".`,
//     };
//
//     sections = [
//       {
//         id: `section-${moduleId}-1`,
//         title: "Einführung",
//         content: `# ${moduleInfo.title}\n\n${moduleInfo.description || "Keine Beschreibung verfügbar"}\n\nDieser Inhalt wird bald verfügbar sein.`,
//         media_url: null,
//         order_index: 1,
//         module_content_id: localContentId,
//         created_at: currentTime,
//         updated_at: currentTime,
//       },
//     ];
//     console.log(`Created placeholder content for ${moduleId}`);
//   }
//
//   // Vollständiges ModuleContent-Objekt erstellen
//   return {
//     id: localContentId,
//     module_id: moduleId,
//     content_type: contentType,
//     title: moduleInfo.title,
//     description: moduleInfo.description,
//     content: contentData,
//     order_index: moduleInfo.order,
//     created_at: currentTime,
//     updated_at: currentTime,
//     sections,
//     exercise_steps: exerciseSteps,
//     quiz_questions: quizQuestions,
//   };
// };

// Laden der bereits gespeicherten Antworten eines Benutzers für ein bestimmtes Modul
export const loadUserModuleProgress = async (
  userId: string,
  moduleId: string,
): Promise<{
  exerciseResults: Record<string, any>;
  quizAnswers: Record<string, any>;
}> => {
  try {
    // Zuerst das Modul laden, um die IDs der Schritte/Fragen zu bekommen
    const moduleContent = await loadModuleContent(moduleId);

    if (!moduleContent) {
      return { exerciseResults: {}, quizAnswers: {} };
    }

    const exerciseResults: Record<string, any> = {};
    const quizAnswers: Record<string, any> = {};

    // Übungsergebnisse laden, falls vorhanden
    if (
      moduleContent.exercise_steps &&
      moduleContent.exercise_steps.length > 0
    ) {
      const stepIds = moduleContent.exercise_steps.map((step) => step.id);

      const { data: resultsData } = await supabase
        .from("user_exercise_results")
        .select("*")
        .eq("user_id", userId)
        .in("exercise_step_id", stepIds);

      if (resultsData) {
        resultsData.forEach((result) => {
          // Process the answer if needed, especially for LifeWheel exercises
          let processedAnswer = result.answer;

          // Make sure LifeWheel answers have properly formatted numeric values
          if (
            processedAnswer &&
            typeof processedAnswer === "object" &&
            "currentValue" in processedAnswer &&
            "targetValue" in processedAnswer
          ) {
            processedAnswer = {
              currentValue: Number(processedAnswer.currentValue),
              targetValue: Number(processedAnswer.targetValue),
            };
          }

          exerciseResults[result.exercise_step_id] = processedAnswer;
        });
      }
    }

    // Quiz-Antworten laden, falls vorhanden
    if (
      moduleContent.quiz_questions &&
      moduleContent.quiz_questions.length > 0
    ) {
      const questionIds = moduleContent.quiz_questions.map(
        (question) => question.id,
      );

      const { data: answersData } = await supabase
        .from("user_quiz_answers")
        .select("*")
        .eq("user_id", userId)
        .in("question_id", questionIds);

      if (answersData) {
        answersData.forEach((answer) => {
          quizAnswers[answer.question_id] = {
            userAnswer: answer.user_answer,
            isCorrect: answer.is_correct,
          };
        });
      }
    }

    return { exerciseResults, quizAnswers };
  } catch (error) {
    console.error("Fehler beim Laden des Benutzerfortschritts:", error);
    return { exerciseResults: {}, quizAnswers: {} };
  }
};
