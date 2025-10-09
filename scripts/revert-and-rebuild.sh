#!/bin/bash

# Alternative: Dateinamen zurückbenennen und dann sauber rebuilden
# Dies ist die sicherste Methode, wenn Supabase die Migration-Tabelle verwaltet

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "${BLUE}🔄 Revert & Rebuild Strategy${NC}"
echo "=============================="
echo ""

echo "${YELLOW}Problem:${NC}"
echo "  Supabase verwaltet die schema_migrations Tabelle"
echo "  → Wir können alte Einträge nicht manuell löschen"
echo "  → Umbenennung der Migrationen ist problematisch"
echo ""

echo "${BLUE}Lösung:${NC}"
echo "  1. Dateinamen zurück auf Original (20250109...)"
echo "  2. Database Reset durchführen"
echo "  3. Alle Migrationen laufen in korrekter Reihenfolge"
echo ""

echo "${RED}Hinweis: Die Timestamps werden NICHT mehr geändert${NC}"
echo "Das ist OK - Supabase führt Migrationen sequenziell nach Timestamp aus."
echo "20250109... läuft zuerst, dann 20250610..., dann 20250901..., etc."
echo ""

read -p "Fortfahren mit Revert & Rebuild? (j/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Jj]$ ]]; then
    echo "Abgebrochen."
    exit 1
fi

echo ""
echo "${YELLOW}Schritt 1: Dateinamen zurückbenennen...${NC}"

# Benenne zurück
if [ -f "supabase/migrations/20251009000001_k_module_complete_flow.sql" ]; then
    mv supabase/migrations/20251009000001_k_module_complete_flow.sql \
       supabase/migrations/20250109000001_k_module_complete_flow.sql
    echo "  ✓ 20251009000001 → 20250109000001"
fi

if [ -f "supabase/migrations/20251009000002_fix_relationships_and_constraints.sql" ]; then
    mv supabase/migrations/20251009000002_fix_relationships_and_constraints.sql \
       supabase/migrations/20250109000002_fix_relationships_and_constraints.sql
    echo "  ✓ 20251009000002 → 20250109000002"
fi

echo ""
echo "${YELLOW}Schritt 2: Database Reset...${NC}"
echo ""

if npx supabase db reset --linked; then
    echo ""
    echo "${GREEN}✅ Database Reset erfolgreich!${NC}"
    echo ""
    
    echo "${BLUE}Finale Migration-Liste:${NC}"
    npx supabase migration list --linked
    
    echo ""
    echo "${GREEN}🎉 Rebuild abgeschlossen!${NC}"
    echo ""
    echo "${BLUE}Wichtige Info:${NC}"
    echo "  Die K-Module Migrationen haben jetzt Timestamps von Januar 2025"
    echo "  Das ist OK und ändert nichts an der Funktionalität!"
    echo "  Supabase führt sie in korrekter chronologischer Reihenfolge aus."
    echo ""
    echo "${BLUE}Nächste Schritte:${NC}"
    echo "  1. git add supabase/migrations/"
    echo "  2. git commit -m 'revert: restore original migration names for Supabase compatibility'"
    echo "  3. npm run ios  # Teste die App"
    echo ""
else
    echo ""
    echo "${RED}❌ Database Reset fehlgeschlagen!${NC}"
    echo ""
    echo "Versuche manuelle Fehleranalyse:"
    echo "  npx supabase db reset --linked --debug"
    exit 1
fi
