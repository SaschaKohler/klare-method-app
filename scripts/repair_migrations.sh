#!/bin/bash
# =============================================
# Supabase Migration Repair Script
# Repariert inkonsistente Migration-History
# =============================================

set -e  # Exit on error

echo "🔧 Supabase Migration Repair"
echo "=============================="
echo ""

# Farben für Output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Prüfe ob supabase CLI installiert ist
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}❌ Supabase CLI ist nicht installiert!${NC}"
    echo "Installiere mit: brew install supabase/tap/supabase"
    exit 1
fi

echo -e "${YELLOW}⚠️  WARNUNG: Dies ändert die Migration-History der Remote-Datenbank!${NC}"
echo "Projekt: klare-app-ai (awqavfvsnqhubvbfaccv)"
echo ""
read -p "Fortfahren? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Abgebrochen."
    exit 1
fi

echo ""
echo "📋 Schritt 1: Fehlgeschlagene Migrationen als 'reverted' markieren..."
echo "----------------------------------------------------------------------"

# Fehlgeschlagene Migrationen
FAILED_MIGRATIONS=(
    "20251008045858"
    "20251008050348"
    "20251009070744"
)

for migration in "${FAILED_MIGRATIONS[@]}"; do
    echo "  Revertiere: $migration"
    supabase migration repair --status reverted "$migration" || echo "  ⚠️  Migration $migration nicht gefunden (OK)"
done

echo -e "${GREEN}✅ Fehlgeschlagene Migrationen revertiert${NC}"
echo ""

echo "📋 Schritt 2: Erfolgreiche Migrationen als 'applied' markieren..."
echo "-------------------------------------------------------------------"

# Erfolgreiche Migrationen
APPLIED_MIGRATIONS=(
    "20250610000001"
    "20250610000002"
    "20250611000001"
    "20250611000002"
    "20250611000003"
    "20250611000004"
    "20250611000005"
    "20250611000006"
    "20250611000007"
    "20250611000008"
    "20250611000009"
    "20250611000010"
    "20250611000011"
    "20251217000001"
)

for migration in "${APPLIED_MIGRATIONS[@]}"; do
    echo "  Markiere als applied: $migration"
    supabase migration repair --status applied "$migration" || echo "  ⚠️  Migration $migration nicht gefunden (OK)"
done

echo -e "${GREEN}✅ Erfolgreiche Migrationen markiert${NC}"
echo ""

echo "📋 Schritt 3: Migrations-Status prüfen..."
echo "------------------------------------------"
supabase migration list --linked || echo "⚠️  Konnte Status nicht abrufen"
echo ""

echo "📋 Schritt 4: Neue Migrationen pushen..."
echo "-----------------------------------------"
echo "Folgende Migrationen werden gepusht:"
echo "  - 20250901000000_create_modules_table.sql"
echo "  - 20251002084500_modules_source_of_truth.sql"
echo "  - 20250109000001_k_module_complete_flow.sql"
echo ""

read -p "Migrationen jetzt pushen? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Pushe Migrationen..."
    if supabase db push --linked; then
        echo -e "${GREEN}✅ Migrationen erfolgreich gepusht!${NC}"
    else
        echo -e "${RED}❌ Fehler beim Pushen der Migrationen${NC}"
        echo "Versuche manuelle Ausführung über Supabase Studio:"
        echo "https://supabase.com/dashboard/project/awqavfvsnqhubvbfaccv/editor"
        exit 1
    fi
else
    echo "⏭️  Pushen übersprungen. Du kannst später manuell pushen mit:"
    echo "   supabase db push --linked"
fi

echo ""
echo "📋 Schritt 5: Verifizierung..."
echo "-------------------------------"

echo "Prüfe ob modules Tabelle existiert..."
if supabase db execute --linked --query "SELECT COUNT(*) FROM modules;" &> /dev/null; then
    MODULE_COUNT=$(supabase db execute --linked --query "SELECT COUNT(*) FROM modules;" | tail -n 1)
    echo -e "${GREEN}✅ modules Tabelle existiert (${MODULE_COUNT} Einträge)${NC}"
    
    echo ""
    echo "K-Module in der Datenbank:"
    supabase db execute --linked --query "SELECT slug, title, order_index FROM modules WHERE klare_step = 'K' ORDER BY order_index;" || echo "⚠️  Konnte K-Module nicht abrufen"
else
    echo -e "${RED}❌ modules Tabelle existiert nicht!${NC}"
    echo "Führe Migrationen manuell aus."
fi

echo ""
echo "=============================="
echo -e "${GREEN}✨ Migration Repair abgeschlossen!${NC}"
echo "=============================="
echo ""
echo "Nächste Schritte:"
echo "1. Teste die App mit der Remote-Datenbank"
echo "2. Prüfe K-Module in der App"
echo "3. Bei Problemen: Siehe docs/REMOTE_DB_SYNC_SOLUTION.md"
