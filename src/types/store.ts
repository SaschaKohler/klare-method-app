// src/types/store.ts

// =============================================
// Base Store Types
// =============================================

/**
 * Basis-Status für alle Stores
 */
export interface BaseState {
  /**
   * Zeigt an, ob Daten geladen werden
   */
  isLoading: boolean;
  
  /**
   * Enthält Fehler, falls ein Fehler aufgetreten ist
   */
  error: Error | null;
  
  /**
   * Zeitpunkt der letzten Synchronisation mit dem Server
   */
  lastSyncTime: Date | null;
  
  /**
   * Version des Store-Schemas für Migrations
   */
  _version?: number;
}

/**
 * Basis-Aktionen, die jeder Store implementieren sollte
 */
export interface BaseActions {
  /**
   * Setzt den Lade-Status
   */
  setLoading: (isLoading: boolean) => void;
  
  /**
   * Setzt einen Fehler
   */
  setError: (error: Error | null) => void;
  
  /**
   * Aktualisiert den Zeitpunkt der letzten Synchronisation
   */
  updateLastSync: () => void;
  
  /**
   * Setzt den Store auf den Ausgangszustand zurück
   */
  reset: () => void;
}

/**
 * Basis-Konfiguration für Persistenz
 */
export interface PersistConfig<T> {
  /**
   * Name für die Persistenz (wird als Schlüssel im Speicher verwendet)
   */
  name: string;
  
  /**
   * Version für die Migration
   */
  version?: number;
  
  /**
   * Migrationsfunktion für Version-Updates
   */
  migrate?: (persistedState: any, version: number) => T;
}

// =============================================
// Application Specific Types
// =============================================

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
interface AvergeScoreResult {
  current: number;
  target: number;
  gap: number;
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
export enum ResourceCategory {
  ACTIVITY = "activity",
  PERSONAL_STRENGTH = "personal_strength",
  RELATIONSHIP = "relationship",
  PLACE = "place",
  MEMORY = "memory",
  CUSTOM = "custom",
}
export interface Resource {
  id: string;
  userId: string;
  name: string;
  description?: string;
  rating: number;
  category: ResourceCategory;
  activationTips?: string;
  lastActivated?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RawResourceData {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  rating: number;
  category: ResourceCategory;
  activation_tips?: string;
  last_activated?: string;
  created_at: string;
  updated_at: string;
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
