-- supabase/migrations/20250421000000_a_content_extensions.sql

-- Erweiterung für den A-Schritt (Ausrichtung) der KLARE-Methode

-- Erweiterung für exercise_steps um vision_board_editor hinzuzufügen
-- Diese Änderung MUSS vor dem Einfügen von Daten erfolgen, die den neuen Typ verwenden
ALTER TABLE exercise_steps 
DROP CONSTRAINT IF EXISTS exercise_steps_step_type_check;

ALTER TABLE exercise_steps 
ADD CONSTRAINT exercise_steps_step_type_check 
CHECK (step_type IN ('reflection', 'practice', 'input', 'selection', 'journal', 'introduction', 'example', 'vision_board_editor'));

Alter TABLE klare_content.practical_exercises
Add COLUMN duration_minutes integer DEFAULT 0;

-- A-Module Inhalte: Einführungs-Modul
INSERT INTO public.module_contents (module_id, content_type, title, description, content, order_index)
VALUES (
  'a-intro',
  'intro',
  'Einführung in die Ausrichtung',
  'Überblick über den dritten Schritt der KLARE-Methode',
  jsonb_build_object(
    'intro_text', 'Willkommen zum Ausrichtungs-Modul der KLARE Methode. Hier lernen Sie, wie Sie Ihre Werte, Ziele und Handlungen in Einklang bringen und eine kohärente Lebensvision entwickeln können.',
    'key_points', jsonb_build_array(
      'Werte-Hierarchie etablieren',
      'Lebensbereiche integrieren',
      'Lebensvision entwickeln',
      'Kongruente Entscheidungen treffen'
    )
  ),
  1
)
ON CONFLICT (id) DO UPDATE
SET content_type = EXCLUDED.content_type,
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    content = EXCLUDED.content,
    order_index = EXCLUDED.order_index,
    updated_at = now();

-- Intro-Modul Sektionen
INSERT INTO public.content_sections (title, content, media_url, order_index, module_content_id)
SELECT 
  'Was ist Ausrichtung?', 
  '# Was ist Ausrichtung?

Ausrichtung ist der dritte Schritt der KLARE-Methode und fokussiert auf die Integration aller Lebensbereiche und die Schaffung einer kohärenten Vision. Hier werden Werte, Ziele und Handlungen in Einklang gebracht, um eine durchgängige Kongruenz zu ermöglichen.

Ausrichtung bedeutet, Ihre innere Wertehierarchie zu kennen und alle Lebensbereiche so zu integrieren, dass sie in eine gemeinsame Richtung weisen. Es ist wie wenn alle Instrumente in einem Orchester zum gleichen Stück spielen - nur dann entsteht Harmonie statt Kakophonie.

## Warum Ausrichtung für Kongruenz essentiell ist

Nach der Klarheit über unsere aktuelle Situation und der Aktivierung unserer natürlichen Lebendigkeit müssen wir eine klare Richtung finden:

1. **Kohärenz statt Fragmentierung**: Ausrichtung überwindet die Fragmentierung verschiedener Lebensbereiche
2. **Eindeutigkeit statt Ambivalenz**: Klare Wertehierarchie löst innere Konflikte auf
3. **Integration statt Separation**: Alle Aspekte Ihres Lebens werden zu einem harmonischen Ganzen
4. **Kongruente Entscheidungen**: Klare Ausrichtung ermöglicht leichtere und stimmigere Entscheidungen',
  NULL,
  1,
  id
FROM public.module_contents
WHERE module_id = 'a-intro'
ON CONFLICT (id) DO UPDATE
SET title = EXCLUDED.title,
    content = EXCLUDED.content,
    media_url = EXCLUDED.media_url,
    order_index = EXCLUDED.order_index,
    updated_at = now();

INSERT INTO public.content_sections (title, content, media_url, order_index, module_content_id)
SELECT 
  'Die Herausforderung der Ausrichtung', 
  '# Die Herausforderung der Ausrichtung

In der modernen Gesellschaft stehen wir vor zahlreichen Herausforderungen, die eine klare Ausrichtung erschweren:

- Multiple, teils widersprüchliche Rollen und Erwartungen
- Überfluss an Möglichkeiten und Optionen
- Wertekonflikte zwischen verschiedenen Lebensbereichen
- Gesellschaftliche Erwartungen vs. persönliche Bedürfnisse
- Schnelllebigkeit und ständiger Wandel

Diese Faktoren führen oft zu einem Gefühl der Zerrissenheit und inneren Konflikten. Ausrichtung schafft hingegen innere Kohärenz und Integrität.',
  NULL,
  2,
  id
FROM public.module_contents
WHERE module_id = 'a-intro'
ON CONFLICT (id) DO UPDATE
SET title = EXCLUDED.title,
    content = EXCLUDED.content,
    media_url = EXCLUDED.media_url,
    order_index = EXCLUDED.order_index,
    updated_at = now();

INSERT INTO public.content_sections (title, content, media_url, order_index, module_content_id)
SELECT 
  'Der Weg zur Ausrichtung', 
  '# Der Weg zur Ausrichtung

Der Prozess zur Entwicklung Ihrer Ausrichtung umfasst vier Kernschritte:

1. **Werte-Hierarchie entwickeln**
   Identifikation und Priorisierung Ihrer persönlichen Kernwerte als Kompass

2. **Lebensbereiche integrieren**
   Konflikte zwischen Lebensbereichen auflösen und Synergien schaffen

3. **Kongruente Lebensvision entwickeln**
   Eine ganzheitliche und stimmige Vision für Ihr Leben kreieren

4. **Ausgerichtete Entscheidungsfindung**
   Entscheidungen treffen, die mit Ihren Werten und Ihrer Vision übereinstimmen

Die folgenden Module werden Ihnen helfen, diese Schritte praktisch umzusetzen und eine tiefe Ausrichtung in Ihrem Leben zu etablieren.',
  NULL,
  3,
  id
FROM public.module_contents
WHERE module_id = 'a-intro'
ON CONFLICT (id) DO UPDATE
SET title = EXCLUDED.title,
    content = EXCLUDED.content,
    media_url = EXCLUDED.media_url,
    order_index = EXCLUDED.order_index,
    updated_at = now();

-- A-Module Inhalte: Theorie-Modul
INSERT INTO public.module_contents (module_id, content_type, title, description, content, order_index)
VALUES (
  'a-theory',
  'theory',
  'Die Theorie der Ausrichtung',
  'Verstehen, wie innere Kohärenz zu Kongruenz führt',
  jsonb_build_object(
    'intro_text', 'Die Theorie hinter dem Ausrichtungs-Konzept umfasst Erkenntnisse aus Werteforschung, Identitätspsychologie und Systemtheorie.',
    'key_points', jsonb_build_array(
      'Werte als Orientierungsprinzipien',
      'Logische Ebenen der Ausrichtung',
      'Integration fragmentierter Aspekte',
      'Kohärenz als psychologisches Grundbedürfnis'
    )
  ),
  2
)
ON CONFLICT (id) DO UPDATE
SET content_type = EXCLUDED.content_type,
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    content = EXCLUDED.content,
    order_index = EXCLUDED.order_index,
    updated_at = now();

-- Theorie-Modul Sektionen
INSERT INTO public.content_sections (title, content, media_url, order_index, module_content_id)
SELECT 
  'Die wissenschaftliche Basis', 
  '# Die wissenschaftliche Basis der Ausrichtung

## Werteforschung und Motivationspsychologie

Die Forschung zur Wertehierarchie zeigt, dass Menschen mit klaren, bewussten Werten ein höheres Maß an Lebenszufriedenheit, Resilienz und Sinnerleben aufweisen. Studien von Schwartz und anderen Werteforschern belegen, dass Werte als zentrale Orientierungsprinzipien dienen.

Die Selbstkonkordanz-Theorie belegt, dass Ziele, die mit unseren persönlichen Werten übereinstimmen, mit höherer Wahrscheinlichkeit erreicht werden und zu tieferer Zufriedenheit führen.

## Kohärenzgefühl nach Antonovsky

Aaron Antonovskys Konzept des "Sense of Coherence" (Kohärenzgefühl) beschreibt drei Schlüsselaspekte psychischer Gesundheit:

1. **Verstehbarkeit**: Das Gefühl, dass die Welt verstehbar und strukturiert ist
2. **Handhabbarkeit**: Der Glaube, dass man über die Ressourcen verfügt, um mit Herausforderungen umzugehen
3. **Sinnhaftigkeit**: Das Gefühl, dass das Leben sinnvoll ist und sich Engagement lohnt

Ausrichtung stärkt alle drei Aspekte und trägt so entscheidend zur psychischen Widerstandsfähigkeit bei.',
  NULL,
  1,
  id
FROM public.module_contents
WHERE module_id = 'a-theory'
ON CONFLICT (id) DO UPDATE
SET title = EXCLUDED.title,
    content = EXCLUDED.content,
    media_url = EXCLUDED.media_url,
    order_index = EXCLUDED.order_index,
    updated_at = now();

INSERT INTO public.content_sections (title, content, media_url, order_index, module_content_id)
SELECT 
  'Das Konzept der logischen Ebenen', 
  '# Das Konzept der logischen Ebenen

Die von Robert Dilts entwickelte Theorie der logischen Ebenen beschreibt, wie verschiedene Aspekte unserer Persönlichkeit hierarchisch organisiert sind:

1. **Umgebung**: Wo und wann? Der Kontext
2. **Verhalten**: Was tue ich? Spezifische Handlungen
3. **Fähigkeiten**: Wie tue ich es? Strategien und Methoden
4. **Werte & Glaubenssätze**: Warum tue ich es? Motivation
5. **Identität**: Wer bin ich? Selbstbild
6. **Zugehörigkeit**: Wofür/Wozu? Zweck und Mission

Echte Kongruenz entsteht, wenn alle diese Ebenen miteinander in Einklang stehen. Konflikte entstehen oft, wenn eine Ebene mit einer anderen nicht übereinstimmt (z.B. wenn unser Verhalten im Widerspruch zu unseren Werten steht).

## Beispiel:
- **Umgebung**: In einer Büroumgebung
- **Verhalten**: Pünktlich erscheinen, Aufgaben erledigen
- **Fähigkeiten**: Kommunikation, Organisation, Fachkenntnisse
- **Werte**: Zuverlässigkeit, Qualität, Work-Life-Balance
- **Identität**: Ich bin ein engagierter Profi, der auch ein ausgeglichenes Leben führt
- **Zugehörigkeit**: Beitrag zu einem größeren Ganzen, Gesellschaftliche Rolle

Inkongruenz entsteht, wenn z.B. die Umgebung keinen Raum für die ausgelebte Identität bietet oder das Verhalten im Widerspruch zu den Werten steht.',
  NULL,
  2,
  id
FROM public.module_contents
WHERE module_id = 'a-theory'
ON CONFLICT (id) DO UPDATE
SET title = EXCLUDED.title,
    content = EXCLUDED.content,
    media_url = EXCLUDED.media_url,
    order_index = EXCLUDED.order_index,
    updated_at = now();

INSERT INTO public.content_sections (title, content, media_url, order_index, module_content_id)
SELECT 
  'Werte-Integration und Entscheidungsfindung', 
  '# Werte-Integration und Entscheidungsfindung

## Die Natur von Wertekonflikten

Wertekonflikte entstehen, wenn zwei oder mehr persönliche Werte in einer Situation nicht gleichzeitig erfüllt werden können. Beispiele:

- Sicherheit vs. Freiheit
- Familie vs. Karriere
- Struktur vs. Spontaneität
- Selbstverwirklichung vs. Anpassung

Ohne eine klare Wertehierarchie führen solche Konflikte zu Entscheidungsschwierigkeiten, innerer Zerrissenheit und einem Gefühl der Inkongruenz.

## Integrierte Entscheidungsfindung

Eine klare Ausrichtung ermöglicht eine integrierte Entscheidungsfindung durch:

1. **Werte-basierte Prioritäten**: Entscheidungen werden auf Basis der bewussten Wertehierarchie getroffen
2. **Kontext-Sensitivität**: Verständnis, welche Werte in welchem Kontext Vorrang haben
3. **Kreative Integration**: Lösungen finden, die mehrere Werte gleichzeitig erfüllen
4. **Intuitive Klarheit**: Tiefere Intuitionen können leichter gehört werden, wenn sie nicht durch Werteambivalenz überlagert sind

Studien zeigen: Menschen mit einer klaren Wertehierarchie treffen Entscheidungen schneller, fühlen sich wohler mit ihren Entscheidungen und erleben weniger kognitive Dissonanz und Entscheidungsreue.',
  NULL,
  3,
  id
FROM public.module_contents
WHERE module_id = 'a-theory'
ON CONFLICT (id) DO UPDATE
SET title = EXCLUDED.title,
    content = EXCLUDED.content,
    media_url = EXCLUDED.media_url,
    order_index = EXCLUDED.order_index,
    updated_at = now();

-- A-Module: Werte-Hierarchie Übungsmodul
INSERT INTO public.module_contents (module_id, content_type, title, description, content, order_index)
VALUES (
  'a-values-hierarchy',
  'exercise',
  'Werte-Hierarchie entwickeln',
  'Identifizieren und priorisieren Sie Ihre Kernwerte',
  jsonb_build_object(
    'description', 'Diese Übung hilft Ihnen, Ihre persönlichen Kernwerte zu identifizieren und in eine klare Hierarchie zu bringen.',
    'duration', 25,
    'materials_needed', jsonb_build_array('Stift und Papier oder Journal', 'Ein ruhiger, ungestörter Ort')
  ),
  3
)
ON CONFLICT (id) DO UPDATE
SET content_type = EXCLUDED.content_type,
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    content = EXCLUDED.content,
    order_index = EXCLUDED.order_index,
    updated_at = now();

-- Übungsschritte für Werte-Hierarchie
INSERT INTO public.exercise_steps (title, instructions, step_type, options, order_index, module_content_id)
SELECT 
  'Einführung', 
  'In dieser Übung werden Sie Ihre persönlichen Kernwerte identifizieren und priorisieren. 

Werte sind fundamentale Überzeugungen, die bestimmen, was uns im Leben wichtig ist. Sie sind wie ein innerer Kompass, der uns bei Entscheidungen leitet und definiert, was für uns ein erfülltes Leben ausmacht.

Wenn wir unsere wichtigsten Werte kennen und in eine Hierarchie bringen, können wir Entscheidungen treffen, die mit unserem authentischen Selbst übereinstimmen.

Nehmen Sie sich etwa 25 Minuten ungestörte Zeit für diese Übung.',
  'introduction',
  jsonb_build_object(
    'next_button_text', 'Beginnen'
  ),
  1,
  id
FROM public.module_contents
WHERE module_id = 'a-values-hierarchy'
ON CONFLICT (id) DO UPDATE
SET title = EXCLUDED.title,
    instructions = EXCLUDED.instructions,
    step_type = EXCLUDED.step_type,
    options = EXCLUDED.options,
    order_index = EXCLUDED.order_index,
    updated_at = now();

INSERT INTO public.exercise_steps (title, instructions, step_type, options, order_index, module_content_id)
SELECT 
  'Werte entdecken', 
  'Denken Sie an Momente in Ihrem Leben, in denen Sie sich besonders erfüllt, lebendig und im Einklang mit sich selbst gefühlt haben. Diese Momente geben wichtige Hinweise auf Ihre Kernwerte.

Betrachten Sie die folgende Liste von Werten und wählen Sie alle aus, die für Sie besonders wichtig sind. Es gibt keine richtigen oder falschen Antworten - es geht nur darum, was für SIE persönlich bedeutsam ist.',
  'selection',
  jsonb_build_object(
    'selection_type', 'multiple',
    'min_selections', 5,
    'max_selections', 15,
    'options', jsonb_build_array(
      'Abenteuer', 'Anerkennung', 'Authentizität', 'Autonomie', 'Balance', 
      'Bildung', 'Dankbarkeit', 'Ehrlichkeit', 'Erfolg', 'Familie', 
      'Freiheit', 'Freundschaft', 'Fürsorge', 'Gesundheit', 'Glaube', 
      'Gerechtigkeit', 'Harmonie', 'Herausforderung', 'Humor', 'Kreativität', 
      'Leidenschaft', 'Loyalität', 'Macht', 'Mitgefühl', 'Mut', 
      'Nachhaltigkeit', 'Offenheit', 'Ordnung', 'Respekt', 'Ruhe', 
      'Selbstentwicklung', 'Sicherheit', 'Spaß', 'Spiritualität', 'Tradition', 
      'Unabhängigkeit', 'Verbundenheit', 'Vertrauen', 'Weisheit', 'Wohlstand'
    ),
    'custom_option', true,
    'next_button_text', 'Weiter'
  ),
  2,
  id
FROM public.module_contents
WHERE module_id = 'a-values-hierarchy'
ON CONFLICT (id) DO UPDATE
SET title = EXCLUDED.title,
    instructions = EXCLUDED.instructions,
    step_type = EXCLUDED.step_type,
    options = EXCLUDED.options,
    order_index = EXCLUDED.order_index,
    updated_at = now();

INSERT INTO public.exercise_steps (title, instructions, step_type, options, order_index, module_content_id)
SELECT 
  'Werte priorisieren', 
  'Ausgezeichnet! Sie haben Ihre wichtigsten Werte identifiziert. Nun geht es darum, diese in eine Hierarchie zu bringen.

Wählen Sie aus Ihren ausgewählten Werten die 5 wichtigsten aus. Diese repräsentieren Ihre Kernwerte - jene fundamentalen Prinzipien, die Sie in Ihrem Leben am stärksten leiten und motivieren.',
  'selection',
  jsonb_build_object(
    'selection_type', 'ranking',
    'selections_count', 5,
    'options_source', 'previous_step',
    'instructions', 'Ziehen Sie die Werte in die Reihenfolge ihrer Wichtigkeit für Sie, beginnend mit dem wichtigsten.',
    'next_button_text', 'Weiter'
  ),
  3,
  id
FROM public.module_contents
WHERE module_id = 'a-values-hierarchy'
ON CONFLICT (id) DO UPDATE
SET title = EXCLUDED.title,
    instructions = EXCLUDED.instructions,
    step_type = EXCLUDED.step_type,
    options = EXCLUDED.options,
    order_index = EXCLUDED.order_index,
    updated_at = now();

INSERT INTO public.exercise_steps (title, instructions, step_type, options, order_index, module_content_id)
SELECT 
  'Werte definieren', 
  'Nun werden Sie Ihre Top-5-Werte persönlich definieren. Jeder Mensch versteht unter dem gleichen Wort etwas anderes. 

Für diese Übung ist es wichtig, dass Sie Ihre eigene Definition für jeden Ihrer Kernwerte formulieren. Was bedeutet dieser Wert speziell für Sie? Wie drückt er sich in Ihrem Leben aus?

Nehmen Sie sich Zeit, um über jeden Wert nachzudenken und ihn in Ihren eigenen Worten zu beschreiben.',
  'reflection',
  jsonb_build_object(
    'reflection_prompt', 'Beschreiben Sie für jeden Ihrer Top-5-Werte, was dieser Wert für Sie persönlich bedeutet:',
    'min_length', 100,
    'next_button_text', 'Weiter'
  ),
  4,
  id
FROM public.module_contents
WHERE module_id = 'a-values-hierarchy'
ON CONFLICT (id) DO UPDATE
SET title = EXCLUDED.title,
    instructions = EXCLUDED.instructions,
    step_type = EXCLUDED.step_type,
    options = EXCLUDED.options,
    order_index = EXCLUDED.order_index,
    updated_at = now();

INSERT INTO public.exercise_steps (title, instructions, step_type, options, order_index, module_content_id)
SELECT 
  'Wertekonflikte untersuchen', 
  'Wertekonflikte treten auf, wenn zwei oder mehr unserer Werte in einer bestimmten Situation nicht gleichzeitig erfüllt werden können.

Denken Sie über potenzielle Konflikte zwischen Ihren Top-5-Werten nach. Zum Beispiel könnte ein Wert wie "Abenteuer" manchmal mit "Sicherheit" in Konflikt geraten, oder "Familie" mit "Karriere".

Für jeden möglichen Konflikt, überlegen Sie:
1. In welchen Situationen könnten diese Werte in Konflikt geraten?
2. Welcher Wert hat in solchen Situationen Vorrang?
3. Gibt es Möglichkeiten, beide Werte zu integrieren oder einen Kompromiss zu finden?',
  'reflection',
  jsonb_build_object(
    'reflection_prompt', 'Beschreiben Sie potenzielle Konflikte zwischen Ihren Werten und wie Sie damit umgehen würden:',
    'min_length', 100,
    'next_button_text', 'Weiter'
  ),
  5,
  id
FROM public.module_contents
WHERE module_id = 'a-values-hierarchy'
ON CONFLICT (id) DO UPDATE
SET title = EXCLUDED.title,
    instructions = EXCLUDED.instructions,
    step_type = EXCLUDED.step_type,
    options = EXCLUDED.options,
    order_index = EXCLUDED.order_index,
    updated_at = now();

INSERT INTO public.exercise_steps (title, instructions, step_type, options, order_index, module_content_id)
SELECT 
  'Werte im Alltag leben', 
  'Der letzte Schritt besteht darin, konkrete Wege zu finden, wie Sie Ihre Kernwerte bewusster in Ihrem Alltag leben können.

Für jeden Ihrer Top-5-Werte, definieren Sie:
1. Eine konkrete Handlung, die Sie in der kommenden Woche umsetzen können, um diesen Wert stärker zu leben
2. Eine langfristige Veränderung, die Sie vornehmen könnten, um Ihr Leben mehr mit diesem Wert in Einklang zu bringen
3. Wie Sie andere Menschen in Ihrem Leben in Bezug auf diesen Wert einbeziehen können',
  'reflection',
  jsonb_build_object(
    'reflection_prompt', 'Beschreiben Sie, wie Sie Ihre Werte konkret in Ihrem Alltag umsetzen werden:',
    'min_length', 100,
    'next_button_text', 'Weiter'
  ),
  6,
  id
FROM public.module_contents
WHERE module_id = 'a-values-hierarchy'
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
  'Herzlichen Glückwunsch! Sie haben Ihre persönliche Werte-Hierarchie entwickelt. Dies ist ein wesentlicher Schritt zur Schaffung von mehr Ausrichtung und Kongruenz in Ihrem Leben.

Nehmen Sie sich einen Moment Zeit, um über die Erkenntnisse dieser Übung zu reflektieren:

- Was hat Sie überrascht an Ihren Top-5-Werten?
- Inwiefern leben Sie diese Werte bereits in Ihrem Alltag?
- Wo gibt es noch Diskrepanzen zwischen Ihren Werten und Ihrem aktuellen Leben?
- Wie wird sich Ihr Leben verändern, wenn Sie Ihre Entscheidungen stärker an Ihren Kernwerten ausrichten?

Ihre Werte-Hierarchie ist kein statisches Konstrukt, sondern kann sich im Laufe Ihres Lebens entwickeln. Es ist hilfreich, diesen Prozess regelmäßig zu wiederholen und Ihre Werte-Hierarchie anzupassen, wenn sich Ihre Lebenssituation oder Ihre Prioritäten ändern.',
  'reflection',
  jsonb_build_object(
    'reflection_prompt', 'Teilen Sie Ihre abschließenden Gedanken zu dieser Übung:',
    'min_length', 50,
    'next_button_text', 'Abschließen'
  ),
  7,
  id
FROM public.module_contents
WHERE module_id = 'a-values-hierarchy'
ON CONFLICT (id) DO UPDATE
SET title = EXCLUDED.title,
    instructions = EXCLUDED.instructions,
    step_type = EXCLUDED.step_type,
    options = EXCLUDED.options,
    order_index = EXCLUDED.order_index,
    updated_at = now();

-- A-Module: Vision Board Modul 
INSERT INTO public.module_contents (module_id, content_type, title, description, content, order_index)
VALUES (
  'a-vision-board',
  'exercise',
  'Digitales Vision Board',
  'Erstellen Sie eine visuelle Repräsentation Ihrer Lebensvision',
  jsonb_build_object(
    'description', 'In dieser Übung erstellen Sie ein digitales Vision Board, das Ihre persönliche Lebensvision visuell darstellt.',
    'duration', 30,
    'materials_needed', jsonb_build_array('Ihr Smartphone oder Tablet', 'Ruhige, kreative Umgebung')
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

-- Übungsschritte für Vision Board
INSERT INTO public.exercise_steps (title, instructions, step_type, options, order_index, module_content_id)
SELECT 
  'Einführung zum Vision Board', 
  'Ein Vision Board ist eine kraftvolle visuelle Darstellung Ihrer Ziele, Träume und Wünsche. Anders als To-Do-Listen oder Zielplanungen spricht ein Vision Board Ihr Unterbewusstsein auf einer tieferen, emotionalen Ebene an.

Die Kraft eines Vision Boards liegt in der Verbindung von visueller Darstellung, emotionaler Resonanz und regelmäßiger Erinnerung. Es programmiert Ihr Gehirn darauf, Möglichkeiten zu erkennen und Handlungen zu initiieren, die Sie Ihrer Vision näher bringen.

In dieser Übung erstellen Sie ein digitales Vision Board, das Sie jederzeit auf Ihrem Mobilgerät bei sich tragen können.',
  'introduction',
  jsonb_build_object(
    'next_button_text', 'Beginnen'
  ),
  1,
  id
FROM public.module_contents
WHERE module_id = 'a-vision-board'
ON CONFLICT (id) DO UPDATE
SET title = EXCLUDED.title,
    instructions = EXCLUDED.instructions,
    step_type = EXCLUDED.step_type,
    options = EXCLUDED.options,
    order_index = EXCLUDED.order_index,
    updated_at = now();

INSERT INTO public.exercise_steps (title, instructions, step_type, options, order_index, module_content_id)
SELECT 
  'Lebensbereiche definieren', 
  'Bevor Sie mit der visuellen Gestaltung beginnen, definieren Sie die wichtigsten Lebensbereiche, die Sie in Ihrem Vision Board darstellen möchten.

Basierend auf Ihrem Lebensrad und Ihren Kernwerten, wählen Sie 4-8 Lebensbereiche aus, für die Sie eine Vision entwickeln möchten. Beispiele könnten sein:

- Karriere/Berufung
- Beziehungen/Familie
- Gesundheit/Wohlbefinden
- Persönliches Wachstum
- Finanzen/Wohlstand
- Spiritualität/Sinn
- Wohnumfeld/Lebensraum
- Freizeit/Hobbies

Wählen Sie die Bereiche, die für Sie persönlich am wichtigsten sind:',
  'selection',
  jsonb_build_object(
    'selection_type', 'multiple',
    'min_selections', 4,
    'max_selections', 8,
    'options', jsonb_build_array(
      'Karriere/Berufung', 'Beziehungen/Familie', 'Gesundheit/Wohlbefinden', 
      'Persönliches Wachstum', 'Finanzen/Wohlstand', 'Spiritualität/Sinn', 
      'Wohnumfeld/Lebensraum', 'Freizeit/Hobbies', 'Gemeinschaft/Soziales', 
      'Kreativität/Selbstausdruck'
    ),
    'custom_option', true,
    'next_button_text', 'Weiter'
  ),
  2,
  id
FROM public.module_contents
WHERE module_id = 'a-vision-board'
ON CONFLICT (id) DO UPDATE
SET title = EXCLUDED.title,
    instructions = EXCLUDED.instructions,
    step_type = EXCLUDED.step_type,
    options = EXCLUDED.options,
    order_index = EXCLUDED.order_index,
    updated_at = now();

INSERT INTO public.exercise_steps (title, instructions, step_type, options, order_index, module_content_id)
SELECT 
  'Vision für jeden Bereich', 
  'Für jeden ausgewählten Lebensbereich werden Sie nun Ihre Vision formulieren. 

Eine kraftvolle Vision ist:
- In der Gegenwart formuliert (als ob sie bereits wahr ist)
- Positiv formuliert (was Sie wollen, nicht was Sie nicht wollen)
- Emotional ansprechend (sie berührt Sie und erzeugt positive Gefühle)
- Spezifisch genug, um klar zu sein, aber offen genug für kreative Entwicklung

Für jeden Bereich, beantworten Sie:
1. Wie sieht dieser Lebensbereich in Ihrer idealen Zukunft aus?
2. Wie fühlt es sich an?
3. Welche Schlüsselelemente sind enthalten?
4. Welches Bild oder Symbol repräsentiert diese Vision am besten?',
  'reflection',
  jsonb_build_object(
    'reflection_prompt', 'Beschreiben Sie Ihre Vision für jeden Lebensbereich:',
    'min_length', 150,
    'next_button_text', 'Weiter'
  ),
  3,
  id
FROM public.module_contents
WHERE module_id = 'a-vision-board'
ON CONFLICT (id) DO UPDATE
SET title = EXCLUDED.title,
    instructions = EXCLUDED.instructions,
    step_type = EXCLUDED.step_type,
    options = EXCLUDED.options,
    order_index = EXCLUDED.order_index,
    updated_at = now();

INSERT INTO public.exercise_steps (title, instructions, step_type, options, order_index, module_content_id)
SELECT 
  'Vision Board erstellen', 
  'Jetzt ist es Zeit, Ihr digitales Vision Board zu erstellen! 

Sie können für jeden Lebensbereich ein Symbol, ein Bild oder ein Icon auswählen und diesem eine kurze Beschreibung oder ein Motto hinzufügen.

Wählen Sie Bilder und Symbole, die eine starke emotionale Resonanz für Sie haben. Es geht nicht darum, was für andere sinnvoll erscheint, sondern was in Ihnen ein tiefes Gefühl der Begeisterung, des Verlangens oder der Inspiration auslöst.',
  'vision_board_editor',
  jsonb_build_object(
    'background_options', jsonb_build_array(
      'gradient_blue', 'gradient_purple', 'mountains', 'ocean', 'forest', 
      'sunrise', 'stars', 'abstract', 'minimal', 'custom'
    ),
    'layout_options', jsonb_build_array(
      'grid', 'freeform', 'circle', 'spiral', 'flow'
    ),
    'export_options', jsonb_build_array(
      'app_only', 'image', 'wallpaper'
    ),
    'next_button_text', 'Weiter'
  ),
  4,
  id
FROM public.module_contents
WHERE module_id = 'a-vision-board'
ON CONFLICT (id) DO UPDATE
SET title = EXCLUDED.title,
    instructions = EXCLUDED.instructions,
    step_type = EXCLUDED.step_type,
    options = EXCLUDED.options,
    order_index = EXCLUDED.order_index,
    updated_at = now();

INSERT INTO public.exercise_steps (title, instructions, step_type, options, order_index, module_content_id)
SELECT 
  'Integration in den Alltag', 
  'Ihr Vision Board ist nur so wirksam, wie Sie es in Ihren Alltag integrieren. Hier sind einige Möglichkeiten, wie Sie Ihr digitales Vision Board regelmäßig nutzen können:

1. **Tägliche Betrachtung**: Nehmen Sie sich 1-2 Minuten am Morgen oder Abend Zeit, um Ihr Vision Board zu betrachten und die Gefühle zu spüren, die es in Ihnen auslöst.

2. **Hintergrundbild**: Setzen Sie Ihr Vision Board als Hintergrundbild auf Ihrem Smartphone oder Tablet.

3. **Regelmäßige Reflexion**: Planen Sie einmal pro Woche oder Monat Zeit ein, um über Ihr Vision Board nachzudenken und zu reflektieren, wie Ihre aktuellen Handlungen mit Ihrer Vision übereinstimmen.

4. **Kontinuierliche Weiterentwicklung**: Ihr Vision Board ist ein lebendiges Dokument. Aktualisieren Sie es, wenn sich Ihre Vision weiterentwickelt oder verändert.

Planen Sie jetzt, wie Sie Ihr Vision Board in Ihren Alltag integrieren werden:',
  'reflection',
  jsonb_build_object(
    'reflection_prompt', 'Beschreiben Sie, wie Sie Ihr Vision Board in Ihren Alltag integrieren werden:',
    'min_length', 50,
    'next_button_text', 'Weiter'
  ),
  5,
  id
FROM public.module_contents
WHERE module_id = 'a-vision-board'
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
  'Herzlichen Glückwunsch zum Erstellen Ihres persönlichen Vision Boards! Sie haben einen wichtigen Schritt zur Ausrichtung Ihres Lebens unternommen.

Nehmen Sie sich einen Moment Zeit, um über den Prozess und Ihre Erkenntnisse zu reflektieren:

- Welche Emotionen hat das Erstellen des Vision Boards in Ihnen ausgelöst?
- Gab es überraschende Einsichten während des Prozesses?
- Welcher Teil Ihres Vision Boards resoniert am stärksten mit Ihnen?
- Wie fühlt es sich an, eine visuelle Repräsentation Ihrer Lebensvision zu haben?

Denken Sie daran: Ein Vision Board ist kein magisches Werkzeug, das Ihre Träume automatisch wahr werden lässt, sondern ein Kompass, der Ihre Wahrnehmung, Entscheidungen und Handlungen subtil in Richtung Ihrer Vision lenkt.',
  'reflection',
  jsonb_build_object(
    'reflection_prompt', 'Teilen Sie Ihre abschließenden Gedanken zu dieser Übung:',
    'min_length', 50,
    'next_button_text', 'Abschließen'
  ),
  6,
  id
FROM public.module_contents
WHERE module_id = 'a-vision-board'
ON CONFLICT (id) DO UPDATE
SET title = EXCLUDED.title,
    instructions = EXCLUDED.instructions,
    step_type = EXCLUDED.step_type,
    options = EXCLUDED.options,
    order_index = EXCLUDED.order_index,
    updated_at = now();

-- A-Module: Entscheidungskompass Modul
INSERT INTO public.module_contents (module_id, content_type, title, description, content, order_index)
VALUES (
  'a-decision-compass',
  'exercise',
  'Entscheidungskompass',
  'Lernen Sie, kongruente Entscheidungen zu treffen',
  jsonb_build_object(
    'description', 'Diese Übung vermittelt eine strukturierte Methode, um Entscheidungen im Einklang mit Ihren Werten und Ihrer Vision zu treffen.',
    'duration', 20,
    'materials_needed', jsonb_build_array('Eine aktuelle Entscheidungssituation', 'Ihre Werte-Hierarchie')
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

-- Übungsschritte für Entscheidungskompass
INSERT INTO public.exercise_steps (title, instructions, step_type, options, order_index, module_content_id)
SELECT 
  'Einführung zum Entscheidungskompass', 
  'Der Entscheidungskompass ist ein strukturierter Ansatz, um Entscheidungen im Einklang mit Ihren Werten und Ihrer Vision zu treffen. Er integriert rationale Analyse mit intuitiver Weisheit und schafft so kongruente Entscheidungen.

Viele Menschen treffen Entscheidungen entweder rein rational (was oft emotionale Aspekte ignoriert) oder rein emotional (was manchmal langfristige Konsequenzen übersieht). Der Entscheidungskompass verbindet beide Ansätze.

In dieser Übung lernen Sie, wie Sie diesen Kompass für Ihre eigenen Entscheidungen nutzen können - von alltäglichen Wahlmöglichkeiten bis hin zu lebensverändernden Entscheidungen.',
  'introduction',
  jsonb_build_object(
    'next_button_text', 'Beginnen'
  ),
  1,
  id
FROM public.module_contents
WHERE module_id = 'a-decision-compass'
ON CONFLICT (id) DO UPDATE
SET title = EXCLUDED.title,
    instructions = EXCLUDED.instructions,
    step_type = EXCLUDED.step_type,
    options = EXCLUDED.options,
    order_index = EXCLUDED.order_index,
    updated_at = now();

INSERT INTO public.exercise_steps (title, instructions, step_type, options, order_index, module_content_id)
SELECT 
  'Entscheidungssituation definieren', 
  'Denken Sie an eine aktuelle Entscheidung, die Sie treffen müssen oder möchten. Dies kann eine kleine Alltagsentscheidung oder eine größere Lebensentscheidung sein.

Beschreiben Sie die Entscheidungssituation so klar wie möglich:
- Um welche Entscheidung geht es genau?
- Welche Optionen stehen zur Auswahl?
- Bis wann muss die Entscheidung getroffen werden?
- Wer ist von dieser Entscheidung betroffen?

Versuchen Sie, die Situation ohne Verzerrung oder voreilige Schlussfolgerungen zu beschreiben. Fokussieren Sie sich zunächst nur auf die Fakten der Situation.',
  'reflection',
  jsonb_build_object(
    'reflection_prompt', 'Beschreiben Sie Ihre aktuelle Entscheidungssituation:',
    'min_length', 50,
    'next_button_text', 'Weiter'
  ),
  2,
  id
FROM public.module_contents
WHERE module_id = 'a-decision-compass'
ON CONFLICT (id) DO UPDATE
SET title = EXCLUDED.title,
    instructions = EXCLUDED.instructions,
    step_type = EXCLUDED.step_type,
    options = EXCLUDED.options,
    order_index = EXCLUDED.order_index,
    updated_at = now();

INSERT INTO public.exercise_steps (title, instructions, step_type, options, order_index, module_content_id)
SELECT 
  'Werte-Prüfung', 
  'Jetzt werden Sie Ihre Entscheidungsoptionen anhand Ihrer Kernwerte überprüfen. 

Rufen Sie sich Ihre Top-5-Werte in Erinnerung (die Sie in der Werte-Hierarchie-Übung definiert haben). Für jede Option in Ihrer Entscheidungssituation, bewerten Sie:

1. Inwiefern unterstützt oder verletzt diese Option jeden Ihrer Kernwerte?
2. Gibt es Wertekonflikte zwischen verschiedenen Optionen?
3. Welche Option ist am besten mit Ihrer gesamten Wertehierarchie vereinbar?

Denken Sie daran: Es geht nicht nur darum, einzelne Werte zu erfüllen, sondern um die Gesamtausrichtung mit Ihrer Wertehierarchie.',
  'reflection',
  jsonb_build_object(
    'reflection_prompt', 'Analysieren Sie Ihre Entscheidungsoptionen im Hinblick auf Ihre Kernwerte:',
    'min_length', 100,
    'next_button_text', 'Weiter'
  ),
  3,
  id
FROM public.module_contents
WHERE module_id = 'a-decision-compass'
ON CONFLICT (id) DO UPDATE
SET title = EXCLUDED.title,
    instructions = EXCLUDED.instructions,
    step_type = EXCLUDED.step_type,
    options = EXCLUDED.options,
    order_index = EXCLUDED.order_index,
    updated_at = now();

INSERT INTO public.exercise_steps (title, instructions, step_type, options, order_index, module_content_id)
SELECT 
  'Visions-Prüfung', 
  'Nun werden Sie Ihre Entscheidungsoptionen im Kontext Ihrer größeren Lebensvision betrachten.

Denken Sie an Ihr Vision Board und Ihre langfristigen Ziele. Für jede Option in Ihrer Entscheidungssituation, reflektieren Sie:

1. Inwiefern bringt Sie diese Option Ihrer Vision näher oder entfernt Sie davon?
2. Wie passt diese Option in das Gesamtbild Ihres gewünschten Lebens?
3. Würde Ihr zukünftiges Selbst diese Entscheidung gutheißen?

Es geht darum, die kurzfristigen Konsequenzen einer Entscheidung mit Ihren langfristigen Aspirationen in Einklang zu bringen.',
  'reflection',
  jsonb_build_object(
    'reflection_prompt', 'Analysieren Sie Ihre Entscheidungsoptionen im Hinblick auf Ihre Lebensvision:',
    'min_length', 100,
    'next_button_text', 'Weiter'
  ),
  4,
  id
FROM public.module_contents
WHERE module_id = 'a-decision-compass'
ON CONFLICT (id) DO UPDATE
SET title = EXCLUDED.title,
    instructions = EXCLUDED.instructions,
    step_type = EXCLUDED.step_type,
    options = EXCLUDED.options,
    order_index = EXCLUDED.order_index,
    updated_at = now();

INSERT INTO public.exercise_steps (title, instructions, step_type, options, order_index, module_content_id)
SELECT 
  'Körperweisheit einbeziehen', 
  'Unser Körper verfügt über eine eigene Form von Intelligenz, die oft unbewusste Muster und Informationen integriert, die unserem bewussten Denken nicht zugänglich sind.

Für jede Ihrer Entscheidungsoptionen, führen Sie folgende Übung durch:

1. Schließen Sie die Augen und atmen Sie einige Male tief durch
2. Stellen Sie sich vor, Sie hätten sich bereits für Option A entschieden
3. Beobachten Sie aufmerksam, wie sich Ihr Körper dabei anfühlt:
   - Gibt es Anspannung oder Entspannung?
   - Fühlt sich Ihr Atem frei oder eingeschränkt an?
   - Spüren Sie Weite oder Enge in Ihrer Brust?
   - Gibt es ein Gefühl von Leichtigkeit oder Schwere?
4. Wiederholen Sie den Prozess für jede Option

Diese körperlichen Reaktionen können wertvolle Hinweise auf Ihre tiefere Weisheit geben.',
  'reflection',
  jsonb_build_object(
    'reflection_prompt', 'Beschreiben Sie Ihre körperlichen Reaktionen auf die verschiedenen Optionen:',
    'min_length', 100,
    'next_button_text', 'Weiter'
  ),
  5,
  id
FROM public.module_contents
WHERE module_id = 'a-decision-compass'
ON CONFLICT (id) DO UPDATE
SET title = EXCLUDED.title,
    instructions = EXCLUDED.instructions,
    step_type = EXCLUDED.step_type,
    options = EXCLUDED.options,
    order_index = EXCLUDED.order_index,
    updated_at = now();

INSERT INTO public.exercise_steps (title, instructions, step_type, options, order_index, module_content_id)
SELECT 
  'Integration und Entscheidung', 
  'Nun ist es Zeit, alle Aspekte zu integrieren und zu einer kongruenten Entscheidung zu kommen.

Betrachten Sie:
- Was haben Sie aus der Werte-Prüfung gelernt?
- Was hat die Visions-Prüfung ergeben?
- Was hat Ihre Körperweisheit Ihnen mitgeteilt?

Manchmal stimmen alle drei Perspektiven überein, was die Entscheidung klar macht. Oft gibt es jedoch scheinbare Widersprüche, die eine tiefere Integration erfordern.

Basierend auf allen drei Perspektiven, welche Entscheidung erscheint Ihnen am kongruentesten - also am besten mit Ihren Werten, Ihrer Vision und Ihrer tieferen Weisheit übereinstimmend?',
  'reflection',
  jsonb_build_object(
    'reflection_prompt', 'Beschreiben Sie Ihre integrierte Entscheidung und die Gründe dafür:',
    'min_length', 100,
    'next_button_text', 'Weiter'
  ),
  6,
  id
FROM public.module_contents
WHERE module_id = 'a-decision-compass'
ON CONFLICT (id) DO UPDATE
SET title = EXCLUDED.title,
    instructions = EXCLUDED.instructions,
    step_type = EXCLUDED.step_type,
    options = EXCLUDED.options,
    order_index = EXCLUDED.order_index,
    updated_at = now();

INSERT INTO public.exercise_steps (title, instructions, step_type, options, order_index, module_content_id)
SELECT 
  'Umsetzungsplanung', 
  'Eine Entscheidung ist nur so gut wie ihre Umsetzung. Planen Sie nun die konkreten nächsten Schritte, um Ihre Entscheidung in die Tat umzusetzen.

Definieren Sie:
1. Welche konkreten Maßnahmen werden Sie ergreifen?
2. Bis wann werden Sie diese Maßnahmen umsetzen?
3. Welche möglichen Hindernisse könnten auftreten und wie werden Sie damit umgehen?
4. Wer kann Sie bei der Umsetzung unterstützen?
5. Wie werden Sie den Fortschritt überprüfen?

Je spezifischer Ihr Plan ist, desto wahrscheinlicher ist es, dass Sie Ihre Entscheidung erfolgreich umsetzen werden.',
  'reflection',
  jsonb_build_object(
    'reflection_prompt', 'Beschreiben Sie Ihren Umsetzungsplan:',
    'min_length', 100,
    'next_button_text', 'Weiter'
  ),
  7,
  id
FROM public.module_contents
WHERE module_id = 'a-decision-compass'
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
  'Herzlichen Glückwunsch! Sie haben den Entscheidungskompass erfolgreich angewendet und eine kongruente Entscheidung getroffen.

Nehmen Sie sich einen Moment Zeit, um über den Prozess zu reflektieren:

- Was hat Sie überrascht am Entscheidungskompass-Prozess?
- Welcher Aspekt (Werte, Vision, Körperweisheit) war am einflussreichsten für Ihre Entscheidung?
- Wie fühlt sich diese Entscheidung im Vergleich zu früheren Entscheidungen an?
- Wie werden Sie den Entscheidungskompass in Zukunft nutzen?

Der Entscheidungskompass ist ein Werkzeug, das mit der Übung immer intuitiver wird. Mit der Zeit werden Sie in der Lage sein, diesen Prozess schneller und müheloser durchzuführen, was zu einem Leben führt, das durchgängig mit Ihren tiefsten Werten und Ihrer Vision übereinstimmt.',
  'reflection',
  jsonb_build_object(
    'reflection_prompt', 'Teilen Sie Ihre abschließenden Gedanken zu dieser Übung:',
    'min_length', 50,
    'next_button_text', 'Abschließen'
  ),
  8,
  id
FROM public.module_contents
WHERE module_id = 'a-decision-compass'
ON CONFLICT (id) DO UPDATE
SET title = EXCLUDED.title,
    instructions = EXCLUDED.instructions,
    step_type = EXCLUDED.step_type,
    options = EXCLUDED.options,
    order_index = EXCLUDED.order_index,
    updated_at = now();

-- Unterstützende Fragen für den A-Schritt einfügen
INSERT INTO klare_content.supporting_questions (step_id, question_text, sort_order)
VALUES
  ('A', 'Wie kann ich meine verschiedenen Lebensbereiche besser integrieren und in Einklang bringen?', 9),
  ('A', 'Welche meiner Werte sind am wichtigsten für mich, und wie kann ich sie in eine klare Hierarchie bringen?', 10),
  ('A', 'Wie kann ich eine Vision entwickeln, die alle Aspekte meines Lebens kohärent verbindet?', 11),
  ('A', 'Wie erkenne ich, ob eine Entscheidung wirklich mit meinen tiefsten Werten übereinstimmt?', 12),
  ('A', 'Wie kann ich meine Ausrichtung beibehalten, wenn sich meine Lebensumstände ändern?', 13)
ON CONFLICT DO NOTHING;

-- Transformation Paths für den A-Schritt einfügen
INSERT INTO klare_content.transformation_paths (step_id, from_text, to_text, sort_order) 
VALUES
  ('A', 'Fragmentiertes Leben mit widersprüchlichen Zielen', 'Integriertes Leben mit kohärenter Ausrichtung', 9),
  ('A', 'Unklare Werte und ständige Wertekonflikte', 'Klare Werte-Hierarchie als innerer Kompass', 10), 
  ('A', 'Entscheidungen basierend auf externen Erwartungen', 'Entscheidungen im Einklang mit inneren Werten', 11),
  ('A', 'Vage oder widersprüchliche Lebensvision', 'Klare, inspirierende und kohärente Lebensvision', 12),
  ('A', 'Leben in vielen unverbundenen "Abteilungen"', 'Ganzheitliches Leben mit synergetischen Lebensbereichen', 13)
ON CONFLICT DO NOTHING;

-- Praktische Übungen für den A-Schritt einfügen
INSERT INTO klare_content.practical_exercises (step_id, title, description, duration_minutes, sort_order)
VALUES
  ('A', 'Werte-Karten Sortierung', 'Sortieren Sie Werte-Karten nach ihrer Wichtigkeit für Sie, um Ihre Werte-Hierarchie zu klären.', 10, 9),
  ('A', 'Lebensbereiche-Integration', 'Identifizieren Sie Konflikte zwischen Lebensbereichen und entwickeln Sie Strategien, um sie zu integrieren.', 15, 10),
  ('A', 'Zukunfts-Selbst Perspektive', 'Führen Sie einen Dialog mit Ihrem zukünftigen Selbst, um Ihre Lebensvision zu klären.', 20, 11),
  ('A', 'Wertegeleitete Entscheidungsmatrix', 'Erstellen Sie eine Matrix, um Entscheidungen anhand Ihrer Werte zu bewerten.', 15, 12),
  ('A', 'Ressourcen-Umverteilung', 'Überprüfen Sie, wie Sie Ihre Zeit, Energie und Ressourcen entsprechend Ihrer Werte neu verteilen können.', 10, 13)
ON CONFLICT DO NOTHING;

-- Erstellen der neuen Tabelle für Vision Board Items
CREATE TABLE IF NOT EXISTS vision_board_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  life_area TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  position_x INTEGER,
  position_y INTEGER,
  width INTEGER,
  height INTEGER,
  scale FLOAT DEFAULT 1.0,
  rotation INTEGER DEFAULT 0,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sicherheitsrichtlinien für vision_board_items-Tabelle
ALTER TABLE vision_board_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own vision board items" 
ON vision_board_items FOR SELECT TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own vision board items" 
ON vision_board_items FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vision board items" 
ON vision_board_items FOR UPDATE TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vision board items" 
ON vision_board_items FOR DELETE TO authenticated 
USING (auth.uid() = user_id);

-- Erstellen einer Tabelle für komplette Vision Boards
CREATE TABLE IF NOT EXISTS vision_boards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  background_type TEXT NOT NULL,
  background_value TEXT,
  layout_type TEXT NOT NULL DEFAULT 'grid',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sicherheitsrichtlinien für vision_boards-Tabelle
ALTER TABLE vision_boards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own vision boards" 
ON vision_boards FOR SELECT TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own vision boards" 
ON vision_boards FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vision boards" 
ON vision_boards FOR UPDATE TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vision boards" 
ON vision_boards FOR DELETE TO authenticated 
USING (auth.uid() = user_id);

-- Erstellen einer Tabelle für persönliche Werte
CREATE TABLE IF NOT EXISTS personal_values (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  value_name TEXT NOT NULL,
  description TEXT,
  rank INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sicherheitsrichtlinien für personal_values-Tabelle
ALTER TABLE personal_values ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own personal values" 
ON personal_values FOR SELECT TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own personal values" 
ON personal_values FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own personal values" 
ON personal_values FOR UPDATE TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own personal values" 
ON personal_values FOR DELETE TO authenticated 
USING (auth.uid() = user_id);

-- Trigger für die Aktualisierung des updated_at Feldes
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_vision_board_items_modtime
BEFORE UPDATE ON vision_board_items
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_vision_boards_modtime
BEFORE UPDATE ON vision_boards
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_personal_values_modtime
BEFORE UPDATE ON personal_values
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

