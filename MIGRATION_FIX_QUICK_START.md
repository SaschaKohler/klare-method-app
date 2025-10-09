# 🚀 Migration Fix - Quick Start

## Problem
Die Remote-Datenbank hat eine inkonsistente Migration-History und die `modules` Tabelle fehlt, wodurch die K-Module nicht funktionieren.

---

## ✅ Lösung (2 Optionen)

### Option A: Automatisches Repair-Script (EMPFOHLEN)

```bash
cd /Users/saschakohler/Documents/01_Development/Active_Projects/klare-methode-app
./scripts/repair_migrations.sh
```

**Das Script macht:**
1. ✅ Markiert fehlgeschlagene Migrationen als "reverted"
2. ✅ Markiert erfolgreiche Migrationen als "applied"
3. ✅ Pusht neue Migrationen (modules Tabelle + K-Module)
4. ✅ Verifiziert das Ergebnis

**Dauer:** ~2 Minuten

---

### Option B: Manuelle Schritte

#### 1. Fehlgeschlagene Migrationen reparieren
```bash
supabase migration repair --status reverted 20251008045858
supabase migration repair --status reverted 20251008050348
supabase migration repair --status reverted 20251009070744
```

#### 2. Erfolgreiche Migrationen markieren
```bash
supabase migration repair --status applied 20250610000001
supabase migration repair --status applied 20250610000002
supabase migration repair --status applied 20250611000001
supabase migration repair --status applied 20250611000002
supabase migration repair --status applied 20250611000003
supabase migration repair --status applied 20250611000004
supabase migration repair --status applied 20250611000005
supabase migration repair --status applied 20250611000006
supabase migration repair --status applied 20250611000007
supabase migration repair --status applied 20250611000008
supabase migration repair --status applied 20250611000009
supabase migration repair --status applied 20250611000010
supabase migration repair --status applied 20250611000011
supabase migration repair --status applied 20251217000001
```

#### 3. Neue Migrationen pushen
```bash
supabase db push --linked
```

#### 4. Verifizieren
```bash
supabase db execute --linked --query "SELECT COUNT(*) FROM modules WHERE klare_step = 'K';"
```

---

## 🔍 Verifizierung

Nach dem Repair solltest du sehen:

```sql
-- modules Tabelle existiert
SELECT COUNT(*) FROM modules;
-- Ergebnis: ~22 Module

-- K-Module sind vorhanden
SELECT slug, title FROM modules WHERE klare_step = 'K' ORDER BY order_index;
-- Ergebnis: 12 K-Module (k-welcome bis k-completion)
```

---

## 🎯 Was wurde behoben?

| Problem | Status | Lösung |
|---------|--------|--------|
| Fehlgeschlagene Migrationen blockieren | ❌ | ✅ Als "reverted" markiert |
| `modules` Tabelle fehlt | ❌ | ✅ Migration `20250901000000` erstellt |
| K-Module können nicht eingefügt werden | ❌ | ✅ Migration `20250109000001` funktioniert |
| Inkonsistente Migration-History | ❌ | ✅ Synchronisiert |

---

## 📱 App testen

Nach dem Fix:

1. **Starte die App**
   ```bash
   npm run ios
   # oder
   npm run android
   ```

2. **Navigiere zu einem K-Modul**
   - Öffne HomeScreen
   - Wähle "K - Klarheit"
   - Du solltest jetzt 12 Phasen sehen

3. **Teste den Ablauf**
   - Phase 1: Willkommen
   - Phase 2: Lebensrad-Analyse
   - Phase 3-6: Meta-Modell
   - usw.

---

## ⚠️ Troubleshooting

### Problem: "relation modules does not exist"
**Lösung:** Migration wurde nicht gepusht
```bash
supabase db push --linked --debug
```

### Problem: "migration repair failed"
**Lösung:** Manuell über Supabase Studio
1. Öffne https://supabase.com/dashboard/project/awqavfvsnqhubvbfaccv/editor
2. Führe SQL aus `supabase/migrations/20250901000000_create_modules_table.sql`
3. Führe SQL aus `supabase/migrations/20250109000001_k_module_complete_flow.sql`

### Problem: "password required"
**Lösung:** Datenbank-Passwort eingeben
- Findest du im Supabase Dashboard unter Settings > Database

---

## 📚 Weitere Dokumentation

- **Detaillierte Analyse:** `docs/REMOTE_DB_SYNC_SOLUTION.md`
- **K-Modul Dokumentation:** `docs/K_MODULE_COMPLETE_FLOW.md`
- **Migration Probleme:** `docs/MIGRATION_PROBLEMS_AND_SOLUTIONS.md`

---

## ✨ Nach dem Fix

Die App sollte jetzt:
- ✅ 12 K-Modul Phasen anzeigen
- ✅ Vollständigen Transformationsablauf haben
- ✅ AI-gestützte Personalisierung nutzen
- ✅ Progress-Tracking funktionieren

**Viel Erfolg! 🚀**
