-- Migration für das Klarheits-Tagebuch Feature

-- Erstellen der Tagebucheinträge-Tabelle
CREATE TABLE user_journal_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  entry_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  entry_content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  mood_rating SMALLINT,
  clarity_rating SMALLINT,
  category TEXT DEFAULT 'general',
  is_favorite BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabelle für Tagebuch-Vorlagen
CREATE TABLE journal_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  prompt_questions JSONB NOT NULL,
  category TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabelle für Template-Kategorien
CREATE TABLE journal_template_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sicherheitsrichtlinien
ALTER TABLE user_journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_template_categories ENABLE ROW LEVEL SECURITY;

-- Nur der jeweilige Nutzer kann seine eigenen Einträge sehen und bearbeiten
CREATE POLICY "Users can manage their own journal entries" 
ON user_journal_entries FOR ALL TO authenticated 
USING (auth.uid() = user_id);

-- Jeder authentifizierte Nutzer kann Vorlagen und Kategorien lesen
CREATE POLICY "Authenticated users can read templates" 
ON journal_templates FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read template categories" 
ON journal_template_categories FOR SELECT TO authenticated USING (true);

-- Template-Kategorien hinzufügen
INSERT INTO journal_template_categories (
  name,
  description,
  icon,
  order_index
) VALUES 
(
  'Tägliche Reflexion',
  'Routine-Einträge für Morgen und Abend',
  'calendar',
  1
),
(
  'Klarheit',
  'Übungen zur Steigerung der Klarheit',
  'lightbulb',
  2
),
(
  'Lebendigkeit',
  'Übungen zur Steigerung der Lebendigkeit',
  'sparkles',
  3
),
(
  'Ausrichtung',
  'Übungen zur Steigerung der Ausrichtung',
  'compass',
  4
),
(
  'Realisierung',
  'Übungen zur Steigerung der Realisierung',
  'target',
  5
),
(
  'Entfaltung',
  'Übungen zur Steigerung der Entfaltung',
  'flower',
  6
);

-- Basis-Vorlagen hinzufügen
INSERT INTO journal_templates (
  title,
  description,
  prompt_questions,
  category,
  order_index
) VALUES 
(
  'Morgen-Reflexion',
  'Kurze Reflexion für den Start in den Tag',
  '[
    "Wie fühle ich mich heute (körperlich, emotional, mental)?",
    "Welche Gedanken dominieren meinen Geist?",
    "Was ist heute wirklich wichtig für mich?",
    "Wie möchte ich mich heute bewusst ausrichten?"
  ]'::jsonb,
  'Tägliche Reflexion',
  1
),
(
  'Abend-Reflexion',
  'Umfassendere Reflexion für den Tagesabschluss',
  '[
    "Was waren heute meine klarsten Momente?",
    "Wo habe ich Inkongruenzen zwischen meinen Werten und Handlungen bemerkt?",
    "Welche wiederkehrenden Gedanken oder Emotionen habe ich erlebt?",
    "Welche Metamodell-Verletzungen habe ich in meinem Denken bemerkt?",
    "Was habe ich heute über mich gelernt?"
  ]'::jsonb,
  'Tägliche Reflexion',
  2
),
(
  'Inkongruenz-Reflexion',
  'Tiefere Analyse einer erkannten Inkongruenz',
  '[
    "Welche Inkongruenz habe ich bemerkt?",
    "Auf welcher Ebene findet sie statt (Aussagen, Werte, Identität, Wahrnehmung)?",
    "Wie wirkt sich diese Inkongruenz auf mein Energieniveau aus?",
    "Welche ersten Schritte könnte ich unternehmen, um mehr Kongruenz zu erreichen?"
  ]'::jsonb,
  'Klarheit',
  1
),
(
  'Genius Gate Anwendung',
  'Anwendung der Genius Gate-Fragen auf eine aktuelle Situation',
  '[
    "Welche Situation oder welcher Gedanke beschäftigt mich aktuell?",
    "Welcher universale Modellierungsprozess (Verzerrung, Generalisierung, Tilgung) könnte hier am stärksten wirksam sein?",
    "Welche Genius Gate-Frage könnte hier Klarheit bringen (z.B. Woher weiß ich das? Was würde geschehen, wenn...? Verglichen womit?)?",
    "Wenn ich diese Frage ehrlich beantworte: Welche Einsicht gewinne ich?",
    "Wie kann ich die Situation nun präziser und klarer beschreiben?"
  ]'::jsonb,
  'Klarheit',
  2
),
(
  'Metamodell-Praxis',
  'Anwendung des Metamodells auf eigene Aussagen und Gedanken',
  '[
    "Ein Gedanke oder eine Aussage, die mir heute durch den Kopf ging:",
    "Welche Metamodell-Verletzung könnte darin enthalten sein (z.B. Universalquantor, Gedankenlesen, unvollständig spezifiziertes Verb)?",
    "Wie lautet die passende Metamodell-Frage dazu?",
    "Meine Antwort auf diese Frage:",
    "Eine präzisere Neuformulierung:"
  ]'::jsonb,
  'Klarheit',
  3
),
(
  'Ressourcen-Tagebuch',
  'Dokumentation besonderer Ressourcen und energiereicher Momente',
  '[
    "In welchen Momenten habe ich mich heute besonders lebendig gefühlt?",
    "Was genau hat diese Lebendigkeit ausgelöst?",
    "Wie hat sich diese Lebendigkeit körperlich angefühlt? Wo im Körper habe ich sie wahrgenommen?",
    "Wie könnte ich mehr solcher Momente in meinen Alltag integrieren?"
  ]'::jsonb,
  'Lebendigkeit',
  1
),
(
  'Werte-Reflexion',
  'Reflexion über die persönlichen Werte und ihre Bedeutung',
  '[
    "Welcher Wert war heute für mich besonders wichtig?",
    "In welchen Situationen habe ich diesen Wert gelebt?",
    "Gab es Situationen, in denen verschiedene Werte in Konflikt geraten sind?",
    "Wie habe ich mich in diesen Konflikt-Situationen entschieden?",
    "Wie zufrieden bin ich mit meinen Entscheidungen aus heutiger Sicht?"
  ]'::jsonb,
  'Ausrichtung',
  1
),
(
  'Fortschritts-Tagebuch',
  'Dokumentation von Fortschritten und Erfolgen',
  '[
    "Welche kleinen oder großen Fortschritte habe ich heute gemacht?",
    "Was hat mir dabei geholfen, diese Fortschritte zu erzielen?",
    "Welche Hindernisse habe ich überwunden?",
    "Was ist mein nächster kleiner Schritt?"
  ]'::jsonb,
  'Realisierung',
  1
),
(
  'Kongruenz-Momente',
  'Dokumentation von Momenten vollständiger Kongruenz',
  '[
    "Wann habe ich mich heute vollkommen im Einklang mit mir selbst gefühlt?",
    "Was waren die Umstände dieses Kongruenz-Moments?",
    "Wie hat sich diese Kongruenz körperlich angefühlt?",
    "Was kann ich tun, um mehr solcher Momente zu erleben?"
  ]'::jsonb,
  'Entfaltung',
  1
);
