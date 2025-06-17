import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { WelcomeScreen } from './WelcomeScreen';
import { AICoachIntroScreen } from './AICoachIntroScreen';
import { PrivacyPreferencesScreen } from './PrivacyPreferencesScreen';
import { ProfileSetupScreen } from './ProfileSetupScreen';
import { LifeWheelSetupScreen } from './LifeWheelSetupScreen';
import OnboardingCompleteScreen from './OnboardingCompleteScreen';

export type OnboardingStackParamList = {
  Welcome: undefined;
  AICoachIntro: undefined;
  PrivacyPreferences: undefined;
  ProfileSetup: undefined;
  LifeWheelSetup: undefined;
  OnboardingComplete: undefined;
};

const Stack = createStackNavigator<OnboardingStackParamList>();

export const OnboardingNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: 'transparent' },
        animationEnabled: true,
        animationTypeForReplace: 'push',
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="AICoachIntro" component={AICoachIntroScreen} />
      <Stack.Screen name="PrivacyPreferences" component={PrivacyPreferencesScreen} />
      <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
      <Stack.Screen name="LifeWheelSetup" component={LifeWheelSetupScreen} />
      <Stack.Screen name="OnboardingComplete" component={OnboardingCompleteScreen} />
    </Stack.Navigator>
  );
};
