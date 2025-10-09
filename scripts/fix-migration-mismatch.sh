#!/bin/bash

# Fix Migration Mismatch Script
# Behebt das Problem zwischen umbenannten lokalen und alten Remote-Migrationen

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "${BLUE}🔧 Migration Mismatch Fixer${NC}"
echo "=============================="
echo ""

echo "${YELLOW}Problem erkannt:${NC}"
echo "  Remote hat: 20250109000001 (alt)"
echo "  Local hat:  20251009000001 (neu)"
echo ""
echo "Die Remote-DB kennt noch die alten Dateinamen!"
echo ""

echo "${BLUE}Lösungsoptionen:${NC}"
echo ""
echo "Option 1: Migrations-History im Supabase Dashboard clearen (EMPFOHLEN)"
echo "  → Öffne: https://supabase.com/dashboard/project/awqavfvsnqhubvbfaccv/sql"
echo "  → Führe aus:"
echo "    DELETE FROM supabase_migrations.schema_migrations WHERE version IN ('20250109000001', '20250109000002');"
echo "  → Dann: npx supabase db push --linked"
echo ""
echo "Option 2: Kompletter Database Drop & Rebuild via Dashboard"
echo "  → Öffne: https://supabase.com/dashboard/project/awqavfvsnqhubvbfaccv/settings/database"
echo "  → Klicke auf 'Reset Database Password' > 'Reset Database'"
echo "  → Dann: ./scripts/rebuild-database.sh"
echo ""
echo "Option 3: Temporäre alte Dateien erstellen (Workaround)"
echo "  → Erstelle Dummy-Dateien mit alten Namen"
echo "  → Führe db reset aus"
echo "  → Lösche Dummy-Dateien wieder"
echo ""

read -p "Welche Option möchtest du? (1/2/3/Abbrechen): " -n 1 -r
echo

case $REPLY in
    1)
        echo ""
        echo "${BLUE}Option 1 gewählt: SQL im Dashboard ausführen${NC}"
        echo ""
        echo "Kopiere folgenden SQL-Code:"
        echo "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        cat scripts/clean-remote-migrations.sql
        echo "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
        echo "${GREEN}Nach dem Ausführen im Dashboard:${NC}"
        echo "  npx supabase db push --linked"
        ;;
    2)
        echo ""
        echo "${RED}⚠️  Option 2: Database Reset via Dashboard${NC}"
        echo "Dies löscht ALLE Daten!"
        echo ""
        echo "1. Öffne: https://supabase.com/dashboard/project/awqavfvsnqhubvbfaccv/settings/database"
        echo "2. Scrolle zu 'Database Password'"
        echo "3. Klicke 'Reset Database Password'"
        echo "4. Bestätige mit neuem Passwort"
        echo ""
        echo "Danach hier fortfahren..."
        read -p "Drücke Enter wenn fertig..." 
        ./scripts/rebuild-database.sh
        ;;
    3)
        echo ""
        echo "${YELLOW}Option 3: Workaround mit temporären Dateien${NC}"
        echo ""
        
        # Erstelle temporäre Dummy-Dateien
        echo "-- Temporary migration file for cleanup" > supabase/migrations/20250109000001_temp_cleanup.sql
        echo "-- This file can be deleted after successful reset" >> supabase/migrations/20250109000001_temp_cleanup.sql
        
        echo "-- Temporary migration file for cleanup" > supabase/migrations/20250109000002_temp_cleanup.sql
        echo "-- This file can be deleted after successful reset" >> supabase/migrations/20250109000002_temp_cleanup.sql
        
        echo "${GREEN}✓ Temporäre Dateien erstellt${NC}"
        echo ""
        
        # Versuche db reset
        echo "Führe db reset aus..."
        if npx supabase db reset --linked; then
            echo "${GREEN}✓ Database Reset erfolgreich!${NC}"
            
            # Lösche temporäre Dateien
            rm supabase/migrations/20250109000001_temp_cleanup.sql
            rm supabase/migrations/20250109000002_temp_cleanup.sql
            echo "${GREEN}✓ Temporäre Dateien gelöscht${NC}"
            
            echo ""
            echo "${GREEN}🎉 Fertig! Datenbank wurde erfolgreich neu aufgebaut.${NC}"
        else
            echo "${RED}✗ Database Reset fehlgeschlagen${NC}"
            # Cleanup bei Fehler
            rm -f supabase/migrations/20250109000001_temp_cleanup.sql
            rm -f supabase/migrations/20250109000002_temp_cleanup.sql
        fi
        ;;
    *)
        echo ""
        echo "Abgebrochen."
        exit 0
        ;;
esac

echo ""
echo "${BLUE}Nächste Schritte nach erfolgreichem Fix:${NC}"
echo "  1. npx supabase migration list --linked  # Prüfe Status"
echo "  2. npm run ios                            # Teste die App"
echo ""
