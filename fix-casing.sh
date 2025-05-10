#!/bin/bash

# First, we'll rename the files within Git using git mv commands
# This is the safest way to preserve git history

cd "$(dirname "$0")"

# Step 1: Enable case sensitivity in Git for this repository
git config core.ignorecase false

# Step 2: Create a temporary directory to handle the renaming
mkdir -p temp_rename

# Step 3: Move the problematic directories to temporary names first
git mv ios/klaremethode temp_rename/klaremethode_temp
git mv ios/klaremethode.xcodeproj temp_rename/klaremethode_xcodeproj_temp
git mv ios/klaremethode.xcworkspace temp_rename/klaremethode_xcworkspace_temp

# Step 4: Move them back with the correct case
git mv temp_rename/klaremethode_temp ios/KLAREMethode
git mv temp_rename/klaremethode_xcodeproj_temp ios/KLAREMethode.xcodeproj
git mv temp_rename/klaremethode_xcworkspace_temp ios/KLAREMethode.xcworkspace

# Step 5: Clean up
rmdir temp_rename

echo "Casing fixes complete. Now commit these changes with:"
echo "git commit -m \"Fix filename casing inconsistencies\""
