# OAuth funktioniert - Database RLS Fix nötig! 🎉

## ✅ ERFOLG: OAuth Problem gelöst!
- Browser schließt sich automatisch ✅
- Session wird korrekt etabliert ✅  
- Code-Exchange funktioniert ✅
- User wird eingeloggt ✅

## ❌ AKTUELLES PROBLEM: Database RLS Policies

### Fehler in den Logs:
```
Error creating user profile: {"code": "42501", "message": "new row violates row-level security policy for table \"users\""}
```

### LÖSUNG: RLS Policies im Supabase Dashboard korrigieren

#### 1. Supabase Dashboard öffnen:
- Gehe zu: https://supabase.com/dashboard/project/awqavfvsnqhubvbfaccv
- Login mit deinem Account

#### 2. SQL Editor öffnen:
- Klicke links auf "SQL Editor"
- Erstelle neue Query

#### 3. Diese SQL-Befehle ausführen:

```sql
-- 1. Prüfe aktuelle users Tabelle
SELECT * FROM users LIMIT 5;

-- 2. Prüfe RLS Status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'users';

-- 3. Prüfe aktuelle Policies  
SELECT policyname, cmd, roles, qual, with_check
FROM pg_policies 
WHERE tablename = 'users';

-- 4. Drop alte Policies (falls vorhanden)
DROP POLICY IF EXISTS "Users can create their own profile" ON users;
DROP POLICY IF EXISTS "Users can read their own profile" ON users;  
DROP POLICY IF EXISTS "Users can update their own profile" ON users;

-- 5. Neue korrekte Policies erstellen
CREATE POLICY "Users can create their own profile" 
ON users FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can read their own profile" 
ON users FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON users FOR UPDATE 
USING (auth.uid() = id) 
WITH CHECK (auth.uid() = id);

-- 6. RLS aktivieren (falls nicht aktiviert)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
```

#### 4. Query ausführen:
- Klicke "Run" Button 
- Alle Befehle sollten erfolgreich sein

#### 5. App neu testen:
```bash
npx expo start --clear
```

### Erwartetes Ergebnis:
- OAuth funktioniert weiterhin ✅
- User-Profile werden erfolgreich erstellt ✅
- Keine RLS-Fehler mehr ✅
- App lädt komplett ohne Errors ✅

### Debug Info:
- **User ID:** `dd90c6b4-b234-4d91-8f5e-8172195a84cc`
- **Project:** `awqavfvsnqhubvbfaccv` (AI-ready Database)
- **Problem:** RLS Policy verhindert User-Erstellung

Nach dem Fix sollte die App vollständig funktionieren! 🚀
