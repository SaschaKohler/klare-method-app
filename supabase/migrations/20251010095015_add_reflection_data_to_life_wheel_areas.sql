-- Add reflection_data JSONB column to store AI coach Q&A per life area

ALTER TABLE life_wheel_areas 
ADD COLUMN IF NOT EXISTS reflection_data JSONB DEFAULT '{}'::jsonb;

-- Add comment explaining the structure
COMMENT ON COLUMN life_wheel_areas.reflection_data IS 
'Stores AI coach Q&A and user reflections per life area. Structure:
{
  "why_low": "User explanation why current value is low",
  "what_matters": "What matters most in this area",
  "ideal_state": "Description of ideal state (target)",
  "obstacles": ["List of obstacles"],
  "first_steps": ["Concrete first steps"],
  "previous_answers": [
    {
      "question": "Question text",
      "answer": "User answer",
      "timestamp": "ISO date",
      "session_id": "UUID"
    }
  ]
}';;
