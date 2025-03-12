-- supabase/migrations/20250312000000_initial_schema.sql

-- Aktiviere UUID-Erweiterung für Benutzer-IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabelle für Benutzer
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  progress INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sicherheitsrichtlinien für users-Tabelle
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Tabelle für Lebensbereiche
CREATE TABLE life_wheel_areas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  current_value INTEGER NOT NULL,
  target_value INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, name)
);

-- Sicherheitsrichtlinien für life_wheel_areas-Tabelle
ALTER TABLE life_wheel_areas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own life wheel areas" ON life_wheel_areas
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own life wheel areas" ON life_wheel_areas
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own life wheel areas" ON life_wheel_areas
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Tabelle für abgeschlossene Module
CREATE TABLE completed_modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  module_id TEXT NOT NULL,
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, module_id)
);

-- Sicherheitsrichtlinien für completed_modules-Tabelle
ALTER TABLE completed_modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own completed modules" ON completed_modules
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own completed modules" ON completed_modules
  FOR INSERT WITH CHECK (auth.uid() = user_id);
