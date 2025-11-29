
-- Fix excercise_steps with null IDs and add proper constraints
-- Problem: 15 exercise steps have null IDs, causing module screens to be empty

-- 1. Generate UUIDs for all exercise steps with null IDs
UPDATE excercise_steps
SET id = gen_random_uuid()
WHERE id IS NULL;

-- 2. Make id column NOT NULL and add default
ALTER TABLE excercise_steps
  ALTER COLUMN id SET NOT NULL,
  ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- 3. Add primary key constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'excercise_steps_pkey'
  ) THEN
    ALTER TABLE excercise_steps ADD PRIMARY KEY (id);
  END IF;
END $$;

-- 4. Verify the fix
SELECT 
  COUNT(*) as total_steps,
  COUNT(id) as steps_with_id,
  COUNT(*) - COUNT(id) as steps_without_id
FROM excercise_steps;
;
