export { default as ModuleComponents } from "./ModuleComponents";
export { default as ModuleContent } from "./ModuleContent";
export { default as ModuleExercise } from "./ModuleExercise";
export { default as ModuleQuiz } from "./ModuleQuiz";

// Export aller L-Modul-Komponenten
export { default as ResourceVisualizerComponent } from "./ResourceVisualizerComponent";
export { default as ResourceFormComponent } from "./ResourceFormComponent";
export { default as LResourceManagerComponent } from "./LResourceManagerComponent";
export { default as LModuleComponent } from "./LModuleComponent";
export { default as LModuleIndexComponent } from "./LModuleIndexComponent";

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
