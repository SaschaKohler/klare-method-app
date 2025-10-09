# K-Modul: Vollständiger Transformationsablauf

## Übersicht

Das K-Modul (Klarheit) wurde von 2 auf **12 umfassende Phasen** erweitert, um ein echtes Transformationserlebnis zu schaffen. Der Ablauf basiert auf dem TFP-Skript und der KLARE-Methode.

**Gesamtdauer:** ~200 Minuten (ca. 3,5 Stunden)  
**Phasen:** 12 aufeinander aufbauende Schritte  
**AI-Integration:** Vollständig personalisiert mit KModuleAIService

---

## Die 12 Phasen im Detail

### Phase 1: Willkommen (5 Min)
**Slug:** `k-welcome`  
**Typ:** Intro  
**Ziel:** Einstimmung auf die Transformationsreise

**Inhalte:**
- Persönliche AI-Begrüßung basierend auf User-Profil
- Überblick über die Bedeutung von Klarheit
- Vorstellung der 12 Phasen
- Motivation für den Prozess aufbauen

**UI-Elemente:**
- Welcome Card mit Icon
- AI Coach Nachricht (personalisiert)
- Übersicht aller Phasen mit Zeitangaben

---

### Phase 2: IST-Analyse mit Lebensrad (15 Min)
**Slug:** `k-lifewheel-analysis`  
**Typ:** Exercise  
**Ziel:** Ehrliche Bestandsaufnahme der aktuellen Lebenssituation

**Inhalte:**
- Integration des bestehenden Lebensrads
- IST-Bewertung aller Lebensbereiche (0-10)
- SOLL-Bewertung (Zielzustand)
- AI-Analyse der größten Diskrepanzen

**UI-Elemente:**
- Lebensrad-Zusammenfassung (Top 3 Bereiche)
- Button zum Lebensrad-Screen
- AI-Insights zu erkannten Mustern

**Datenbank:**
- Nutzt bestehende `life_wheel_areas` Tabelle
- Speichert IST/SOLL-Werte

---

### Phase 3: Meta-Modell Einführung (10 Min)
**Slug:** `k-metamodel-intro`  
**Typ:** Theory  
**Ziel:** Grundlagen des Meta-Modells verstehen

**Inhalte:**
- Was ist das Meta-Modell der Sprache?
- Die drei Hauptkategorien:
  1. **Generalisierungen** (immer, nie, alle)
  2. **Tilgungen** (fehlende Informationen)
  3. **Verzerrungen** (Ursache-Wirkung, Vorannahmen)
- Warum präzise Sprache = klares Denken

**UI-Elemente:**
- Theory Cards mit Kategorien
- Beispiele für jede Kategorie
- Präzisierende Fragen

---

### Phase 4-6: Meta-Modell Praxis (3x 20 Min)

#### Phase 4: Level 1 - Generalisierungen
**Slug:** `k-metamodel-level1`  
**Challenge:** Universalquantoren erkennen

**Übung:**
- User gibt eigene Aussage ein
- AI analysiert mit `analyzeMetaModel()`
- Identifiziert Muster wie "immer", "nie", "alle"
- Generiert präzisierende Fragen

#### Phase 5: Level 2 - Tilgungen
**Slug:** `k-metamodel-level2`  
**Challenge:** Fehlende Informationen finden

**Übung:**
- Erkennen von unvollständigen Aussagen
- Fragen nach "Wer genau?", "Was genau?", "Wann genau?"

#### Phase 6: Level 3 - Verzerrungen
**Slug:** `k-metamodel-level3`  
**Challenge:** Vorannahmen hinterfragen

**Übung:**
- Ursache-Wirkung-Ketten prüfen
- Vorannahmen bewusst machen

**Gemeinsame UI-Elemente:**
- Level-Anzeige mit Progress
- Text-Input für User-Aussagen
- AI-Analyse-Ergebnisse (Pattern, Keyword, Frage)
- Coach-Feedback mit Encouragement

---

### Phase 7: Genius Gate Intro (15 Min)
**Slug:** `k-genius-gate`  
**Typ:** Theory  
**Ziel:** Zugang zum Unbewussten schaffen

**Inhalte:**
- Was ist das Genius Gate?
- Die 5-Schritte-Methode:
  1. Thema/Blockade wählen
  2. Präzise Fragen stellen
  3. Erste spontane Antworten hören
  4. Tiefer gehen: "Und was ist darunter?"
  5. Kernüberzeugung erkennen

**UI-Elemente:**
- Key-Icon Header
- Schrittweise Anleitung
- Wichtiger Hinweis: Ehrlichkeit zu sich selbst

---

### Phase 8: Genius Gate Praxis (25 Min)
**Slug:** `k-genius-gate-practice`  
**Typ:** Exercise  
**Ziel:** Blockaden erforschen, unbewusste Muster aufdecken

**Übung:**
- User wählt ein Thema/eine Blockade
- AI stellt tiefgehende Fragen (sokratische Methode)
- Progressive Vertiefung (depth_level 1-3)
- Erkennen der Kernüberzeugung

**UI-Elemente:**
- Multi-Step Text-Input
- AI-Coaching mit progressiven Fragen
- Reflexions-Zusammenfassung

**AI-Prompts:**
- `k_genius_gate_coaching` Template
- Berücksichtigt depth_level und topic

---

### Phase 9: Inkongruenz-Mapping (25 Min)
**Slug:** `k-incongruence-mapping`  
**Typ:** Exercise  
**Ziel:** Innere Konflikte sichtbar machen

**Übung:**
- **Drei Ebenen erfassen:**
  1. **Kognitiv:** Was denkst du?
  2. **Emotional:** Was fühlst du wirklich?
  3. **Behavioral:** Was tust du tatsächlich?
- AI analysiert Widersprüche zwischen den Ebenen
- Visualisierung der Inkongruenzen

**UI-Elemente:**
- 3 separate Text-Inputs (Denken, Fühlen, Handeln)
- AI-Analyse der Diskrepanzen
- Einfühlsame Hinweise zu möglichen Ursachen

**Datenbank:**
- Speichert in `phaseData.incongruence_mapping`

---

### Phase 10: Klarheits-Reflexion (20 Min)
**Slug:** `k-clarity-reflection`  
**Typ:** Exercise  
**Ziel:** Integration aller Erkenntnisse

**Reflexionsfragen:**
1. **Wichtigste Erkenntnisse:** Was waren deine Aha-Momente?
2. **Erkannte Muster:** Welche wiederkehrenden Muster hast du entdeckt?
3. **Größte Inkongruenz:** Wo ist der größte Widerspruch?
4. **Nächste Schritte:** Was möchtest du als Erstes verändern?

**UI-Elemente:**
- 4 Reflexions-Inputs
- AI-Zusammenfassung der gesamten Klarheits-Reise
- Würdigung des Fortschritts

**AI-Prompts:**
- `k_completion_summary` Template
- Inkludiert alle key_insights und patterns

---

### Phase 11: Klarheits-Tagebuch Setup (15 Min)
**Slug:** `k-clarity-journal-setup`  
**Typ:** Exercise  
**Ziel:** Tägliche Praxis etablieren

**Inhalte:**
- Warum tägliches Journaling wichtig ist
- **Tägliche Klarheits-Fragen:**
  - Was war heute meine größte Erkenntnis?
  - Wo habe ich unpräzise kommuniziert?
  - Welche Inkongruenz habe ich bemerkt?
  - Was möchte ich morgen klarer sehen?

**UI-Elemente:**
- Journal-Prompts-Liste
- Button zum Journal-Screen
- Empfehlung: 5-10 Min täglich

**Integration:**
- Verknüpfung mit bestehendem Journal-System
- AI-generierte tägliche Prompts

---

### Phase 12: Abschluss & Ausblick (10 Min)
**Slug:** `k-completion`  
**Typ:** Theory  
**Ziel:** Fortschritt würdigen, Ausblick auf L-Modul

**Inhalte:**
- **Glückwunsch-Screen** mit Checkmark-Icon
- **Zusammenfassung der Achievements:**
  - ✓ IST-Analyse mit Lebensrad
  - ✓ Meta-Modell in 3 Levels gemeistert
  - ✓ Genius Gate für Selbsterkenntnis genutzt
  - ✓ Inkongruenzen erkannt und kartiert
  - ✓ Klarheits-Tagebuch eingerichtet
- **AI-Celebration:** Persönliche Würdigung
- **Ausblick auf L-Modul (Lebendigkeit)**

**UI-Elemente:**
- Completion Card mit Trophy-Icon
- Achievement-Liste
- Next-Step-Preview für L-Modul

---

## Technische Implementierung

### Komponente: KModuleComponentNew.tsx

**State Management:**
```typescript
const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
const [completedPhases, setCompletedPhases] = useState<KModulePhase[]>([]);
const [phaseData, setPhaseData] = useState<Record<string, any>>({});
```

**Phase-Konfiguration:**
```typescript
const PHASE_CONFIGS: PhaseConfig[] = [
  { id: 'welcome', title: 'Willkommen', ... },
  { id: 'lifewheel_analysis', title: 'IST-Analyse', ... },
  // ... 12 Phasen total
];
```

**Navigation:**
- `handleNextPhase()`: Validiert aktuelle Phase, markiert als completed, geht weiter
- `handlePreviousPhase()`: Zurück zur vorherigen Phase
- Progress-Anzeige: `(currentPhaseIndex + 1) / totalPhases * 100`

**Validierung pro Phase:**
- `lifewheel_analysis`: Prüft ob Lebensrad-Daten vorhanden
- `metamodel_level1-3`: Prüft ob mindestens eine Analyse durchgeführt
- `genius_gate_practice`: Prüft ob User-Input vorhanden
- `incongruence_mapping`: Prüft ob alle 3 Ebenen ausgefüllt
- `clarity_reflection`: Prüft ob key_insights vorhanden

---

## AI-Integration

### KModuleAIService

**Neue Prompt-Templates:**
1. `k_welcome_personalized`: Personalisierte Begrüßung
2. `k_lifewheel_insights`: Lebensrad-Analyse
3. `k_metamodel_analysis`: Meta-Modell-Analyse (bereits vorhanden)
4. `k_genius_gate_coaching`: Sokratische Fragetechnik
5. `k_incongruence_insights`: Inkongruenz-Analyse
6. `k_completion_summary`: Abschluss-Zusammenfassung

**Verwendung:**
```typescript
const welcome = await aiService.startKSession(userContext, 'k-welcome', {
  userId: user?.id,
  completedModules,
});

const result = await aiService.analyzeMetaModel(
  userStatement,
  level,
  challenge,
  { userId: user?.id }
);
```

---

## Datenbank-Schema

### Neue Tabelle: k_module_progress

```sql
CREATE TABLE k_module_progress (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  current_phase text NOT NULL,
  completed_phases text[],
  metamodel_level integer DEFAULT 1,
  lifewheel_completed boolean DEFAULT false,
  genius_gate_sessions integer DEFAULT 0,
  incongruence_maps_created integer DEFAULT 0,
  key_insights jsonb DEFAULT '[]',
  patterns_identified jsonb DEFAULT '[]',
  started_at timestamptz,
  last_activity_at timestamptz,
  completed_at timestamptz,
  metadata jsonb
);
```

**Function: update_k_module_progress**
```sql
SELECT update_k_module_progress(
  user_id,
  'metamodel_level1',
  '{"analysis_count": 3}'::jsonb
);
```

---

## UI/UX-Highlights

### Progress Header
- Zeigt aktuelle Phase und Gesamtfortschritt
- Progress Bar mit Prozentanzeige
- Geschätzte Zeit für aktuelle Phase

### Phase Overview (Collapsible)
- Liste aller 12 Phasen
- Checkmark für abgeschlossene Phasen
- Radio-Button für aktuelle Phase
- Klickbar für schnelle Navigation (optional)

### AI Coach Cards
- Konsistentes Design mit linker Border in klare-k Farbe
- Icon + Titel + Nachricht
- Encouragement-Text (italic, farbig)

### Input Cards
- Label + Hint (italic, farbig)
- Multi-line TextInput
- Action-Button (Analysieren, Weiter, etc.)

### Results Cards
- Strukturierte Darstellung der AI-Analyse
- Chips für Pattern-Types
- Question-Boxes mit Icon

---

## Testing-Checkliste

- [ ] Alle 12 Phasen durchlaufen
- [ ] Validierung funktioniert (kann nicht ohne Eingabe weiter)
- [ ] Zurück-Navigation funktioniert
- [ ] Lebensrad-Integration funktioniert
- [ ] Meta-Modell-Analyse liefert Ergebnisse
- [ ] AI-Responses werden korrekt angezeigt
- [ ] Progress wird gespeichert
- [ ] Completion führt zu onComplete()
- [ ] Phase-Overview zeigt korrekten Status

---

## Nächste Schritte

1. **Content-Population:** Echte Inhalte aus TFP-Skript einfügen
2. **AI-API-Integration:** Mock-Responses durch echte OpenAI/Claude-Calls ersetzen
3. **Journal-Integration:** Klarheits-Tagebuch mit Journal-System verbinden
4. **Lebensrad-Navigation:** Deep-Link zum LifeWheelScreen implementieren
5. **Progress-Persistierung:** k_module_progress in Supabase speichern
6. **L-Modul-Vorbereitung:** Ähnlichen Ablauf für Lebendigkeit erstellen

---

## Änderungen gegenüber vorher

**Vorher:**
- 2 Screens (k-intro, k-meta-model)
- Minimale Interaktion
- Kein strukturierter Ablauf
- Keine Validierung

**Jetzt:**
- 12 durchdachte Phasen
- Vollständige Transformationsreise
- AI-gestützte Personalisierung
- Validierung und Progress-Tracking
- Integration mit Lebensrad und Journal
- Genius Gate und Inkongruenz-Mapping
- Umfassende Reflexion und Abschluss

**Ergebnis:** Ein echtes Transformationserlebnis, das den User durch einen strukturierten Prozess der Selbsterkenntnis führt.
