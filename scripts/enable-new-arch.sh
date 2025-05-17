#!/bin/bash

# Clean and rebuild project with new architecture enabled
echo "🧹 Cleaning project..."

# Clean node modules and caches
echo "Cleaning node_modules..."
rm -rf node_modules
rm -rf ~/.expo/web-build-cache
watchman watch-del-all

# Clean iOS build files
echo "Cleaning iOS build files..."
rm -rf ios/build
rm -rf ios/Pods
rm -rf ios/Podfile.lock
rm -rf ~/.rncache

# Clean Android build files
echo "Cleaning Android build files..."
cd android && ./gradlew clean && cd ..

# Reinstall dependencies
echo "📦 Reinstalling dependencies..."
yarn install

# Update pod dependencies
echo "📱 Installing iOS pods with new architecture..."
cd ios && pod install && cd ..

# Start development build
echo "🚀 Starting development build..."
echo "Run one of the following commands to start your app:"
echo "yarn ios     - for iOS"
echo "yarn android - for Android"
