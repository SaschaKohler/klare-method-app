-- Migration to complete the LifeWheel analysis exercise
-- This migration updates the existing k-lifewheel exercise to include all life areas
-- and ensures proper linking with the LifeWheel data

-- First, let's modify the content description of the k-lifewheel module to include metadata about the LifeWheel connection
UPDATE module_contents
SET content = jsonb_set(
  content, 
  '{update_lifewheel}', 
  'true'::jsonb
)
WHERE module_id = 'k-lifewheel';

-- Delete existing exercise steps for k-lifewheel after step 2 to replace them with comprehensive steps
DELETE FROM exercise_steps 
WHERE module_content_id = (SELECT id FROM module_contents WHERE module_id = 'k-lifewheel' LIMIT 1) 
AND order_index > 2;

-- Now let's add complete steps for all LifeWheel areas
-- Step 3: Finanzen bewerten
INSERT INTO exercise_steps (
  module_content_id,
  title,
  instructions,
  step_type,
  options,
  order_index
) VALUES (
  (SELECT id FROM module_contents WHERE module_id = 'k-lifewheel' LIMIT 1),
  'Finanzen bewerten',
  'Wie zufrieden sind Sie mit Ihrer finanziellen Situation? Berücksichtigen Sie dabei:

- Einkommen und finanzielle Sicherheit
- Schulden und Verbindlichkeiten
- Sparmöglichkeiten und Rücklagen
- Altersvorsorge
- Ausgaben und Budget
- Finanzielles Wissen und Kompetenz

Bewerten Sie Ihren aktuellen Zustand auf einer Skala von 1-10.',
  'input',
  '{
    "input_type": "slider",
    "min_value": 1,
    "max_value": 10,
    "step": 1,
    "default_value": 5,
    "target_question": "Welchen Wert würden Sie gerne erreichen?",
    "lifewheel_area": "finances"
  }',
  3
);

-- Step 4: Beziehungen bewerten
INSERT INTO exercise_steps (
  module_content_id,
  title,
  instructions,
  step_type,
  options,
  order_index
) VALUES (
  (SELECT id FROM module_contents WHERE module_id = 'k-lifewheel' LIMIT 1),
  'Beziehungen bewerten',
  'Wie zufrieden sind Sie mit Ihren Beziehungen und Ihrem sozialen Leben? Berücksichtigen Sie dabei:

- Partnerschaft oder Ehe
- Dating-Leben (falls zutreffend)
- Qualität und Tiefe Ihrer Freundschaften
- Kommunikation und emotionale Verbindung
- Unterstützung und Vertrauen
- Balance zwischen Geben und Nehmen

Bewerten Sie Ihren aktuellen Zustand auf einer Skala von 1-10.',
  'input',
  '{
    "input_type": "slider",
    "min_value": 1,
    "max_value": 10,
    "step": 1,
    "default_value": 5,
    "target_question": "Welchen Wert würden Sie gerne erreichen?",
    "lifewheel_area": "relationships"
  }',
  4
);

-- Step 5: Familie bewerten
INSERT INTO exercise_steps (
  module_content_id,
  title,
  instructions,
  step_type,
  options,
  order_index
) VALUES (
  (SELECT id FROM module_contents WHERE module_id = 'k-lifewheel' LIMIT 1),
  'Familie bewerten',
  'Wie zufrieden sind Sie mit Ihren Familienbeziehungen? Berücksichtigen Sie dabei:

- Verhältnis zu Eltern und Geschwistern
- Beziehung zu Kindern (falls vorhanden)
- Verhältnis zur erweiterten Familie
- Familiäre Atmosphäre und Kommunikation
- Gemeinsame Zeit und Aktivitäten
- Unterstützung innerhalb der Familie

Bewerten Sie Ihren aktuellen Zustand auf einer Skala von 1-10.',
  'input',
  '{
    "input_type": "slider",
    "min_value": 1,
    "max_value": 10,
    "step": 1,
    "default_value": 5,
    "target_question": "Welchen Wert würden Sie gerne erreichen?",
    "lifewheel_area": "family"
  }',
  5
);

-- Step 6: Persönliches Wachstum bewerten
INSERT INTO exercise_steps (
  module_content_id,
  title,
  instructions,
  step_type,
  options,
  order_index
) VALUES (
  (SELECT id FROM module_contents WHERE module_id = 'k-lifewheel' LIMIT 1),
  'Persönliches Wachstum bewerten',
  'Wie zufrieden sind Sie mit Ihrer persönlichen Entwicklung? Berücksichtigen Sie dabei:

- Weiterbildung und Lernen
- Persönliche Ziele und deren Verwirklichung
- Entwicklung neuer Fähigkeiten
- Selbstreflexion und Selbsterkenntnis
- Überwindung von Herausforderungen
- Engagement für kontinuierliche Verbesserung

Bewerten Sie Ihren aktuellen Zustand auf einer Skala von 1-10.',
  'input',
  '{
    "input_type": "slider",
    "min_value": 1,
    "max_value": 10,
    "step": 1,
    "default_value": 5,
    "target_question": "Welchen Wert würden Sie gerne erreichen?",
    "lifewheel_area": "personalGrowth"
  }',
  6
);

-- Step 7: Freizeit bewerten
INSERT INTO exercise_steps (
  module_content_id,
  title,
  instructions,
  step_type,
  options,
  order_index
) VALUES (
  (SELECT id FROM module_contents WHERE module_id = 'k-lifewheel' LIMIT 1),
  'Freizeit bewerten',
  'Wie zufrieden sind Sie mit Ihrer Freizeit und Erholung? Berücksichtigen Sie dabei:

- Ausreichend Zeit für Hobbys und Interessen
- Balance zwischen Aktivität und Entspannung
- Qualität der Freizeitaktivitäten
- Urlaub und Reisen
- Kreative Ausdrucksmöglichkeiten
- Zufriedenheit mit der Freizeitgestaltung

Bewerten Sie Ihren aktuellen Zustand auf einer Skala von 1-10.',
  'input',
  '{
    "input_type": "slider",
    "min_value": 1,
    "max_value": 10,
    "step": 1,
    "default_value": 5,
    "target_question": "Welchen Wert würden Sie gerne erreichen?",
    "lifewheel_area": "leisure"
  }',
  7
);

-- Step 8: Spiritualität bewerten
INSERT INTO exercise_steps (
  module_content_id,
  title,
  instructions,
  step_type,
  options,
  order_index
) VALUES (
  (SELECT id FROM module_contents WHERE module_id = 'k-lifewheel' LIMIT 1),
  'Spiritualität bewerten',
  'Wie zufrieden sind Sie mit Ihrer spirituellen oder inneren Entwicklung? Berücksichtigen Sie dabei:

- Verbindung zu höheren Werten oder Zielen
- Gefühl von Sinn und Zweck im Leben
- Spirituelle oder religiöse Praktiken (falls zutreffend)
- Innere Ruhe und Ausgeglichenheit
- Dankbarkeit und Wertschätzung
- Verbundenheit mit etwas Größerem

Bewerten Sie Ihren aktuellen Zustand auf einer Skala von 1-10.',
  'input',
  '{
    "input_type": "slider",
    "min_value": 1,
    "max_value": 10,
    "step": 1,
    "default_value": 5,
    "target_question": "Welchen Wert würden Sie gerne erreichen?",
    "lifewheel_area": "spirituality"
  }',
  8
);

-- Update the existing steps for consistency
-- Step 1: Update introduction step
UPDATE exercise_steps
SET instructions = 'Das Lebensrad ist ein leistungsstarkes Werkzeug zur Selbstreflexion. Es hilft Ihnen, einen klaren Überblick über verschiedene Lebensbereiche zu gewinnen und Ungleichgewichte zu identifizieren.

In dieser Übung werden Sie acht zentrale Lebensbereiche auf einer Skala von 1 (sehr unzufrieden) bis 10 (vollkommen zufrieden) bewerten. Nehmen Sie sich Zeit für diese Bewertung und seien Sie ehrlich zu sich selbst. Es gibt keine richtigen oder falschen Antworten - es geht nur um Ihre persönliche Einschätzung Ihrer aktuellen Situation.

Ihre Bewertungen werden automatisch in Ihr Lebensrad übertragen, das Sie später jederzeit in der App einsehen und aktualisieren können.'
WHERE module_content_id = (SELECT id FROM module_contents WHERE module_id = 'k-lifewheel' LIMIT 1)
AND order_index = 1;

-- Step 2: Update health step with lifewheel area
UPDATE exercise_steps
SET options = '{
  "input_type": "slider",
  "min_value": 1,
  "max_value": 10,
  "step": 1,
  "default_value": 5,
  "target_question": "Welchen Wert würden Sie gerne erreichen?",
  "lifewheel_area": "health"
}'
WHERE module_content_id = (SELECT id FROM module_contents WHERE module_id = 'k-lifewheel' LIMIT 1)
AND order_index = 2;

-- Step 3: Update career step with lifewheel area
UPDATE exercise_steps
SET options = '{
  "input_type": "slider",
  "min_value": 1,
  "max_value": 10,
  "step": 1,
  "default_value": 5,
  "target_question": "Welchen Wert würden Sie gerne erreichen?",
  "lifewheel_area": "career"
}'
WHERE module_content_id = (SELECT id FROM module_contents WHERE module_id = 'k-lifewheel' LIMIT 1)
AND order_index = 3;

-- Step 9: Add summary and reflection
INSERT INTO exercise_steps (
  module_content_id,
  title,
  instructions,
  step_type,
  options,
  order_index
) VALUES (
  (SELECT id FROM module_contents WHERE module_id = 'k-lifewheel' LIMIT 1),
  'Ihr Lebensrad verstehen',
  'Betrachten Sie Ihr Lebensrad und reflektieren Sie:

1. **Ungleichgewichte**: Welche Bereiche sind besonders niedrig bewertet? Welche überraschend hoch?

2. **Zusammenhänge**: Wie beeinflussen sich die verschiedenen Bereiche gegenseitig? Zum Beispiel: Wie wirkt sich Ihre Gesundheit auf Ihre Karriere aus?

3. **Prioritäten**: Welche 1-2 Bereiche würden, wenn verbessert, den größten positiven Einfluss auf Ihr gesamtes Leben haben?

4. **Potenzial**: In welchen Bereichen sehen Sie das größte Verbesserungspotenzial?

Notieren Sie Ihre Erkenntnisse:',
  'journal',
  '{
    "placeholder": "Meine Erkenntnisse aus dem Lebensrad...",
    "min_length": 50
  }',
  9
);

-- Step 10: Add next steps
INSERT INTO exercise_steps (
  module_content_id,
  title,
  instructions,
  step_type,
  options,
  order_index
) VALUES (
  (SELECT id FROM module_contents WHERE module_id = 'k-lifewheel' LIMIT 1),
  'Nächste Schritte',
  'Basierend auf Ihrer Lebensrad-Analyse, welche konkreten Schritte könnten Sie unternehmen, um mehr Ausgewogenheit in Ihr Leben zu bringen?

Wählen Sie 1-2 Prioritätsbereiche und definieren Sie jeweils eine kleine, umsetzbare Maßnahme, die Sie in der kommenden Woche ergreifen können:',
  'journal',
  '{
    "placeholder": "In den nächsten 7 Tagen werde ich...",
    "min_length": 30
  }',
  10
);

-- Extend the ModuleExercise component with functionality to update LifeWheel values
-- This is done by adding a trigger function that automatically updates the life_wheel_areas table
-- when a user submits an answer to a LifeWheel-related exercise step

-- Create a function to update the life_wheel_areas table based on exercise responses
CREATE OR REPLACE FUNCTION update_lifewheel_from_exercise()
RETURNS TRIGGER AS $$
DECLARE
  area_id TEXT;
  current_value INTEGER;
  target_value INTEGER;
  existing_area_id UUID;
BEGIN
  -- Extract area_id and values from the answer
  IF NEW.answer IS NOT NULL AND 
     (SELECT jsonb_extract_path_text(options, 'lifewheel_area') 
      FROM exercise_steps 
      WHERE id = NEW.exercise_step_id) IS NOT NULL THEN
    
    -- Get the lifewheel area id from the exercise step options
    SELECT jsonb_extract_path_text(options, 'lifewheel_area') 
    INTO area_id
    FROM exercise_steps 
    WHERE id = NEW.exercise_step_id;
    
    -- Get the current value from the user's answer
    current_value := NEW.answer;
    
    -- For the target value, check if it was provided in the answer
    -- If not, use a default of current_value + 2 (capped at 10)
    IF jsonb_typeof(NEW.answer) = 'object' AND NEW.answer ? 'target' THEN
      target_value := (NEW.answer->>'target')::INTEGER;
    ELSE
      target_value := LEAST(current_value + 2, 10);
    END IF;
    
    -- Check if this user already has this area in their life wheel
    SELECT id INTO existing_area_id
    FROM life_wheel_areas
    WHERE user_id = NEW.user_id AND name = area_id;
    
    IF existing_area_id IS NOT NULL THEN
      -- Update existing area
      UPDATE life_wheel_areas
      SET current_value = current_value,
          target_value = target_value,
          updated_at = NOW()
      WHERE id = existing_area_id;
    ELSE
      -- Insert new area
      INSERT INTO life_wheel_areas (
        user_id, 
        name, 
        current_value, 
        target_value, 
        created_at, 
        updated_at
      ) VALUES (
        NEW.user_id,
        area_id,
        current_value,
        target_value,
        NOW(),
        NOW()
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to call the function when a user submits an exercise response
DROP TRIGGER IF EXISTS update_lifewheel_trigger ON user_exercise_results;
CREATE TRIGGER update_lifewheel_trigger
AFTER INSERT ON user_exercise_results
FOR EACH ROW
EXECUTE FUNCTION update_lifewheel_from_exercise();