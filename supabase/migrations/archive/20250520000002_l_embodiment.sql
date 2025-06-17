-- supabase/migrations/20250520000002_l_embodiment.sql

-- Diese Migration fügt das Modul l-embodiment (Verkörperungsübung) hinzu

-- Module 6: l-embodiment (Verkörperungsübung)
INSERT INTO public.module_contents (module_id, content_type, title, description, content, order_index)
VALUES (
  'l-embodiment',
  'exercise',
  'Verkörperungsübung',
  'Körperliche Übung zur Aktivierung Ihrer natürlichen Lebendigkeit',
  jsonb_build_object(
    'description', 'Diese Übung nutzt körperliche Praktiken zur Aktivierung und Verankerung Ihrer natürlichen Lebendigkeit.',
    'duration', 10,
    'materials_needed', jsonb_build_array('Bequeme Kleidung', 'Ein ruhiger Raum mit ausreichend Platz', 'Optional: sanfte Hintergrundmusik')
  ),
  6
)
ON CONFLICT (id) DO UPDATE
SET content_type = EXCLUDED.content_type,
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    content = EXCLUDED.content,
    order_index = EXCLUDED.order_index,
    updated_at = now();

-- Übungsschritte für Verkörperungsübung
INSERT INTO public.exercise_steps (title, instructions, step_type, options, order_index, module_content_id)
SELECT 
  'Einführung', 
  'In dieser Übung werden Sie körperliche Praktiken nutzen, um Ihre natürliche Lebendigkeit zu aktivieren und zu verankern.

Unser Körper ist nicht nur ein Transportmittel für unseren Geist - er ist ein intelligentes System mit eigener Weisheit. Körperliche Übungen können uns direkt mit unserer Lebendigkeit verbinden, oft schneller und tiefer als rein gedankliche Prozesse.

Diese Übung dauert etwa 10 Minuten. Tragen Sie bequeme Kleidung und sorgen Sie für ausreichend Platz zum Bewegen. Optional können Sie sanfte Hintergrundmusik abspielen.',
  'introduction',
  jsonb_build_object(
    'next_button_text', 'Beginnen'
  ),
  1,
  id
FROM public.module_contents
WHERE module_id = 'l-embodiment'
ON CONFLICT (id) DO UPDATE
SET title = EXCLUDED.title,
    instructions = EXCLUDED.instructions,
    step_type = EXCLUDED.step_type,
    options = EXCLUDED.options,
    order_index = EXCLUDED.order_index,
    updated_at = now();

INSERT INTO public.exercise_steps (title, instructions, step_type, options, order_index, module_content_id)
SELECT 
  'Körperliche Bestandsaufnahme', 
  'Beginnen Sie im Stehen oder Sitzen mit geschlossenen Augen. 

Richten Sie Ihre Aufmerksamkeit auf Ihren Körper und beobachten Sie ohne Urteil:
- Wie fühlen sich Ihre Füße an? Sind sie fest mit dem Boden verbunden?
- Wie ist Ihre Körperhaltung? Gibt es Spannungen oder Blockaden?
- Wie ist Ihre Atmung? Flach oder tief? Schnell oder langsam?
- Wo fühlen Sie Energie oder Lebendigkeit in Ihrem Körper?
- Wo fühlen Sie Schwere oder Blockaden?

Nehmen Sie sich 1-2 Minuten Zeit für diese Bestandsaufnahme.',
  'practice',
  jsonb_build_object(
    'timer_duration', 120,
    'timer_optional', true,
    'next_button_text', 'Weiter'
  ),
  2,
  id
FROM public.module_contents
WHERE module_id = 'l-embodiment'
ON CONFLICT (id) DO UPDATE
SET title = EXCLUDED.title,
    instructions = EXCLUDED.instructions,
    step_type = EXCLUDED.step_type,
    options = EXCLUDED.options,
    order_index = EXCLUDED.order_index,
    updated_at = now();

INSERT INTO public.exercise_steps (title, instructions, step_type, options, order_index, module_content_id)
SELECT 
  'Belebende Atmung', 
  'Bleiben Sie in Ihrer bequemen Position und konzentrieren Sie sich nun auf Ihre Atmung.

Führen Sie folgende Atemübung durch:
1. Atmen Sie tief durch die Nase ein und zählen Sie dabei bis 4
2. Halten Sie den Atem für einen Moment (Zählen bis 2)
3. Atmen Sie durch den Mund aus und zählen Sie bis 6
4. Wiederholen Sie diesen Zyklus 5-7 Mal

Mit jedem Einatmen stellen Sie sich vor, wie frische Energie in Ihren Körper strömt. Mit jedem Ausatmen lassen Sie Anspannung und Blockaden los.

Diese Atemübung aktiviert Ihr parasympathisches Nervensystem und schafft eine Grundlage für Lebendigkeit.',
  'practice',
  jsonb_build_object(
    'timer_duration', 90,
    'timer_optional', true,
    'next_button_text', 'Weiter'
  ),
  3,
  id
FROM public.module_contents
WHERE module_id = 'l-embodiment'
ON CONFLICT (id) DO UPDATE
SET title = EXCLUDED.title,
    instructions = EXCLUDED.instructions,
    step_type = EXCLUDED.step_type,
    options = EXCLUDED.options,
    order_index = EXCLUDED.order_index,
    updated_at = now();

INSERT INTO public.exercise_steps (title, instructions, step_type, options, order_index, module_content_id)
SELECT 
  'Energie-Bewegung', 
  'Stehen Sie nun auf (wenn Sie es nicht bereits tun) und beginnen Sie, sich frei zu bewegen.

Folgen Sie diesen Anweisungen:
1. Beginnen Sie mit sanften Bewegungen der Hände und Arme
2. Lassen Sie die Bewegung größer werden und beziehen Sie den ganzen Körper ein
3. Bewegen Sie sich intuitiv, wie es sich für Sie gut anfühlt
4. Experimentieren Sie mit verschiedenen Qualitäten: fließend, rhythmisch, energetisch, verspielt
5. Achten Sie darauf, wo in Ihrem Körper Sie Lebendigkeit spüren

Es geht nicht darum, "richtig" zu tanzen, sondern authentische Bewegung zu entdecken. Lassen Sie Ihren Körper führen, nicht Ihren Kopf.

Nehmen Sie sich 1-2 Minuten Zeit für diese freie Bewegung.',
  'practice',
  jsonb_build_object(
    'timer_duration', 120,
    'timer_optional', true,
    'next_button_text', 'Weiter'
  ),
  4,
  id
FROM public.module_contents
WHERE module_id = 'l-embodiment'
ON CONFLICT (id) DO UPDATE
SET title = EXCLUDED.title,
    instructions = EXCLUDED.instructions,
    step_type = EXCLUDED.step_type,
    options = EXCLUDED.options,
    order_index = EXCLUDED.order_index,
    updated_at = now();

INSERT INTO public.exercise_steps (title, instructions, step_type, options, order_index, module_content_id)
SELECT 
  'Haltungen der Lebendigkeit', 
  'Experimentieren Sie nun mit verschiedenen Körperhaltungen und beobachten Sie deren Wirkung.

Versuchen Sie nacheinander folgende Haltungen einzunehmen und halten Sie jede für etwa 15-20 Sekunden:

1. "Macht-Pose": Stehen Sie aufrecht, Füße hüftbreit, Hände an den Hüften oder über dem Kopf ausgestreckt
2. "Offenheits-Pose": Stehen Sie mit offenen Armen, als würden Sie jemanden willkommen heißen
3. "Verwurzelung": Stehen Sie fest auf beiden Beinen, leicht gebeugt, und spüren Sie den Kontakt zum Boden
4. "Ihre eigene Lebendigkeit": Nehmen Sie intuitiv eine Haltung ein, die für Sie persönlich Lebendigkeit ausdrückt

Achten Sie darauf, wie sich Ihre Stimmung und Energie mit jeder Haltung verändert.',
  'practice',
  jsonb_build_object(
    'timer_duration', 90,
    'timer_optional', true,
    'next_button_text', 'Weiter'
  ),
  5,
  id
FROM public.module_contents
WHERE module_id = 'l-embodiment'
ON CONFLICT (id) DO UPDATE
SET title = EXCLUDED.title,
    instructions = EXCLUDED.instructions,
    step_type = EXCLUDED.step_type,
    options = EXCLUDED.options,
    order_index = EXCLUDED.order_index,
    updated_at = now();

INSERT INTO public.exercise_steps (title, instructions, step_type, options, order_index, module_content_id)
SELECT 
  'Lebendigkeit verankern', 
  'Nehmen Sie zum Abschluss dieser Übung nochmals Ihre "Lebendigkeit-Haltung" ein - diejenige, die für Sie am stärksten Lebendigkeit ausdrückt.

Während Sie in dieser Haltung verweilen:
1. Atmen Sie tief und bewusst
2. Spüren Sie die Energie in Ihrem Körper
3. Schaffen Sie eine mentale "Anker"-Verbindung: Berühren Sie z.B. Daumen und Mittelfinger oder drücken Sie einen bestimmten Punkt an Ihrem Handgelenk
4. Prägen Sie sich dieses Gefühl der Lebendigkeit ein - visuell, körperlich und emotional

Dieser "Anker" kann in Zukunft genutzt werden, um schnell wieder mit Ihrer natürlichen Lebendigkeit in Kontakt zu kommen.',
  'practice',
  jsonb_build_object(
    'timer_duration', 60,
    'timer_optional', true,
    'next_button_text', 'Weiter'
  ),
  6,
  id
FROM public.module_contents
WHERE module_id = 'l-embodiment'
ON CONFLICT (id) DO UPDATE
SET title = EXCLUDED.title,
    instructions = EXCLUDED.instructions,
    step_type = EXCLUDED.step_type,
    options = EXCLUDED.options,
    order_index = EXCLUDED.order_index,
    updated_at = now();

INSERT INTO public.exercise_steps (title, instructions, step_type, options, order_index, module_content_id)
SELECT 
  'Reflexion und Integration', 
  'Nehmen Sie sich nun einen Moment Zeit, um über Ihre Erfahrungen mit dieser Verkörperungsübung zu reflektieren:

- Wie hat sich die Übung auf Ihr Energieniveau und Ihre Stimmung ausgewirkt?
- Welche Körperbereiche fühlen sich jetzt lebendiger an als zuvor?
- Welche spezifischen Bewegungen oder Haltungen hatten die stärkste positive Wirkung?
- Wie könnten Sie ähnliche körperliche Praktiken in Ihren Alltag integrieren?

Planen Sie konkret, wie Sie Ihren körperlichen "Lebendigkeit-Anker" im Alltag nutzen könnten. In welchen Situationen würde es besonders hilfreich sein, schnell zu Ihrer natürlichen Lebendigkeit zurückzufinden?',
  'reflection',
  jsonb_build_object(
    'reflection_prompt', 'Teilen Sie Ihre Erfahrungen und Ihren Integrationsplan',
    'min_length', 30,
    'next_button_text', 'Abschließen'
  ),
  7,
  id
FROM public.module_contents
WHERE module_id = 'l-embodiment'
ON CONFLICT (id) DO UPDATE
SET title = EXCLUDED.title,
    instructions = EXCLUDED.instructions,
    step_type = EXCLUDED.step_type,
    options = EXCLUDED.options,
    order_index = EXCLUDED.order_index,
    updated_at = now();