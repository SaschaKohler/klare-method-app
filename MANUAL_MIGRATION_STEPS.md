# 🎯 Manuelle Migration - Schritt für Schritt

## Problem
Die Migrationen können nicht automatisch gepusht werden, weil sie **vor der letzten Remote-Migration** liegen. Wir müssen sie **manuell in der richtigen Reihenfolge** ausführen.

---

## ✅ Lösung: Manuelle Ausführung über Supabase Studio

### Schritt 1: Öffne Supabase Studio SQL Editor

```
https://supabase.com/dashboard/project/awqavfvsnqhubvbfaccv/editor
```

1. Klicke auf **"SQL Editor"** in der linken Sidebar
2. Klicke auf **"New Query"**

---

### Schritt 2: Führe Migrationen in dieser Reihenfolge aus

#### Migration 1: `20250901000000_create_modules_table.sql`

**Kopiere den gesamten Inhalt von:**
```
/Users/saschakohler/Documents/01_Development/Active_Projects/klare-methode-app/supabase/migrations/20250901000000_create_modules_table.sql
```

**Füge in SQL Editor ein und klicke "Run"**

**Erwartetes Ergebnis:**
```
✅ CREATE TABLE modules
✅ CREATE INDEX modules_slug_idx
✅ CREATE POLICY "Modules are viewable by everyone"
✅ CREATE OR REPLACE FUNCTION update_updated_at()
✅ CREATE TRIGGER update_modules_updated_at
✅ INSERT INTO modules (ca. 10-15 Zeilen)
```

**Hinweis:** Die Migration erstellt auch die `update_updated_at()` Funktion, falls sie fehlt.

---

#### Migration 2: `20251002084500_modules_source_of_truth.sql`

**Kopiere den gesamten Inhalt von:**
```
/Users/saschakohler/Documents/01_Development/Active_Projects/klare-methode-app/supabase/migrations/20251002084500_modules_source_of_truth.sql
```

**Füge in SQL Editor ein und klicke "Run"**

**Erwartetes Ergebnis:**
```
✅ ALTER TABLE module_contents
✅ CREATE TABLE legacy_module_mapping
✅ CREATE VIEW module_content_full
```

---

#### Migration 3: `20250109000001_k_module_complete_flow.sql`

**Kopiere den gesamten Inhalt von:**
```
/Users/saschakohler/Documents/01_Development/Active_Projects/klare-methode-app/supabase/migrations/20250109000001_k_module_complete_flow.sql
```

**Füge in SQL Editor ein und klicke "Run"**

**Erwartetes Ergebnis:**
```
✅ INSERT INTO modules (12 K-Module)
✅ INSERT INTO module_contents
✅ INSERT INTO excercise_steps
✅ INSERT INTO ai_prompt_templates
✅ CREATE TABLE k_module_progress
✅ CREATE FUNCTION update_k_module_progress
```

---

### Schritt 3: Markiere Migrationen als "applied"

Zurück im Terminal:

```bash
cd /Users/saschakohler/Documents/01_Development/Active_Projects/klare-methode-app

# Markiere die 3 Migrationen als erfolgreich angewendet
supabase migration repair --status applied 20250901000000
supabase migration repair --status applied 20251002084500
supabase migration repair --status applied 20250109000001
```

---

### Schritt 4: Verifiziere das Ergebnis

#### A) In Supabase Studio

**SQL Editor → Neue Query:**

```sql
-- Prüfe ob modules Tabelle existiert
SELECT COUNT(*) as total_modules FROM modules;

-- Zeige alle K-Module
SELECT slug, title, order_index, estimated_duration 
FROM modules 
WHERE klare_step = 'K' 
ORDER BY order_index;

-- Prüfe k_module_progress Tabelle
SELECT COUNT(*) FROM k_module_progress;
```

**Erwartetes Ergebnis:**
```
total_modules: ~22-25
K-Module: 12 Einträge (k-welcome bis k-completion)
k_module_progress: 0 (Tabelle existiert aber leer)
```

#### B) Im Terminal

```bash
# Migrations-Status prüfen
supabase migration list --linked

# Sollte zeigen:
# 20250901000000 │ 20250901000000 ✅
# 20251002084500 │ 20251002084500 ✅
# 20250109000001 │ 20250109000001 ✅
```

---

## 🎉 Erfolg!

Wenn alle Schritte erfolgreich waren:

✅ `modules` Tabelle existiert  
✅ 12 K-Module sind eingefügt  
✅ `k_module_progress` Tabelle existiert  
✅ AI-Prompt-Templates sind vorhanden  
✅ Migration-History ist synchronisiert  

---

## 📱 App testen

1. **Starte die App:**
   ```bash
   npm run ios
   # oder
   npm run android
   ```

2. **Navigiere zu K-Modul:**
   - Öffne HomeScreen
   - Wähle "K - Klarheit"
   - Du solltest jetzt **12 Phasen** sehen statt 2!

3. **Teste den Ablauf:**
   - Phase 1: Willkommen ✅
   - Phase 2: Lebensrad-Analyse ✅
   - Phase 3: Meta-Modell Intro ✅
   - usw.

---

## ⚠️ Troubleshooting

### Problem: "relation modules already exists"
**Lösung:** Migration 1 wurde bereits ausgeführt, überspringe sie

### Problem: "column module_id does not exist"
**Lösung:** Migration 2 wurde noch nicht ausgeführt, führe sie aus

### Problem: "duplicate key value"
**Lösung:** Modul existiert bereits, das ist OK (ON CONFLICT DO NOTHING)

### Problem: SQL-Fehler in Migration 3
**Lösung:** Prüfe ob Migration 1 und 2 erfolgreich waren

---

## 📝 Warum manuell?

**Grund:** Die Migrationen haben Timestamps **vor** der letzten Remote-Migration (`20251217000001`).

Supabase CLI verhindert standardmäßig das Einfügen von Migrationen "in der Mitte" der History, um Inkonsistenzen zu vermeiden.

**Alternativen:**
1. ✅ **Manuell ausführen** (EMPFOHLEN - sicher und kontrolliert)
2. ❌ Migrationen umbenennen (würde History brechen)
3. ❌ `--include-all` mit falscher Reihenfolge (führt zu Fehlern)

---

## 🚀 Nächste Schritte

Nach erfolgreicher Migration:

1. Teste K-Module in der App
2. Prüfe AI-Integration
3. Teste Progress-Tracking
4. Dokumentiere Erkenntnisse

**Viel Erfolg! 🎉**
