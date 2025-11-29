
-- Fix completed_modules Tabelle: Bereinige verwaiste Daten und konvertiere zu UUID

-- 1. Entferne bestehende RLS Policies temporär
DROP POLICY IF EXISTS "Users can access their own completed_modules" ON completed_modules;
DROP POLICY IF EXISTS "Users can insert their own completed_modules" ON completed_modules;
DROP POLICY IF EXISTS "Users can update their own completed_modules" ON completed_modules;
DROP POLICY IF EXISTS "Users can delete their own completed_modules" ON completed_modules;

-- 2. Lösche verwaiste Einträge (User existiert nicht mehr in auth.users)
DELETE FROM completed_modules cm
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users u WHERE u.id = cm.user_id::uuid
);

-- 3. Füge fehlende IDs hinzu
UPDATE completed_modules 
SET id = gen_random_uuid()::text 
WHERE id IS NULL;

-- 4. Erstelle temporäre Spalten für UUID-Konvertierung
ALTER TABLE completed_modules 
ADD COLUMN IF NOT EXISTS user_uuid uuid,
ADD COLUMN IF NOT EXISTS module_uuid uuid,
ADD COLUMN IF NOT EXISTS id_uuid uuid;

-- 5. Konvertiere user_id von text zu uuid
UPDATE completed_modules
SET user_uuid = user_id::uuid
WHERE user_id IS NOT NULL;

-- 6. Konvertiere module_id (Slugs) zu UUIDs via modules Tabelle
UPDATE completed_modules cm
SET module_uuid = m.id
FROM modules m
WHERE cm.module_id = m.slug;

-- 7. Konvertiere id von text zu uuid
UPDATE completed_modules
SET id_uuid = id::uuid
WHERE id IS NOT NULL;

-- 8. Lösche Einträge die nicht konvertiert werden konnten
DELETE FROM completed_modules 
WHERE user_uuid IS NULL OR module_uuid IS NULL OR id_uuid IS NULL;

-- 9. Ersetze alte Spalten mit neuen UUID-Spalten
ALTER TABLE completed_modules 
DROP COLUMN user_id,
DROP COLUMN module_id,
DROP COLUMN id;

ALTER TABLE completed_modules 
RENAME COLUMN user_uuid TO user_id;
ALTER TABLE completed_modules 
RENAME COLUMN module_uuid TO module_id;
ALTER TABLE completed_modules 
RENAME COLUMN id_uuid TO id;

-- 10. Setze NOT NULL Constraints
ALTER TABLE completed_modules 
ALTER COLUMN id SET NOT NULL,
ALTER COLUMN user_id SET NOT NULL,
ALTER COLUMN module_id SET NOT NULL,
ALTER COLUMN completed_at SET DEFAULT now();

-- 11. Füge Primary Key hinzu
ALTER TABLE completed_modules 
ADD PRIMARY KEY (id);

-- 12. Füge Foreign Key Constraints hinzu
ALTER TABLE completed_modules
ADD CONSTRAINT fk_completed_modules_user 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE completed_modules
ADD CONSTRAINT fk_completed_modules_module 
FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE;

-- 13. Erstelle Indizes für Performance
CREATE INDEX IF NOT EXISTS idx_completed_modules_user_id ON completed_modules(user_id);
CREATE INDEX IF NOT EXISTS idx_completed_modules_module_id ON completed_modules(module_id);
CREATE INDEX IF NOT EXISTS idx_completed_modules_completed_at ON completed_modules(completed_at DESC);

-- 14. Erstelle unique constraint für user+module Kombination
CREATE UNIQUE INDEX IF NOT EXISTS idx_completed_modules_user_module 
ON completed_modules(user_id, module_id);

-- 15. Erstelle RLS Policies neu
ALTER TABLE completed_modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their own completed_modules"
ON completed_modules FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own completed_modules"
ON completed_modules FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own completed_modules"
ON completed_modules FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own completed_modules"
ON completed_modules FOR DELETE
USING (auth.uid() = user_id);

COMMENT ON TABLE completed_modules IS 'Speichert abgeschlossene Module mit korrekten UUID-Referenzen (bereinigt)';
;
