export type RootStackParamList = {
  Root: undefined;
  KlareMethod: { step?: "K" | "L" | "A" | "R" | "E" };
  Module: { moduleId: string };
  Exercise: { exerciseId: string };
  LifeWheelDetail: undefined;
};

export type RootTabParamList = {
  Home: undefined;
  Learn: undefined;
  LifeWheel: undefined;
  Profile: undefined;
};
