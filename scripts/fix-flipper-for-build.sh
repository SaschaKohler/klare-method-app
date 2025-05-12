#!/bin/bash
# Script to fix the expo-community-flipper plugin issue for EAS builds

echo "🔍 Checking for expo-community-flipper..."

# Check if this is a production/preview build
if [ "$EAS_BUILD_PROFILE" == "production" ] || [ "$EAS_BUILD_PROFILE" == "preview" ]; then
    echo "📦 Production or preview build detected. Removing Flipper for this build..."
    cp app.no-flipper.json app.json.backup
    cp app.no-flipper.json app.json
    echo "✅ Temporarily removed Flipper plugin for this build."
    exit 0
fi

# For development builds, install the package if it doesn't exist
if ! grep -q "expo-community-flipper" package.json; then
    echo "📦 Installing expo-community-flipper package..."
    yarn add expo-community-flipper
    
    if grep -q "expo-community-flipper" package.json; then
        echo "✅ Successfully installed expo-community-flipper"
    else
        echo "⚠️ Failed to install expo-community-flipper, using fallback approach..."
        cp app.no-flipper.json app.json.backup
        cp app.no-flipper.json app.json
        echo "✅ Temporarily removed Flipper plugin for this build."
    fi
else
    echo "✅ expo-community-flipper is already installed."
fi
