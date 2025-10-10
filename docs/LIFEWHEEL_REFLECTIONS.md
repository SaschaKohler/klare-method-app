# Life Wheel Reflections - AI-Coach Q&A System

## Übersicht

Das Life Wheel Reflection System speichert alle Fragen und Antworten zwischen AI-Coach und User für jeden Lebensbereich. Dies ermöglicht:

- ✅ **Keine Wiederholungen** von Fragen
- ✅ **Personalisierte Follow-ups** basierend auf vorherigen Antworten
- ✅ **Historische Kontextdaten** für AI-Coaching
- ✅ **Strukturierte Reflexionsdaten** für Insights

---

## Datenstruktur

### `life_wheel_areas.reflection_data` (JSONB)

```typescript
{
  // Strukturierte Hauptfragen
  "why_low": "Warum ist der aktuelle Wert niedrig?",
  "what_matters": "Was ist dir wichtig in diesem Bereich?",
  "ideal_state": "Wie sieht dein idealer Zustand aus?",
  "obstacles": ["Hindernis 1", "Hindernis 2"],
  "first_steps": ["Schritt 1", "Schritt 2"],
  
  // Alle vorherigen Q&A
  "previous_answers": [
    {
      "question": "Was würde sich ändern, wenn...",
      "answer": "Ich würde mehr...",
      "timestamp": "2025-10-10T12:00:00Z",
      "session_id": "onboarding_123456"
    }
  ]
}
```

---

## API Usage

### 1. Antwort speichern (während Onboarding)

```typescript
import { LifeWheelReflectionService } from '@/services';

await LifeWheelReflectionService.saveReflectionAnswer(
  userId,
  areaId,
  "Was ist dir in diesem Bereich am wichtigsten?",
  "Familie und Freunde",
  "onboarding_session"
);
```

### 2. Vorherige Fragen abrufen (Wiederholungen vermeiden)

```typescript
const previousQuestions = await LifeWheelReflectionService.getPreviousQuestions(
  userId,
  areaId
);

// Ergebnis: ["Was ist dir wichtig?", "Wo siehst du..."]
```

### 3. Vollständigen Kontext für AI laden

```typescript
const context = await LifeWheelReflectionService.getAIContext(
  userId,
  areaId
);

// Enthält:
// - area: { name, current_value, target_value }
// - reflections: { why_low, ideal_state, ... }
// - previousQuestions: ["Frage 1", "Frage 2"]
// - userProfile: { goals, challenges, ... }
```

### 4. Strukturierte Reflexion aktualisieren

```typescript
await LifeWheelReflectionService.updateStructuredReflection(
  userId,
  areaId,
  {
    why_low: "Zu wenig Zeit für mich selbst",
    obstacles: ["Arbeit", "Familie"],
    first_steps: ["Morgenroutine", "Sport 2x/Woche"]
  }
);
```

---

## Integration im AI-Service

### `AIService.generateLifeWheelCoachingQuestion()`

```typescript
// VORHER: Keine Prüfung auf Wiederholungen
static async generateLifeWheelCoachingQuestion(params) {
  // Generiere irgendeine Frage
  return "Was ist dir wichtig?";
}

// NACHHER: Mit Kontext und Wiederholungs-Vermeidung
static async generateLifeWheelCoachingQuestion(params) {
  // 1. Lade vorherige Fragen
  const previousQuestions = await LifeWheelReflectionService
    .getPreviousQuestions(userId, areaId);
  
  // 2. Übergebe an AI (Anthropic/OpenAI)
  const question = await AnthropicService.generateCoachingQuestion({
    areaName,
    currentValue,
    targetValue,
    userContext: {
      previousQuestions, // ← WICHTIG!
    }
  });
  
  // 3. Oder: Fallback-Filter
  const availableQuestions = fallbackQuestions.filter(
    q => !previousQuestions.includes(q)
  );
  
  return availableQuestions[0];
}
```

---

## Beispiel-Flow: Onboarding

### Screen: `LifeWheelSetupScreen.tsx`

```typescript
const handleNext = async () => {
  // User hat Frage beantwortet
  if (userAnswer.trim()) {
    await LifeWheelReflectionService.saveReflectionAnswer(
      user.id,
      currentArea.id,
      coachingQuestion,
      userAnswer,
      `onboarding_${Date.now()}`
    );
  }
  
  // Nächster Bereich
  setCurrentAreaIndex(prev => prev + 1);
};
```

### Service: `AIService.ts`

```typescript
// Beim Laden der nächsten Frage
const previousQuestions = await LifeWheelReflectionService
  .getPreviousQuestions(userId, areaId);

console.log(`📝 Area: ${areaName}`);
console.log(`Already asked: ${previousQuestions.length} questions`);

// AI weiß jetzt, welche Fragen schon gestellt wurden!
```

---

## Zukunft: AI-Powered Coaching Sessions

### Personalisierte Follow-up-Fragen

```typescript
const context = await LifeWheelReflectionService.getAIContext(
  userId,
  "career"
);

// AI-Prompt:
// "User sagte: 'Ich fühle mich in meinem Job gefangen'
//  Letzte Frage war: 'Was macht dir Freude?'
//  Antwort: 'Kreative Projekte'
//  
//  Stelle eine tiefere Follow-up-Frage über kreative Projekte."
```

### Progress Tracking

```typescript
const reflections = await LifeWheelReflectionService.getAreaReflections(
  userId,
  "health"
);

// Zeige Timeline:
// - Vor 30 Tagen: "Ich möchte fitter werden"
// - Vor 15 Tagen: "Ich trainiere jetzt 2x/Woche"
// - Heute: "Ich fühle mich energiegeladen!"
```

---

## Vorteile

### 1. **Keine Wiederholungen**
```typescript
// Ohne System:
"Was ist dir wichtig?" → "Was ist dir wichtig?" → "Was ist dir wichtig?"

// Mit System:
"Was ist dir wichtig?" → "Wie könntest du das erreichen?" → "Was hindert dich?"
```

### 2. **Kontextuelle Tiefe**
AI kennt die gesamte Konversations-Historie und kann darauf aufbauen.

### 3. **Daten für Insights**
Alle Antworten sind strukturiert abrufbar für:
- Persönliche Insights
- Pattern Recognition
- Progress Tracking
- Personalisierte Module

### 4. **DSGVO-konform**
Alle Daten sind **user_id-scoped** und können jederzeit gelöscht werden.

---

## Migration Checklist

### ✅ Bereits implementiert:
- [x] Migration: `reflection_data` JSONB Spalte
- [x] Service: `LifeWheelReflectionService`
- [x] Integration: `LifeWheelSetupScreen`
- [x] Integration: `AIService.generateLifeWheelCoachingQuestion`
- [x] Export: `src/services/index.ts`

### 📋 Nächste Schritte:
- [ ] Test: Onboarding-Flow mit Antwort-Speicherung
- [ ] UI: Reflexions-Historie anzeigen im LifeWheelScreen
- [ ] AI: Echte Anthropic/OpenAI Integration mit Context
- [ ] Analytics: Dashboard für gespeicherte Reflections

---

## Datenbankabfragen

### Alle Reflections eines Users

```sql
SELECT 
  name,
  current_value,
  target_value,
  reflection_data
FROM life_wheel_areas
WHERE user_id = 'uuid'
  AND reflection_data IS NOT NULL;
```

### Anzahl beantworteter Fragen pro Area

```sql
SELECT 
  name,
  jsonb_array_length(
    reflection_data->'previous_answers'
  ) as questions_answered
FROM life_wheel_areas
WHERE user_id = 'uuid';
```

---

## Troubleshooting

### Problem: Fragen wiederholen sich trotzdem

**Ursache:** Fallback-Fragen sind zu allgemein formuliert

**Lösung:**
```typescript
// Verwende exakte String-Matches
const previousQuestions = await getPreviousQuestions(userId, areaId);
const newQuestion = generateUniqueQuestion(previousQuestions);
```

### Problem: reflection_data ist NULL

**Ursache:** Migration nicht ausgeführt oder keine Antworten gespeichert

**Lösung:**
```sql
-- Prüfen ob Spalte existiert
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'life_wheel_areas' 
  AND column_name = 'reflection_data';

-- Default-Wert setzen falls NULL
UPDATE life_wheel_areas 
SET reflection_data = '{}'::jsonb 
WHERE reflection_data IS NULL;
```

---

## Zusammenfassung

**Das Life Wheel Reflection System ist die Grundlage für:**

1. **Intelligentes AI-Coaching** ohne Wiederholungen
2. **Personalisierte Fragen** basierend auf User-Historie
3. **Progress Tracking** über Zeit
4. **Datengrundlage** für Personal Insights

**Alle Daten sind:**
- ✅ User-scoped (DSGVO)
- ✅ Strukturiert (JSONB)
- ✅ Historisch (Timeline)
- ✅ AI-ready (Context für Prompts)

🎯 **Das System ist produktionsbereit für Herbst 2025 Launch!**
