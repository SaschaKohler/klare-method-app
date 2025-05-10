# Fixing Filename Casing Inconsistencies

You're encountering build errors due to filename casing inconsistencies between your local filesystem and Git. This is a common issue when developing on macOS (which has a case-insensitive filesystem) and building on EAS (which uses a case-sensitive filesystem).

## The Issue

In your local filesystem, the directories are lowercase `klaremethode`, but in Git, they are tracked as `KLAREMethode`. This inconsistency causes the EAS build to fail.

## Solution

Follow these steps to fix the issue:

1. First, save your current changes by stashing or committing them:
   ```bash
   # Option 1: Stash changes
   git stash save "Work in progress before fixing casing issues"
   
   # Option 2: Commit changes
   git add .
   git commit -m "Save changes before fixing casing issues"
   ```

2. Run the provided fix-casing script:
   ```bash
   ./fix-casing.sh
   ```

3. Commit the casing changes:
   ```bash
   git commit -m "Fix filename casing inconsistencies"
   ```

4. If you stashed your changes, apply them back:
   ```bash
   git stash pop
   ```

5. Update the Podfile to use the correct casing:
   ```bash
   # Update any references from klaremethode to KLAREMethode in the Podfile
   # Then run:
   cd ios && pod install
   ```

6. Now try building your app again with:
   ```bash
   eas build --platform ios --profile development
   ```

## Prevent Future Issues

To prevent similar issues in the future, configure Git to be case-sensitive in this repository:

```bash
git config core.ignorecase false
```

Consider adding this setting to your global Git config for all repositories if you often work with case-sensitive systems:

```bash
git config --global core.ignorecase false
```

## Alternative Solution - If the script doesn't work

If the script approach doesn't work, you may need to manually fix the case:

1. Rename the directories and files in your filesystem to match the case in Git:
   ```bash
   # Make a backup of your ios directory first
   cp -r ios ios_backup
   
   # Then rename the directories
   mv ios/klaremethode ios/KLAREMethode
   mv ios/klaremethode.xcodeproj ios/KLAREMethode.xcodeproj
   mv ios/klaremethode.xcworkspace ios/KLAREMethode.xcworkspace
   ```

2. Update references in your project files to use the correct case.

3. Run `pod install` in the ios directory to update dependencies.
