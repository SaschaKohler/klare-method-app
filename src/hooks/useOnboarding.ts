import { useEffect, useState } from 'react';
import { useOnboardingStore } from '../store';
import { useUserStore } from '../store';
import { OnboardingService } from '../services/OnboardingService';

export interface OnboardingStatus {
  isRequired: boolean;
  isInProgress: boolean;
  isCompleted: boolean;
  currentStep: number;
  completionProgress: number;
}

export const useOnboarding = () => {
  const { user } = useUserStore();
  const {
    currentStep,
    isCompleted: localCompleted,
    profile,
    privacySettings,
    lifeWheelAreas,
    completeOnboarding,
    updateProfile,
    updatePrivacySettings,
    updateLifeWheelArea,
    setCurrentStep,
    getCompletionProgress,
    resetOnboarding,
  } = useOnboardingStore();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serverCompleted, setServerCompleted] = useState<boolean | null>(null);

  // Check server-side onboarding status
  useEffect(() => {
    const checkServerStatus = async () => {
      if (!user?.id) return;
      
      try {
        const completed = await OnboardingService.isOnboardingCompleted(user.id);
        setServerCompleted(completed);
      } catch (err) {
        console.error('Error checking server onboarding status:', err);
        setServerCompleted(false);
      }
    };

    checkServerStatus();
  }, [user?.id]);

  // Determine overall onboarding status
  const getOnboardingStatus = (): OnboardingStatus => {
    if (!user) {
      return {
        isRequired: false,
        isInProgress: false,
        isCompleted: false,
        currentStep: 1,
        completionProgress: 0,
      };
    }

    // If server says completed, trust that and mark as not required
    if (serverCompleted === true) {
      console.log('✅ Server says onboarding is completed');
      return {
        isRequired: false,
        isInProgress: false,
        isCompleted: true,
        currentStep: 5,
        completionProgress: 100,
      };
    }

    // If local store says completed, also trust that (for immediate UI updates)
    if (localCompleted) {
      console.log('✅ Local store says onboarding is completed');
      return {
        isRequired: false,
        isInProgress: false,
        isCompleted: true,
        currentStep: 5,
        completionProgress: 100,
      };
    }

    // If server explicitly says not completed (false, not null)
    if (serverCompleted === false) {
      console.log('❌ Server says onboarding is not completed');
      return {
        isRequired: true,
        isInProgress: currentStep > 1 || profile.firstName.length > 0,
        isCompleted: false,
        currentStep,
        completionProgress: getCompletionProgress(),
      };
    }

    // Still checking server status (serverCompleted === null)
    // Default to requiring onboarding for safety
    console.log('🔄 Still checking server onboarding status...');
    return {
      isRequired: true,
      isInProgress: currentStep > 1 || profile.firstName.length > 0,
      isCompleted: false,
      currentStep,
      completionProgress: getCompletionProgress(),
    };
  };

  // Complete onboarding and sync to server
  const completeOnboardingFlow = async (): Promise<boolean> => {
    if (!user?.id) {
      setError('User not authenticated');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('💾 Saving onboarding data to server...');
      
      // Save to server
      await OnboardingService.completeOnboarding(user.id, {
        profile,
        privacySettings,
        lifeWheelAreas,
      });

      // Update local state IMMEDIATELY
      console.log('✅ Server save successful, updating local state...');
      completeOnboarding();
      setServerCompleted(true);

      console.log('🎉 Onboarding completed successfully! Local and server state updated.');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to complete onboarding';
      setError(errorMessage);
      console.error('❌ Error completing onboarding:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Load existing onboarding data (for editing/review)
  const loadOnboardingData = async (): Promise<boolean> => {
    if (!user?.id) {
      setError('User not authenticated');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await OnboardingService.getOnboardingData(user.id);
      
      if (data) {
        updateProfile(data.profile);
        updatePrivacySettings(data.privacySettings);
        // Update life wheel areas
        data.lifeWheelAreas.forEach(area => {
          updateLifeWheelArea(area.id, area);
        });
        
        console.log('✅ Onboarding data loaded successfully');
        return true;
      }
      
      return false;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load onboarding data';
      setError(errorMessage);
      console.error('❌ Error loading onboarding data:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Save current progress to server (partial save)
  const saveProgress = async (): Promise<boolean> => {
    if (!user?.id) {
      setError('User not authenticated');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Save profile if it has minimum required data
      if (profile.firstName && profile.ageRange) {
        await OnboardingService.saveUserProfile(user.id, profile);
      }

      // Always save privacy settings
      await OnboardingService.savePrivacySettings(user.id, privacySettings);

      console.log('✅ Progress saved successfully');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save progress';
      setError(errorMessage);
      console.error('❌ Error saving progress:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Reset onboarding (for testing or re-onboarding)
  const resetOnboardingFlow = () => {
    resetOnboarding();
    setServerCompleted(false);
    setError(null);
  };

  return {
    // Status
    status: getOnboardingStatus(),
    isLoading,
    error,
    
    // Data
    profile,
    privacySettings,
    lifeWheelAreas,
    currentStep,
    
    // Actions
    setCurrentStep,
    updateProfile,
    updatePrivacySettings,
    updateLifeWheelArea,
    completeOnboardingFlow,
    loadOnboardingData,
    saveProgress,
    resetOnboardingFlow,
    
    // Computed
    completionProgress: getCompletionProgress(),
  };
};
