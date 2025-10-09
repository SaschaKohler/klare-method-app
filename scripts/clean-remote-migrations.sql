-- Clean Remote Migration History
-- Führe dies im Supabase SQL Editor aus, um die alte Migration zu entfernen

-- 1. Zeige aktuelle Migrationen
SELECT version, name, inserted_at 
FROM supabase_migrations.schema_migrations 
ORDER BY version;

-- 2. Lösche die alte umbenannte Migration
DELETE FROM supabase_migrations.schema_migrations 
WHERE version = '20250109000001';

DELETE FROM supabase_migrations.schema_migrations 
WHERE version = '20250109000002';

-- 3. Verifiziere die Löschung
SELECT version, name, inserted_at 
FROM supabase_migrations.schema_migrations 
ORDER BY version;

-- 4. Optional: Zeige alle Migrationen, die noch fehlen
-- Diese werden beim nächsten db push/reset hinzugefügt
