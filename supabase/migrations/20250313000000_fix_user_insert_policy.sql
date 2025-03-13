-- supabase/migrations/20250313000000_fix_user_insert_policy.sql

-- Migration: Konfiguriere Row-Level Security (RLS) für KLARE Methode App
-- Diese Migration fügt notwendige RLS-Richtlinien hinzu, um Registrierungsfehler zu beheben

-- Schritt 1: Aktiviere Row-Level Security für alle Tabellen (falls noch nicht geschehen)
ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."life_wheel_areas" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."completed_modules" ENABLE ROW LEVEL SECURITY;

-- Schritt 2: Lösche bestehende Richtlinien (falls vorhanden) für einen sauberen Neustart
DROP POLICY IF EXISTS "Users can insert their own profile" ON "public"."users";
DROP POLICY IF EXISTS "Users can update their own profile" ON "public"."users";
DROP POLICY IF EXISTS "Users can read their own profile" ON "public"."users";
DROP POLICY IF EXISTS "Users can insert their own life wheel areas" ON "public"."life_wheel_areas";
DROP POLICY IF EXISTS "Users can update their own life wheel areas" ON "public"."life_wheel_areas";
DROP POLICY IF EXISTS "Users can read their own life wheel areas" ON "public"."life_wheel_areas";
DROP POLICY IF EXISTS "Users can insert their completed modules" ON "public"."completed_modules";
DROP POLICY IF EXISTS "Users can read their completed modules" ON "public"."completed_modules";

-- Schritt 3: Erstelle Richtlinien für die users-Tabelle
-- Erlaubt Benutzern, ihren eigenen Eintrag zu erstellen
CREATE POLICY "Users can insert their own profile" 
ON "public"."users"
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = id);

-- Erlaubt Benutzern, ihren eigenen Eintrag zu lesen
CREATE POLICY "Users can read their own profile" 
ON "public"."users"
FOR SELECT 
TO authenticated
USING (auth.uid() = id);

-- Erlaubt Benutzern, ihren eigenen Eintrag zu aktualisieren
CREATE POLICY "Users can update their own profile" 
ON "public"."users"
FOR UPDATE 
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Schritt 4: Erstelle Richtlinien für die life_wheel_areas-Tabelle
-- Erlaubt Benutzern, ihre eigenen Lebensrad-Einträge zu erstellen
CREATE POLICY "Users can insert their own life wheel areas" 
ON "public"."life_wheel_areas"
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Erlaubt Benutzern, ihre eigenen Lebensrad-Einträge zu lesen
CREATE POLICY "Users can read their own life wheel areas" 
ON "public"."life_wheel_areas"
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Erlaubt Benutzern, ihre eigenen Lebensrad-Einträge zu aktualisieren
CREATE POLICY "Users can update their own life wheel areas" 
ON "public"."life_wheel_areas"
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Schritt 5: Erstelle Richtlinien für die completed_modules-Tabelle
-- Erlaubt Benutzern, ihre abgeschlossenen Module zu erstellen
CREATE POLICY "Users can insert their completed modules" 
ON "public"."completed_modules"
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Erlaubt Benutzern, ihre abgeschlossenen Module zu lesen
CREATE POLICY "Users can read their completed modules" 
ON "public"."completed_modules"
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Bestätigungsnachricht
SELECT 'Migration erfolgreich: Row-Level Security Richtlinien für KLARE Methode App wurden konfiguriert.' as "Info";
