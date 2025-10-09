# Migration Naming Convention - Klare-App

## 📋 Aktuelles Problem

Die Migrationen haben **inkonsistente Timestamps**:

```
❌ 20250109000001_k_module_complete_flow.sql           (Januar 2025)
❌ 20250109000002_fix_relationships_and_constraints.sql (Januar 2025)
✅ 20250610000001_fix_users_table_rls.sql              (Juni 2025)
✅ 20250611000001_extensions_and_functions.sql         (Juni 2025)
...
✅ 20250901000000_create_modules_table.sql             (September 2025)
✅ 20251002084500_modules_source_of_truth.sql          (Oktober 2025)
❌ 20251217000001_add_onboarding_fields.sql            (Dezember 2025 - sollte am Ende sein)
```

**Problem**: Die K-Module-Migrationen (Januar) sind eigentlich die NEUESTEN, werden aber als ERSTE ausgeführt!

## ✅ Korrekte Reihenfolge

### Vorgeschlagene Umbenennung:

```
VORHER                                              NACHHER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
20250109000001_k_module_complete_flow.sql      →  20251009000001_k_module_complete_flow.sql
20250109000002_fix_relationships...sql         →  20251009000002_fix_relationships_and_constraints.sql
20251217000001_add_onboarding_fields.sql       →  20251217000001_add_onboarding_fields.sql (bleibt)
```

### Finale chronologische Ordnung:

```
01. 20250610000001_fix_users_table_rls.sql
02. 20250610000002_add_basic_test_modules.sql
03. 20250611000001_extensions_and_functions.sql
04. 20250611000002_core_user_system.sql
05. 20250611000003_ai_integration_system.sql
06. 20250611000004_life_wheel_system.sql
07. 20250611000005_module_system_continued.sql
08. 20250611000006_journal_translation_system.sql
09. 20250611000007_rls_policies_security.sql
10. 20250611000008_tfp_enhancement_schema.sql
11. 20250611000009_initial_data_seed.sql
12. 20250611000010_compatibility_layer.sql
13. 20250611000011_privacy_first_preferences.sql
14. 20250901000000_create_modules_table.sql
15. 20251002084500_modules_source_of_truth.sql
16. 20251009000001_k_module_complete_flow.sql          ← NEU BENANNT
17. 20251009000002_fix_relationships_and_constraints.sql ← NEU BENANNT
18. 20251217000001_add_onboarding_fields.sql
```

## 🚀 Umbenennung durchführen

### Automatisch (Empfohlen):

```bash
./scripts/rename-migrations.sh
```

### Manuell:

```bash
cd supabase/migrations

# K-Module Migration
mv 20250109000001_k_module_complete_flow.sql \
   20251009000001_k_module_complete_flow.sql

# Fix Relationships Migration  
mv 20250109000002_fix_relationships_and_constraints.sql \
   20251009000002_fix_relationships_and_constraints.sql
```

## 📌 Naming Convention

### Format:
```
YYYYMMDDHHMMSS_descriptive_name.sql
```

### Beispiele:
- `20251009000001_k_module_complete_flow.sql`
  - 2025-10-09 00:00:01
  - Beschreibung: k_module_complete_flow
  
- `20251009000002_fix_relationships_and_constraints.sql`
  - 2025-10-09 00:00:02
  - Beschreibung: fix_relationships_and_constraints

### Best Practices:

✅ **DO:**
- Verwende das aktuelle Datum für neue Migrationen
- Verwende beschreibende Namen (snake_case)
- Halte Namen kurz aber aussagekräftig
- Nummeriere sequenziell an einem Tag (000001, 000002, ...)

❌ **DON'T:**
- Verwende keine alten Timestamps für neue Features
- Vermeide generische Namen wie "fix" oder "update"
- Benenne bestehende Migrationen nicht um (außer jetzt für Cleanup)

## 🔄 Nach der Umbenennung

1. **Git Commit:**
```bash
git add supabase/migrations/
git commit -m "refactor: rename migrations to correct chronological order"
```

2. **Database Rebuild:**
```bash
./scripts/rebuild-database.sh
```

3. **Verifizierung:**
```bash
npx supabase migration list --linked
```

## ⚠️ Wichtige Hinweise

- ✅ Diese Umbenennung ist sicher, da die App noch nicht in Production ist
- ✅ Nach Umbenennung MUSS ein Database Rebuild durchgeführt werden
- ✅ Supabase tracked Migrationen nach Namen - Umbenennung = neue Migration
- ⚠️ Wenn die DB bereits deployed ist, benötigt Supabase eine saubere Basis

## 🎯 Warum ist die Reihenfolge wichtig?

1. **Dependency Management**: Spätere Migrationen können auf frühere Tabellen/Functions referenzieren
2. **Rollback Safety**: Rückwärts-Migrationen müssen in umgekehrter Reihenfolge laufen
3. **Team Synchronization**: Alle Developer müssen die gleiche Migration-History haben
4. **Production Deployment**: Neue Environments bauen Schema in korrekter Reihenfolge auf
