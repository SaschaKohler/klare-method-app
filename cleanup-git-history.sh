#!/bin/bash

echo "🔒 Git History Cleanup für sensitive Daten"
echo "========================================="

echo "Erstelle Backup..."
git branch backup-before-cleanup

echo "Entferne sensitive Daten aus der Git-Historie..."

# Option 1: Mit git filter-branch (funktioniert lokal)
git filter-branch --force --index-filter \
'git rm --cached --ignore-unmatch debug_templates.js' \
--prune-empty --tag-name-filter cat -- --all

echo "Bereinige Refs..."
rm -rf .git/refs/original/
git reflog expire --expire=now --all
git gc --prune=now --aggressive 

echo "✅ Git-History bereinigt!"
echo ""
echo "⚠️  WICHTIGE SCHRITTE:"
echo "1. Trage den NEUEN Supabase API-Key in die .env Datei ein"
echo "2. Committe die bereinigten Änderungen:"
echo "   git add ."
echo "   git commit -m 'security: remove exposed API keys from debug file'"
echo "3. Force-Push zum Remote (VORSICHT - informiere dein Team!):"
echo "   git push --force-with-lease origin main"
echo ""
echo "📋 Falls etwas schief geht, kannst du zur Backup-Branch zurückkehren:"
echo "   git checkout backup-before-cleanup"
