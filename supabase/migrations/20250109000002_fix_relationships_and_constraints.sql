-- =============================================
-- Fix: Foreign Key und Check Constraints
-- =============================================

-- 1) Bereinige ungültige Daten BEVOR Foreign Key Constraint erstellt wird
-- Lösche module_contents Einträge, deren module_id nicht in modules existiert
DELETE FROM module_contents
WHERE module_id NOT IN (SELECT id FROM modules);

-- 2) Add Foreign Key zwischen module_contents und modules
ALTER TABLE module_contents
  DROP CONSTRAINT IF EXISTS module_contents_module_id_fkey;

ALTER TABLE module_contents
  ADD CONSTRAINT module_contents_module_id_fkey 
  FOREIGN KEY (module_id) 
  REFERENCES modules(id) 
  ON DELETE CASCADE;

-- 2) Erweitere ai_conversations message_type Check Constraint
ALTER TABLE ai_conversations
  DROP CONSTRAINT IF EXISTS ai_conversations_message_type_check;

ALTER TABLE ai_conversations
  ADD CONSTRAINT ai_conversations_message_type_check 
  CHECK (message_type = ANY (ARRAY['user'::text, 'ai'::text, 'system'::text, 'assistant'::text, 'function'::text]));

-- 3) Index für Performance
CREATE INDEX IF NOT EXISTS module_contents_module_id_idx 
  ON module_contents(module_id);

COMMENT ON CONSTRAINT module_contents_module_id_fkey ON module_contents 
  IS 'Foreign key relationship to modules table for proper JOIN operations';
