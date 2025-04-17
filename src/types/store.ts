// src/types/store.ts

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
export interface ApiError {
  message: string;
  code?: string;
  status: number;
  details?: Record<string, unknown>;
}
export interface AuthError {
  message: string;
  code?: string;
  status: number;
  details?: Record<string, unknown>;
}

export interface Stage {
  id: string;
  name: string;
  description: string;
  order: number;
  requiredModules: string[];
  modules: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  progress: number; // Gesamtfortschritt in Prozent
  streak: number; // Aktuelle Tagesstreak
  lastActive: string; // ISO Datum
  joinDate: string; // ISO Datum des Programmstarts
  completedModules: string[]; // IDs der abgeschlossenen Module (für Abwärtskompatibilität)
}

export interface SessionData {
  session: {
    user: User;
    expires: string;
  } | null;
}

export interface SupabaseResponse<T> {
  data: T | null;
  error: AuthError | null;
}

// KLARE method step types
export type KlareStep = "K" | "L" | "A" | "R" | "E";

// Authentication related types
export interface AuthResponse {
  error: ApiError | null;
}
