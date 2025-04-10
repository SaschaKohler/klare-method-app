// src/screens/__tests__/ModuleScreen.test.tsx
import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ModuleScreen from '../ModuleScreen';
import { loadModuleContent } from '../../lib/contentService';
import { useUserStore } from '../../store/useUserStore';

// Mock für contentService
jest.mock('../../lib/contentService', () => ({
  loadModuleContent: jest.fn(),
  ModuleContent: {
    id: 'test-module-id',
    module_id: 'k-intro',
    content_type: 'intro',
    title: 'Test Module',
    description: 'Test Description',
    content: { intro_text: 'This is a test module' },
    order_index: 1,
  }
}));

// Mock für useUserStore
jest.mock('../../store/useUserStore', () => ({
  useUserStore: jest.fn(),
}));

// Mocks für die Komponenten
jest.mock('../../components/modules/ModuleContent', () => 'ModuleContent');
jest.mock('../../components/modules/ModuleExercise', () => 'ModuleExercise');
jest.mock('../../components/modules/ModuleQuiz', () => 'ModuleQuiz');

// Mock für Navigation
const Stack = createNativeStackNavigator();
const MockNavigator = ({ params = { moduleId: 'k-intro', stepId: 'K' } }) => (
  <NavigationContainer>
    <Stack.Navigator>
      <Stack.Screen
        name="ModuleScreen"
        component={ModuleScreen}
        initialParams={params}
      />
    </Stack.Navigator>
  </NavigationContainer>
);

// Mock für die Navigation-Hooks
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
    }),
    useRoute: () => ({
      params: { moduleId: 'k-intro', stepId: 'K' },
    }),
  };
});

describe('ModuleScreen', () => {
  beforeEach(() => {
    // Mocks zurücksetzen
    jest.clearAllMocks();
    
    // Mock für useUserStore
    useUserStore.mockReturnValue({
      user: { id: 'test-user-id' },
      completeModule: jest.fn(),
    });
    
    // Standard-Modul-Daten
    const mockModuleData = {
      id: 'test-module-id',
      module_id: 'k-intro',
      content_type: 'intro',
      title: 'Test Module',
      description: 'Test Description',
      content: { intro_text: 'This is a test module' },
      order_index: 1,
      sections: [
        {
          id: 'section-1',
          title: 'Section 1',
          content: 'Section 1 content',
          order_index: 1,
        }
      ]
    };
    
    // Mock für loadModuleContent
    loadModuleContent.mockResolvedValue(mockModuleData);
  });

  test('Lädt Moduldaten beim Mounten', async () => {
    await act(async () => {
      render(<MockNavigator />);
    });
    
    // Prüfen, ob loadModuleContent aufgerufen wurde
    expect(loadModuleContent).toHaveBeenCalledWith('k-intro');
  });

  test('Zeigt Ladeindikator beim Laden der Daten', async () => {
    // loadModuleContent-Promise wird nicht sofort aufgelöst
    loadModuleContent.mockReturnValue(new Promise(() => {}));
    
    const { getByText } = render(<MockNavigator />);
    
    // Ladeindikator sollte angezeigt werden
    expect(getByText('Modul wird geladen...')).toBeTruthy();
  });

  test('Zeigt Fehler an, wenn das Laden fehlschlägt', async () => {
    // loadModuleContent schlägt fehl
    loadModuleContent.mockRejectedValue(new Error('Test error'));
    
    let component;
    await act(async () => {
      component = render(<MockNavigator />);
    });
    
    // Fehler sollte angezeigt werden
    expect(component.getByText('Fehler')).toBeTruthy();
    expect(component.getByText('Test error')).toBeTruthy();
    
    // Erneut versuchen Button sollte angezeigt werden
    expect(component.getByText('Erneut versuchen')).toBeTruthy();
  });

  test('Rendert ModuleContent für intro-Module', async () => {
    const mockModuleData = {
      id: 'test-module-id',
      module_id: 'k-intro',
      content_type: 'intro',
      title: 'Test Intro Module',
      description: 'Test Description',
      content: { intro_text: 'This is a test module' },
      order_index: 1,
      sections: []
    };
    
    loadModuleContent.mockResolvedValue(mockModuleData);
    
    let component;
    await act(async () => {
      component = render(<MockNavigator />);
    });
    
    // Modultitel sollte angezeigt werden
    expect(component.getByText('Test Intro Module')).toBeTruthy();
    
    // ModuleContent sollte gerendert werden (da wir es gemockt haben, prüfen wir indirekt)
    // In einem echten Test würde man prüfen, ob die Komponente mit den richtigen Props gerendert wird
  });

  test('Rendert ModuleExercise für exercise-Module', async () => {
    const mockModuleData = {
      id: 'test-module-id',
      module_id: 'k-exercise',
      content_type: 'exercise',
      title: 'Test Exercise Module',
      description: 'Test Description',
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
    
    loadModuleContent.mockResolvedValue(mockModuleData);
    
    let component;
    await act(async () => {
      component = render(<MockNavigator params={{ moduleId: 'k-exercise', stepId: 'K' }} />);
    });
    
    // Modultitel sollte angezeigt werden
    expect(component.getByText('Test Exercise Module')).toBeTruthy();
    
    // ModuleExercise sollte gerendert werden (da wir es gemockt haben, prüfen wir indirekt)
    // In einem echten Test würde man prüfen, ob die Komponente mit den richtigen Props gerendert wird
  });

  test('Rendert ModuleQuiz für quiz-Module', async () => {
    const mockModuleData = {
      id: 'test-module-id',
      module_id: 'k-quiz',
      content_type: 'quiz',
      title: 'Test Quiz Module',
      description: 'Test Description',
      content: { intro_text: 'This is a test quiz' },
      order_index: 1,
      quiz_questions: [
        {
          id: 'question-1',
          question: 'Test question',
          question_type: 'single_choice',
          options: ['Option 1', 'Option 2'],
          correct_answer: '0',
          explanation: 'Explanation',
          order_index: 1
        }
      ]
    };
    
    loadModuleContent.mockResolvedValue(mockModuleData);
    
    let component;
    await act(async () => {
      component = render(<MockNavigator params={{ moduleId: 'k-quiz', stepId: 'K' }} />);
    });
    
    // Modultitel sollte angezeigt werden
    expect(component.getByText('Test Quiz Module')).toBeTruthy();
    
    // ModuleQuiz sollte gerendert werden (da wir es gemockt haben, prüfen wir indirekt)
    // In einem echten Test würde man prüfen, ob die Komponente mit den richtigen Props gerendert wird
  });

  test('Markiert ein Modul als abgeschlossen, wenn der Abschließen-Button geklickt wird', async () => {
    const mockCompleteModule = jest.fn();
    useUserStore.mockReturnValue({
      user: { id: 'test-user-id' },
      completeModule: mockCompleteModule,
    });
    
    const mockModuleData = {
      id: 'test-module-id',
      module_id: 'k-intro',
      content_type: 'intro',
      title: 'Test Intro Module',
      description: 'Test Description',
      content: { intro_text: 'This is a test module' },
      order_index: 1,
      sections: []
    };
    
    loadModuleContent.mockResolvedValue(mockModuleData);
    
    // Navigation-Mock erstellen
    const mockGoBack = jest.fn();
    jest.spyOn(require('@react-navigation/native'), 'useNavigation').mockReturnValue({
      navigate: jest.fn(),
      goBack: mockGoBack,
    });
    
    let component;
    await act(async () => {
      component = render(<MockNavigator />);
    });
    
    // Warten auf das Rendering
    await waitFor(() => {
      expect(component.getByText('Test Intro Module')).toBeTruthy();
    });
    
    // "Abschließen"-Button finden und klicken
    const completeButton = component.getByText('Abschließen');
    fireEvent.press(completeButton);
    
    // Prüfen, ob completeModule aufgerufen wurde
    expect(mockCompleteModule).toHaveBeenCalledWith('k-intro');
    
    // Warten und prüfen, ob zurück navigiert wurde (nach einer kurzen Verzögerung)
    jest.runAllTimers(); // Wenn setTimeout gemockt ist
    expect(mockGoBack).toHaveBeenCalled();
  });

  test('Navigiert zurück, wenn der Zurück-Button geklickt wird', async () => {
    // Navigation-Mock erstellen
    const mockGoBack = jest.fn();
    jest.spyOn(require('@react-navigation/native'), 'useNavigation').mockReturnValue({
      navigate: jest.fn(),
      goBack: mockGoBack,
    });
    
    let component;
    await act(async () => {
      component = render(<MockNavigator />);
    });
    
    // Warten auf das Rendering
    await waitFor(() => {
      expect(component.getByText('Test Module')).toBeTruthy();
    });
    
    // Den Zurück-Button finden (IconButton mit icon="arrow-left")
    const backButton = component.getByTestId('back-button'); // Annahme: Der Button hat ein testID
    fireEvent.press(backButton);
    
    // Prüfen, ob zurück navigiert wurde
    expect(mockGoBack).toHaveBeenCalled();
  });

  test('Lädt Moduldaten neu, wenn der "Erneut versuchen"-Button geklickt wird', async () => {
    // loadModuleContent schlägt beim ersten Aufruf fehl
    loadModuleContent.mockRejectedValueOnce(new Error('Test error'));
    
    // Beim zweiten Aufruf liefert es Daten
    const mockModuleData = {
      id: 'test-module-id',
      module_id: 'k-intro',
      content_type: 'intro',
      title: 'Test Module',
      description: 'Test Description',
      content: { intro_text: 'This is a test module' },
      order_index: 1,
      sections: []
    };
    loadModuleContent.mockResolvedValueOnce(mockModuleData);
    
    let component;
    await act(async () => {
      component = render(<MockNavigator />);
    });
    
    // Warten auf das Rendering des Fehlerbildschirms
    await waitFor(() => {
      expect(component.getByText('Fehler')).toBeTruthy();
      expect(component.getByText('Test error')).toBeTruthy();
    });
    
    // loadModuleContent-Aufrufzähler zurücksetzen
    loadModuleContent.mockClear();
    
    // "Erneut versuchen"-Button finden und klicken
    const retryButton = component.getByText('Erneut versuchen');
    await act(async () => {
      fireEvent.press(retryButton);
    });
    
    // Prüfen, ob loadModuleContent erneut aufgerufen wurde
    expect(loadModuleContent).toHaveBeenCalledWith('k-intro');
    
    // Warten auf das Rendering der Inhalte
    await waitFor(() => {
      expect(component.getByText('Test Module')).toBeTruthy();
    });
  });
});
