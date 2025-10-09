#!/bin/bash

# Migration Renaming Script
# Benennt Migrationen in logische chronologische Reihenfolge um

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

MIGRATION_DIR="supabase/migrations"

echo "${BLUE}📝 Migration File Renaming${NC}"
echo "=========================="
echo ""

echo "${YELLOW}Aktuelles Problem:${NC}"
echo "  - 20250109000001_k_module_complete_flow.sql (Januar 2025 - FALSCH!)"
echo "  - 20250109000002_fix_relationships_and_constraints.sql (Januar 2025 - FALSCH!)"
echo ""
echo "Diese sollten NACH den Oktober-Migrationen kommen."
echo ""

echo "${BLUE}Neue Reihenfolge wird sein:${NC}"
echo "  1. 20250610000001 bis 20250611000011 (Juni 2025) - Basis-System"
echo "  2. 20250901000000 (September 2025) - Module Table"
echo "  3. 20251002084500 (Oktober 2025) - Modules Source of Truth"
echo "  4. 20251009000001 (Oktober 9, 2025) - K-Module Complete Flow ← NEU"
echo "  5. 20251009000002 (Oktober 9, 2025) - Fix Relationships ← NEU"
echo "  6. 20251217000001 (Dezember 2025) - Onboarding Fields"
echo ""

read -p "Umbenennung durchführen? (j/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Jj]$ ]]; then
    echo "Abgebrochen."
    exit 1
fi

echo ""
echo "${YELLOW}Benenne Dateien um...${NC}"

# Temporäre Namen verwenden, um Konflikte zu vermeiden
echo "1. Temporäre Umbenennung..."
mv "$MIGRATION_DIR/20250109000001_k_module_complete_flow.sql" \
   "$MIGRATION_DIR/TEMP_k_module_complete_flow.sql"

mv "$MIGRATION_DIR/20250109000002_fix_relationships_and_constraints.sql" \
   "$MIGRATION_DIR/TEMP_fix_relationships_and_constraints.sql"

mv "$MIGRATION_DIR/20251217000001_add_onboarding_fields.sql" \
   "$MIGRATION_DIR/TEMP_add_onboarding_fields.sql"

echo "2. Finale Umbenennung..."
mv "$MIGRATION_DIR/TEMP_k_module_complete_flow.sql" \
   "$MIGRATION_DIR/20251009000001_k_module_complete_flow.sql"

mv "$MIGRATION_DIR/TEMP_fix_relationships_and_constraints.sql" \
   "$MIGRATION_DIR/20251009000002_fix_relationships_and_constraints.sql"

mv "$MIGRATION_DIR/TEMP_add_onboarding_fields.sql" \
   "$MIGRATION_DIR/20251217000001_add_onboarding_fields.sql"

echo ""
echo "${GREEN}✅ Umbenennung abgeschlossen!${NC}"
echo ""

echo "${BLUE}Neue chronologische Reihenfolge:${NC}"
ls -1 "$MIGRATION_DIR"/*.sql | sort | nl
echo ""

echo "${YELLOW}Wichtig:${NC}"
echo "  1. Diese Änderungen committen: git add supabase/migrations/"
echo "  2. Dann Database Rebuild durchführen: ./scripts/rebuild-database.sh"
echo "  3. Supabase wird die Migrationen in neuer Reihenfolge ausführen"
echo ""
