#!/bin/bash
# KLARE App - One-Click Migration Runner

echo "🚀 KLARE App Clean Slate Migration"
echo "=================================="
echo ""

# Check if we're in the right directory
if [ ! -f "README.md" ]; then
    echo "❌ Please run from migration/ directory"
    exit 1
fi

echo "📋 This will:"
echo "   1. Export all your current content"  
echo "   2. Create new AI-ready schema"
echo "   3. Import your content with translations"
echo "   4. Reduce 69 migrations to 6 clean ones"
echo ""

read -p "🤔 Ready to start? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "👋 Migration cancelled"
    exit 0
fi

echo ""
echo "🎯 STEP 1: Create new Supabase project"
echo "   → Go to https://supabase.com/dashboard"
echo "   → Create new project for migration"
echo "   → Keep old project as backup!"
echo ""
read -p "✅ New project created? Press Enter to continue..."

echo ""
echo "🎯 STEP 2: Export current content"
echo "   → Open your OLD project SQL Editor"
echo "   → Run each query from: migration/01_content_export.sql"
echo "   → Download each result as CSV (click download icon)"
echo "   → Save files in: migration/exports/"
echo "   → See: migration/EXPORT_GUIDE.md for details"
echo ""
read -p "✅ Content exported to migration/exports/? Press Enter to continue..."

echo ""
echo "🎯 STEP 3: Setup new schema"
echo "   → Open your NEW project SQL Editor"
echo "   → Copy & run: migration/03_ai_ready_schema.sql"
echo "   → Verify all tables created"
echo ""
read -p "✅ New schema ready? Press Enter to continue..."

echo ""
echo "🎯 STEP 4: Import content"
echo "   → Import CSV files via Supabase UI"
echo "   → Run: migration/05_content_import.sql"
echo "   → Verify import success"
echo ""
read -p "✅ Content imported? Press Enter to continue..."

echo ""
echo "🎯 STEP 5: Update app config"
echo "   → Update .env with new Supabase URL/Keys"
echo "   → Run: supabase gen types typescript"
echo "   → Test your app!"
echo ""

echo "🎉 MIGRATION COMPLETE!"
echo ""
echo "✅ You now have:"
echo "   • Clean AI-ready database"
echo "   • All content preserved"
echo "   • Ready for Adaptive KLARE Strategy"
echo ""
echo "🚀 Next: Start Phase 1 of your 16-week plan!"
