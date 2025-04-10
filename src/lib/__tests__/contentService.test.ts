// src/lib/__tests__/contentService.test.ts
import { 
  loadModuleContent, 
  loadModulesByStep, 
  saveExerciseResult,
  saveQuizAnswer,
  loadUserModuleProgress
} from '../contentService';
import { supabase } from '../supabase';

// Mock für supabase
jest.mock('../supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    ilike: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    single: jest.fn()
  }
}));

describe('Content Service', () => {
  beforeEach(() => {
    // Mocks zurücksetzen
    jest.clearAllMocks();
  });

  describe('loadModuleContent', () => {
    test('Lädt ein Modul mit allen zugehörigen Inhalten (Text-Modul)', async () => {
      // Mock-Daten vorbereiten
      const mockModuleData = {
        id: 'test-id',
        module_id: 'k-intro',
        content_type: 'intro',
        title: 'Test Module',
        description: 'Test Description',
        content: { intro_text: 'This is a test module' },
        order_index: 1
      };
      
      const mockSections = [
        { 
          id: 'section-1', 
          title: 'Section 1', 
          content: 'Section 1 content', 
          order_index: 1 
        }
      ];
      
      // Supabase-Antworten mockieren
      supabase.from.mockImplementation((table) => {
        if (table === 'module_contents') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ 
              data: mockModuleData, 
              error: null 
            })
          };
        } else if (table === 'content_sections') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ 
              data: mockSections, 
              error: null 
            })
          };
        }
        return supabase;
      });
      
      // Funktion testen
      const result = await loadModuleContent('k-intro');
      
      // Prüfen, ob die Ergebnisse den Erwartungen entsprechen
      expect(result).not.toBeNull();
      expect(result?.title).toBe('Test Module');
      expect(result?.content_type).toBe('intro');
      expect(result?.sections?.length).toBe(1);
      expect(result?.sections?.[0].title).toBe('Section 1');
    });
    
    test('Lädt ein Modul mit Übungsschritten (Exercise-Modul)', async () => {
      // Mock-Daten vorbereiten
      const mockModuleData = {
        id: 'test-id',
        module_id: 'k-exercise',
        content_type: 'exercise',
        title: 'Test Exercise',
        description: 'Test Exercise Description',
        content: { intro_text: 'This is a test exercise' },
        order_index: 1
      };
      
      const mockExerciseSteps = [
        { 
          id: 'step-1', 
          title: 'Step 1', 
          instructions: 'Step 1 instructions',
          step_type: 'reflection',
          options: {},
          order_index: 1 
        }
      ];
      
      // Supabase-Antworten mockieren
      supabase.from.mockImplementation((table) => {
        if (table === 'module_contents') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ 
              data: mockModuleData, 
              error: null 
            })
          };
        } else if (table === 'exercise_steps') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ 
              data: mockExerciseSteps, 
              error: null 
            })
          };
        }
        return supabase;
      });
      
      // Funktion testen
      const result = await loadModuleContent('k-exercise');
      
      // Prüfen, ob die Ergebnisse den Erwartungen entsprechen
      expect(result).not.toBeNull();
      expect(result?.title).toBe('Test Exercise');
      expect(result?.content_type).toBe('exercise');
      expect(result?.exercise_steps?.length).toBe(1);
      expect(result?.exercise_steps?.[0].title).toBe('Step 1');
    });
    
    test('Lädt ein Modul mit Quiz-Fragen (Quiz-Modul)', async () => {
      // Mock-Daten vorbereiten
      const mockModuleData = {
        id: 'test-id',
        module_id: 'k-quiz',
        content_type: 'quiz',
        title: 'Test Quiz',
        description: 'Test Quiz Description',
        content: { intro_text: 'This is a test quiz' },
        order_index: 1
      };
      
      const mockQuizQuestions = [
        { 
          id: 'question-1', 
          question: 'Test question',
          question_type: 'single_choice',
          options: ['Option 1', 'Option 2'],
          correct_answer: '0',
          explanation: 'Explanation',
          order_index: 1 
        }
      ];
      
      // Supabase-Antworten mockieren
      supabase.from.mockImplementation((table) => {
        if (table === 'module_contents') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ 
              data: mockModuleData, 
              error: null 
            })
          };
        } else if (table === 'quiz_questions') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ 
              data: mockQuizQuestions, 
              error: null 
            })
          };
        }
        return supabase;
      });
      
      // Funktion testen
      const result = await loadModuleContent('k-quiz');
      
      // Prüfen, ob die Ergebnisse den Erwartungen entsprechen
      expect(result).not.toBeNull();
      expect(result?.title).toBe('Test Quiz');
      expect(result?.content_type).toBe('quiz');
      expect(result?.quiz_questions?.length).toBe(1);
      expect(result?.quiz_questions?.[0].question).toBe('Test question');
    });
    
    test('Gibt null zurück, wenn das Modul nicht gefunden wird', async () => {
      // Supabase-Antwort mockieren (kein Modul gefunden)
      supabase.from.mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ 
          data: null, 
          error: null 
        })
      }));
      
      // Funktion testen
      const result = await loadModuleContent('non-existent-module');
      
      // Prüfen, ob das Ergebnis null ist
      expect(result).toBeNull();
    });
    
    test('Gibt null zurück, wenn ein Fehler auftritt', async () => {
      // Supabase-Antwort mockieren (Fehler)
      supabase.from.mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ 
          data: null, 
          error: { message: 'Test error' } 
        })
      }));
      
      // Funktion testen
      const result = await loadModuleContent('k-intro');
      
      // Prüfen, ob das Ergebnis null ist
      expect(result).toBeNull();
    });
  });

  describe('loadModulesByStep', () => {
    test('Lädt alle Module für einen bestimmten Schritt', async () => {
      // Mock-Daten vorbereiten
      const mockModules = [
        {
          id: 'test-id-1',
          module_id: 'k-intro',
          content_type: 'intro',
          title: 'Test Module 1',
          description: 'Test Description 1',
          content: { intro_text: 'This is test module 1' },
          order_index: 1
        },
        {
          id: 'test-id-2',
          module_id: 'k-theory',
          content_type: 'text',
          title: 'Test Module 2',
          description: 'Test Description 2',
          content: { intro_text: 'This is test module 2' },
          order_index: 2
        }
      ];
      
      // Supabase-Antwort mockieren
      supabase.from.mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        ilike: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ 
          data: mockModules, 
          error: null 
        })
      }));
      
      // Funktion testen
      const result = await loadModulesByStep('K');
      
      // Prüfen, ob die Ergebnisse den Erwartungen entsprechen
      expect(result).toHaveLength(2);
      expect(result[0].module_id).toBe('k-intro');
      expect(result[1].module_id).toBe('k-theory');
      
      // Prüfen, ob die richtige Suche durchgeführt wurde
      expect(supabase.from).toHaveBeenCalledWith('module_contents');
      expect(supabase.ilike).toHaveBeenCalledWith('module_id', 'k-%');
    });
    
    test('Gibt ein leeres Array zurück, wenn keine Module gefunden werden', async () => {
      // Supabase-Antwort mockieren (keine Module gefunden)
      supabase.from.mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        ilike: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ 
          data: [], 
          error: null 
        })
      }));
      
      // Funktion testen
      const result = await loadModulesByStep('X');
      
      // Prüfen, ob das Ergebnis ein leeres Array ist
      expect(result).toEqual([]);
    });
    
    test('Gibt ein leeres Array zurück, wenn ein Fehler auftritt', async () => {
      // Supabase-Antwort mockieren (Fehler)
      supabase.from.mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        ilike: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ 
          data: null, 
          error: { message: 'Test error' } 
        })
      }));
      
      // Funktion testen
      const result = await loadModulesByStep('K');
      
      // Prüfen, ob das Ergebnis ein leeres Array ist
      expect(result).toEqual([]);
    });
  });

  describe('saveExerciseResult', () => {
    test('Speichert ein Übungsergebnis für einen Benutzer', async () => {
      // Supabase-Antwort mockieren
      supabase.from.mockImplementation(() => ({
        insert: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ 
          data: { id: 'result-id' }, 
          error: null 
        })
      }));
      
      // Testdaten
      const userId = 'test-user-id';
      const exerciseStepId = 'test-step-id';
      const answer = { text: 'Test answer' };
      
      // Funktion testen
      const result = await saveExerciseResult(userId, exerciseStepId, answer);
      
      // Prüfen, ob das Ergebnis erfolgreich war
      expect(result).toBe(true);
      
      // Prüfen, ob die richtige Insert-Operation durchgeführt wurde
      expect(supabase.from).toHaveBeenCalledWith('user_exercise_results');
      expect(supabase.insert).toHaveBeenCalledWith({
        user_id: userId,
        exercise_step_id: exerciseStepId,
        answer,
        completed_at: expect.any(String)
      });
    });
    
    test('Gibt false zurück, wenn ein Fehler auftritt', async () => {
      // Supabase-Antwort mockieren (Fehler)
      supabase.from.mockImplementation(() => ({
        insert: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ 
          data: null, 
          error: { message: 'Test error' } 
        })
      }));
      
      // Testdaten
      const userId = 'test-user-id';
      const exerciseStepId = 'test-step-id';
      const answer = { text: 'Test answer' };
      
      // Funktion testen
      const result = await saveExerciseResult(userId, exerciseStepId, answer);
      
      // Prüfen, ob das Ergebnis fehlgeschlagen ist
      expect(result).toBe(false);
    });
  });

  describe('saveQuizAnswer', () => {
    test('Speichert eine Quiz-Antwort für einen Benutzer', async () => {
      // Supabase-Antwort mockieren
      supabase.from.mockImplementation(() => ({
        insert: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ 
          data: { id: 'answer-id' }, 
          error: null 
        })
      }));
      
      // Testdaten
      const userId = 'test-user-id';
      const questionId = 'test-question-id';
      const userAnswer = '0';
      const isCorrect = true;
      
      // Funktion testen
      const result = await saveQuizAnswer(userId, questionId, userAnswer, isCorrect);
      
      // Prüfen, ob das Ergebnis erfolgreich war
      expect(result).toBe(true);
      
      // Prüfen, ob die richtige Insert-Operation durchgeführt wurde
      expect(supabase.from).toHaveBeenCalledWith('user_quiz_answers');
      expect(supabase.insert).toHaveBeenCalledWith({
        user_id: userId,
        question_id: questionId,
        user_answer: userAnswer,
        is_correct: isCorrect,
        completed_at: expect.any(String)
      });
    });
    
    test('Gibt false zurück, wenn ein Fehler auftritt', async () => {
      // Supabase-Antwort mockieren (Fehler)
      supabase.from.mockImplementation(() => ({
        insert: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ 
          data: null, 
          error: { message: 'Test error' } 
        })
      }));
      
      // Testdaten
      const userId = 'test-user-id';
      const questionId = 'test-question-id';
      const userAnswer = '0';
      const isCorrect = true;
      
      // Funktion testen
      const result = await saveQuizAnswer(userId, questionId, userAnswer, isCorrect);
      
      // Prüfen, ob das Ergebnis fehlgeschlagen ist
      expect(result).toBe(false);
    });
  });

  describe('loadUserModuleProgress', () => {
    test('Lädt den Fortschritt eines Benutzers für ein Modul', async () => {
      // Mock-Daten vorbereiten
      const mockModuleData = {
        id: 'test-id',
        module_id: 'k-exercise',
        content_type: 'exercise',
        title: 'Test Exercise',
        description: 'Test Exercise Description',
        content: { intro_text: 'This is a test exercise' },
        order_index: 1,
        exercise_steps: [
          { 
            id: 'step-1', 
            title: 'Step 1', 
            instructions: 'Step 1 instructions',
            step_type: 'reflection',
            options: {},
            order_index: 1 
          }
        ]
      };
      
      const mockExerciseResults = [
        {
          id: 'result-1',
          user_id: 'test-user-id',
          exercise_step_id: 'step-1',
          answer: { text: 'Test answer' },
          completed_at: '2023-01-01T00:00:00Z'
        }
      ];
      
      // Fake für die loadModuleContent-Funktion
      jest.spyOn(global, 'loadModuleContent').mockResolvedValue(mockModuleData);
      
      // Supabase-Antworten mockieren
      supabase.from.mockImplementation((table) => {
        if (table === 'user_exercise_results') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            in: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ 
              data: mockExerciseResults, 
              error: null 
            })
          };
        } else if (table === 'user_quiz_answers') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            in: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ 
              data: [], 
              error: null 
            })
          };
        }
        return supabase;
      });
      
      // Funktion testen
      const result = await loadUserModuleProgress('test-user-id', 'k-exercise');
      
      // Prüfen, ob die Ergebnisse den Erwartungen entsprechen
      expect(result.exerciseResults).toHaveProperty('step-1');
      expect(result.exerciseResults['step-1']).toEqual({ text: 'Test answer' });
      expect(result.quizAnswers).toEqual({});
      
      // Mock wiederherstellen
      jest.restoreAllMocks();
    });
    
    test('Gibt leere Objekte zurück, wenn keine Ergebnisse gefunden werden', async () => {
      // Mock-Daten vorbereiten
      const mockModuleData = {
        id: 'test-id',
        module_id: 'k-exercise',
        content_type: 'exercise',
        title: 'Test Exercise',
        description: 'Test Exercise Description',
        content: { intro_text: 'This is a test exercise' },
        order_index: 1,
        exercise_steps: [
          { 
            id: 'step-1', 
            title: 'Step 1', 
            instructions: 'Step 1 instructions',
            step_type: 'reflection',
            options: {},
            order_index: 1 
          }
        ]
      };
      
      // Fake für die loadModuleContent-Funktion
      jest.spyOn(global, 'loadModuleContent').mockResolvedValue(mockModuleData);
      
      // Supabase-Antworten mockieren (keine Ergebnisse)
      supabase.from.mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ 
          data: [], 
          error: null 
        })
      }));
      
      // Funktion testen
      const result = await loadUserModuleProgress('test-user-id', 'k-exercise');
      
      // Prüfen, ob die Ergebnisse leere Objekte sind
      expect(result.exerciseResults).toEqual({});
      expect(result.quizAnswers).toEqual({});
      
      // Mock wiederherstellen
      jest.restoreAllMocks();
    });
    
    test('Gibt leere Objekte zurück, wenn das Modul nicht gefunden wird', async () => {
      // Fake für die loadModuleContent-Funktion (Modul nicht gefunden)
      jest.spyOn(global, 'loadModuleContent').mockResolvedValue(null);
      
      // Funktion testen
      const result = await loadUserModuleProgress('test-user-id', 'non-existent-module');
      
      // Prüfen, ob die Ergebnisse leere Objekte sind
      expect(result.exerciseResults).toEqual({});
      expect(result.quizAnswers).toEqual({});
      
      // Mock wiederherstellen
      jest.restoreAllMocks();
    });
  });
});
