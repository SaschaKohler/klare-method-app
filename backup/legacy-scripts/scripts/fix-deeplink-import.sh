#!/bin/bash

# Verwendung: ./fix-deeplink-import.sh

# Pfad zur Datei
file_path="/Users/saschakohler/Documents/01_Development/Active_Projects/klare-methode-app/src/screens/AuthScreen.tsx"

# Ersetze den auskommentierten Import durch den aktiven Import
sed -i '.bak' 's|// import DeepLinkInfo from "../components/DeepLinkInfo";|import { DeepLinkInfo } from "../components";|' "$file_path"

echo "DeepLinkInfo Import wurde aktualisiert."
