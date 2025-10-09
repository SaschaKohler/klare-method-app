#!/bin/bash

# Backup Script before Database Rebuild
# Erstellt ein Backup wichtiger Daten vor dem Neuaufbau

set -e

# Farben
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_ID="awqavfvsnqhubvbfaccv"
BACKUP_DIR="backup/db-backup-$(date +%Y%m%d-%H%M%S)"

echo "${BLUE}💾 Klare-App Database Backup${NC}"
echo "============================"
echo ""

mkdir -p "$BACKUP_DIR"

echo "${YELLOW}📦 Erstelle Backup in: $BACKUP_DIR${NC}"
echo ""

# Export der wichtigsten Tabellen als SQL
echo "${BLUE}1. Backup: Users und Profile${NC}"
npx supabase db dump --linked --data-only -t users -t user_profiles > "$BACKUP_DIR/users.sql" 2>/dev/null || echo "  ⚠️  Keine users/user_profiles Daten"

echo "${BLUE}2. Backup: Module und Progress${NC}"
npx supabase db dump --linked --data-only -t modules -t completed_modules > "$BACKUP_DIR/modules.sql" 2>/dev/null || echo "  ⚠️  Keine Module-Daten"

echo "${BLUE}3. Backup: Life Wheel${NC}"
npx supabase db dump --linked --data-only -t life_wheel_areas -t life_wheel_snapshots > "$BACKUP_DIR/lifewheel.sql" 2>/dev/null || echo "  ⚠️  Keine Life Wheel Daten"

echo "${BLUE}4. Backup: Journal${NC}"
npx supabase db dump --linked --data-only -t journal_entries > "$BACKUP_DIR/journal.sql" 2>/dev/null || echo "  ⚠️  Keine Journal-Daten"

echo "${BLUE}5. Backup: Complete Schema${NC}"
npx supabase db dump --linked --schema-only > "$BACKUP_DIR/schema.sql" 2>/dev/null || echo "  ⚠️  Schema Backup fehlgeschlagen"

echo ""
echo "${GREEN}✅ Backup abgeschlossen!${NC}"
echo ""
echo "Backup-Dateien:"
ls -lh "$BACKUP_DIR/"
echo ""
echo "${YELLOW}Hinweis: Da die App noch nicht produktiv ist, sind diese Backups${NC}"
echo "${YELLOW}hauptsächlich zur Sicherheit. Die meisten Daten sind Testdaten.${NC}"
echo ""
