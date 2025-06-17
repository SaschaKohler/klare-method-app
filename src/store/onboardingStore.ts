import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { unifiedStorage } from '../storage/unifiedStorage';

export interface OnboardingProfile {
  firstName: string;
  preferredName: string;
  ageRange: string;
  primaryGoals: string[];
  currentChallenges: string[];
  experienceLevel: string;
  timeCommitment: string;
}

export interface PrivacySettings {
  dataProcessing: 'local' | 'cloud' | 'ai_enabled';
  analytics: boolean;
  crashReporting: boolean;
  marketing: boolean;
  aiFeatures: boolean;
  personalInsights: boolean;
}

export interface LifeWheelArea {
  id: string;
  name: string;
  currentValue: number;
  targetValue: number;
  color: string;
}

interface OnboardingState {
  // Onboarding Progress
  currentStep: number;
  isCompleted: boolean;
  completedAt?: Date;
  
  // User Profile
  profile: OnboardingProfile;
  
  // Privacy Settings
  privacySettings: PrivacySettings;
  
  // Life Wheel Setup
  lifeWheelAreas: LifeWheelArea[];
  
  // Actions
  setCurrentStep: (step: number) => void;
  updateProfile: (profile: Partial<OnboardingProfile>) => void;
  updatePrivacySettings: (settings: Partial<PrivacySettings>) => void;
  updateLifeWheelArea: (areaId: string, updates: Partial<LifeWheelArea>) => void;
  setLifeWheelAreas: (areas: LifeWheelArea[]) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  
  // Computed
  getCompletionProgress: () => number;
  isStepCompleted: (step: number) => boolean;
}

const initialProfile: OnboardingProfile = {
  firstName: '',
  preferredName: '',
  ageRange: '',
  primaryGoals: [],
  currentChallenges: [],
  experienceLevel: '',
  timeCommitment: '',
};

const initialPrivacySettings: PrivacySettings = {
  dataProcessing: 'local',
  analytics: false,
  crashReporting: true,
  marketing: false,
  aiFeatures: false,
  personalInsights: true,
};

const defaultLifeWheelAreas: LifeWheelArea[] = [
  { id: 'health', name: 'Health', currentValue: 5, targetValue: 8, color: '#6366F1' },
  { id: 'career', name: 'Career', currentValue: 5, targetValue: 8, color: '#8B5CF6' },
  { id: 'relationships', name: 'Relationships', currentValue: 5, targetValue: 8, color: '#EC4899' },
  { id: 'personal_growth', name: 'Personal Growth', currentValue: 5, targetValue: 8, color: '#F59E0B' },
  { id: 'finances', name: 'Finances', currentValue: 5, targetValue: 8, color: '#10B981' },
  { id: 'fun_recreation', name: 'Fun & Recreation', currentValue: 5, targetValue: 8, color: '#6366F1' },
  { id: 'physical_environment', name: 'Physical Environment', currentValue: 5, targetValue: 8, color: '#8B5CF6' },
  { id: 'contribution', name: 'Contribution', currentValue: 5, targetValue: 8, color: '#EC4899' },
];

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      // Initial State
      currentStep: 1,
      isCompleted: false,
      completedAt: undefined,
      profile: initialProfile,
      privacySettings: initialPrivacySettings,
      lifeWheelAreas: defaultLifeWheelAreas,
      
      // Actions
      setCurrentStep: (step: number) =>
        set({ currentStep: step }),
      
      updateProfile: (profileUpdates: Partial<OnboardingProfile>) =>
        set((state) => ({
          profile: { ...state.profile, ...profileUpdates }
        })),
      
      updatePrivacySettings: (settingsUpdates: Partial<PrivacySettings>) =>
        set((state) => ({
          privacySettings: { ...state.privacySettings, ...settingsUpdates }
        })),
      
      updateLifeWheelArea: (areaId: string, updates: Partial<LifeWheelArea>) =>
        set((state) => ({
          lifeWheelAreas: state.lifeWheelAreas.map(area =>
            area.id === areaId ? { ...area, ...updates } : area
          )
        })),
      
      setLifeWheelAreas: (areas: LifeWheelArea[]) =>
        set({ lifeWheelAreas: areas }),
      
      completeOnboarding: () =>
        set({ 
          isCompleted: true, 
          completedAt: new Date(),
          currentStep: 5 
        }),
      
      resetOnboarding: () =>
        set({
          currentStep: 1,
          isCompleted: false,
          completedAt: undefined,
          profile: initialProfile,
          privacySettings: initialPrivacySettings,
          lifeWheelAreas: defaultLifeWheelAreas,
        }),
      
      // Computed
      getCompletionProgress: () => {
        const state = get();
        const steps = [
          state.currentStep >= 1, // Welcome
          state.currentStep >= 2, // AI Intro
          state.currentStep >= 3, // Privacy
          state.profile.firstName.length > 0 && state.profile.ageRange.length > 0, // Profile
          state.lifeWheelAreas.every(area => area.currentValue > 0), // Life Wheel
        ];
        
        const completedSteps = steps.filter(Boolean).length;
        return Math.round((completedSteps / steps.length) * 100);
      },
      
      isStepCompleted: (step: number) => {
        const state = get();
        switch (step) {
          case 1: return true; // Welcome is always accessible
          case 2: return true; // AI Intro is always accessible
          case 3: return true; // Privacy is always accessible
          case 4: return state.profile.firstName.length > 0 && state.profile.ageRange.length > 0;
          case 5: return state.lifeWheelAreas.every(area => area.currentValue > 0);
          default: return false;
        }
      },
    }),
    {
      name: 'onboarding-storage',
      storage: {
        getItem: (name) => unifiedStorage.getString(name) ?? null,
        setItem: (name, value) => unifiedStorage.set(name, value),
        removeItem: (name) => unifiedStorage.delete(name),
      },
    }
  )
);
