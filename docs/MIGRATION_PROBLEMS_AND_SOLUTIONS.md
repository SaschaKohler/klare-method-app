# Supabase Migration Probleme & Lösungen

## Identifizierte Probleme

### 1. ❌ Supabase läuft nicht lokal
**Problem:** `supabase status` zeigt "No such container"

**Ursache:** Lokale Supabase-Instanz wurde nie gestartet oder ist gestoppt

**Lösung:**
```bash
cd /Users/saschakohler/Documents/01_Development/Active_Projects/klare-methode-app
supabase start
```

---

### 2. ❌ Falsches Migrations-Datum
**Problem:** Migration `20251009000001_k_module_complete_flow.sql` hat Datum in der Zukunft (9. Okt 2025)

**Ursache:** Falsches Datumsformat beim Erstellen

**Lösung:** ✅ Bereits behoben
```bash
# Umbenannt von 20251009... zu 20250109...
mv supabase/migrations/20251009000001_k_module_complete_flow.sql \
   supabase/migrations/20250109000001_k_module_complete_flow.sql
```

---

### 3. ❌ **KRITISCH:** `modules` Tabelle existiert nicht
**Problem:** Migration `20251002084500_modules_source_of_truth.sql` referenziert `modules` Tabelle, die nie erstellt wurde

**Betroffene Zeilen:**
- Zeile 58: `JOIN modules m ON m.slug = md.slug`
- Zeile 79: `ADD COLUMN IF NOT EXISTS module_id uuid REFERENCES modules(id)`
- Zeile 84: `FROM modules m`

**Ursache:** Die `modules` Tabelle wurde in keiner vorherigen Migration erstellt. Es gibt nur `module_contents`.

**Lösung:** Neue Migration erstellen, die die `modules` Tabelle VOR `20251002084500` erstellt

---

### 4. ❌ Inkonsistentes Schema
**Problem:** Code verwendet `modules` Tabelle, aber DB hat nur `module_contents`

**Betroffene Dateien:**
- `20250109000001_k_module_complete_flow.sql` - versucht INSERT in `modules`
- `20251002084500_modules_source_of_truth.sql` - versucht JOIN mit `modules`

---

## Lösungsansätze

### Option A: `modules` Tabelle erstellen (EMPFOHLEN)

**Schritt 1:** Neue Migration vor `20251002084500` erstellen

```sql
-- supabase/migrations/20250901000000_create_modules_table.sql
-- =============================================
-- Create modules table as source of truth
-- =============================================

CREATE TABLE IF NOT EXISTS modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  klare_step text NOT NULL CHECK (klare_step IN ('K', 'L', 'A', 'R', 'E')),
  title text NOT NULL,
  description text,
  content_type text CHECK (content_type IN ('intro', 'theory', 'exercise', 'quiz', 'video')),
  order_index integer NOT NULL,
  difficulty_level integer CHECK (difficulty_level BETWEEN 1 AND 5),
  estimated_duration integer, -- in Minuten
  is_active boolean DEFAULT true,
  prerequisites text[], -- Array von module slugs
  learning_objectives text[],
  tags text[],
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS modules_slug_idx ON modules(slug);
CREATE INDEX IF NOT EXISTS modules_klare_step_idx ON modules(klare_step);
CREATE INDEX IF NOT EXISTS modules_order_idx ON modules(klare_step, order_index);

-- RLS Policies
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Modules are viewable by everyone"
  ON modules FOR SELECT
  USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_modules_updated_at
  BEFORE UPDATE ON modules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Seed initial modules from module_contents
INSERT INTO modules (slug, klare_step, title, description, content_type, order_index, difficulty_level, estimated_duration, is_active)
SELECT 
  id as slug,
  klare_step,
  title,
  COALESCE(content->>'intro_text', '') as description,
  CASE 
    WHEN id LIKE '%-intro' THEN 'intro'
    WHEN id LIKE '%-quiz' THEN 'quiz'
    ELSE 'exercise'
  END as content_type,
  order_index,
  difficulty_level,
  estimated_duration,
  true as is_active
FROM module_contents
WHERE id IS NOT NULL
ON CONFLICT (slug) DO NOTHING;
```

**Schritt 2:** Migration-Reihenfolge korrigieren
```bash
# Aktuell:
20250610000001_fix_users_table_rls.sql
20250610000002_add_basic_test_modules.sql
...
20251002084500_modules_source_of_truth.sql  # ❌ Referenziert modules
20250109000001_k_module_complete_flow.sql   # ❌ INSERT in modules

# Neu:
20250610000001_fix_users_table_rls.sql
20250610000002_add_basic_test_modules.sql
...
20250901000000_create_modules_table.sql     # ✅ Erstellt modules
20251002084500_modules_source_of_truth.sql  # ✅ Kann jetzt modules nutzen
20250109000001_k_module_complete_flow.sql   # ✅ Kann in modules schreiben
```

---

### Option B: Migration `20251002084500` reparieren

**Problem:** Die Migration hat fehlerhafte Daten in Zeile 37-45

```sql
-- FALSCH (Zeile 37-45):
WITH mapping_data(slug, legacy_module_content_id) AS (
  VALUES
    ('a-intro',            '54b29d5a-ca3f-4c8c-83c2-e9af20353032'),
    ('k-reality-check',        'K', 'Realitäts-Check Übung', ...),  # ❌ Zu viele Spalten!
```

**Lösung:** Migration korrigieren oder löschen

---

### Option C: Auf `module_contents` bleiben

**Änderung:** Alle neuen Migrationen verwenden `module_contents` statt `modules`

**Nachteil:** Inkonsistent mit bestehendem Code und Architektur

---

## Empfohlener Workflow

### 1. Lokale Supabase starten
```bash
cd /Users/saschakohler/Documents/01_Development/Active_Projects/klare-methode-app
supabase start
```

### 2. Fehlerhafte Migration reparieren
```bash
# Backup erstellen
cp supabase/migrations/20251002084500_modules_source_of_truth.sql \
   supabase/migrations/archive/20251002084500_modules_source_of_truth.sql.backup

# Migration löschen oder reparieren
rm supabase/migrations/20251002084500_modules_source_of_truth.sql
```

### 3. Neue `modules` Tabelle erstellen
```bash
# Neue Migration erstellen
supabase migration new create_modules_table

# Inhalt von Option A einfügen
```

### 4. K-Module Migration anpassen
```bash
# Datei: supabase/migrations/20250109000001_k_module_complete_flow.sql
# Prüfen ob modules Tabelle existiert, sonst in module_contents schreiben
```

### 5. Migrationen anwenden
```bash
supabase db reset
# oder
supabase db push
```

### 6. Testen
```bash
supabase db diff
```

---

## Schnell-Fix für sofortiges Testen

Wenn du die K-Module JETZT testen willst, ohne Migrationen zu fixen:

```bash
# 1. Fehlerhafte Migrationen verschieben
mv supabase/migrations/20251002084500_modules_source_of_truth.sql supabase/migrations/archive/
mv supabase/migrations/20250109000001_k_module_complete_flow.sql supabase/migrations/archive/

# 2. Supabase starten
supabase start

# 3. Supabase DB reset
supabase db reset

# 4. Manuell K-Module in module_contents einfügen (via Supabase Studio)
# Oder via SQL:
supabase db execute --file scripts/insert_k_modules.sql
```

---

## Nächste Schritte

1. ✅ Supabase lokal starten
2. ⏳ Entscheiden: Option A (modules Tabelle) oder Option C (nur module_contents)
3. ⏳ Fehlerhafte Migrationen reparieren
4. ⏳ DB reset durchführen
5. ⏳ K-Module testen

---

## Wichtige Erkenntnisse

- **Migration-Reihenfolge ist kritisch:** Tabellen müssen existieren, bevor sie referenziert werden
- **Datumsformat:** `YYYYMMDDHHMMSS` - immer aktuelles Datum verwenden
- **Schema-Konsistenz:** Code und DB müssen übereinstimmen
- **Lokales Testing:** Immer zuerst lokal testen mit `supabase start`
