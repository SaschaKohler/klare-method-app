#!/bin/bash
# This script fixes case inconsistencies in iOS project files
# for React Native Expo projects built with EAS

cd "$(dirname "$0")"

echo "🔍 Analyzing project structure..."

# Step 1: Check current Git status
echo "📋 Current Git status:"
git status -s

# Step 2: Enable case sensitivity in Git for this repository
git config core.ignorecase false

# Step 3: Create temporary directory for renaming
mkdir -p .tmp_rename

# Step 4: Check if the directory structure has lowercase or uppercase names
if [ -d "ios/klaremethode" ] && [ ! -d "ios/KLAREMethode" ]; then
    echo "🔄 Converting from lowercase to uppercase naming..."
    
    # Stash any changes first to avoid conflicts
    echo "💾 Stashing any uncommitted changes..."
    git stash save "Before casing fix" > /dev/null 2>&1
    
    # Move lowercase directories to temporary location
    echo "🔄 Moving directories to temporary location..."
    git mv ios/klaremethode .tmp_rename/klaremethode_temp
    git mv ios/klaremethode.xcodeproj .tmp_rename/klaremethode_xcodeproj_temp
    git mv ios/klaremethode.xcworkspace .tmp_rename/klaremethode_xcworkspace_temp
    
    # Move them back with correct case
    echo "🔄 Moving back with correct case..."
    git mv .tmp_rename/klaremethode_temp ios/KLAREMethode
    git mv .tmp_rename/klaremethode_xcodeproj_temp ios/KLAREMethode.xcodeproj
    git mv .tmp_rename/klaremethode_xcworkspace_temp ios/KLAREMethode.xcworkspace
    
    # Apply stashed changes
    echo "🔄 Applying stashed changes..."
    git stash pop > /dev/null 2>&1 || echo "⚠️ No stashed changes to apply or conflicts occurred"
    
elif [ -d "ios/KLAREMethode" ] && [ ! -d "ios/klaremethode" ]; then
    echo "✅ Directory structure already has correct casing (KLAREMethode)."
else
    echo "⚠️ Unable to determine current directory structure. Please check manually."
    exit 1
fi

# Step 5: Clean up
rmdir .tmp_rename 2>/dev/null || true

# Step 6: Update references in Podfile if needed
echo "🔄 Updating references in Podfile..."
if grep -q "klaremethode" ios/Podfile; then
    sed -i '' 's/klaremethode/KLAREMethode/g' ios/Podfile
    echo "✅ Updated Podfile references"
fi

echo "🔄 Running pod install..."
(cd ios && pod install)

echo "✅ Casing fixes complete!"
echo ""
echo "Next steps:"
echo "1. Commit these changes: git commit -am \"Fix filename casing inconsistencies\""
echo "2. Try building again: eas build --platform ios --profile development"
echo ""
