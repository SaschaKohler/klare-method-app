#!/bin/bash

# Navigate to your project directory
cd /Users/saschakohler/Documents/01_Development/Active_Projects/klare-methode-app

echo "Completely resetting your project and setting up with Yarn classic..."

# 1. Remove ALL Yarn-related files and directories
echo "Removing all Yarn configuration files..."
rm -rf .yarn
rm -rf .yarnrc
rm -rf .yarnrc.yml
rm -rf yarn.lock
rm -rf .pnp.*

# 2. Remove npm lock file and node_modules
echo "Removing node_modules and npm lock file..."
rm -rf node_modules
rm -rf package-lock.json

# 3. Clean caches
echo "Cleaning caches..."
watchman watch-del-all 2>/dev/null || echo "Watchman not running or not installed"
rm -rf $TMPDIR/metro-* 2>/dev/null || echo "No Metro cache to clear"
rm -rf $TMPDIR/haste-map-* 2>/dev/null || echo "No Haste map cache to clear"

# 4. Update package.json - Fix main entry and add resolutions
echo "Updating package.json..."
cat >package.json <<EOL
{
  "name": "klare-methode-app",
  "version": "1.0.0",
  "main": "node_modules/expo/AppEntry.js",
  "scripts": {
    "start": "expo start --dev-client",
    "android": "expo run:android",
    "ios": "expo run:ios",
    "web": "expo start --web",
    "e2e": "maestro test e2e/flows",
    "test": "jest",
    "clean": "watchman watch-del-all && rm -rf node_modules && rm -rf $TMPDIR/metro-* && yarn install"
  },
  "dependencies": {
    "@react-native-async-storage/async-storage": "1.23.1",
    "@react-native-community/slider": "^4.5.5",
    "@react-native-picker/picker": "^2.11.0",
    "@react-navigation/bottom-tabs": "^7.2.1",
    "@react-navigation/native": "^7.0.15",
    "@react-navigation/native-stack": "^7.2.1",
    "@supabase/supabase-js": "^2.49.1",
    "color": "^5.0.0",
    "date-fns": "^4.1.0",
    "expo": "~52.0.38",
    "expo-asset": "~11.0.4",
    "expo-blur": "~14.0.3",
    "expo-dev-client": "~5.0.20",
    "expo-font": "~13.0.4",
    "expo-haptics": "^14.0.1",
    "expo-image-picker": "~16.0.6",
    "expo-linear-gradient": "^14.0.2",
    "expo-splash-screen": "~0.29.22",
    "expo-status-bar": "~2.0.1",
    "moti": "^0.30.0",
    "react": "18.3.1",
    "react-native": "0.76.9",
    "react-native-dotenv": "^3.4.11",
    "react-native-draggable-flatlist": "^4.0.2",
    "react-native-gesture-handler": "~2.20.2",
    "react-native-markdown-display": "^7.0.2",
    "react-native-mmkv": "^2.12.2",
    "react-native-paper": "^5.13.1",
    "react-native-reanimated": "^3.17.5",
    "react-native-safe-area-context": "4.12.0",
    "react-native-screens": "~4.4.0",
    "react-native-svg": "15.8.0",
    "react-native-url-polyfill": "^2.0.0",
    "react-native-uuid": "^2.0.3",
    "react-native-vector-icons": "^10.2.0",
    "supabase": "^2.20.12",
    "supabase-cli": "^0.0.21",
    "uuid": "^11.1.0",
    "zustand": "^5.0.3"
  },
  "devDependencies": {
    "@babel/core": "^7.25.2",
    "@babel/plugin-proposal-class-properties": "^7.18.6",
    "@babel/plugin-proposal-export-namespace-from": "^7.18.9",
    "@babel/plugin-proposal-nullish-coalescing-operator": "^7.18.6",
    "@babel/plugin-proposal-optional-chaining": "^7.21.0",
    "@babel/plugin-transform-export-namespace-from": "^7.25.9",
    "@babel/plugin-transform-flow-strip-types": "^7.26.5",
    "@babel/plugin-transform-runtime": "^7.26.10",
    "@react-native-community/cli": "^18.0.0",
    "@react-native-community/cli-platform-android": "^18.0.0",
    "@testing-library/jest-native": "^5.4.2",
    "@testing-library/react-native": "^12.0.0",
    "@types/jest": "^29.5.3",
    "@types/react": "~18.3.12",
    "babel-plugin-module-resolver": "^5.0.2",
    "cz-conventional-changelog": "^3.3.0",
    "jest": "^29.6.0",
    "jest-expo": "^52.0.0",
    "patch-package": "^8.0.0",
    "react-native-gradle-plugin": "^0.71.19",
    "react-test-renderer": "18.2.0",
    "typescript": "^5.3.3"
  },
  "resolutions": {
    "react": "18.3.1",
    "react-native": "0.76.9"
  },
  "private": true,
  "config": {
    "commitizen": {
      "path": "./node_modules/cz-conventional-changelog"
    }
  },
  "jest": {
    "preset": "jest-expo",
    "transformIgnorePatterns": [
      "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)"
    ],
    "setupFilesAfterEnv": [
      "@testing-library/jest-native/extend-expect"
    ],
    "moduleFileExtensions": [
      "ts",
      "tsx",
      "js",
      "jsx",
      "json",
      "node"
    ],
    "testMatch": [
      "**/__tests__/**/*.test.[jt]s?(x)"
    ],
    "collectCoverage": true,
    "collectCoverageFrom": [
      "src/**/*.{js,jsx,ts,tsx}",
      "!src/**/*.d.ts"
    ],
    "moduleNameMapper": {
      "^@/(.*)$": "<rootDir>/src/$1"
    }
  }
}
EOL

# 5. Update babel.config.js with module resolver
echo "Updating babel.config.js..."
cat >babel.config.js <<EOL
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module:react-native-dotenv",
        {
          moduleName: "@env",
          path: ".env",
          blacklist: null,
          whitelist: null,
          safe: false,
          allowUndefined: true,
        },
      ],
      ["module-resolver", {
        alias: {
          "react-native": "./node_modules/react-native",
          "react": "./node_modules/react"
        }
      }],
      "react-native-reanimated/plugin",
    ],
  };
};
EOL

# 6. Update metro.config.js with explicit resolution
echo "Updating metro.config.js..."
cat >metro.config.js <<EOL
// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add explicit resolution for react-native
config.resolver.extraNodeModules = {
  'react-native': path.resolve(__dirname, 'node_modules/react-native'),
  'react': path.resolve(__dirname, 'node_modules/react'),
};

module.exports = config;
EOL

# 7. Install dependencies with yarn classic
echo "Installing dependencies with yarn classic..."
npm install -g yarn@1.22.19 # Install a specific stable version of yarn classic
yarn --version

# This is critical - make sure we're using yarn classic
yarn install

# 8. Start the app with a clean environment
echo "Starting expo with a clean cache..."
yarn start --reset-cache

echo "Completed reset and setup with Yarn classic."
echo "Your project should now be working with Yarn package management."
