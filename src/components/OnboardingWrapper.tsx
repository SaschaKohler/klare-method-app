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

  // Show loading state while checking user and onboarding status
  // BUT: Don't block on completionProgress when user is not authenticated
  if (userLoading || onboardingLoading || (user && status.completionProgress === 0)) {
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

  // User authenticated but onboarding required
  if (status.isRequired && !status.isCompleted) {
    return <OnboardingNavigator />;
  }

  // Onboarding completed - show main app
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
