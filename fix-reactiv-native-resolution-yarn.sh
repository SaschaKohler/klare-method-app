#!/bin/bash

# Navigate to your project directory
cd /Users/saschakohler/Documents/01_Development/Active_Projects/klare-methode-app

# Save current working directory
PROJECT_DIR=$(pwd)

echo "Fixing React Native dependency resolution with Yarn..."

# 1. Create a temporary metro.config.js with explicit resolution
cat >metro.config.js.new <<EOL
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

# Replace the original file
mv metro.config.js.new metro.config.js

# 2. Create a temporary babel.config.js with module resolver
cat >babel.config.js.new <<EOL
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

# Replace the original file
mv babel.config.js.new babel.config.js

# 3. Install missing module resolver plugin if needed
yarn add -D babel-plugin-module-resolver

# 4. Clear all caches
watchman watch-del-all
rm -rf $TMPDIR/metro-*
rm -rf node_modules/.cache

# 5. Try to start the app
echo "Starting the app with fixed configuration..."
yarn start --clear
