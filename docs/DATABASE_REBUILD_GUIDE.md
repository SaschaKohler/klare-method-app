# Database Rebuild Guide - Klare-App

## 🎯 Warum ein Neuaufbau?

Die aktuelle Datenbank hat wahrscheinlich:
- ❌ Inkonsistente Schema-Versionen (TEXT vs UUID für `user_id`)
- ❌ Alte/verwaiste Tabellen aus früheren Migrations
- ❌ RLS Policies mit Type-Casting-Problemen
- ❌ Foreign Key Constraints, die nicht sauber sind

**Nach dem Rebuild:**
- ✅ Sauberes, konsistentes Schema
- ✅ Alle Migrationen in korrekter Reihenfolge
- ✅ Keine Type-Casting-Probleme
- ✅ Optimale Performance

## 📋 Voraussetzungen

- Die App ist noch nicht in Production (Launch: Herbst 2025)
- Alle Daten sind Testdaten
- Supabase CLI ist installiert

## 🚀 Schnell-Anleitung

### Option A: Direkter Rebuild (Empfohlen)

```bash
# 1. Optional: Backup erstellen (falls du Testdaten behalten möchtest)
./scripts/backup-before-rebuild.sh

# 2. Datenbank komplett neu aufbauen
./scripts/rebuild-database.sh
```

### Option B: Manueller Rebuild

```bash
# 1. Mit Supabase verbinden
npx supabase link --project-ref awqavfvsnqhubvbfaccv

# 2. Database Reset
npx supabase db reset --linked

# 3. Migrations-Status prüfen
npx supabase migration list --linked
```

## 📝 Was passiert beim Rebuild?

1. **Alle Tabellen werden gelöscht**
   - Inkl. alter/verwaister Tabellen
   - Inkl. aller Daten (nur Testdaten!)

2. **Alle Migrationen werden neu ausgeführt**
   - In chronologischer Reihenfolge
   - Von Anfang bis Ende

3. **Saubere Extensions & Functions**
   - uuid-ossp
   - pgcrypto
   - Alle RPC-Funktionen

4. **Konsistente RLS Policies**
   - Alle mit korrekten UUID-Casts
   - Keine Type-Mismatch-Fehler

## 🔍 Nach dem Rebuild testen

### 1. App starten
```bash
npm run ios
```

### 2. Neuen Test-User erstellen
- Durchlaufe das Onboarding
- Erstelle ein Profil
- Bewerte das Lebensrad

### 3. K-Module testen
- Öffne "Einführung in die Klarheit"
- Teste die Meta-Modell-Analyse
- Prüfe, ob die Inkongruenz-Analyse läuft
- Validiere die Navigation zwischen Phasen

### 4. Daten-Persistenz prüfen
```bash
# Im Supabase Dashboard SQL Editor ausführen:
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM life_wheel_areas;
SELECT COUNT(*) FROM completed_modules;
SELECT COUNT(*) FROM ai_service_logs;
```

## 🐛 Troubleshooting

### Problem: "Cannot link to project"
```bash
# Lösung: Supabase CLI updaten
npm install -g supabase@latest
```

### Problem: "Migration failed"
```bash
# Lösung: Einzelne Migration prüfen
npx supabase migration list --linked
# Fehlerhafte Migration manuell im SQL Editor ausführen
```

### Problem: "Auth users nicht synchronisiert"
```bash
# Lösung: auth.users Tabelle ist automatisch von Supabase verwaltet
# Deine users Tabelle referenziert korrekt auf auth.users(id)
```

## 📊 Migration-Reihenfolge

Nach dem Rebuild werden diese Migrationen ausgeführt:

1. ✅ `20250610000001_fix_users_table_rls.sql`
2. ✅ `20250610000002_add_basic_test_modules.sql`
3. ✅ `20250611000001_extensions_and_functions.sql`
4. ✅ `20250611000002_core_user_system.sql`
5. ✅ `20250611000003_ai_integration_system.sql`
6. ✅ `20250611000004_life_wheel_system.sql`
7. ✅ `20250611000005_module_system_continued.sql`
8. ✅ `20250611000006_journal_translation_system.sql`
9. ✅ `20250611000007_rls_policies_security.sql` (NEU KORRIGIERT!)
10. ✅ `20250611000008_tfp_enhancement_schema.sql`
11. ✅ `20250611000009_initial_data_seed.sql`
12. ✅ `20250611000010_compatibility_layer.sql`
13. ✅ `20250611000011_privacy_first_preferences.sql`
14. ✅ `20250901000000_create_modules_table.sql`
15. ✅ `20251002084500_modules_source_of_truth.sql`
16. ✅ `20251217000001_add_onboarding_fields.sql`
17. ✅ `20250109000001_k_module_complete_flow.sql` (NEU!)
18. ✅ `20250109000002_fix_relationships_and_constraints.sql` (NEU!)

## ✅ Entscheidungshilfe

**Mache einen Rebuild, wenn:**
- ✅ Du keine wichtigen Production-Daten hast (✓ App ist nicht live)
- ✅ Du Type-Casting-Fehler in RLS Policies hast (✓ Aktuelles Problem)
- ✅ Du saubere Performance haben möchtest (✓ Best Practice)
- ✅ Du Zeit für einen Neustart hast (~15-20 Min) (✓ Jetzt)

**Verzichte auf Rebuild, wenn:**
- ❌ Production-Daten vorhanden sind
- ❌ Deadlines in wenigen Stunden anstehen
- ❌ Andere Team-Mitglieder aktiv entwickeln

## 🎉 Empfehlung

**JA, mache den Rebuild jetzt!**

Gründe:
1. Keine Production-Daten verloren
2. Behebt alle aktuellen Schema-Probleme
3. Saubere Basis für die finale Entwicklung bis Herbst 2025
4. Nur 15-20 Minuten Zeitaufwand

```bash
# Los geht's!
./scripts/rebuild-database.sh
```
