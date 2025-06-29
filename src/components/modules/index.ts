export { default as ModuleComponents } from "./ModuleComponents";
export { default as ModuleContent } from "./ModuleContent";
export { default as ModuleExercise } from "./ModuleExercise";
export { default as ModuleQuiz } from "./ModuleQuiz";

// Export aller K-Modul-Komponenten (Klarheit)
export { default as KModuleComponent } from "./KModuleComponent";

// Export aller L-Modul-Komponenten
export { default as ResourceVisualizerComponent } from "./ResourceVisualizerComponent";
export { default as ResourceFormComponent } from "./ResourceFormComponent";
export { default as LResourceManagerComponent } from "./LResourceManagerComponent";
export { default as LModuleComponent } from "./LModuleComponent";
export { default as LModuleIndexComponent } from "./LModuleIndexComponent";

// Export der A-Modul-Komponenten
export { default as AModuleComponent } from "./AModuleComponent";
export { default as VisionBoardExercise } from "./VisionBoardExercise";
export { default as ValuesHierarchyComponent } from "./ValuesHierarchyComponent";

// Typen für die L-Module
export interface Resource {
  id: string;
  name: string;
  description?: string;
  rating: number;
  activationTips?: string;
  lastActivated?: string;
}

export interface Blocker {
  id: string;
  name: string;
  description?: string;
  impact: number;
  transformationStrategy?: string;
  lastTransformed?: string;
}

// Typen für die A-Module
export interface PersonalValue {
  id?: string;
  value_name: string;
  description?: string;
  rank: number;
  conflict_analysis?: string;
}

export interface VisionBoardItem {
  id?: string;
  life_area: string;
  title: string;
  description?: string;
  image_url?: string;
  position_x: number;
  position_y: number;
  width: number;
  height: number;
  scale: number;
  rotation: number;
  color?: string;
}
