export type KlareMethodStep = "K" | "L" | "A" | "R" | "E";

export type RootStackParamList = {
  Main: undefined;
  Auth: undefined;
  KlareMethod: {
    step: KlareMethodStep; // Make step required
  };
  ModuleScreen: {
    moduleId: string;
    stepId: KlareMethodStep; // Consistent naming and type
  };
  LifeWheel: undefined;
  Journal: undefined;
  JournalEditor: {
    templateId?: string;
    date?: string;
  };
  JournalViewer: {
    entryId: string;
  };
  VisionBoard: {
    boardId?: string;
    lifeAreas?: string[];
  };

};

export type RootTabParamList = {
  Home: undefined;
  Learn: undefined;
  Profile: undefined;
  Journal: undefined; 
  ResourceLibrary: undefined;
  ResourceFinder: undefined;
  EditResource: { resource: any }; 
  ResourceLibraryScreen: undefined;
  ResourceFinderScreen: undefined;
  EditResourceScreen: { resource: any }; 
  ResourceLibraryComponent: undefined;
  ResourceFinderComponent: undefined;
  LResourceManagerComponent: undefined;
  LModuleComponent: undefined;
  LModuleIndexComponent: undefined;

  VisionBoardScreen: undefined;
  ValuesHierarchyComponent: undefined;
  ResourceVisualizerComponent: undefined;
  ResourceFormComponent: undefined;
  ModuleComponents: undefined;
  ModuleContent: undefined;
  ModuleExercise: undefined;

  ModuleQuiz: undefined;
  ModuleExerciseStep: {
    stepId: string;
    moduleId: string;
  };
  ModuleExerciseStepProps: {
    step: any; // Define the type of step if possible
    onComplete: () => void;
    stepIndex: number;
    isLastStep: boolean;
  };
  ModuleQuizProps: {
    quiz: any; // Define the type of quiz if possible
    onComplete: () => void;
  };
};
