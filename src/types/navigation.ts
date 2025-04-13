export type KlareMethodStep = "K" | "L" | "A" | "R" | "E";

export type RootStackParamList = {
  Main: undefined;
  Auth: undefined;
  KlareMethod: {
    step: KlareMethodStep; // Make step required
  };
  ModuleScreen: {
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
};

export type RootTabParamList = {
  Home: undefined;
  Learn: undefined;
  Profile: undefined;
  Journal: undefined; // Add Journal to tab navigation if needed
};
