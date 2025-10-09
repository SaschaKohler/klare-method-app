#!/bin/bash

# Validates SQL migrations without executing them
# Checks for syntax errors and potential issues

set -e

echo "🔍 Validating Supabase Migrations (Dry-Run)..."
echo ""

# Farben für Output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

MIGRATION_DIR="supabase/migrations"

# Migrations to validate
MIGRATIONS=(
    "20250109000002_fix_relationships_and_constraints.sql"
    "20250611000007_rls_policies_security.sql"
)

echo "${BLUE}📋 Migrations to validate:${NC}"
for i in "${!MIGRATIONS[@]}"; do
    echo "  $((i+1)). ${MIGRATIONS[$i]}"
done
echo ""

# Function to check syntax
validate_syntax() {
    local file=$1
    local filename=$(basename "$file")
    
    echo "${YELLOW}🔍 Validating: $filename${NC}"
    
    # Check if file exists
    if [ ! -f "$file" ]; then
        echo "${RED}❌ File not found: $file${NC}"
        return 1
    fi
    
    # Check file size
    size=$(wc -c < "$file" | tr -d ' ')
    echo "   📏 File size: $size bytes"
    
    # Check for common issues
    echo "   🔎 Checking for common issues..."
    
    # Check for auth.uid() = user_id without cast
    if grep -q "auth\.uid() = user_id" "$file" 2>/dev/null; then
        echo "   ${YELLOW}⚠️  Found potential UUID/TEXT comparison issue${NC}"
        echo "      Consider using auth.uid()::text or ensuring user_id is UUID"
    fi
    
    # Check for missing semicolons
    if grep -Eq "[^;]$" "$file" 2>/dev/null; then
        echo "   ${YELLOW}⚠️  File might be missing final semicolon${NC}"
    fi
    
    # Count DO $$ blocks
    do_blocks=$(grep -c "DO \$\$" "$file" 2>/dev/null || echo "0")
    end_blocks=$(grep -c "END \$\$" "$file" 2>/dev/null || echo "0")
    
    if [ "$do_blocks" -ne "$end_blocks" ]; then
        echo "   ${RED}❌ Unmatched DO/END blocks: $do_blocks DO vs $end_blocks END${NC}"
        return 1
    else
        echo "   ${GREEN}✓ DO/END blocks balanced: $do_blocks blocks${NC}"
    fi
    
    # Count CREATE POLICY statements
    policies=$(grep -c "CREATE POLICY" "$file" 2>/dev/null || echo "0")
    echo "   ${GREEN}✓ Found $policies CREATE POLICY statements${NC}"
    
    echo "   ${GREEN}✅ Basic validation passed${NC}"
    echo ""
    
    return 0
}

# Validate each migration
all_valid=true
for migration in "${MIGRATIONS[@]}"; do
    if ! validate_syntax "$MIGRATION_DIR/$migration"; then
        all_valid=false
    fi
done

echo ""
if [ "$all_valid" = true ]; then
    echo "${GREEN}🎉 All migrations passed validation!${NC}"
    echo ""
    echo "${BLUE}📝 Next steps:${NC}"
    echo "  1. Review the SQL files manually in your editor"
    echo "  2. Test in Supabase SQL Editor: https://supabase.com/dashboard/project/awqavfvsnqhubvbfaccv/sql"
    echo "  3. Run: npx supabase db reset"
    echo "  4. Or run the full migration: ./scripts/test-migration.sh"
    echo ""
else
    echo "${RED}❌ Some migrations have issues. Please review them.${NC}"
    exit 1
fi
