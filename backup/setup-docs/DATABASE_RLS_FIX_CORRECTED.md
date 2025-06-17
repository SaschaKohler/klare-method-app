# Database RLS Fix - KORRIGIERTE VERSION 

## UUID vs TEXT Typkonflikt behoben

### ❌ FEHLER:
```
ERROR: 42883: operator does not exist: uuid = text
HINT: No operator matches the given name and argument types.
```

### ✅ LÖSUNG: Type Casting hinzufügen

#### Im Supabase SQL Editor ausführen:

```sql
-- 1. Prüfe users Tabelle Struktur
\d users;

-- 2. Prüfe aktuelle Policies (und entferne sie)
DROP POLICY IF EXISTS "Users can create their own profile" ON users;
DROP POLICY IF EXISTS "Users can read their own profile" ON users;  
DROP POLICY IF EXISTS "Users can update their own profile" ON users;

-- 3. KORRIGIERTE Policies mit UUID::TEXT Casting
CREATE POLICY "Users can create their own profile" 
ON users FOR INSERT 
WITH CHECK (auth.uid()::TEXT = id::TEXT);

CREATE POLICY "Users can read their own profile" 
ON users FOR SELECT 
USING (auth.uid()::TEXT = id::TEXT);

CREATE POLICY "Users can update their own profile" 
ON users FOR UPDATE 
USING (auth.uid()::TEXT = id::TEXT) 
WITH CHECK (auth.uid()::TEXT = id::TEXT);

-- 4. RLS aktivieren
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 5. Test: Prüfe ob Policies korrekt erstellt wurden
SELECT policyname, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'users';
```

### Alternative (falls UUID Spalte):
```sql
-- Falls id Spalte als UUID definiert ist:
CREATE POLICY "Users can create their own profile" 
ON users FOR INSERT 
WITH CHECK (auth.uid() = id::TEXT);

CREATE POLICY "Users can read their own profile" 
ON users FOR SELECT 
USING (auth.uid() = id::TEXT);

CREATE POLICY "Users can update their own profile" 
ON users FOR UPDATE 
USING (auth.uid() = id::TEXT) 
WITH CHECK (auth.uid() = id::TEXT);
```

### Test nach dem Fix:
```bash
npx expo start --clear
# OAuth testen - sollte jetzt User-Profile erstellen können!
```

### Was passiert:
- `auth.uid()` gibt TEXT zurück
- `id` Spalte ist UUID 
- `::TEXT` castet UUID zu TEXT für Vergleich
- RLS Policies funktionieren jetzt korrekt

Der OAuth-Flow sollte dann vollständig ohne Errors laufen! 🎉
