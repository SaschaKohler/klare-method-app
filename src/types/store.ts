// src/types/store.ts

// User related types
export interface User {
  id: string;
  name: string;
  email: string;
  progress: number;
  streak: number;
  lastActive: string;
  joinDate: string;
}

// LifeWheel related types
export interface LifeWheelArea {
  id: string;
  name: string;
  currentValue: number;
  targetValue: number;
}

// Progression related types
export interface CompletedModule {
  id: string;
  completedAt: string;
}

export interface ModuleProgressCache {
  [key: string]: number;
}

// KLARE method step types
export type KlareStep = "K" | "L" | "A" | "R" | "E";

// Authentication related types
export interface AuthResponse {
  error: any | null;
}
