-- SQL zur Ergänzung der K-Module für die KLARE-Methode-App

-- 1. Modul "Genius Gate - Kommunikation mit dem Unbewussten" hinzufügen
INSERT INTO module_contents (
  module_id,
  content_type,
  title,
  description,
  content,
  order_index
) VALUES (
  'k-genius-gate',
  'theory',
  'Genius Gate - Kommunikation mit dem Unbewussten',
  'Lerne Techniken, um durch präzise Fragen zu tiefer Selbsterkenntnis zu gelangen',
  '{
    "intro_text": "Das Genius Gate ist eine kraftvolle Methode, um durch gezielte Fragetechniken mit unbewussten Teilen unserer Persönlichkeit in Kontakt zu treten. In diesem Modul lernen Sie, wie Sie durch präzise Fragen verborgene Überzeugungen, Muster und Ressourcen in sich entdecken können.",
    "key_concepts": [
      "Die Macht präziser Fragen",
      "Universale Modellierungsprozesse im Detail",
      "Meta-Modell-Fragetechniken",
      "Praktische Anwendung im Alltag"
    ],
    "duration_minutes": 15
  }',
  4
);

-- Abschnitte für das Genius Gate Modul hinzufügen
INSERT INTO content_sections (
  module_content_id,
  title,
  content,
  order_index
) VALUES 
(
  (SELECT id FROM module_contents WHERE module_id = 'k-genius-gate' LIMIT 1),
  'Die Grundlagen des Genius Gate',
  'Das Genius Gate basiert auf der Erkenntnis, dass ein Großteil unserer inneren Prozesse unbewusst abläuft. Wir nehmen die Welt über unsere Sinne wahr (VAKOG - visuell, auditiv, kinästhetisch, olfaktorisch, gustatorisch), doch unsere bewusste Wahrnehmung erfasst nur einen Bruchteil der verfügbaren Informationen.

Durch gezielte Fragetechniken können wir jedoch mit unserem Unbewussten in Kontakt treten und verborgene Informationen zugänglich machen. Dies hilft uns, blinde Flecken zu erkennen, einschränkende Glaubenssätze zu hinterfragen und zu echter Klarheit zu gelangen.

Die Grundfrage des Genius Gate lautet: "Was muss ich wissen, was ich noch nicht weiß?"',
  1
),
(
  (SELECT id FROM module_contents WHERE module_id = 'k-genius-gate' LIMIT 1),
  'Die Kernfragen des Genius Gate',
  'Die folgenden Fragen bilden das Herzstück des Genius Gate-Ansatzes:

1. **Woher weißt Du das?**
   Hinterfragt die Quellen unserer Überzeugungen

2. **Wie machst Du das?**
   Untersucht unsere inneren Strategien und Prozesse

3. **Wer, wie, was genau?**
   Fordert konkrete Details statt vager Aussagen

4. **Was würde geschehen, wenn...?**
   Erforscht mögliche Konsequenzen und Alternativen

5. **Was hindert Dich daran...?**
   Identifiziert innere Blockaden und Widerstände

6. **Verglichen womit?**
   Deckt versteckte Vergleiche und Maßstäbe auf

7. **Immer? Niemals? Alle? Keiner?**
   Hinterfragt absolute Aussagen und Verallgemeinerungen

8. **Wie weißt Du...?**
   Untersucht den Prozess, durch den wir zu einer Schlussfolgerung kommen

Diese Fragen helfen uns, die drei universalen Modellierungsprozesse (Verzerrung, Generalisierung, Tilgung) zu erkennen und zu überwinden.',
  2
),
(
  (SELECT id FROM module_contents WHERE module_id = 'k-genius-gate' LIMIT 1),
  'Die universalen Modellierungsprozesse im Detail',
  '**1. Verzerrung**

Bei der Verzerrung nehmen wir eine Umgestaltung sensorischer Einzelheiten vor. Wir interpretieren die Realität auf eine Weise, die nicht unbedingt der objektiven Wirklichkeit entspricht.

Beispiele für Verzerrungen:
- Ursache-Wirkung: "Deine Kritik macht mich wütend" (statt: "Ich reagiere mit Wut auf das, was ich als Kritik wahrnehme")
- Gedankenlesen: "Er findet mich inkompetent" (ohne direkte Bestätigung)
- Implizierter Kausativ: "Ich möchte mich verändern, aber mein Partner unterstützt mich nicht" (als ob die fehlende Unterstützung automatisch Veränderung verhindert)

**2. Generalisierung**

Durch Generalisierung nehmen wir eine Erfahrung als repräsentativ für eine ganze Kategorie. Dies hilft uns, schnell zu lernen, kann aber auch einschränkend wirken.

Beispiele für Generalisierungen:
- Universalquantoren: "Ich schaffe das nie" oder "Alle denken so"
- Modaloperatoren: "Ich muss immer perfekt sein" oder "Ich kann nicht nein sagen"

**3. Tilgung**

Bei der Tilgung blenden wir bestimmte Aspekte der Realität aus. Dies hilft uns, uns zu konzentrieren, kann aber zu einem unvollständigen Bild führen.

Beispiele für Tilgungen:
- Nominalisierungen: "Die Angst kontrolliert mich" (macht aus einem Prozess ein Ding)
- Unvollständig spezifizierte Verben: "Er hat mich verletzt" (wie genau?)
- Vergleichstilgungen: "Das ist zu teuer" (verglichen womit?)

Die Genius Gate-Fragen helfen uns, diese Prozesse zu erkennen und zu korrigieren, um ein klareres, präziseres Bild der Realität zu gewinnen.',
  3
),
(
  (SELECT id FROM module_contents WHERE module_id = 'k-genius-gate' LIMIT 1),
  'Anwendung im Alltag',
  'Das Genius Gate ist kein einmaliges Werkzeug, sondern eine tägliche Praxis. So können Sie es in Ihren Alltag integrieren:

1. **Innerer Dialog**: Wenden Sie die Genius Gate-Fragen auf Ihre eigenen Gedanken an. Wenn Sie sich dabei ertappen, wie Sie denken "Das schaffe ich nie", fragen Sie sich: "Wirklich nie? Ohne Ausnahme?"

2. **Journaling**: Notieren Sie Situationen, in denen Sie sich unwohl, gestresst oder blockiert fühlen. Wenden Sie dann die Genius Gate-Fragen auf Ihre Beschreibung an.

3. **Gespräche**: Achten Sie in Gesprächen auf Meta-Modell-Verletzungen - sowohl bei sich selbst als auch bei anderen. Überlegen Sie, welche Frage hier Klarheit schaffen könnte.

4. **Entscheidungsfindung**: Vor wichtigen Entscheidungen können Sie mit Genius Gate-Fragen unbewusste Annahmen und Befürchtungen aufdecken.

5. **Problemlösung**: Wenn Sie mit einem Problem feststecken, nutzen Sie die Fragen, um neue Perspektiven zu gewinnen.

Je mehr Sie diese Fragetechniken üben, desto natürlicher werden sie Ihnen erscheinen und desto klarer wird Ihr Denken werden.',
  4
);

-- Übungsmodul für das Genius Gate hinzufügen
INSERT INTO module_contents (
  module_id,
  content_type,
  title,
  description,
  content,
  order_index
) VALUES (
  'k-genius-gate-practice',
  'exercise',
  'Genius Gate in der Praxis',
  'Wende die Genius Gate-Fragetechniken auf konkrete Situationen an',
  '{
    "intro_text": "In dieser Übung werden Sie die Genius Gate-Fragetechniken auf konkrete Situationen aus Ihrem Leben anwenden. Sie werden lernen, wie Sie durch gezieltes Fragen mehr Klarheit gewinnen können.",
    "duration_minutes": 20
  }',
  5
);

-- Übungsschritte für das Genius Gate-Praxis-Modul hinzufügen
INSERT INTO exercise_steps (
  module_content_id,
  title,
  instructions,
  step_type,
  options,
  order_index
) VALUES 
(
  (SELECT id FROM module_contents WHERE module_id = 'k-genius-gate-practice' LIMIT 1),
  'Identifiziere einschränkende Gedanken',
  'Denken Sie an eine aktuelle Situation, in der Sie sich blockiert, unwohl oder unsicher fühlen. Notieren Sie Ihre Gedanken zu dieser Situation so ehrlich wie möglich.

Beispiele könnten sein:
- "Ich kann diese Aufgabe nicht bewältigen."
- "Alle erwarten, dass ich perfekt bin."
- "Diese Situation macht mich wütend."
- "Es ist zu schwierig, jetzt noch etwas zu ändern."

Notieren Sie nun Ihren einschränkenden Gedanken:',
  'journal',
  '{
    "placeholder": "Mein einschränkender Gedanke ist...",
    "min_length": 10
  }',
  1
),
(
  (SELECT id FROM module_contents WHERE module_id = 'k-genius-gate-practice' LIMIT 1),
  'Identifiziere den Modellierungsprozess',
  'Analysieren Sie Ihren notierten Gedanken. Welcher der drei universalen Modellierungsprozesse ist hier am stärksten wirksam?

- **Verzerrung**: Interpretieren Sie die Situation auf eine verzerrte Weise?
- **Generalisierung**: Verallgemeinern Sie eine einzelne Erfahrung?
- **Tilgung**: Lassen Sie wichtige Informationen weg?

Wählen Sie den dominanten Prozess:',
  'selection',
  '{
    "options": [
      "Verzerrung (z.B. \"Er macht mich wütend\", \"Sie ignoriert mich absichtlich\")",
      "Generalisierung (z.B. \"Ich kann das nie\", \"Immer passiert mir das\")",
      "Tilgung (z.B. \"Das ist zu schwer\", \"Sie ist besser\")"
    ],
    "allow_multiple": false
  }',
  2
),
(
  (SELECT id FROM module_contents WHERE module_id = 'k-genius-gate-practice' LIMIT 1),
  'Wähle eine passende Genius Gate-Frage',
  'Basierend auf dem identifizierten Modellierungsprozess, welche Genius Gate-Frage wäre am hilfreichsten, um mehr Klarheit zu gewinnen?

Wählen Sie eine Frage, die Sie an sich selbst stellen möchten:',
  'selection',
  '{
    "options": [
      "Woher weiß ich das?",
      "Wirklich immer/nie? Ohne Ausnahme?",
      "Was genau meine ich mit...?",
      "Verglichen womit?",
      "Wie genau bewirkt X, dass Y passiert?",
      "Was würde geschehen, wenn...?",
      "Was hindert mich daran...?"
    ],
    "allow_multiple": false
  }',
  3
),
(
  (SELECT id FROM module_contents WHERE module_id = 'k-genius-gate-practice' LIMIT 1),
  'Beantworte die Genius Gate-Frage',
  'Nehmen Sie sich nun Zeit, um die von Ihnen gewählte Frage ehrlich und gründlich zu beantworten. Erlauben Sie sich, tiefer zu graben als üblich.

Ihre Antwort könnte neue Einsichten, versteckte Annahmen oder alternative Perspektiven offenbaren.',
  'journal',
  '{
    "placeholder": "Meine Antwort auf diese Frage ist...",
    "min_length": 50
  }',
  4
),
(
  (SELECT id FROM module_contents WHERE module_id = 'k-genius-gate-practice' LIMIT 1),
  'Formuliere einen klareren Gedanken',
  'Basierend auf Ihren neuen Einsichten, formulieren Sie nun einen klareren, präziseren Gedanken zur gleichen Situation. Dieser sollte weniger Verzerrungen, Generalisierungen oder Tilgungen enthalten.

Beispiele:
- Statt "Ich kann diese Aufgabe nicht bewältigen" → "Ich fühle mich unsicher bei zwei spezifischen Aspekten dieser Aufgabe"
- Statt "Alle erwarten, dass ich perfekt bin" → "Ich vermute, dass mein Chef hohe Erwartungen an dieses Projekt hat"
- Statt "Diese Situation macht mich wütend" → "Ich reagiere mit Wut, wenn ich mich übergangen fühle"',
  'journal',
  '{
    "placeholder": "Mein klarerer Gedanke ist...",
    "min_length": 10
  }',
  5
),
(
  (SELECT id FROM module_contents WHERE module_id = 'k-genius-gate-practice' LIMIT 1),
  'Reflexion',
  'Reflektieren Sie über diesen Prozess:

1. Wie hat sich Ihr Verständnis der Situation durch die Genius Gate-Frage verändert?
2. Welche neuen Möglichkeiten sehen Sie jetzt, die vorher nicht sichtbar waren?
3. Was nehmen Sie sich vor, um diese Art des Hinterfragens in Ihren Alltag zu integrieren?',
  'journal',
  '{
    "placeholder": "Meine Reflexion zu diesem Prozess...",
    "min_length": 50
  }',
  6
);

-- 2. Modul "Inkongruenzen kartieren" hinzufügen
INSERT INTO module_contents (
  module_id,
  content_type,
  title,
  description,
  content,
  order_index
) VALUES (
  'k-incongruence-mapping',
  'exercise',
  'Inkongruenzen kartieren',
  'Identifiziere und visualisiere innere Konflikte und Widersprüche',
  '{
    "intro_text": "Inkongruenzen sind innere Widersprüche, die uns Energie kosten und uns daran hindern, unser volles Potenzial zu entfalten. In dieser Übung werden Sie lernen, Ihre persönlichen Inkongruenzen zu identifizieren und zu kartieren, um den Weg für mehr innere Harmonie zu ebnen.",
    "duration_minutes": 25,
    "key_concepts": [
      "Die vier Ebenen der Inkongruenz",
      "Innere Konflikte identifizieren",
      "Werte-Diskrepanzen aufdecken",
      "Lösungsansätze entwickeln"
    ]
  }',
  6
);

-- Übungsschritte für das Inkongruenz-Mapping hinzufügen
INSERT INTO exercise_steps (
  module_content_id,
  title,
  instructions,
  step_type,
  options,
  order_index
) VALUES 
(
  (SELECT id FROM module_contents WHERE module_id = 'k-incongruence-mapping' LIMIT 1),
  'Einführung in Inkongruenzen',
  'Inkongruenz bedeutet mangelnde Übereinstimmung oder Widersprüchlichkeit. In Bezug auf unsere persönliche Entwicklung können wir Inkongruenzen auf vier Ebenen erfahren:

1. **Ebene der Aussagen**: Was wir sagen vs. was wir tun
   Beispiel: "Gesundheit ist mir wichtig" während wir ungesund leben

2. **Ebene der Werte**: Konkurrierende Werte in uns
   Beispiel: Wunsch nach Sicherheit vs. Wunsch nach Abenteuern

3. **Ebene der Identität**: Wer wir glauben zu sein vs. wer wir sein wollen
   Beispiel: "Ich bin ein geduldiger Mensch" vs. ständige Ungeduld im Alltag

4. **Ebene der Wahrnehmung**: Wie wir uns selbst sehen vs. wie andere uns sehen
   Beispiel: Wir halten uns für hilfsbereit, andere erleben uns als kontrollierend

Inkongruenzen verursachen innere Konflikte, kosten Energie und verhindern authentisches Handeln. Sie zu erkennen ist der erste Schritt zur Kongruenz - einem Zustand der inneren Harmonie, in dem all unsere Teile im Einklang sind.',
  'reflection',
  '{}',
  1
),
(
  (SELECT id FROM module_contents WHERE module_id = 'k-incongruence-mapping' LIMIT 1),
  'Inkongruenzen auf der Aussage-Ebene',
  'Betrachten Sie Ihr Lebensrad und die Bereiche, die Sie als wichtig bewertet haben.

Identifizieren Sie nun 1-2 Bereiche, in denen es eine Diskrepanz gibt zwischen:
- Was Sie sagen, dass es Ihnen wichtig ist
- Wie viel Zeit, Energie oder Aufmerksamkeit Sie tatsächlich investieren

Beispiele:
- "Familie ist mir am wichtigsten" vs. 60+ Stunden Arbeitswoche
- "Gesundheit hat Priorität" vs. kaum Bewegung im Alltag
- "Persönliches Wachstum ist essenziell" vs. keine Zeit für Lernen

Beschreiben Sie Ihre identifizierten Inkongruenzen:',
  'journal',
  '{
    "placeholder": "Eine Inkongruenz zwischen meinen Aussagen und meinem Handeln ist...",
    "min_length": 30
  }',
  2
),
(
  (SELECT id FROM module_contents WHERE module_id = 'k-incongruence-mapping' LIMIT 1),
  'Inkongruenzen auf der Werte-Ebene',
  'Oft erleben wir innere Konflikte, weil verschiedene Werte in uns konkurrieren.

Überlegen Sie:
- Welche Ihrer Werte stehen manchmal im Konflikt?
- In welchen Situationen erleben Sie ein inneres Hin und Her?

Beispiele:
- Freiheit vs. Sicherheit
- Familie vs. Karriere
- Ehrlichkeit vs. Harmonie
- Selbstfürsorge vs. Fürsorge für andere

Beschreiben Sie einen Werte-Konflikt, den Sie in sich tragen:',
  'journal',
  '{
    "placeholder": "Ein Werte-Konflikt, den ich in mir trage, ist...",
    "min_length": 30
  }',
  3
),
(
  (SELECT id FROM module_contents WHERE module_id = 'k-incongruence-mapping' LIMIT 1),
  'Inkongruenzen auf der Identitäts-Ebene',
  'Manchmal gibt es eine Diskrepanz zwischen:
- Wer wir glauben zu sein (Selbstbild)
- Wie wir tatsächlich handeln
- Wer wir sein wollen (ideales Selbst)

Reflektieren Sie:
- Gibt es Eigenschaften, die Sie sich zuschreiben, die aber nicht zu Ihrem tatsächlichen Verhalten passen?
- Gibt es eine Kluft zwischen Ihrem aktuellen Selbst und Ihrem idealen Selbst?

Beispiele:
- "Ich bin ein geduldiger Mensch" vs. häufige Ungeduld im Alltag
- "Ich bin kreativ" vs. kaum kreative Aktivitäten
- "Ich bin jemand, der Risiken eingeht" vs. Vermeidung von Risiken

Beschreiben Sie eine Identitäts-Inkongruenz, die Sie erkennen:',
  'journal',
  '{
    "placeholder": "Eine Inkongruenz in meinem Selbstbild ist...",
    "min_length": 30
  }',
  4
),
(
  (SELECT id FROM module_contents WHERE module_id = 'k-incongruence-mapping' LIMIT 1),
  'Inkongruenzen auf der Wahrnehmungs-Ebene',
  'Diese Ebene betrifft die Unterschiede zwischen:
- Wie wir uns selbst sehen
- Wie andere uns wahrnehmen

Dies ist oft schwer zu erkennen, da wir blind für unsere blinden Flecken sind.

Überlegen Sie:
- Haben Sie schon Feedback erhalten, das nicht zu Ihrem Selbstbild passte?
- Gibt es Verhaltensweisen, bei denen andere überrascht waren, als Sie sagten, dass Sie sich damit unwohl fühlen oder unsicher sind?

Beispiele:
- Sie halten sich für zurückhaltend, andere sehen Sie als bestimmt
- Sie denken, Sie kommunizieren klar, andere finden Sie vage
- Sie sehen sich als hilfsbereit, andere erleben Sie als kontrollierend

Beschreiben Sie eine mögliche Wahrnehmungs-Inkongruenz:',
  'journal',
  '{
    "placeholder": "Eine mögliche Diskrepanz zwischen meiner Selbstwahrnehmung und der Wahrnehmung anderer könnte sein...",
    "min_length": 30
  }',
  5
),
(
  (SELECT id FROM module_contents WHERE module_id = 'k-incongruence-mapping' LIMIT 1),
  'Deine Inkongruenz-Karte',
  'Betrachten Sie nun alle Inkongruenzen, die Sie identifiziert haben:

1. Welche erscheint Ihnen am bedeutsamsten oder energieraubendsten?
2. Gibt es Verbindungen oder Muster zwischen den verschiedenen Inkongruenzen?
3. Welche würde, wenn aufgelöst, den größten positiven Einfluss auf Ihr Leben haben?

Wählen Sie eine Prioritäts-Inkongruenz aus und beschreiben Sie sie im Detail:',
  'journal',
  '{
    "placeholder": "Die wichtigste Inkongruenz, an der ich arbeiten möchte, ist...",
    "min_length": 50
  }',
  6
),
(
  (SELECT id FROM module_contents WHERE module_id = 'k-incongruence-mapping' LIMIT 1),
  'Lösungsansätze entwickeln',
  'Für Ihre Prioritäts-Inkongruenz werden wir nun erste Lösungsansätze entwickeln.

Überlegen Sie:
1. Was ist der erste kleine Schritt, den Sie unternehmen könnten, um diese Inkongruenz zu verringern?
2. Welche Ressourcen (Fähigkeiten, Unterstützung, Werkzeuge) könnten Ihnen dabei helfen?
3. Welche Hindernisse könnten auftreten und wie könnten Sie diese überwinden?

Notieren Sie Ihren Aktionsplan:',
  'journal',
  '{
    "placeholder": "Mein Aktionsplan zur Verringerung dieser Inkongruenz ist...",
    "min_length": 50
  }',
  7
);

-- 3. Modul "Metamodell-Übungen" hinzufügen
INSERT INTO module_contents (
  module_id,
  content_type,
  title,
  description,
  content,
  order_index
) VALUES (
  'k-metamodel-practice',
  'exercise',
  'Metamodell in der Praxis',
  'Präzise Sprache für mehr Klarheit im Alltag',
  '{
    "intro_text": "Das Meta-Modell der Sprache ist ein Werkzeug, um Ungenauigkeiten, Verzerrungen und Auslassungen in unserer Kommunikation zu erkennen und aufzulösen. In dieser Übung werden Sie lernen, wie Sie durch präzisere Sprache zu mehr Klarheit in Ihrem Denken und Handeln gelangen können.",
    "duration_minutes": 20,
    "key_concepts": [
      "Metamodell-Verletzungen erkennen",
      "Präzisionsfragen stellen",
      "Sprache als Spiegel des Denkens nutzen"
    ]
  }',
  7
);

-- Übungsschritte für die Metamodell-Übungen hinzufügen
INSERT INTO exercise_steps (
  module_content_id,
  title,
  instructions,
  step_type,
  options,
  order_index
) VALUES 
(
  (SELECT id FROM module_contents WHERE module_id = 'k-metamodel-practice' LIMIT 1),
  'Metamodell-Verletzungen erkennen',
  'Im Folgenden sehen Sie verschiedene Aussagen, die typische Metamodell-Verletzungen enthalten. Versuchen Sie, die Art der Verletzung zu identifizieren.

Wählen Sie für jede Aussage die passende Metamodell-Kategorie:',
  'selection',
  '{
    "options": [
      {"statement": "Niemand nimmt mich ernst.", "type": "Universalquantor (Generalisierung)"},
      {"statement": "Sie macht mich traurig.", "type": "Ursache-Wirkung (Verzerrung)"},
      {"statement": "Das ist zu schwierig.", "type": "Vergleichstilgung (Tilgung)"},
      {"statement": "Ich kann mich nicht ändern.", "type": "Modaloperator der Möglichkeit (Generalisierung)"},
      {"statement": "Die Entscheidung belastet mich.", "type": "Nominalisierung (Tilgung)"}
    ],
    "matching": true
  }',
  1
),
(
  (SELECT id FROM module_contents WHERE module_id = 'k-metamodel-practice' LIMIT 1),
  'Präzisionsfragen formulieren',
  'Für jede Art von Metamodell-Verletzung gibt es spezifische Fragen, die helfen, das getilgte, verzerrte oder generalisierte Material wiederherzustellen.

Hier sind die wichtigsten Fragetypen:

1. **Für Universalquantoren**: "Wirklich alle/immer/nie? Ohne Ausnahme?"
2. **Für Modaloperatoren**: "Was würde passieren, wenn du es tätest/nicht tätest?"
3. **Für Ursache-Wirkung**: "Wie genau bewirkt X, dass du Y fühlst?"
4. **Für Nominalisierungen**: "Wie genau (nominalisierter Prozess) du?"
5. **Für Vergleichstilgungen**: "Verglichen womit?"

Üben Sie nun, passende Präzisionsfragen zu formulieren:',
  'selection',
  '{
    "options": [
      {"statement": "Ich muss perfekt sein.", "question": "Was würde passieren, wenn du nicht perfekt wärst?"},
      {"statement": "Das wird nie funktionieren.", "question": "Wirklich nie? Unter keinen Umständen?"},
      {"statement": "Mein Chef frustriert mich.", "question": "Wie genau bewirkt das, was dein Chef tut, dass du frustriert bist?"},
      {"statement": "Die Angst lähmt mich.", "question": "Wie genau ängstigst du dich, sodass du dich gelähmt fühlst?"},
      {"statement": "Das ist zu teuer.", "question": "Verglichen womit ist es zu teuer?"}
    ],
    "matching": true
  }',
  2
),
(
  (SELECT id FROM module_contents WHERE module_id = 'k-metamodel-practice' LIMIT 1),
  'Eigene Metamodell-Verletzungen identifizieren',
  'Denken Sie an eine aktuelle Herausforderung oder ein Problem, mit dem Sie konfrontiert sind.

Beschreiben Sie diese Situation in 3-5 Sätzen:',
  'journal',
  '{
    "placeholder": "Die Situation, mit der ich konfrontiert bin...",
    "min_length": 50
  }',
  3
),
(
  (SELECT id FROM module_contents WHERE module_id = 'k-metamodel-practice' LIMIT 1),
  'Eigene Beschreibung analysieren',
  'Lesen Sie Ihre Beschreibung noch einmal durch und identifizieren Sie mögliche Metamodell-Verletzungen in Ihrem Text:

- Haben Sie absolute Begriffe verwendet (alle, immer, nie, keiner)?
- Haben Sie jemanden oder etwas für Ihre Gefühle verantwortlich gemacht?
- Haben Sie Prozesse in Substantive verwandelt (Nominalisierungen)?
- Haben Sie unspezifische Verben oder Vergleiche verwendet?
- Haben Sie Modaloperatoren benutzt ("Ich muss", "Ich kann nicht")?

Notieren Sie die Metamodell-Verletzungen, die Sie in Ihrer eigenen Beschreibung gefunden haben:',
  'journal',
  '{
    "placeholder": "Die Metamodell-Verletzungen in meiner Beschreibung sind...",
    "min_length": 30
  }',
  4
),
(
  (SELECT id FROM module_contents WHERE module_id = 'k-metamodel-practice' LIMIT 1),
  'Präzisere Beschreibung formulieren',
  'Basierend auf Ihrer Analyse, formulieren Sie nun eine präzisere, klarere Beschreibung derselben Situation. Vermeiden Sie dabei Metamodell-Verletzungen und seien Sie so spezifisch wie möglich.

Ihre überarbeitete Beschreibung:',
  'journal',
  '{
    "placeholder": "Eine präzisere Beschreibung meiner Situation ist...",
    "min_length": 50
  }',
  5
),
(
  (SELECT id FROM module_contents WHERE module_id = 'k-metamodel-practice' LIMIT 1),
  'Reflexion',
  'Reflektieren Sie über diesen Prozess:

1. Wie hat sich Ihr Verständnis der Situation durch die präzisere Formulierung verändert?
2. Welche neuen Möglichkeiten oder Einsichten haben sich durch die klarere Beschreibung ergeben?
3. Wie könnten Sie das Meta-Modell in Ihrem Alltag nutzen, um zu mehr Klarheit zu gelangen?',
  'journal',
  '{
    "placeholder": "Meine Reflexion zu diesem Prozess...",
    "min_length": 50
  }',
  6
);

-- 4. Modul "Klarheits-Tagebuch" hinzufügen
INSERT INTO module_contents (
  module_id,
  content_type,
  title,
  description,
  content,
  order_index
) VALUES (
  'k-clarity-journal',
  'exercise',
  'Klarheits-Tagebuch',
  'Tägliche Praxis für anhaltende Klarheit',
  '{
    "intro_text": "Das Klarheits-Tagebuch ist eine kraftvolle tägliche Praxis, die Ihnen hilft, Klarheit nachhaltig in Ihrem Leben zu verankern. In diesem Modul lernen Sie, wie Sie ein solches Tagebuch führen können und erhalten Vorlagen für die tägliche Anwendung.",
    "duration_minutes": 15,
    "key_concepts": [
      "Die Kraft täglicher Reflexion",
      "Muster und Inkongruenzen erkennen",
      "Klarheit als tägliche Praxis"
    ]
  }',
  8
);

-- Übungsschritte für das Klarheits-Tagebuch hinzufügen
INSERT INTO exercise_steps (
  module_content_id,
  title,
  instructions,
  step_type,
  options,
  order_index
) VALUES 
(
  (SELECT id FROM module_contents WHERE module_id = 'k-clarity-journal' LIMIT 1),
  'Einführung zum Klarheits-Tagebuch',
  'Das Klarheits-Tagebuch ist eine strukturierte Methode, um täglich Ihre Gedanken, Emotionen und Handlungen zu reflektieren und so mehr Klarheit zu gewinnen. 

Durch regelmäßiges Schreiben können Sie:
- Muster in Ihrem Denken und Verhalten erkennen
- Inkongruenzen zwischen Ihren Werten und Handlungen aufdecken
- Fortschritte in Ihrer persönlichen Entwicklung dokumentieren
- Emotionale Klarheit gewinnen
- Entscheidungen bewusster treffen

Das Klarheits-Tagebuch ist keine weitere To-Do-Liste oder ein Kalender. Es ist ein Raum für ehrliche Selbstreflexion, für das Hinterfragen von Annahmen und für die Entwicklung eines tieferen Verständnisses Ihrer selbst.',
  'reflection',
  '{}',
  1
),
(
  (SELECT id FROM module_contents WHERE module_id = 'k-clarity-journal' LIMIT 1),
  'Struktur des Klarheits-Tagebuchs',
  'Ein effektives Klarheits-Tagebuch enthält die folgenden Komponenten:

1. **Tägliche Check-ins**: Kurze Reflexionen über Ihren aktuellen emotionalen und mentalen Zustand

2. **Muster-Erkennung**: Beobachtungen zu wiederkehrenden Gedanken, Gefühlen oder Verhaltensweisen

3. **Inkongruenz-Awareness**: Bewusstheit über Diskrepanzen zwischen Werten und Handlungen

4. **Klarheits-Momente**: Dokumentation von Momenten besonderer Klarheit oder Einsicht

5. **Wachstumsbereiche**: Reflexion über Bereiche, in denen Sie mehr Klarheit gewinnen möchten

Das Tagebuch sollte einfach genug sein, um es täglich führen zu können, aber tiefgehend genug, um echte Einsichten zu ermöglichen. Sie können es an Ihre Bedürfnisse anpassen.',
  'reflection',
  '{}',
  2
),
(
  (SELECT id FROM module_contents WHERE module_id = 'k-clarity-journal' LIMIT 1),
  'Tägliche Leitfragen',
  'Hier sind einige Leitfragen, die Sie in Ihrem Klarheits-Tagebuch verwenden können:

**Morgen-Reflexion (5 Minuten)**
1. Wie fühle ich mich heute? (Körperlich, emotional, mental)
2. Welche Gedanken dominieren meinen Geist?
3. Was ist heute wirklich wichtig für mich?

**Abend-Reflexion (10 Minuten)**
1. Was waren heute meine klarsten Momente?
2. Wo habe ich Inkongruenzen zwischen meinen Werten und Handlungen bemerkt?
3. Welche wiederkehrenden Gedanken oder Emotionen habe ich erlebt?
4. Welche Metamodell-Verletzungen habe ich in meinem Denken bemerkt?
5. Was habe ich heute über mich gelernt?

Es ist wichtig, dass Sie diese Fragen anpassen, sodass sie für Sie persönlich relevant sind. Die Konsistenz ist dabei wichtiger als die Perfektion. Selbst 5 Minuten tägliche Reflexion können einen großen Unterschied machen.',
  'reflection',
  '{}',
  3
),
(
  (SELECT id FROM module_contents WHERE module_id = 'k-clarity-journal' LIMIT 1),
  'Erstellen Sie Ihren ersten Tagebucheintrag',
  'Nehmen Sie sich Zeit, um einen ersten Eintrag in Ihr Klarheits-Tagebuch zu schreiben. 

Reflektieren Sie über:
1. Ihre aktuellen Gedanken und Gefühle
2. Einen Moment der Klarheit, den Sie kürzlich erlebt haben
3. Eine Inkongruenz, die Sie in Ihrem Leben bemerkt haben
4. Einen Bereich, in dem Sie mehr Klarheit suchen

Ihr erster Tagebucheintrag:',
  'journal',
  '{
    "placeholder": "Mein erster Eintrag in mein Klarheits-Tagebuch...",
    "min_length": 100
  }',
  4
),
(
  (SELECT id FROM module_contents WHERE module_id = 'k-clarity-journal' LIMIT 1),
  'Ihre Tagebuch-Routine planen',
  'Um das Klarheits-Tagebuch zu einer festen Gewohnheit zu machen, ist es hilfreich, einen klaren Plan zu haben:

1. **Wann** werden Sie schreiben? (Morgens, abends, beides?)
2. **Wo** werden Sie schreiben? (In der App, in einem physischen Notizbuch?)
3. **Wie lange** werden Sie schreiben? (5 Minuten, 10 Minuten?)
4. **Wie werden Sie sich erinnern?** (Erinnerung in der App, Verknüpfung mit einer bestehenden Gewohnheit?)

Beschreiben Sie Ihren Plan für die Integration des Klarheits-Tagebuchs in Ihren Alltag:',
  'journal',
  '{
    "placeholder": "Mein Plan für mein Klarheits-Tagebuch ist...",
    "min_length": 50
  }',
  5
);

-- 5. Modul "Reality-Check" hinzufügen
INSERT INTO module_contents (
  module_id,
  content_type,
  title,
  description,
  content,
  order_index
) VALUES (
  'k-reality-check',
  'exercise',
  'Reality-Check: Selbsttäuschungen überwinden',
  'Werkzeuge zur Überprüfung eigener Annahmen und zum konstruktiven Umgang mit Feedback',
  '{
    "intro_text": "Selbsttäuschungen sind oft subtil und schwer zu erkennen - gerade weil sie Teil unserer eigenen Wahrnehmung sind. Der Reality-Check ist ein Prozess, der Ihnen hilft, Ihre Annahmen zu überprüfen und Feedback konstruktiv zu nutzen, um zu mehr Klarheit zu gelangen.",
    "duration_minutes": 20,
    "key_concepts": [
      "Die Psychologie der Selbsttäuschung",
      "Kognitive Verzerrungen erkennen",
      "Feedback als Geschenk annehmen",
      "Die vier Säulen des Reality-Checks"
    ]
  }',
  9
);

-- Übungsschritte für den Reality-Check hinzufügen
INSERT INTO exercise_steps (
  module_content_id,
  title,
  instructions,
  step_type,
  options,
  order_index
) VALUES 
(
  (SELECT id FROM module_contents WHERE module_id = 'k-reality-check' LIMIT 1),
  'Die Psychologie der Selbsttäuschung',
  'Selbsttäuschung ist ein universell menschliches Phänomen. Unser Gehirn ist darauf programmiert, kognitive Dissonanz zu vermeiden und ein kohärentes Selbstbild zu erhalten - manchmal auf Kosten der Realität.

Häufige Formen der Selbsttäuschung:

1. **Bestätigungsfehler**: Wir nehmen bevorzugt Informationen wahr, die unsere bestehenden Überzeugungen bestätigen.

2. **Selbstdienliche Verzerrung**: Erfolge schreiben wir uns selbst zu, Misserfolge äußeren Umständen.

3. **Überoptimismus**: Wir überschätzen unsere Fähigkeiten und unterschätzen Risiken.

4. **Vermeidung unangenehmer Wahrheiten**: Wir blenden Informationen aus, die unser Selbstbild bedrohen.

5. **Rückschaufehler**: "Das habe ich schon immer gewusst" - die Illusion, Ereignisse im Nachhinein vorhergesehen zu haben.

Die gute Nachricht: Durch bewusste Selbstreflexion und gezielte Reality-Checks können wir diese Verzerrungen erkennen und überwinden.',
  'reflection',
  '{}',
  1
),
(
  (SELECT id FROM module_contents WHERE module_id = 'k-reality-check' LIMIT 1),
  'Eigene Selbsttäuschungen erkennen',
  'Denken Sie an eine Situation aus der jüngeren Vergangenheit, in der Sie überrascht waren, dass Ihre Wahrnehmung nicht mit der Realität oder der Wahrnehmung anderer übereinstimmte.

Dies könnte sein:
- Feedback, das Sie überrascht hat
- Eine Situation, die anders verlief als erwartet
- Ein Moment, in dem Sie realisierten, dass Ihre Selbsteinschätzung nicht stimmte

Beschreiben Sie diese Situation kurz:',
  'journal',
  '{
    "placeholder": "Eine Situation, in der meine Wahrnehmung nicht mit der Realität übereinstimmte, war...",
    "min_length": 50
  }',
  2
),
(
  (SELECT id FROM module_contents WHERE module_id = 'k-reality-check' LIMIT 1),
  'Die vier Säulen des Reality-Checks',
  'Der Reality-Check basiert auf vier Säulen, die Ihnen helfen, Ihre Wahrnehmung zu überprüfen:

1. **Evidenz sammeln**: Welche konkreten Fakten und Beobachtungen (nicht Interpretationen) gibt es?

2. **Perspektivenwechsel**: Wie würde die Situation aus anderen Blickwinkeln aussehen?

3. **Feedback einholen**: Was sagen vertraute Personen, die ehrlich mit Ihnen sind?

4. **Kognitive Verzerrungen identifizieren**: Welche typischen Denkfehler könnten hier wirksam sein?

Wenden Sie diese vier Säulen auf die zuvor beschriebene Situation an:',
  'journal',
  '{
    "placeholder": "Wenn ich die vier Säulen des Reality-Checks auf diese Situation anwende...",
    "min_length": 100
  }',
  3
),
(
  (SELECT id FROM module_contents WHERE module_id = 'k-reality-check' LIMIT 1),
  'Feedback als Geschenk annehmen',
  'Feedback - besonders kritisches - kann unangenehm sein, ist aber eines der wertvollsten Werkzeuge für persönliches Wachstum.

Drei Schritte zum konstruktiven Umgang mit Feedback:

1. **Trennen Sie Beobachtung von Bewertung**:
   - Beobachtung: "Du hast in drei Meetings nicht gesprochen"
   - Bewertung: "Du bist zu schüchtern in Meetings"

2. **Isolieren Sie den nützlichen Kern**:
   Selbst in schlecht formuliertem Feedback steckt oft ein wertvoller Kern.

3. **Vermeiden Sie reflexive Abwehr**:
   Der erste Impuls ist oft, Feedback abzuwehren. Atmen Sie durch und nehmen Sie es zunächst einfach an - Sie müssen nicht sofort reagieren.

Denken Sie an das letzte kritische Feedback, das Sie erhalten haben. Beschreiben Sie, wie Sie es damals aufgenommen haben und wie Sie es heute mit diesen drei Schritten aufnehmen würden:',
  'journal',
  '{
    "placeholder": "Das letzte kritische Feedback, das ich erhielt, war... Damals reagierte ich... Heute würde ich...",
    "min_length": 100
  }',
  4
),
(
  (SELECT id FROM module_contents WHERE module_id = 'k-reality-check' LIMIT 1),
  'Ihr persönlicher Reality-Check-Plan',
  'Basierend auf Ihren Erkenntnissen aus diesem Modul, entwickeln Sie nun Ihren persönlichen Reality-Check-Plan:

1. In welchen Lebensbereichen könnte es besonders nützlich sein, Ihre Annahmen regelmäßig zu überprüfen?

2. Welche 2-3 vertrauten Personen könnten Sie um ehrliches Feedback bitten?

3. Welche konkreten Maßnahmen werden Sie ergreifen, um regelmäßige Reality-Checks in Ihren Alltag zu integrieren?

4. Wie werden Sie mit unangenehmen Erkenntnissen umgehen?

Ihr Reality-Check-Plan:',
  'journal',
  '{
    "placeholder": "Mein persönlicher Plan für regelmäßige Reality-Checks ist...",
    "min_length": 100
  }',
  5
);
