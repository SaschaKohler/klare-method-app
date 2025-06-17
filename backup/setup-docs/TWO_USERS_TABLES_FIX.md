# ZWEI USERS TABELLEN - Problem identifiziert! 

## 🔍 Problem gefunden:
Es gibt **zwei separate users Tabellen**:
- `auth.users` (Supabase's interne Auth-Tabelle) ✅
- `public.users` (Deine App's User-Profile-Tabelle) ❌ 

## 🛠️ Lösung: RLS für PUBLIC.users konfigurieren

### Im Supabase SQL Editor ausführen:

```sql
-- 1. Prüfe Struktur der public.users Tabelle
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'users';

-- 2. Prüfe aktuelle Policies für public.users
SELECT policyname, cmd, qual, with_check
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'users';

-- 3. Entferne alte Policies (falls vorhanden)
DROP POLICY IF EXISTS "Users can create their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can read their own profile" ON public.users;  
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;

-- 4. Erstelle KORREKTE Policies für public.users
CREATE POLICY "Users can create their own profile" 
ON public.users FOR INSERT 
WITH CHECK (auth.uid()::TEXT = id::TEXT);

CREATE POLICY "Users can read their own profile" 
ON public.users FOR SELECT 
USING (auth.uid()::TEXT = id::TEXT);

CREATE POLICY "Users can update their own profile" 
ON public.users FOR UPDATE 
USING (auth.uid()::TEXT = id::TEXT) 
WITH CHECK (auth.uid()::TEXT = id::TEXT);

-- 5. RLS für public.users aktivieren (falls nicht aktiviert)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 6. Verification: Prüfe neue Policies
SELECT schemaname, tablename, policyname, cmd, roles
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'users';
```

## 🔍 Debug: Prüfe Tabellen-Struktur

```sql
-- Zeige alle users Tabellen
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'users';

-- Zeige public.users Spalten
\d public.users

-- Test ob public.users existiert und leer ist
SELECT COUNT(*) FROM public.users;
```

## 📋 Was sollte passieren:

1. **public.users** bekommt korrekte RLS Policies
2. **User-Profile können erstellt werden** (INSERT erlaubt)  
3. **Keine 42501 RLS Violations** mehr
4. **App funktioniert vollständig**

## 🎯 Der Unterschied:

- **`auth.users`** = Supabase's interne Auth-Daten (Email, Password, etc.)
- **`public.users`** = Deine App's User-Profile (Name, Progress, etc.)

Beide Tabellen brauchen ihre eigenen RLS Policies!

Nach dem Fix sollte OAuth + User-Erstellung perfekt funktionieren! 🚀
