#!/bin/bash

# Test Migration Script für Supabase
# Führt Migrationen einzeln aus und zeigt Fehler an

set -e

echo "🔍 Testing Supabase Migrations..."
echo ""

# Farben für Output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Supabase Project ID
PROJECT_ID="awqavfvsnqhubvbfaccv"

echo "📋 Migrations to test:"
echo "1. 20250109000002_fix_relationships_and_constraints.sql"
echo "2. 20250611000007_rls_policies_security.sql"
echo "3. 20250109000001_k_module_complete_flow.sql"
echo ""

read -p "Möchtest du alle Migrationen testen? (j/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Jj]$ ]]
then
    echo "❌ Abgebrochen."
    exit 1
fi

echo ""
echo "${YELLOW}⚠️  HINWEIS: Dies wird die Migrationen auf der LIVE Datenbank ausführen!${NC}"
echo "${YELLOW}   Stelle sicher, dass du ein Backup hast.${NC}"
echo ""

read -p "Bist du sicher? (j/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Jj]$ ]]
then
    echo "❌ Abgebrochen."
    exit 1
fi

echo ""
echo "🚀 Starte Migration..."
echo ""

# Test 1: fix_relationships_and_constraints
echo "📝 Testing: 20250109000002_fix_relationships_and_constraints.sql"
if npx supabase db push --db-url "$(npx supabase status --project-id $PROJECT_ID -o json | jq -r '.DB_URL')" --file supabase/migrations/20250109000002_fix_relationships_and_constraints.sql; then
    echo "${GREEN}✅ Migration 1 erfolgreich!${NC}"
else
    echo "${RED}❌ Migration 1 fehlgeschlagen!${NC}"
    exit 1
fi
echo ""

# Test 2: rls_policies_security
echo "📝 Testing: 20250611000007_rls_policies_security.sql"
if npx supabase db push --db-url "$(npx supabase status --project-id $PROJECT_ID -o json | jq -r '.DB_URL')" --file supabase/migrations/20250611000007_rls_policies_security.sql; then
    echo "${GREEN}✅ Migration 2 erfolgreich!${NC}"
else
    echo "${RED}❌ Migration 2 fehlgeschlagen!${NC}"
    exit 1
fi
echo ""

# Test 3: k_module_complete_flow
echo "📝 Testing: 20250109000001_k_module_complete_flow.sql"
if npx supabase db push --db-url "$(npx supabase status --project-id $PROJECT_ID -o json | jq -r '.DB_URL')" --file supabase/migrations/20250109000001_k_module_complete_flow.sql; then
    echo "${GREEN}✅ Migration 3 erfolgreich!${NC}"
else
    echo "${RED}❌ Migration 3 fehlgeschlagen!${NC}"
    exit 1
fi
echo ""

echo ""
echo "${GREEN}🎉 Alle Migrationen erfolgreich ausgeführt!${NC}"
echo ""
