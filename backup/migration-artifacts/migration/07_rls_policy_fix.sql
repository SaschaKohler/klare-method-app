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

