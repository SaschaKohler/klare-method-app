# User Answer Tracking & AI-Personalisierung Guide

## Überblick

Die KLARE-App verfügt jetzt über ein **granulares User Answer Tracking System**, das alle Benutzerantworten, Übungsergebnisse und Erkenntnisse speichert, um hochpersonalisierte AI-Prompts zu generieren.

## Architektur

### Neue Datenbanktabellen

#### 1. `user_answers`
**Zweck**: Zentrale Speicherung aller User-Antworten für AI-Kontext

**Felder**:
- `user_id`: Referenz zum User
- `module_id`: Zu welchem Modul gehört die Antwort
- `question_type`: `'quiz'`, `'reflection'`, `'metamodel'`, `'genius_gate'`, `'coaching'`, `'exercise'`
- `question_text`: Die gestellte Frage (wichtig für AI-Kontext)
- `answer_text`: Freitext-Antwort
- `answer_data`: Strukturierte Antworten (JSONB)
- `emotion_tags`: Array von Emotionen (z.B. `['frustrated', 'hopeful']`)
- `key_themes`: Array von Themen (z.B. `['career', 'relationships']`)
- `confidence_level`: 1-5 (Wie sicher ist der User mit seiner Antwort?)
- `ai_analysis`: AI-generierte Analyse dieser Antwort (JSONB)
- `related_insights`: Links zu `personal_insights`

**Beispiel**:
```typescript
{
  user_id: "abc-123",
  module_id: "k-metamodel-level1",
  question_type: "metamodel",
  question_text: "Welche Universalquantoren verwendest du häufig in deinem Alltag?",
  answer_text: "Ich sage oft 'immer' und 'nie', besonders wenn ich über meine Arbeit spreche.",
  emotion_tags: ["frustrated", "aware"],
  key_themes: ["work", "communication", "patterns"],
  confidence_level: 4
}
```

#### 2. `exercise_results`
**Zweck**: Detaillierte Tracking von Übungsdurchführungen

**Felder**:
- `exercise_type`: z.B. `'metamodel_level1'`, `'genius_gate'`
- `user_input`: Die kompletten User-Eingaben (JSONB)
- `completion_status`: `'in_progress'`, `'completed'`, `'skipped'`
- `time_spent_seconds`: Wie lange hat die Übung gedauert?
- `score`: Optional: 0-100 Performance-Score
- `ai_feedback`: AI-generierte Rückmeldungen
- `suggested_improvements`: Verbesserungsvorschläge

**Beispiel**:
```typescript
{
  user_id: "abc-123",
  module_id: "k-metamodel-level1",
  exercise_type: "universalquantoren_identification",
  user_input: {
    identified_phrases: ["Ich schaffe das nie", "Du hilfst mir immer"],
    reframed_phrases: ["Ich schaffe das manchmal nicht", "Du hilfst mir oft"]
  },
  completion_status: "completed",
  time_spent_seconds: 420,
  score: 85
}
```

### Erweiterte Kontext-Building

Der **AIService** nutzt jetzt `buildChatContext()` um:

✅ **Onboarding-Daten** (Ziele, Herausforderungen, Erfahrungslevel)  
✅ **Life Wheel Status** (aktuelle Zufriedenheit)  
✅ **Letzte 20 User-Antworten** (mit Themen und Emotionen)  
✅ **Letzte 10 Übungsergebnisse**  
✅ **Abgeschlossene Module**  
✅ **Erkannte Muster** (aus `user_patterns`)  
✅ **Journal-Einträge** (letzte 5)  

## Integration in Module

### Beispiel: Meta-Modell Level 1 Modul

```typescript
import { UserAnswerTrackingService } from '@/services/UserAnswerTrackingService';
import { AIService } from '@/services/AIService';

// 1. User beantwortet eine Reflexionsfrage
const handleUserAnswer = async (questionText: string, answerText: string) => {
  await UserAnswerTrackingService.saveUserAnswer({
    user_id: userId,
    module_id: 'k-metamodel-level1',
    question_type: 'metamodel',
    question_text: questionText,
    answer_text: answerText,
    key_themes: ['communication', 'patterns'],
    emotion_tags: ['curious', 'challenged'],
    confidence_level: 3
  });
};

// 2. Übung wird durchgeführt
const handleExerciseCompletion = async (exerciseData: any) => {
  const resultId = await UserAnswerTrackingService.saveExerciseResult({
    user_id: userId,
    module_id: 'k-metamodel-level1',
    exercise_type: 'universalquantoren_practice',
    user_input: exerciseData,
    completion_status: 'completed',
    time_spent_seconds: timeSpent
  });
  
  // Optional: AI-Feedback generieren
  const context = await AIService.buildChatContext(userId);
  const feedback = await AIService.generateExerciseFeedback(context, exerciseData);
  
  await UserAnswerTrackingService.updateExerciseResult(resultId, {
    ai_feedback: feedback
  });
};

// 3. Personalisierte nächste Frage generieren
const getNextQuestion = async () => {
  const context = await AIService.buildChatContext(userId);
  
  // Der Kontext enthält jetzt:
  // - context.userAnswers (letzte Antworten)
  // - context.keyThemes (häufigste Themen)
  // - context.emotionalState (aktuelle Emotionen)
  // - context.currentGoals (aus Onboarding)
  
  const nextQuestion = await AIService.generatePersonalizedQuestion(
    context,
    'metamodel_level2' // Nächstes Thema
  );
  
  return nextQuestion;
};
```

## AI-Prompt-Generierung mit User-Kontext

### Vorher (Basierend nur auf Onboarding):
```
"Du bist ein Coach. Der User möchte an 'Kommunikation' arbeiten."
```

### Nachher (Mit granuliertem Tracking):
```
"Du bist ein Coach für [User Name].

Ziele: Bessere Kommunikation, Work-Life-Balance
Herausforderungen: Stress bei der Arbeit, Zeitmanagement

Aktuelle Themen (aus letzten Antworten): 
- Kommunikation (15x erwähnt)
- Arbeitsstress (12x erwähnt)
- Familie (8x erwähnt)

Emotionale Lage: frustrated, hopeful, determined

Fortschritt:
- K-Modul Level 1 abgeschlossen (Meta-Modell verstanden)
- Genius Gate Übung: 85% Score
- LifeWheel Durchschnitt: 6.2/10

Erkannte Muster:
- Verwendet häufig Universalquantoren ("immer", "nie")
- Tendenz zu Schwarz-Weiß-Denken
- Hohe Motivation bei praktischen Übungen

Generiere eine präzise, personalisierte Frage zum Meta-Modell Level 2 
(Tilgungen), die an die bisherigen Erkenntnisse anknüpft."
```

## Database Functions

### `get_comprehensive_user_context(user_id)`

Liefert kompletten User-Kontext als JSONB:

```sql
SELECT get_comprehensive_user_context('abc-123');

-- Ergebnis:
{
  "profile": {
    "goals": ["Bessere Kommunikation", "Work-Life-Balance"],
    "challenges": ["Stress", "Zeitmanagement"],
    "experience_level": "beginner"
  },
  "recent_answers": [
    {
      "question": "Welche Universalquantoren...",
      "answer": "Ich sage oft 'immer'...",
      "themes": ["work", "communication"],
      "emotions": ["frustrated"],
      "date": "2025-10-09T12:00:00Z"
    }
  ],
  "life_wheel": { ... },
  "patterns": [
    {"type": "universalquantoren_usage", "confidence": 0.85}
  ],
  "completed_modules": ["k-metamodel-level1"]
}
```

### `get_user_answers_by_theme(user_id, theme, limit)`

Holt Antworten zu einem spezifischen Thema:

```sql
SELECT * FROM get_user_answers_by_theme('abc-123', 'communication', 5);
```

## Analytics & Insights

### Antwort-Pattern-Analyse

```typescript
const analysis = await UserAnswerTrackingService.analyzeAnswerPatterns(userId);

console.log(analysis);
// {
//   frequentThemes: [
//     { theme: 'work', count: 15 },
//     { theme: 'relationships', count: 8 }
//   ],
//   emotionalTrend: 'hopeful',
//   progressIndicators: {
//     totalAnswers: 42,
//     averageConfidence: 3.6
//   }
// }
```

### AI-Prompt-Kontext erstellen

```typescript
const promptContext = await UserAnswerTrackingService.buildAIPromptContext(userId);

console.log(promptContext);
// "Ziele: Bessere Kommunikation, Work-Life-Balance
//  Herausforderungen: Stress, Zeitmanagement
//  Aktuelle Themen: work, communication, family
//  Emotionale Lage: hopeful, determined
//  LifeWheel Durchschnitt: 6.2/10
//  Erkannte Muster: universalquantoren_usage"
```

## Migration Deployment

```bash
# 1. Migration ausführen
supabase db push

# 2. Verify
psql $DATABASE_URL -c "\d user_answers"
psql $DATABASE_URL -c "\d exercise_results"

# 3. Test Function
psql $DATABASE_URL -c "SELECT get_comprehensive_user_context('test-user-id');"
```

## Best Practices

### 1. Speichere IMMER Antworten
Auch wenn die Antwort kurz ist oder leer - speichere sie mit `confidence_level: 1` als Signal, dass der User unsicher war.

### 2. Extrahiere Themen automatisch
Nutze einfache Keyword-Matching oder später AI-basierte Extraktion für `key_themes`.

### 3. Emotionen aus Kontext ableiten
Wenn möglich, lass die AI Emotionen aus dem Antworttext extrahieren.

### 4. Regelmäßige Pattern-Analyse
Führe wöchentlich `analyzeAnswerPatterns()` aus, um neue Insights zu generieren.

### 5. Privacy-First
Alle sensiblen Daten werden **nur** mit User-Consent gespeichert (siehe `privacy_settings` in `user_profiles`).

## Roadmap

### Kurzfristig (nächste Woche)
- [ ] Integration in K-Module (Meta-Modell, Genius Gate)
- [ ] Test-Daten generieren für AI-Prompt-Testing
- [ ] UI-Komponente für "Deine Fortschritts-Insights"

### Mittelfristig (nächster Monat)
- [ ] AI-basierte Theme-Extraktion (statt manuell)
- [ ] Emotion-Detection aus Text (Sentiment Analysis)
- [ ] Pattern-Recognition Algorithmen verfeinern

### Langfristig
- [ ] Predictive Analytics (Welches Modul passt als nächstes?)
- [ ] Adaptive Schwierigkeitsgrade basierend auf Performance
- [ ] Peer-Benchmarking (anonymisiert)

## Support

Bei Fragen zum User Answer Tracking System:
- Siehe `UserAnswerTrackingService.ts` für TypeScript API
- Siehe Migration `20251217000003_user_answers_granular_tracking.sql` für DB Schema
- Siehe `AIService.ts` für erweiterte Kontext-Building Funktionen
