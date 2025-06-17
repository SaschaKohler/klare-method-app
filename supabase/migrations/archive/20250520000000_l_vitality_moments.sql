-- supabase/migrations/20250520000000_l_vitality_moments.sql

-- Diese Migration fügt das Modul l-vitality-moments (Lebendigkeits-Momente) hinzu

-- Module 4: l-vitality-moments (Lebendigkeits-Momente)
INSERT INTO public.module_contents (module_id, content_type, title, description, content, order_index)
VALUES (
  'l-vitality-moments',
  'exercise',
  'Lebendigkeits-Momente',
  'Identifizieren und verstärken Sie Momente natürlicher Lebendigkeit',
  jsonb_build_object(
    'description', 'Diese Übung hilft Ihnen, Momente natürlicher Lebendigkeit in Ihrem Alltag zu identifizieren und bewusst zu verstärken.',
    'duration', 15,
    'materials_needed', jsonb_build_array('Ein Notizbuch oder Journal', 'Ruhige Umgebung', 'Optional: Stimmungsvolle Musik')
  ),
  4
)
ON CONFLICT (id) DO UPDATE
SET content_type = EXCLUDED.content_type,
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    content = EXCLUDED.content,
    order_index = EXCLUDED.order_index,
    updated_at = now();

-- Übungsschritte für Lebendigkeits-Momente
INSERT INTO public.exercise_steps (title, instructions, step_type, options, order_index, module_content_id)
SELECT 
  'Einführung', 
  'In dieser Übung lernen Sie, Momente natürlicher Lebendigkeit bewusst wahrzunehmen und zu verstärken.

Lebendigkeit zeigt sich oft in kleinen, alltäglichen Momenten - ein Lächeln, das von Herzen kommt, der Genuss einer Tasse Tee, oder die Freude beim Hören eines Lieblingssongs. Diese Momente sind Hinweise auf Ihren natürlichen, authentischen Zustand.

Nehmen Sie sich etwa 15 Minuten Zeit für diese Übung. Finden Sie einen ruhigen Ort, wo Sie ungestört sein können.',
  'introduction',
  jsonb_build_object(
    'next_button_text', 'Beginnen'
  ),
  1,
  id
FROM public.module_contents
WHERE module_id = 'l-vitality-moments'
ON CONFLICT (id) DO UPDATE
SET title = EXCLUDED.title,
    instructions = EXCLUDED.instructions,
    step_type = EXCLUDED.step_type,
    options = EXCLUDED.options,
    order_index = EXCLUDED.order_index,
    updated_at = now();

INSERT INTO public.exercise_steps (title, instructions, step_type, options, order_index, module_content_id)
SELECT 
  'Lebendigkeits-Tagebuch', 
  'Denken Sie an die vergangenen drei Tage zurück.

Versuchen Sie, mindestens fünf Momente zu identifizieren, in denen Sie sich besonders lebendig, energetisiert oder in Ihrem Element gefühlt haben. Diese Momente können sehr kurz gewesen sein - auch ein flüchtiger Moment des Wohlbefindens zählt.

Notieren Sie für jeden Moment:
- Was genau ist passiert?
- Wie haben Sie sich körperlich gefühlt? (z.B. warm, entspannt, energiegeladen)
- Welche Emotionen waren präsent?
- Was hat diesen Moment besonders gemacht?',
  'reflection',
  jsonb_build_object(
    'reflection_prompt', 'Beschreiben Sie Ihre Lebendigkeits-Momente der letzten drei Tage',
    'min_length', 50,
    'next_button_text', 'Weiter'
  ),
  2,
  id
FROM public.module_contents
WHERE module_id = 'l-vitality-moments'
ON CONFLICT (id) DO UPDATE
SET title = EXCLUDED.title,
    instructions = EXCLUDED.instructions,
    step_type = EXCLUDED.step_type,
    options = EXCLUDED.options,
    order_index = EXCLUDED.order_index,
    updated_at = now();

INSERT INTO public.exercise_steps (title, instructions, step_type, options, order_index, module_content_id)
SELECT 
  'Körperliche Signale', 
  'Betrachten Sie nun die Momente, die Sie aufgeschrieben haben.

Konzentrieren Sie sich besonders auf die körperlichen Empfindungen während dieser Momente der Lebendigkeit.
- Wo in Ihrem Körper haben Sie die Lebendigkeit am stärksten gespürt?
- Gab es bestimmte Körperbereiche, die sich besonders entspannt oder energetisiert anfühlten?
- Welche Veränderungen in Ihrer Atmung, Körperhaltung oder Muskelspannung haben Sie bemerkt?

Diese körperlichen Signale sind wichtige Hinweise auf Ihren natürlichen Zustand der Lebendigkeit. Sie können als "Anker" dienen, um diesen Zustand bewusst zu aktivieren.',
  'reflection',
  jsonb_build_object(
    'reflection_prompt', 'Beschreiben Sie die körperlichen Signale Ihrer Lebendigkeit',
    'min_length', 30,
    'next_button_text', 'Weiter'
  ),
  3,
  id
FROM public.module_contents
WHERE module_id = 'l-vitality-moments'
ON CONFLICT (id) DO UPDATE
SET title = EXCLUDED.title,
    instructions = EXCLUDED.instructions,
    step_type = EXCLUDED.step_type,
    options = EXCLUDED.options,
    order_index = EXCLUDED.order_index,
    updated_at = now();

INSERT INTO public.exercise_steps (title, instructions, step_type, options, order_index, module_content_id)
SELECT 
  'Bewusste Aktivierung', 
  'Wählen Sie nun einen dieser Lebendigkeits-Momente aus, der für Sie besonders zugänglich erscheint.

Nehmen Sie sich einen Moment Zeit, um diesen Zustand der Lebendigkeit jetzt bewusst zu aktivieren:

1. Schließen Sie die Augen und atmen Sie tief durch
2. Rufen Sie die Erinnerung an diesen Moment in allen Details wach
3. Spüren Sie die körperlichen Empfindungen, die mit diesem Moment verbunden waren
4. Erlauben Sie sich, die positiven Emotionen wieder zu erleben
5. Verstärken Sie diese Empfindungen mit jedem Atemzug

Bleiben Sie für etwa 1-2 Minuten in diesem Zustand.',
  'practice',
  jsonb_build_object(
    'timer_duration', 120,
    'timer_optional', true,
    'next_button_text', 'Weiter'
  ),
  4,
  id
FROM public.module_contents
WHERE module_id = 'l-vitality-moments'
ON CONFLICT (id) DO UPDATE
SET title = EXCLUDED.title,
    instructions = EXCLUDED.instructions,
    step_type = EXCLUDED.step_type,
    options = EXCLUDED.options,
    order_index = EXCLUDED.order_index,
    updated_at = now();

INSERT INTO public.exercise_steps (title, instructions, step_type, options, order_index, module_content_id)
SELECT 
  'Muster erkennen', 
  'Betrachten Sie nun alle Ihre notierten Lebendigkeits-Momente und suchen Sie nach Mustern:

- In welchen Kontexten erleben Sie am häufigsten Lebendigkeit? (z.B. Natur, kreative Tätigkeiten, Gespräche)
- Gibt es bestimmte Menschen, in deren Gegenwart Sie sich lebendiger fühlen?
- Zu welchen Tageszeiten sind Sie am empfänglichsten für Lebendigkeits-Erfahrungen?
- Welche Stimmungen oder Gedanken begleiten Ihre Lebendigkeits-Momente?

Fassen Sie Ihre wichtigsten Erkenntnisse über Ihre persönlichen Lebendigkeits-Muster zusammen.',
  'reflection',
  jsonb_build_object(
    'reflection_prompt', 'Beschreiben Sie die Muster Ihrer Lebendigkeits-Momente',
    'min_length', 30,
    'next_button_text', 'Weiter'
  ),
  5,
  id
FROM public.module_contents
WHERE module_id = 'l-vitality-moments'
ON CONFLICT (id) DO UPDATE
SET title = EXCLUDED.title,
    instructions = EXCLUDED.instructions,
    step_type = EXCLUDED.step_type,
    options = EXCLUDED.options,
    order_index = EXCLUDED.order_index,
    updated_at = now();

INSERT INTO public.exercise_steps (title, instructions, step_type, options, order_index, module_content_id)
SELECT 
  'Verstärkungs-Plan', 
  'Erstellen Sie nun einen konkreten Plan, wie Sie mehr Lebendigkeits-Momente in Ihren Alltag integrieren können.

Basierend auf den Mustern, die Sie identifiziert haben:
- Welche 2-3 spezifischen Aktivitäten könnten Sie in Ihren Wochenplan einbauen?
- Wie könnten Sie bestehende Routinen modifizieren, um mehr Lebendigkeit zu ermöglichen?
- Welche "Lebendigkeits-Anker" könnten Sie im Alltag einsetzen? (z.B. ein bestimmtes Musikstück, eine Körperhaltung, eine kurze Atemübung)

Setzen Sie sich für die kommende Woche ein konkretes Ziel, wie viele bewusste Lebendigkeits-Momente Sie erleben möchten.',
  'reflection',
  jsonb_build_object(
    'reflection_prompt', 'Beschreiben Sie Ihren Plan zur Verstärkung von Lebendigkeits-Momenten',
    'min_length', 50,
    'next_button_text', 'Weiter'
  ),
  6,
  id
FROM public.module_contents
WHERE module_id = 'l-vitality-moments'
ON CONFLICT (id) DO UPDATE
SET title = EXCLUDED.title,
    instructions = EXCLUDED.instructions,
    step_type = EXCLUDED.step_type,
    options = EXCLUDED.options,
    order_index = EXCLUDED.order_index,
    updated_at = now();

INSERT INTO public.exercise_steps (title, instructions, step_type, options, order_index, module_content_id)
SELECT 
  'Reflexion und Abschluss', 
  'Nehmen Sie sich einen Moment Zeit, um über die Erkenntnisse dieser Übung zu reflektieren:

- Was haben Sie über Ihre natürliche Lebendigkeit gelernt?
- Inwiefern unterscheidet sich Ihr bewusster Fokus auf Lebendigkeits-Momente von Ihrer üblichen Alltagswahrnehmung?
- Wie könnte eine regelmäßige Lebendigkeits-Praxis Ihr Wohlbefinden und Ihre Kongruenz stärken?

Abschließend: Setzen Sie eine konkrete Absicht, wie Sie regelmäßig auf Ihre Lebendigkeits-Momente achten werden. Überlegen Sie auch, ob Sie vielleicht ein tägliches "Lebendigkeits-Tagebuch" führen möchten.',
  'reflection',
  jsonb_build_object(
    'reflection_prompt', 'Teilen Sie Ihre Reflexionen und Absicht',
    'min_length', 30,
    'next_button_text', 'Abschließen'
  ),
  7,
  id
FROM public.module_contents
WHERE module_id = 'l-vitality-moments'
ON CONFLICT (id) DO UPDATE
SET title = EXCLUDED.title,
    instructions = EXCLUDED.instructions,
    step_type = EXCLUDED.step_type,
    options = EXCLUDED.options,
    order_index = EXCLUDED.order_index,
    updated_at = now();