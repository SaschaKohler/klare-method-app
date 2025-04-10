// src/types/navigation.ts
export type RootStackParamList = {
  Main: undefined;
  Auth: undefined;
  KlareMethod: { step?: "K" | "L" | "A" | "R" | "E" };
  ModuleScreen: { stepId: "K" | "L" | "A" | "R" | "E" };
  LifeWheel: undefined;
};

export type RootTabParamList = {
  Home: undefined;
  Learn: undefined;
  Profile: undefined;
};
