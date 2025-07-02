// src/navigation/types.ts

import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

// Definiert die einzelnen Schritte der KLARE-Methode als Konstanten-Array.
export const KlareMethodSteps = ["K", "L", "A", "R", "E"] as const;

// Erstellt einen Typ, der nur einen der Werte aus KlareMethodSteps annehmen kann.
export type KlareMethodStep = (typeof KlareMethodSteps)[number];

// Definiert die Parameter für jeden Screen im Root Stack Navigator.
export type RootStackParamList = {
  Main: undefined; // Haupt-Tab-Navigator, keine Parameter.
  Auth: undefined; // Authentifizierungs-Screen, keine Parameter.
  EmailConfirmation: { email: string }; // E-Mail-Bestätigungs-Screen.
  Debug: undefined; // Debug-Screen, nur im Entwicklungsmodus verfügbar.
  KlareMethod: { step: KlareMethodStep }; // Screen für einen Schritt der KLARE-Methode.
  LifeWheel: undefined; // Lebensrad-Screen.
  Journal: undefined; // Journal-Hauptscreen.
  JournalEditor: { templateId?: string; date?: string, entryId?: string }; // Editor zum Erstellen/Bearbeiten von Journaleinträgen.
  JournalViewer: { entryId: string }; // Anzeige eines einzelnen Journaleintrags.
  VisionBoard: { boardId?: string; lifeAreas?: string[] }; // Vision Board Screen.
  ResourceLibrary: undefined; // Bibliothek für Ressourcen.
  ResourceFinder: undefined; // Suchfunktion für Ressourcen.
  EditResource: { resource: any }; // Bearbeiten einer Ressource (Typ 'any' zur Flexibilität).
  ModuleScreen: { module: any }; // Anzeige eines Lernmoduls (Typ 'any' zur Flexibilität).
};

// Definiert die Parameter für jeden Screen im Main Tab Navigator.
export type MainTabParamList = {
  Home: undefined;
  LifeWheel: undefined;
  Journal: undefined;
  Profile: undefined;
};

// Typ für die Props jeder Seite im Root Stack, um Navigation und Route stark zu typisieren.
export type RootStackScreenProps<T extends keyof RootStackParamList> = 
  NativeStackScreenProps<RootStackParamList, T>;

// Typ für die Props jeder Seite im Main Tab Navigator.
export type MainTabScreenProps<T extends keyof MainTabParamList> = 
  BottomTabScreenProps<MainTabParamList, T>;
