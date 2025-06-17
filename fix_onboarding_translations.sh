#!/bin/bash

# Quick fix script für alle Onboarding-Screen Translation-Keys
# Entfernt 'onboarding.' Präfix da bereits im Namespace definiert

echo "Fixing onboarding translation keys..."

# AICoachIntroScreen - remaining keys
echo "Fixing AICoachIntroScreen..."
# Already mostly fixed

# PrivacyPreferencesScreen
echo "Fixing PrivacyPreferencesScreen..."
sed -i '' 's/onboarding\.privacy\./privacy\./g' /Users/saschakohler/Documents/01_Development/Active_Projects/klare-methode-app/src/screens/onboarding/PrivacyPreferencesScreen.tsx

# ProfileSetupScreen
echo "Fixing ProfileSetupScreen..."
sed -i '' 's/onboarding\.profile\./profile\./g' /Users/saschakohler/Documents/01_Development/Active_Projects/klare-methode-app/src/screens/onboarding/ProfileSetupScreen.tsx

# LifeWheelSetupScreen
echo "Fixing LifeWheelSetupScreen..."
sed -i '' 's/onboarding\.life_wheel\./life_wheel\./g' /Users/saschakohler/Documents/01_Development/Active_Projects/klare-methode-app/src/screens/onboarding/LifeWheelSetupScreen.tsx

echo "Translation keys fixed!"
echo "🎉 Onboarding screens should now work with language switching!"
