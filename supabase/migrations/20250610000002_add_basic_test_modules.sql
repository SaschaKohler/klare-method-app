-- Quick fix migration to ensure basic module data exists in AI-ready database
-- This creates some test modules for immediate app functionality

-- Insert basic modules for testing if they don't exist
INSERT INTO module_contents (id, title, content, translations, media_url, module_content_id, order_index, created_at, updated_at)
VALUES 
  ('k-intro', 'Klarheit - Einführung', 'Willkommen zur Klarheit', 
   '{"en":{"title":"Clarity - Introduction","content":"Welcome to Clarity"}}', 
   null, 'k-intro', 1, now(), now()),
  ('l-intro', 'Lebendigkeit - Einführung', 'Willkommen zur Lebendigkeit', 
   '{"en":{"title":"Liveliness - Introduction","content":"Welcome to Liveliness"}}', 
   null, 'l-intro', 1, now(), now()),
  ('a-intro', 'Ausrichtung - Einführung', 'Willkommen zur Ausrichtung', 
   '{"en":{"title":"Evolvement - Introduction","content":"Welcome to Evolvement"}}', 
   null, 'a-intro', 1, now(), now()),
  ('r-intro', 'Realisierung - Einführung', 'Willkommen zur Realisierung', 
   '{"en":{"title":"Action - Introduction","content":"Welcome to Action"}}', 
   null, 'r-intro', 1, now(), now()),
  ('e-intro', 'Entfaltung - Einführung', 'Willkommen zur Entfaltung', 
   '{"en":{"title":"Realization - Introduction","content":"Welcome to Realization"}}', 
   null, 'e-intro', 1, now(), now())
ON CONFLICT (id) DO NOTHING;
-- Insert basic content sections for each module
INSERT INTO content_sections (id, module_id, title, content, content_type, order_index, translations, created_at, updated_at)
VALUES 
  ('k-intro-section-1', 'k-intro', 'Was ist Klarheit?', '{"text": "Klarheit bedeutet..."}', 'text', 1, 
   '{"en":{"title":"What is Clarity?","content":{"text":"Clarity means..."}}}', now(), now()),
  ('l-intro-section-1', 'l-intro', 'Was ist Lebendigkeit?', '{"text": "Lebendigkeit bedeutet..."}', 'text', 1, 
   '{"en":{"title":"What is Liveliness?","content":{"text":"Liveliness means..."}}}', now(), now()),
  ('a-intro-section-1', 'a-intro', 'Was ist Ausrichtung?', '{"text": "Ausrichtung bedeutet..."}', 'text', 1, 
   '{"en":{"title":"What is Evolvement?","content":{"text":"Evolvement means..."}}}', now(), now()),
  ('r-intro-section-1', 'r-intro', 'Was ist Realisierung?', '{"text": "Realisierung bedeutet..."}', 'text', 1, 
   '{"en":{"title":"What is Action?","content":{"text":"Action means..."}}}', now(), now()),
  ('e-intro-section-1', 'e-intro', 'Was ist Entfaltung?', '{"text": "Entfaltung bedeutet..."}', 'text', 1, 
   '{"en":{"title":"What is Realization?","content":{"text":"Realization means..."}}}', now(), now())
ON CONFLICT (id) DO NOTHING;
