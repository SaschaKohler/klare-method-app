-- supabase/migrations/20250520000001_l_energy_blockers.sql

-- Diese Migration fügt das Modul l-energy-blockers (Energie-Blocker Analyse) hinzu

-- Module 5: l-energy-blockers (Energie-Blocker Analyse)
INSERT INTO public.module_contents (module_id, content_type, title, description, content, order_index)
VALUES (
  'l-energy-blockers',
  'exercise',
  'Energie-Blocker Analyse',
  'Identifizieren und transformieren Sie Energieblocker',
  jsonb_build_object(
    'description', 'Diese Übung hilft Ihnen, persönliche Energie-Blocker zu identifizieren und Strategien zu ihrer Transformation zu entwickeln.',
    'duration', 25,
    'materials_needed', jsonb_build_array('Stift und Papier oder Journal', 'Ein ruhiger, privater Ort', 'Optional: Bunte Stifte für Visualisierung')
  ),
  5
)
ON CONFLICT (id) DO UPDATE
SET content_type = EXCLUDED.content_type,
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    content = EXCLUDED.content,
    order_index = EXCLUDED.order_index,
    updated_at = now();

-- Übungsschritte für Energie-Blocker Analyse
INSERT INTO public.exercise_steps (title, instructions, step_type, options, order_index, module_content_id)
SELECT 
  'Einführung', 
  'In dieser Übung werden Sie Ihre persönlichen Energie-Blocker identifizieren und Strategien zu ihrer Transformation entwickeln.

Energie-Blocker sind Situationen, Gedanken, Emotionen oder Verhaltensweisen, die unsere natürliche Lebendigkeit unterdrücken oder behindern. Sie können bewusst oder unbewusst wirken und haben oft tiefe Wurzeln in unserer Vergangenheit.

Nehmen Sie sich etwa 25 Minuten ungestörte Zeit für diese Übung. Bereiten Sie ein Notizbuch vor, um Ihre Erkenntnisse festzuhalten.',
  'introduction',
  jsonb_build_object(
    'next_button_text', 'Beginnen'
  ),
  1,
  id
FROM public.module_contents
WHERE module_id = 'l-energy-blockers'
ON CONFLICT (id) DO UPDATE
SET title = EXCLUDED.title,
    instructions = EXCLUDED.instructions,
    step_type = EXCLUDED.step_type,
    options = EXCLUDED.options,
    order_index = EXCLUDED.order_index,
    updated_at = now();

INSERT INTO public.exercise_steps (title, instructions, step_type, options, order_index, module_content_id)
SELECT 
  'Energie-Inventar', 
  'Denken Sie an Ihre typische Woche. 

Erstellen Sie zwei Listen:

**Liste 1: Energie-Räuber**
Welche Aktivitäten, Situationen, Menschen oder inneren Zustände rauben Ihnen regelmäßig Energie? Achten Sie auf alle Bereiche: Arbeit, Beziehungen, Freizeit, tägliche Routinen, digitale Gewohnheiten, etc.

**Liste 2: Energie-Spender**
Welche Aktivitäten, Situationen, Menschen oder inneren Zustände geben Ihnen regelmäßig Energie? Was belebt Sie und stärkt Ihr Wohlbefinden?

Notieren Sie für jede Liste mindestens 7-10 Einträge.',
  'reflection',
  jsonb_build_object(
    'reflection_prompt', 'Notieren Sie Ihre Energie-Räuber und Energie-Spender',
    'min_length', 100,
    'next_button_text', 'Weiter'
  ),
  2,
  id
FROM public.module_contents
WHERE module_id = 'l-energy-blockers'
ON CONFLICT (id) DO UPDATE
SET title = EXCLUDED.title,
    instructions = EXCLUDED.instructions,
    step_type = EXCLUDED.step_type,
    options = EXCLUDED.options,
    order_index = EXCLUDED.order_index,
    updated_at = now();

INSERT INTO public.exercise_steps (title, instructions, step_type, options, order_index, module_content_id)
SELECT 
  'Tiefere Blocker-Analyse', 
  'Wählen Sie aus Ihrer Liste der Energie-Räuber die drei stärksten oder hartnäckigsten aus.

Für jeden dieser drei Hauptblocker, beantworten Sie folgende Fragen:

1. **Symptome**: Wie fühlt sich dieser Blocker körperlich und emotional an?
2. **Trigger**: Was löst diesen Blocker typischerweise aus?
3. **Geschichte**: Wann haben Sie diesen Blocker zum ersten Mal erlebt? Hat er Wurzeln in Ihrer Vergangenheit?
4. **Überzeugungen**: Welche Grundüberzeugungen oder Glaubenssätze könnten mit diesem Blocker verbunden sein?
5. **Funktion**: Könnte dieser Blocker ursprünglich einem Schutzzweck gedient haben? Wenn ja, welchem?',
  'reflection',
  jsonb_build_object(
    'reflection_prompt', 'Analysieren Sie Ihre drei Hauptblocker im Detail',
    'min_length', 150,
    'next_button_text', 'Weiter'
  ),
  3,
  id
FROM public.module_contents
WHERE module_id = 'l-energy-blockers'
ON CONFLICT (id) DO UPDATE
SET title = EXCLUDED.title,
    instructions = EXCLUDED.instructions,
    step_type = EXCLUDED.step_type,
    options = EXCLUDED.options,
    order_index = EXCLUDED.order_index,
    updated_at = now();

INSERT INTO public.exercise_steps (title, instructions, step_type, options, order_index, module_content_id)
SELECT 
  'Transformations-Strategien', 
  'Nun entwickeln Sie Strategien, um Ihre Energieblocker zu transformieren.

Für jeden Ihrer drei Hauptblocker:

1. **Äußere Veränderungen**: Wie könnten Sie die Situation oder Umgebung verändern, um den Blocker zu reduzieren? (z.B. Grenzen setzen, Gewohnheiten ändern)

2. **Innere Veränderungen**: Wie könnten Sie Ihre Wahrnehmung oder Einstellung verändern? Welche neuen Überzeugungen würden helfen?

3. **Energetische Ressourcen**: Welche Energie-Spender aus Ihrer Liste könnten Sie aktivieren, um diesem Blocker entgegenzuwirken?

Seien Sie so konkret und praktisch wie möglich bei Ihren Lösungsansätzen.',
  'reflection',
  jsonb_build_object(
    'reflection_prompt', 'Entwickeln Sie Transformations-Strategien für Ihre Hauptblocker',
    'min_length', 150,
    'next_button_text', 'Weiter'
  ),
  4,
  id
FROM public.module_contents
WHERE module_id = 'l-energy-blockers'
ON CONFLICT (id) DO UPDATE
SET title = EXCLUDED.title,
    instructions = EXCLUDED.instructions,
    step_type = EXCLUDED.step_type,
    options = EXCLUDED.options,
    order_index = EXCLUDED.order_index,
    updated_at = now();

INSERT INTO public.exercise_steps (title, instructions, step_type, options, order_index, module_content_id)
SELECT 
  'Visualisierungs-Übung', 
  'Wählen Sie einen Ihrer drei Hauptblocker aus, den Sie jetzt transformieren möchten.

Diese geführte Visualisierung wird Ihnen helfen, diesen Blocker auf einer tieferen Ebene zu lösen:

1. Schließen Sie die Augen und atmen Sie tief durch
2. Stellen Sie sich vor, wie dieser Energieblocker eine Form annimmt - ein Bild, eine Farbe, eine Form oder ein Symbol
3. Beobachten Sie dieses Bild ohne Urteil und nehmen Sie alle Details wahr
4. Fragen Sie diesen Blocker: "Was möchtest du mir mitteilen? Welches Bedürfnis versuchst du zu erfüllen?"
5. Hören Sie auf die Antwort, die aus Ihrem Inneren kommt
6. Stellen Sie sich nun vor, wie dieses Bild sich verwandelt - in etwas Positives, Unterstützendes
7. Spüren Sie die neue Energie, die dabei freigesetzt wird
8. Atmen Sie diese Energie ein und lassen Sie sie durch Ihren Körper fließen

Nehmen Sie sich 3-5 Minuten Zeit für diese Visualisierung.',
  'practice',
  jsonb_build_object(
    'timer_duration', 300,
    'timer_optional', true,
    'next_button_text', 'Weiter'
  ),
  5,
  id
FROM public.module_contents
WHERE module_id = 'l-energy-blockers'
ON CONFLICT (id) DO UPDATE
SET title = EXCLUDED.title,
    instructions = EXCLUDED.instructions,
    step_type = EXCLUDED.step_type,
    options = EXCLUDED.options,
    order_index = EXCLUDED.order_index,
    updated_at = now();

INSERT INTO public.exercise_steps (title, instructions, step_type, options, order_index, module_content_id)
SELECT 
  'Aktionsplan erstellen', 
  'Erstellen Sie nun einen konkreten 7-Tage-Aktionsplan zur Transformation Ihrer Energieblocker.

Wählen Sie für die kommende Woche:
- 1-2 spezifische Blocker, an denen Sie arbeiten werden
- 2-3 konkrete Maßnahmen für jeden Blocker
- Tage und Zeiten, wann Sie diese Maßnahmen umsetzen werden
- Wie Sie sich an die Umsetzung erinnern werden
- Wie Sie Ihren Fortschritt messen oder beobachten werden

Planen Sie auch bewusst, mehr Zeit mit Energie-Spendern zu verbringen. Welche 2-3 Energie-Spender werden Sie in der kommenden Woche bewusst in Ihren Alltag integrieren?',
  'reflection',
  jsonb_build_object(
    'reflection_prompt', 'Erstellen Sie Ihren 7-Tage-Aktionsplan',
    'min_length', 100,
    'next_button_text', 'Weiter'
  ),
  6,
  id
FROM public.module_contents
WHERE module_id = 'l-energy-blockers'
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

- Was haben Sie über Ihre Energiemuster und Blocker gelernt?
- Welche Zusammenhänge erkennen Sie zwischen Ihren Blockern und Ihrer Lebensgeschichte?
- Wie könnten Sie eine regelmäßige "Energie-Inventur" in Ihren Alltag integrieren?
- Welche Folgen könnte es haben, wenn Sie Ihre Hauptblocker erfolgreich transformieren?

Abschließend: Setzen Sie eine klare Intention für den Umgang mit Ihren Energieblockern in den kommenden Tagen. Was ist Ihr wichtigster Vorsatz aus dieser Übung?',
  'reflection',
  jsonb_build_object(
    'reflection_prompt', 'Teilen Sie Ihre Reflexionen und Intention',
    'min_length', 50,
    'next_button_text', 'Abschließen'
  ),
  7,
  id
FROM public.module_contents
WHERE module_id = 'l-energy-blockers'
ON CONFLICT (id) DO UPDATE
SET title = EXCLUDED.title,
    instructions = EXCLUDED.instructions,
    step_type = EXCLUDED.step_type,
    options = EXCLUDED.options,
    order_index = EXCLUDED.order_index,
    updated_at = now();