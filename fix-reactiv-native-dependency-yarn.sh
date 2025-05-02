#!/bin/bash

# Navigate to your project directory
cd /Users/saschakohler/Documents/01_Development/Active_Projects/klare-methode-app

# 1. Clear watchman watches
echo "Clearing watchman watches..."
watchman watch-del-all

# 2. Reset metro cache
echo "Resetting metro bundler cache..."
rm -rf $TMPDIR/metro-*
rm -rf node_modules/.cache

# 3. Clear watchman for the specific project directory
echo "Clearing watchman for project directory..."
watchman watch-del '/Users/saschakohler/Documents/01_Development/Active_Projects/klare-methode-app'
watchman watch-project '/Users/saschakohler/Documents/01_Development/Active_Projects/klare-methode-app'

# 4. Clean reinstall with compatible peer dependencies
echo "Removing node_modules..."
rm -rf node_modules
rm -rf yarn.lock

# 5. Reinstall dependencies with expo compatible versions
echo "Installing dependencies with compatible versions using Yarn..."
yarn global add expo-cli # Make sure expo-cli is installed
yarn install

# 6. Rebuild iOS pods if needed (if you're on a Mac and developing for iOS)
if [ -d "ios" ]; then
  echo "Rebuilding iOS pods..."
  cd ios
  rm -rf Pods
  rm -rf Podfile.lock
  pod install
  cd ..
fi

# 7. Clear React Native's cache
echo "Cleaning React Native CLI cache..."
npx react-native clean-project-auto

# 8. Start the app with a clean environment
echo "Starting the app..."
yarn start --clear
