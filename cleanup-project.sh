#!/bin/bash
# KLARE-App Cleanup Script

echo "🧹 Starting KLARE-App Source Stack Cleanup..."

# Create backup directories
mkdir -p backup/{migration-artifacts,debug-scripts,setup-docs,legacy-scripts}

echo "📦 Archiving migration artifacts..."
mv migration/ backup/migration-artifacts/ 2>/dev/null
mv content-export-script.sql backup/migration-artifacts/ 2>/dev/null
mv translation_analysis_queries.sql backup/migration-artifacts/ 2>/dev/null
mv exercise_translation_analysis.sql backup/migration-artifacts/ 2>/dev/null

echo "🔍 Archiving debug scripts..."
mv debug_*.js backup/debug-scripts/ 2>/dev/null
mv test_*.js backup/debug-scripts/ 2>/dev/null
mv *_analysis.sql backup/debug-scripts/ 2>/dev/null
mv debug_translations.sql backup/debug-scripts/ 2>/dev/null
mv correct_tables_analysis.sql backup/debug-scripts/ 2>/dev/null
mv interactive_exercises_analysis.sql backup/debug-scripts/ 2>/dev/null

echo "📚 Archiving setup documentation..."
mv OAUTH_*.md backup/setup-docs/ 2>/dev/null
mv GOOGLE_*.md backup/setup-docs/ 2>/dev/null
mv AI_READY_OAUTH_SETUP.md backup/setup-docs/ 2>/dev/null
mv EXPO_DEV_CLIENT_OAUTH_FIX.md backup/setup-docs/ 2>/dev/null
mv DATABASE_*.md backup/setup-docs/ 2>/dev/null
mv SECURITY_*.md backup/setup-docs/ 2>/dev/null
mv COMPLETE_SECURITY_FIX_SUMMARY.md backup/setup-docs/ 2>/dev/null
mv CORRECTED_FUNCTION_SEARCH_PATH_FIX.md backup/setup-docs/ 2>/dev/null
mv AUTH_LEAKED_PASSWORD_FIX.md backup/setup-docs/ 2>/dev/null
mv TWO_USERS_TABLES_FIX.md backup/setup-docs/ 2>/dev/null
mv MODULE_LOADING_FIX_GUIDE.md backup/setup-docs/ 2>/dev/null

echo "🛠️ Archiving legacy scripts..."
mv scripts/ backup/legacy-scripts/ 2>/dev/null

echo "🗑️ Removing backup files..."
rm -f App.tsx.bak .env.backup-working app.json.backup-working .env.example

echo "🗑️ Removing legacy config files..."
rm -f app.json fix_rls_policies.sql CRITICAL_RLS_FIX.sql RLS_POLICY_FIX.sql
rm -f INSERT_TEST_DATA.sql journal_categories_fix.sql

echo "🗑️ Removing temporary files..."
rm -f .DS_Store yarn-error.log verification-success.html
rm -rf .tmp_rename/ tmp/ temp_assets/ coverage/

echo "🗑️ Removing legacy scripts..."
rm -f cleanup-git-history.sh switch-to-yarn.sh upgrade-sdk.sh

echo "✅ Cleanup complete! Check backup/ folder for archived files."
echo "📁 Clean project structure ready for TFP integration!"