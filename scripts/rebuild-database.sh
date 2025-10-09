#!/bin/bash

# Complete Database Rebuild Script
# Setzt die Klare-App Datenbank komplett neu auf

set -e

# Farben
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_ID="awqavfvsnqhubvbfaccv"

echo "${BLUE}🔄 Klare-App Database Rebuild${NC}"
echo "================================"
echo ""
echo "${YELLOW}⚠️  WARNUNG: Dies wird ALLE Daten in der Datenbank löschen!${NC}"
echo ""
echo "Was wird passieren:"
echo "  1. Alle Tabellen werden gelöscht"
echo "  2. Alle Policies werden entfernt"
echo "  3. Sauberer Neuaufbau mit allen Migrationen"
echo ""

read -p "Bist du sicher, dass du fortfahren möchtest? (Tippe 'JA' um zu bestätigen): " -r
echo

if [[ ! $REPLY == "JA" ]]; then
    echo "${RED}❌ Abgebrochen.${NC}"
    exit 1
fi

echo ""
echo "${BLUE}📋 Schritt 1: Supabase CLI Version prüfen${NC}"
npx supabase --version

echo ""
echo "${BLUE}📋 Schritt 2: Verbindung zur Datenbank testen${NC}"
npx supabase link --project-ref $PROJECT_ID

echo ""
echo "${YELLOW}🗑️  Schritt 3: Database Reset durchführen${NC}"
echo "Dies kann einige Minuten dauern..."
npx supabase db reset --linked

echo ""
echo "${GREEN}✅ Database Reset abgeschlossen!${NC}"

echo ""
echo "${BLUE}📊 Schritt 4: Migrations-Status prüfen${NC}"
npx supabase migration list --linked

echo ""
echo "${GREEN}🎉 Datenbank erfolgreich neu aufgebaut!${NC}"
echo ""
echo "${BLUE}Nächste Schritte:${NC}"
echo "  1. Teste die App: npm run ios"
echo "  2. Erstelle einen neuen Test-User im Onboarding"
echo "  3. Teste die K-Module Funktionalität"
echo ""
