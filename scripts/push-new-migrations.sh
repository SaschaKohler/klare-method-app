#!/bin/bash

# Push nur die neuen Migrationen ohne Reset
# Die alte 20250109000001 bleibt in der Remote-History, aber das ist OK

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "${BLUE}🚀 Push neue Migrationen${NC}"
echo "========================"
echo ""

echo "${YELLOW}Aktuelle Situation:${NC}"
echo "  Remote hat:   20250109000001 (alt, kann nicht gelöscht werden)"
echo "  Local fehlt:  20251009000001, 20251009000002 (neu, noch nicht auf Remote)"
echo ""

echo "${BLUE}Strategie:${NC}"
echo "  ✓ Alte Migration 20250109000001 bleibt in Remote-History"
echo "  ✓ Neue Migrationen 20251009000001 & 20251009000002 werden gepusht"
echo "  ✓ Kein Reset nötig - inkrementelles Update"
echo ""

read -p "Neue Migrationen pushen? (j/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Jj]$ ]]; then
    echo "Abgebrochen."
    exit 1
fi

echo ""
echo "${YELLOW}Pushe neue Migrationen...${NC}"

if npx supabase db push --linked; then
    echo ""
    echo "${GREEN}✅ Migrationen erfolgreich gepusht!${NC}"
    echo ""
    
    echo "${BLUE}Migrationen-Status:${NC}"
    npx supabase migration list --linked
    
    echo ""
    echo "${GREEN}🎉 Fertig!${NC}"
    echo ""
    echo "${BLUE}Nächste Schritte:${NC}"
    echo "  1. Teste die App: npm run ios"
    echo "  2. Prüfe K-Module Funktionalität"
    echo "  3. Validiere Inkongruenz-Analyse"
    echo ""
else
    echo ""
    echo "${RED}❌ Push fehlgeschlagen!${NC}"
    echo ""
    echo "Führe mit --debug aus für mehr Details:"
    echo "  npx supabase db push --linked --debug"
    exit 1
fi
