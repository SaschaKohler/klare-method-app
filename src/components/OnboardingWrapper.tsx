import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useOnboarding } from '../hooks/useOnboarding';
import { useUserStore } from '../store';
import { OnboardingNavigator } from '../screens/onboarding';
import { Text } from '../components/ui';
import { Colors } from '../constants/Colors';

interface OnboardingWrapperProps {
  children: React.ReactNode;
}

export const OnboardingWrapper: React.FC<OnboardingWrapperProps> = ({ children }) => {
  const { user, isLoading: userLoading } = useUserStore();
  const { status, isLoading: onboardingLoading } = useOnboarding();

  console.log('OnboardingWrapper status:', {
    user: user?.id,
    userLoading,
    onboardingLoading,
    isRequired: status.isRequired,
    isCompleted: status.isCompleted,
    completionProgress: status.completionProgress
  });

  // Show loading state while checking user and onboarding status
  // BUT: Don't block on completionProgress when user is not authenticated
  if (userLoading || onboardingLoading || (user && status.completionProgress === 0 && status.isRequired)) {
    return (
      <View style={styles.loadingContainer}>
        <Text variant="body" style={styles.loadingText}>
          Loading...
        </Text>
      </View>
    );
  }

  // User not authenticated - let AuthScreen handle this
  if (!user) {
    return <>{children}</>;
  }

  // User authenticated but onboarding required AND not completed
  if (status.isRequired && !status.isCompleted) {
    console.log('🎯 Showing OnboardingNavigator because:', {
      isRequired: status.isRequired,
      isCompleted: status.isCompleted
    });
    return <OnboardingNavigator />;
  }

  // Onboarding completed OR not required - show main app
  console.log('🏠 Showing main app because:', {
    isRequired: status.isRequired,
    isCompleted: status.isCompleted,
    completionProgress: status.completionProgress
  });
  return <>{children}</>;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: Colors.textSecondary,
  },
});
