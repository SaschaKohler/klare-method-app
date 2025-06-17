-- =====================================================
-- 009 - Initial Data Seed  
-- AI-Ready Database Reconstruction - Part 9 (Final)
-- =====================================================

-- =======================================
-- BASIC MODULE STRUCTURE (KLARE Steps)
-- =======================================

-- Insert core KLARE modules
INSERT INTO module_contents (id, title, content, klare_step, order_index, difficulty_level, estimated_duration, ai_personalization_enabled) VALUES 
('k-intro', 'Klarheit - Einführung', '{"intro_text": "Willkommen zur Klarheit", "objectives": ["Standortbestimmung", "Bewusste Wahrnehmung"]}', 'K', 1, 1, 15, true),
('k-meta-model', 'Meta-Modell der Sprache', '{"intro_text": "Präzise Kommunikation für mehr Klarheit", "tfp_focus": "Verzerrungen, Generalisierungen, Tilgungen"}', 'K', 2, 3, 25, true),
('l-intro', 'Lebendigkeit - Einführung', '{"intro_text": "Vitale Energie entdecken", "objectives": ["Energiequellen identifizieren", "Blockaden lösen"]}', 'L', 1, 1, 15, true),
('l-anchoring', 'Ressourcen-Anker', '{"intro_text": "Positive Zustände verankern", "tfp_focus": "Kinästhetische und visuelle Anker"}', 'L', 2, 2, 20, true),
('a-intro', 'Ausrichtung - Einführung', '{"intro_text": "Wahre Richtung finden", "objectives": ["Werte klären", "Ziele definieren"]}', 'A', 1, 1, 15, true),
('a-timeline', 'Timeline-Arbeit', '{"intro_text": "Vergangenheit heilen, Zukunft gestalten", "tfp_focus": "Ressourcen aus der Vergangenheit, Future Pacing"}', 'A', 2, 4, 30, true),
('r-intro', 'Realisierung - Einführung', '{"intro_text": "Vom Wissen zum Handeln", "objectives": ["Konkrete Schritte planen", "Hindernisse überwinden"]}', 'R', 1, 1, 15, true),
('r-parts-integration', 'Innere Teile Integration', '{"intro_text": "Konflikte lösen, Ganzheit finden", "tfp_focus": "Peace Maker, Visual Squash"}', 'R', 2, 4, 35, true),
('e-intro', 'Entfaltung - Einführung', '{"intro_text": "Authentisch leben", "objectives": ["Persönlichkeit entwickeln", "Potentiale entfalten"]}', 'E', 1, 1, 15, true),
('e-transformation', 'Transformationsprozess', '{"intro_text": "Nachhaltige Veränderung", "tfp_focus": "Ganzheitliche Integration aller TFP-Techniken"}', 'E', 2, 5, 40, true);

-- =======================================
-- LIFE WHEEL AREAS (KLARE-OPTIMIZED)
-- =======================================

INSERT INTO life_wheel_areas (id, name, description, color_hex, order_index, translations) VALUES 
('career', 'Karriere & Beruf', 'Berufliche Erfüllung und Entwicklung', '#6366F1', 1, '{"en": {"name": "Career & Work", "description": "Professional fulfillment and development"}}'),
('relationships', 'Beziehungen', 'Familie, Freunde und Partnerschaften', '#8B5CF6', 2, '{"en": {"name": "Relationships", "description": "Family, friends and partnerships"}}'),
('health', 'Gesundheit', 'Körperliche und mentale Gesundheit', '#EC4899', 3, '{"en": {"name": "Health", "description": "Physical and mental health"}}'),
('personal-growth', 'Persönliche Entwicklung', 'Lernen, Wachstum und Selbstreflexion', '#F59E0B', 4, '{"en": {"name": "Personal Growth", "description": "Learning, growth and self-reflection"}}'),
('finances', 'Finanzen', 'Finanzielle Sicherheit und Wohlstand', '#10B981', 5, '{"en": {"name": "Finances", "description": "Financial security and prosperity"}}'),
('recreation', 'Freizeit & Hobby', 'Entspannung und persönliche Interessen', '#06B6D4', 6, '{"en": {"name": "Recreation & Hobbies", "description": "Relaxation and personal interests"}}'),
('environment', 'Umgebung', 'Wohn- und Arbeitsumfeld', '#84CC16', 7, '{"en": {"name": "Environment", "description": "Living and working environment"}}'),
('spirituality', 'Spiritualität', 'Sinn, Werte und spirituelle Praxis', '#A855F7', 8, '{"en": {"name": "Spirituality", "description": "Meaning, values and spiritual practice"}}');

-- =======================================
-- TFP PROMPT TEMPLATES
-- =======================================

-- Meta-Model prompts for each KLARE step
INSERT INTO tfp_prompt_templates (id, technique_category, specific_technique, klare_integration, prompt_template, personalization_variables, difficulty_adaptations) VALUES 
('meta-model-k-clarity', 'meta_model', 'clarity_questions', 'K', 
'Analysiere diese Aussage des Users: "{user_statement}". Identifiziere Meta-Modell-Verletzungen und stelle 3 präzise Fragen, die zu mehr Klarheit führen. Fokussiere auf: Verzerrungen, Generalisierungen und Tilgungen. Berücksichtige den KLARE-Schritt "Klarheit" und das User-Level: {user_level}.',
'{"user_statement": "text", "user_level": "integer", "previous_insights": "array"}',
'{"beginner": "Stelle einfache, direkte Fragen", "advanced": "Nutze komplexe Meta-Modell-Herausforderungen"}'),

('anchoring-l-liveliness', 'anchoring', 'resource_anchor', 'L', 
'Hilf dem User dabei, einen kraftvollen Ressourcen-Anker für mehr Lebendigkeit zu installieren. Gewünschter Zustand: "{target_state}". Führe durch: 1) Zustand intensivieren, 2) Anker setzen (kinästhetisch empfohlen), 3) Testen. User-Kontext: {user_context}. Achte auf VAKOG-Details.',
'{"target_state": "text", "user_context": "object", "preferred_modality": "text"}',
'{"beginner": "Schritt-für-Schritt mit viel Anleitung", "advanced": "Ermögliche selbstständige Anker-Experimente"}'),

('timeline-a-alignment', 'timeline', 'future_pacing', 'A', 
'Unterstütze den User bei der Timeline-Arbeit für bessere Ausrichtung. Ziel: "{future_goal}" bis {target_date}. 1) Aktiviere Ressourcen aus der Vergangenheit, 2) Installiere diese in der Zukunft, 3) Future Pace vom Zielpunkt zurück ins Jetzt. User-Timeline-Orientierung: {timeline_type}.',
'{"future_goal": "text", "target_date": "date", "timeline_type": "text", "available_resources": "array"}',
'{"beginner": "Geführte Timeline-Reise", "advanced": "Komplexe Ressourcen-Installation"}'),

('parts-integration-r-realization', 'parts_integration', 'peace_maker', 'R', 
'Leite eine Peace Maker Session für den User. Konflikt: "{conflict_description}". Führe durch alle 3 Wahrnehmungspositionen: 1) Eigene Sicht, 2) Sicht des anderen, 3) Beobachter-Perspektive. Ziel: Integration für bessere Realisierung von Lösungen. User-Konflikt-Muster: {conflict_patterns}.',
'{"conflict_description": "text", "conflict_patterns": "array", "relationship_context": "text"}',
'{"beginner": "Einfache Perspektivenwechsel", "advanced": "Tiefe systemische Integration"}'),

('integration-e-evolution', 'integration', 'holistic_tfp', 'E', 
'Unterstütze den User bei der ganzheitlichen Integration aller TFP-Techniken für nachhaltige Entfaltung. Bewerte Fortschritt in: Meta-Modell ({meta_model_level}/10), Anchoring ({anchoring_level}/10), Timeline ({timeline_level}/10), Parts Integration ({parts_level}/10). Entwickle personalisierten Integrations-Plan.',
'{"meta_model_level": "integer", "anchoring_level": "integer", "timeline_level": "integer", "parts_level": "integer", "user_goals": "array"}',
'{"beginner": "Einfache Integration zweier Techniken", "advanced": "Komplexe Multi-Technik-Orchestrierung"}');

-- =======================================
-- TFP EXERCISE PROGRESSIONS
-- =======================================

-- Meta-Model progression (Level 1-5)
INSERT INTO tfp_exercise_progressions (technique_name, progression_level, exercise_description, prerequisites, learning_objectives, success_indicators, estimated_duration, common_challenges) VALUES 
('meta_model', 1, 'Erkenne offensichtliche Generalisierungen ("alle", "nie", "immer")', '[]', '["Universalquantoren identifizieren", "Erste Meta-Modell-Fragen stellen"]', '["User erkennt 3/5 Universalquantoren", "Stellt mindestens eine präzisierende Frage"]', 15, '["Zu direkte Fragen", "Widerstand gegen Hinterfragen"]'),

('meta_model', 2, 'Identifiziere Ursache-Wirkung-Verzerrungen', '["Level 1 abgeschlossen"]', '["Kausale Verknüpfungen hinterfragen", "Verantwortung zurückgeben"]', '["Erkennt 4/6 Ursache-Wirkung-Aussagen", "Formuliert alternative Perspektiven"]', 20, '["Schuldzuweisungen vermeiden", "Emotionale Reaktionen managen"]'),

('meta_model', 3, 'Komplexe Tilgungen aufdecken (fehlende Referenzen)', '["Level 1-2 abgeschlossen"]', '["Unvollständige Informationen erkennen", "Präzise Nachfragen stellen"]', '["Identifiziert 5/7 getilgte Referenzen", "Stellt hilfreiche W-Fragen"]', 25, '["Übermäßiges Hinterfragen", "Rapport-Verlust durch zu viele Fragen"]'),

('meta_model', 4, 'Vorannahmen und implizite Botschaften erkennen', '["Level 1-3 abgeschlossen"]', '["Versteckte Annahmen aufdecken", "Kommunikations-Subtext verstehen"]', '["Erkennt 4/6 Vorannahmen", "Hinterfragt höflich aber bestimmt"]', 30, '["Defensive Reaktionen beim Gegenüber", "Komplexität der Sprachmuster"]'),

('meta_model', 5, 'Meta-Modell in emotionalen Gesprächen anwenden', '["Level 1-4 abgeschlossen"]', '["Unter Stress präzise kommunizieren", "Deeskalation durch Klarstellung"]', '["Wendet Meta-Modell in 8/10 Konflikt-Situationen an", "Verbessert Gesprächsqualität messbar"]', 35, '["Emotionale Überwältigung", "Timing der Interventionen"]');

-- Anchoring progression (Level 1-5)  
INSERT INTO tfp_exercise_progressions (technique_name, progression_level, exercise_description, prerequisites, learning_objectives, success_indicators, estimated_duration, common_challenges) VALUES 
('anchoring', 1, 'Einfachen kinästhetischen Anker installieren', '[]', '["Ressourcenzustand aktivieren", "Anker-Timing verstehen"]', '["Kann Anker 3x erfolgreich aktivieren", "Zustand verstärkt sich um 30%"]', 20, '["Zu schwacher Ausgangszustand", "Falsches Timing beim Ankern"]'),

('anchoring', 2, 'Visuellen Anker mit Submodalitäten erstellen', '["Level 1 abgeschlossen"]', '["Submodalitäten gezielt verändern", "Visuelle Anker stabilisieren"]', '["Anker funktioniert 4/5 mal", "Kann Submodalitäten bewusst anpassen"]', 25, '["Unklare innere Bilder", "Submodalitäten-Verwirrung"]'),

('anchoring', 3, 'Anker-Ketten für komplexe Zustände', '["Level 1-2 abgeschlossen"]', '["Mehrere Anker verknüpfen", "Komplexe Zustände aufbauen"]', '["Kette von 3 Ankern funktioniert", "Erreicht gewünschten Zielzustand"]', 30, '["Anker-Interferenz", "Zu komplexe Verkettung"]'),

('anchoring', 4, 'Negative Anker neutralisieren (Kollaps)', '["Level 1-3 abgeschlossen"]', '["Störende Anker identifizieren", "Anker-Kollaps durchführen"]', '["Neutralisiert 2/3 störende Anker", "Kann Kollaps-Technik erklären"]', 35, '["Widerstand gegen Veränderung", "Ökologische Einwände"]'),

('anchoring', 5, 'Covert (verdecktes) Ankern in Gesprächen', '["Level 1-4 abgeschlossen"]', '["Unbemerkt positive Zustände ankern", "Rapport-Anker installieren"]', '["Installiert 3 verdeckte Anker erfolgreich", "Verbessert Gesprächs-Rapport messbar"]', 40, '["Ethische Bedenken", "Zu offensichtliche Anker-Signale"]');

-- =======================================
-- JOURNAL TEMPLATE CATEGORIES (KLARE-optimized)
-- =======================================

INSERT INTO journal_template_categories (id, name, description, color_hex, icon_name, order_index, translations) VALUES 
('klarheit', 'Klarheit', 'Bewusste Wahrnehmung und Standortbestimmung', '#6366F1', 'clarity', 1, '{"en": {"name": "Clarity", "description": "Conscious awareness and orientation"}}'),
('lebendigkeit', 'Lebendigkeit', 'Energie und Vitalität kultivieren', '#8B5CF6', 'energy', 2, '{"en": {"name": "Liveliness", "description": "Cultivating energy and vitality"}}'),
('ausrichtung', 'Ausrichtung', 'Werte und Ziele definieren', '#EC4899', 'target', 3, '{"en": {"name": "Alignment", "description": "Defining values and goals"}}'),
('realisierung', 'Realisierung', 'Konkrete Umsetzung und Handlung', '#F59E0B', 'action', 4, '{"en": {"name": "Realization", "description": "Concrete implementation and action"}}'),
('entfaltung', 'Entfaltung', 'Persönliche Entwicklung und Wachstum', '#10B981', 'growth', 5, '{"en": {"name": "Evolution", "description": "Personal development and growth"}}'),
('tägliche-reflexion', 'Tägliche Reflexion', 'Alltägliche Selbstreflexion', '#06B6D4', 'daily', 6, '{"en": {"name": "Daily Reflection", "description": "Daily self-reflection"}}');

-- =======================================
-- SAMPLE JOURNAL TEMPLATES
-- =======================================

INSERT INTO journal_templates (id, title, description, category_id, questions, estimated_duration, difficulty_level, klare_integration, translations) VALUES 
('klarheit-standort', 'Standortbestimmung', 'Wo stehe ich gerade in meinem Leben?', 'klarheit', 
'["Wie würde ich meine aktuelle Lebenssituation in einem Wort beschreiben?", "Was beschäftigt mich in letzter Zeit am meisten?", "Welche meiner Lebensbereiche brauchen gerade Aufmerksamkeit?", "Was ist mir gerade besonders wichtig?"]', 
15, 1, 'K',
'{"en": {"title": "Life Assessment", "description": "Where do I stand in my life right now?", "questions": ["How would I describe my current life situation in one word?", "What has been occupying my mind lately?", "Which areas of my life need attention right now?", "What is particularly important to me right now?"]}}'),

('lebendigkeit-energie', 'Energiequellen', 'Was gibt mir Kraft und Energie?', 'lebendigkeit',
'["Bei welchen Aktivitäten fühle ich mich besonders lebendig?", "Welche Menschen in meinem Leben geben mir Energie?", "Was raubt mir regelmäßig Energie?", "Wie kann ich heute mehr Vitalität in meinen Tag bringen?"]',
12, 1, 'L',
'{"en": {"title": "Energy Sources", "description": "What gives me strength and energy?", "questions": ["During which activities do I feel particularly alive?", "Which people in my life give me energy?", "What regularly drains my energy?", "How can I bring more vitality to my day today?"]}}'),

('tfp-meta-model', 'Meta-Modell Reflexion', 'Präzise Kommunikation entwickeln', 'klarheit',
'["Welche unpräzise Aussage habe ich heute gemacht oder gehört?", "Welche Annahmen habe ich heute nicht hinterfragt?", "Wo hätte ich präziser nachfragen können?", "Wie kann ich morgen bewusster kommunizieren?"]',
18, 3, 'K',
'{"en": {"title": "Meta-Model Reflection", "description": "Developing precise communication", "questions": ["What imprecise statement did I make or hear today?", "Which assumptions did I not question today?", "Where could I have asked more precisely?", "How can I communicate more consciously tomorrow?"]}}');

-- =======================================
-- AI PROMPT TEMPLATES (General)
-- =======================================

INSERT INTO ai_prompt_templates (id, name, description, template, variables, klare_integration, difficulty_level, usage_context) VALUES 
('klare-k-onboarding', 'KLARE K - Klarheit Onboarding', 'Erstes Coaching für Klarheit-Phase', 
'Du bist ein erfahrener Coach für die KLARE-Methode. Der User startet gerade mit dem K-Schritt (Klarheit). 

User-Kontext:
- Name: {user_name}
- Haupt-Herausforderung: {main_challenge}
- Lebensbereiche mit niedrigen Werten: {low_areas}
- Erfahrung mit Selbstreflexion: {reflection_experience}

Führe ein einfühlsames 10-Minuten-Coaching durch, das:
1. Den User willkommen heißt und Sicherheit vermittelt
2. Die Bedeutung von Klarheit erklärt
3. Eine konkrete erste Übung anbietet
4. Den Bezug zur aktuellen Lebenssituation herstellt

Verwende einen warmen, professionellen Ton. Stelle max. 2 Fragen pro Nachricht.',
'{"user_name": "text", "main_challenge": "text", "low_areas": "array", "reflection_experience": "text"}',
'K', 1, 'onboarding'),

('klare-adaptive-coach', 'Adaptiver KLARE Coach', 'Dynamisches Coaching basierend auf User-Fortschritt',
'Du bist ein adaptiver AI-Coach für die KLARE-Methode. Analysiere den User-Fortschritt und passe dein Coaching an.

Aktueller User-Status:
- KLARE-Schritt: {current_step}
- Fortschritt: {progress_percentage}%
- Letzte Session: {last_session_summary}
- Stärken: {identified_strengths}
- Herausforderungen: {current_challenges}
- TFP-Techniken-Level: {tfp_mastery_levels}

Bestimme:
1. Den optimalen nächsten Schritt
2. Ob TFP-Techniken integriert werden sollten
3. Die angemessene Herausforderungsebene
4. Eine konkrete Übung für heute

Antworte im JSON-Format mit: next_action, reasoning, exercise, difficulty_level, tfp_integration.',
'{"current_step": "text", "progress_percentage": "integer", "last_session_summary": "text", "identified_strengths": "array", "current_challenges": "array", "tfp_mastery_levels": "object"}',
'ADAPTIVE', 5, 'coaching');

-- =======================================
-- VERIFICATION QUERIES
-- =======================================

-- Verify data was inserted correctly
DO $$
DECLARE
    module_count INTEGER;
    area_count INTEGER;
    template_count INTEGER;
    tfp_template_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO module_count FROM module_contents;
    SELECT COUNT(*) INTO area_count FROM life_wheel_areas;
    SELECT COUNT(*) INTO template_count FROM journal_templates;
    SELECT COUNT(*) INTO tfp_template_count FROM tfp_prompt_templates;
    
    RAISE NOTICE 'Data seeding completed:';
    RAISE NOTICE 'Module contents: %', module_count;
    RAISE NOTICE 'Life wheel areas: %', area_count;
    RAISE NOTICE 'Journal templates: %', template_count;
    RAISE NOTICE 'TFP prompt templates: %', tfp_template_count;
    
    IF module_count < 10 OR area_count < 8 OR template_count < 3 OR tfp_template_count < 5 THEN
        RAISE EXCEPTION 'Data seeding incomplete. Expected: modules>=10, areas>=8, templates>=3, tfp_templates>=5';
    END IF;
END $$;

-- Create initial admin user insights (for testing)
INSERT INTO personal_insights (user_id, insight_type, content, confidence_score, source_data) 
SELECT 
    id as user_id,
    'onboarding_complete' as insight_type,
    'User has completed initial setup and is ready for KLARE journey' as content,
    0.95 as confidence_score,
    '{"setup_date": "' || NOW()::date || '", "initial_focus": "K"}' as source_data
FROM users 
WHERE email LIKE '%test%' OR email LIKE '%admin%'
LIMIT 1;

RAISE NOTICE 'Initial data seed completed successfully! 🚀';
RAISE NOTICE 'Database is now AI-ready with TFP integration and KLARE content.';
