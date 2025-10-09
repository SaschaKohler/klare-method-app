# LifeWheel Re-Assessment Guide

## Übersicht

Das **LifeWheel Re-Assessment** Feature ermöglicht es Usern, ihre Lebensbereiche erneut zu bewerten. Die AI nutzt dabei **Memory** aus vorherigen Bewertungen, um personalisierte, kontextbewusste Coaching-Fragen zu stellen.

## Features

### 1. **Memory-basiertes AI-Coaching**
- Zeigt vorherige Bewertung + Datum an
- Berechnet Veränderung seit letzter Bewertung
- AI-Fragen berücksichtigen Entwicklungsrichtung
- Fallback-Fragen sind Memory-bewusst

### 2. **Snapshot-System**
- Automatische Snapshots bei jedem Assessment
- Historie in `life_wheel_snapshots` Tabelle
- Vergleich zwischen Bewertungen möglich

### 3. **Development Tools**
- Debug Menu mit Onboarding-Reset
- Snapshot-Erstellung/-Anzeige
- Navigation zu Re-Assessment

## Verwendung

### User-Flow (Production)

1. **Aus HomeScreen oder ProfileScreen:**
   ```typescript
   <Button
     title="Lebensbereiche neu bewerten"
     onPress={() => navigation.navigate("LifeWheelReAssessment")}
   />
   ```

2. **Durch jeden Lebensbereich:**
   - Sieht vorherige Bewertung (wenn vorhanden)
   - Skaliert aktuellen & Ziel-Wert
   - Erhält personalisierte AI-Frage
   - Kann optional Reflexion eingeben

3. **Abschluss:**
   - Alle Werte werden gespeichert
   - Neuer Snapshot wird erstellt
   - Zurück zum vorherigen Screen

### Development-Flow

**Debug Menu öffnen (nur __DEV__):**

Füge einen Button in einem beliebigen Screen hinzu:

```typescript
import { DebugMenu } from '../components/debug/DebugMenu';

const [debugMenuVisible, setDebugMenuVisible] = useState(false);

// In DEV Mode Button anzeigen
{__DEV__ && (
  <Button
    title="🛠️ Debug"
    onPress={() => setDebugMenuVisible(true)}
    variant="ghost"
  />
)}

<DebugMenu
  visible={debugMenuVisible}
  onClose={() => setDebugMenuVisible(false)}
/>
```

**Debug Menu Funktionen:**
- ✅ Onboarding zurücksetzen
- ✅ Neues LifeWheel Assessment starten
- ✅ Snapshot erstellen
- ✅ Historie anzeigen
- ✅ AI Health Check

## Datenbank-Schema

### `life_wheel_snapshots`

```sql
CREATE TABLE life_wheel_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  snapshot_data JSONB NOT NULL,
  snapshot_type TEXT CHECK (snapshot_type IN ('initial', 're_assessment', 'manual')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**snapshot_data Format:**
```json
{
  "areas": [
    {
      "area_name": "health",
      "current_value": 7,
      "target_value": 9,
      "notes": "User Reflexion..."
    }
  ]
}
```

### `life_wheel_areas`

Speichert aktuelle Bewertungen + Notes:

```sql
UPDATE life_wheel_areas 
SET 
  current_value = 7,
  target_value = 9,
  notes = 'User Reflexion...',
  updated_at = NOW()
WHERE user_id = ? AND area_name = 'health';
```

## AI-Integration

### Memory-Context

Der AI-Service erhält für Re-Assessments zusätzliche Kontextdaten:

```typescript
AIService.generateLifeWheelCoachingQuestion({
  userId: user.id,
  areaName: "Gesundheit",
  areaId: "health",
  currentValue: 7,
  targetValue: 9,
  // Memory aus Snapshot:
  previousValue: 5,
  previousDate: "2025-09-15T10:00:00.000Z"
});
```

### AI-Frage-Generierung

**Mit Anthropic Claude (wenn verfügbar):**

Der Service berechnet automatisch:
- `daysSince`: Tage seit letzter Bewertung
- `valueChange`: Differenz (current - previous)

Diese Daten werden in `userContext` an Claude übergeben:

```typescript
userContext: {
  previousValue: 5,
  previousDate: "2025-09-15T10:00:00.000Z",
  daysSince: 25,
  valueChange: 2  // +2 Verbesserung
}
```

Claude nutzt diese Informationen für kontextbewusste Fragen wie:
> "Du hast deine Gesundheit vor 25 Tagen mit 5/10 bewertet, jetzt mit 7/10. Was hat zu dieser positiven Entwicklung beigetragen?"

**Fallback (ohne Anthropic):**

Memory-bewusste vordefinierte Fragen:

```typescript
// Mit Memory:
"Was hat sich in deiner Gesundheit seit der letzten Einschätzung am meisten verändert?"

// Ohne Memory (erste Bewertung):
"Was würde sich in deinem Leben verändern, wenn du dich körperlich und mental gestärkt fühlst?"
```

## UI-Komponenten

### Vorherige Bewertung Card

```tsx
{currentArea.previousValue !== undefined && (
  <View style={styles.comparisonContainer}>
    <Ionicons name="time-outline" size={20} color={Colors.textSecondary} />
    <View>
      <Text>Vorherige Bewertung: {currentArea.previousValue}/10</Text>
      <Text>vom {new Date(currentArea.previousDate).toLocaleDateString("de-DE")}</Text>
    </View>
  </View>
)}
```

### AI-Coaching Section

```tsx
<View style={styles.coachingContainer}>
  <View style={styles.coachingHeader}>
    <Ionicons name="sparkles" size={24} color={currentArea.color} />
    <Text variant="subtitle">
      {previousSnapshot ? "AI-Coach Reflexion" : "AI-Coach Frage"}
    </Text>
  </View>
  
  {isLoadingQuestion ? (
    <ActivityIndicator />
  ) : (
    <>
      <Text style={styles.coachingQuestion}>{coachingQuestion}</Text>
      <TextInput
        placeholder="Deine Reflexion hierzu..."
        value={userAnswer}
        onChangeText={setUserAnswer}
        multiline
      />
      <Button
        title="Neue Frage generieren"
        onPress={loadCoachingQuestion}
      />
    </>
  )}
</View>
```

## Testing

### Manual Testing Checklist

**Erste Bewertung (kein Memory):**
- [ ] Screen lädt ohne Fehler
- [ ] "AI-Coach Frage" als Header
- [ ] Keine "Vorherige Bewertung" Card
- [ ] AI-Frage ist allgemein gehalten
- [ ] Snapshot wird erstellt

**Zweite Bewertung (mit Memory):**
- [ ] "Vorherige Bewertung" Card wird angezeigt
- [ ] Datum ist korrekt
- [ ] "AI-Coach Reflexion" als Header
- [ ] AI-Frage bezieht sich auf Veränderung
- [ ] Notes werden gespeichert
- [ ] Neuer Snapshot wird erstellt

**Debug Menu:**
- [ ] Onboarding Reset funktioniert
- [ ] Snapshot-Erstellung funktioniert
- [ ] Historie zeigt Snapshots
- [ ] Navigation zu Re-Assessment

### Test-Szenario

```typescript
// 1. Erste Bewertung
- Gesundheit: IST 5, ZIEL 8
- Snapshot erstellt mit snapshot_type='re_assessment'

// 2. Warte einige Tage (oder ändere created_at in DB)

// 3. Zweite Bewertung
- Gesundheit: IST 7, ZIEL 9
- AI-Frage erwähnt vorherige 5/10 und +2 Verbesserung
- User gibt Reflexion ein: "Mehr Sport, bessere Ernährung"
- Notes werden in life_wheel_areas gespeichert
- Neuer Snapshot erstellt
```

### Debug SQL-Queries

```sql
-- Check Snapshots für User
SELECT 
  id,
  snapshot_type,
  created_at,
  snapshot_data->>'areas' as areas
FROM life_wheel_snapshots
WHERE user_id = 'user-id-here'
ORDER BY created_at DESC;

-- Check aktuelle Werte + Notes
SELECT 
  area_name,
  current_value,
  target_value,
  notes,
  updated_at
FROM life_wheel_areas
WHERE user_id = 'user-id-here';

-- Memory-Context für einen Bereich prüfen
WITH latest_snapshot AS (
  SELECT 
    snapshot_data
  FROM life_wheel_snapshots
  WHERE user_id = 'user-id'
  ORDER BY created_at DESC
  LIMIT 1
)
SELECT 
  jsonb_array_elements(snapshot_data->'areas')->>'area_name' as area,
  jsonb_array_elements(snapshot_data->'areas')->>'current_value' as previous_value
FROM latest_snapshot;
```

## Erweiterungsmöglichkeiten

### 1. Visualisierung der Entwicklung

```typescript
// Zeige Werte-Verlauf als Chart
const history = await getLifeWheelHistory(userId, areaId);
<LineChart data={history} />
```

### 2. Automatische Re-Assessment Erinnerungen

```typescript
// Notification nach X Tagen
if (daysSinceLastAssessment > 30) {
  sendPushNotification({
    title: "Zeit für ein LifeWheel Update",
    body: "Bewerte deine Lebensbereiche erneut"
  });
}
```

### 3. AI-generierte Insights

```typescript
// Nach Re-Assessment
const insights = await AIService.generateLifeWheelInsights({
  lifeWheelData: [...],
  userContext: { previousSnapshot, currentSnapshot }
});
```

### 4. Vergleichs-Dashboard

```tsx
<LifeWheelComparisonView
  before={previousSnapshot}
  after={currentSnapshot}
  highlightChanges={true}
/>
```

## Troubleshooting

### "Keine Lebensbereiche gefunden"

**Ursache:** User hat noch kein initiales LifeWheel Setup durchlaufen.

**Lösung:**
```typescript
// Redirect to LifeWheelSetup (Onboarding)
navigation.navigate("Onboarding", { screen: "LifeWheelSetup" });
```

### AI-Fragen laden nicht

**Ursache:** Anthropic API nicht verfügbar oder keine `ANTHROPIC_API_KEY`.

**Erwartung:** Automatischer Fallback auf vordefinierte Fragen.

**Check:**
```typescript
const health = await AIService.healthCheck();
console.log(health.services.aiGeneration); // should be true or false
```

### Snapshots werden nicht erstellt

**Ursache:** Database permission issue oder RLS policy.

**Check:**
```sql
-- Verify RLS policies
SELECT * FROM pg_policies 
WHERE tablename = 'life_wheel_snapshots';

-- Test insert manually
INSERT INTO life_wheel_snapshots (user_id, snapshot_data, snapshot_type)
VALUES (auth.uid(), '{"areas": []}', 're_assessment');
```

## Best Practices

1. **Immer Snapshot erstellen** nach Completion
2. **Notes speichern** vor Navigation weiter
3. **Loading States** während AI-Generierung
4. **Graceful Fallbacks** bei AI-Ausfällen
5. **User-Feedback** über Speicherstatus

---

**Version:** 1.0.0  
**Last Updated:** 2025-10-09  
**Implemented:** LifeWheel Re-Assessment mit AI-Memory
