#!/bin/bash
# Script to upgrade your Expo project from SDK 52 to SDK 53

# Step 1: Make a backup of your project
echo "Creating a backup of your project..."
BACKUP_DIR="../klare-methode-app-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp -r . "$BACKUP_DIR"
echo "Backup created at $BACKUP_DIR"

# Step 2: Update Expo SDK and related packages
echo "Updating Expo SDK and related packages..."
yarn add expo@~53.0.0 \
  expo-asset@~9.1.0 \
  expo-blur@~13.1.0 \
  expo-dev-client@~3.5.0 \
  expo-file-system@~16.1.0 \
  expo-font@~11.10.0 \
  expo-haptics@^12.8.1 \
  expo-image-picker@~15.0.0 \
  expo-linear-gradient@^12.7.1 \
  expo-splash-screen@~0.26.4 \
  expo-status-bar@~1.11.1

# Step 3: Update React Native and React
echo "Updating React Native and React..."
yarn add react@18.2.0 react-native@0.73.2

# Step 4: Update other packages that need specific versions
echo "Updating other dependencies..."
yarn add @react-native-async-storage/async-storage@1.21.0 \
  react-native-safe-area-context@4.8.2 \
  react-native-screens@~3.29.0 \
  react-native-svg@14.1.0 \
  react-native-gesture-handler@~2.14.0 \
  react-native-reanimated@~3.6.0

# Step 5: Update app.json
echo "Updating app.json..."
# This is a manual step - you'll need to update app.json manually
echo "Please update the SDK version in app.json to 53.0.0"

# Step 6: Clean the project
echo "Cleaning project..."
yarn clean

# Step 7: Create a development build
echo "You may need to create a new development build after upgrading"
echo "Run: eas build --profile development --platform ios"
echo "Or:  eas build --profile development --platform android"

echo "Upgrade process completed. Please test your app thoroughly."
