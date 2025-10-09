# AI Integration Guide - Anthropic Claude

## Übersicht

Die KLARE-App nutzt **Anthropic Claude 3.5 Sonnet** für personalisiertes Coaching und AI-generierte Inhalte. Die Integration ist optional und fällt automatisch auf Mock-Responses zurück, wenn kein API-Key konfiguriert ist.

## Setup

### 1. API-Key erstellen

1. Gehe zu [Anthropic Console](https://console.anthropic.com/)
2. Registriere dich oder logge dich ein
3. Navigiere zu **API Keys**
4. Erstelle einen neuen API-Key
5. Kopiere den Key (beginnt mit `sk-ant-api03-...`)

### 2. Environment Variable konfigurieren

Erstelle eine `.env`-Datei im Root-Verzeichnis:

```bash
cp .env.example .env
```

Füge deinen API-Key ein:

```env
# .env
SUPABASE_URL=https://awqavfvsnqhubvbfaccv.supabase.co
SUPABASE_ANON_KEY=dein-supabase-anon-key

# Anthropic AI
ANTHROPIC_API_KEY=sk-ant-api03-dein-key-hier
```

### 3. App neu starten

```bash
# Development Build neu starten
npm run ios
# oder
npm run android
```

## Features

### 1. LifeWheel Coaching (Onboarding)

**Screen:** `src/screens/onboarding/LifeWheelSetupScreen.tsx`

- Generiert personalisierte Coaching-Fragen für jeden Lebensbereich
- Berücksichtigt aktuelle und Ziel-Werte
- Nutzer können Antworten eingeben (optional)
- "Neue Frage generieren" Button für alternative Fragen

**Beispiel:**
```
Bereich: Gesundheit (IST: 5, ZIEL: 8)
AI-Frage: "Was würde sich in deinem Leben verändern, wenn du dich körperlich und mental gestärkt fühlst?"
```

### 2. AI-Powered Journal Prompts

**Funktion:** `AIService.generateJournalPrompt(userId)`

Generiert tägliche, personalisierte Journal-Prompts basierend auf:
- User-Kontext (LifeWheel, Profil)
- Kürzliche Einträge (vermeidet Wiederholungen)
- Aktueller Fokus-Bereich

### 3. Progress Analysis & Insights

**Funktion:** `AIService.analyzeProgressAndSuggestNextSteps(userId)`

Analysiert User-Fortschritt und generiert:
- Personalisierte Insights über erkannte Muster
- Konkrete Entwicklungsvorschläge
- Empfohlene nächste Module

### 4. LifeWheel Insights

**Funktion:** `AnthropicService.generateLifeWheelInsights(params)`

Analysiert gesamtes LifeWheel und erstellt:
- 2-3 prägnante Insights über Muster
- 3-5 umsetzbare Empfehlungen
- Priorisierung nach Wichtigkeit

## API-Services

### AIService.ts

Zentrale Abstraktionsschicht für AI-Funktionalität:

```typescript
import { AIService } from '@/services/AIService';

// Coaching-Frage generieren
const question = await AIService.generateLifeWheelCoachingQuestion({
  userId: user.id,
  areaName: "Gesundheit",
  areaId: "health",
  currentValue: 5,
  targetValue: 8,
});

// Chat-Konversation starten
const { sessionId, response } = await AIService.startConversation(
  userId,
  "coaching",
  "Ich möchte mehr über meine Ziele sprechen"
);

// Nachricht senden
const reply = await AIService.sendMessage(
  userId,
  sessionId,
  "Wie kann ich anfangen?",
  "coaching"
);
```

### AnthropicService.ts

Direkter Claude API Wrapper:

```typescript
import { AnthropicService } from '@/services/AnthropicService';

// Health Check
const health = await AnthropicService.healthCheck();
console.log(health.available); // true/false

// Direkte Anfrage
const response = await AnthropicService.generateResponse({
  systemPrompt: "Du bist ein Life Coach...",
  userMessage: "Was ist dein Rat?",
  maxTokens: 500,
  temperature: 0.7,
});
```

## Fallback-Verhalten

Wenn Anthropic API nicht verfügbar ist:

1. **Automatischer Fallback** auf vordefinierte Antworten
2. **Keine Fehlermeldungen** für User
3. **Logging** im Console: `"ℹ️ Verwende Mock-Responses"`
4. **Funktionalität bleibt erhalten**

### Gründe für Fallback:
- Kein API-Key konfiguriert
- API-Key ungültig
- Netzwerkfehler
- Rate Limit erreicht
- Service Down

## Kosten & Limits

### Claude 3.5 Sonnet Preise (Stand Januar 2025)

- **Input:** $3 / Million Tokens
- **Output:** $15 / Million Tokens

### Durchschnittliche Kosten pro Feature:

| Feature | Input Tokens | Output Tokens | Kosten |
|---------|--------------|---------------|--------|
| Coaching-Frage | ~150 | ~50 | $0.001 |
| Journal Prompt | ~100 | ~30 | $0.0008 |
| LifeWheel Insights | ~300 | ~400 | $0.007 |
| Chat Message | ~200 | ~150 | $0.003 |

**Geschätzte Monatskosten pro Aktiver User:** $0.50 - $2.00

### Rate Limits

- **Tier 1 (Standard):** 50 Requests/Minute
- **Tier 2:** 1,000 Requests/Minute (nach $100 spending)

## Monitoring

### Health Check

```typescript
const health = await AIService.healthCheck();
console.log(health);
// {
//   status: "healthy",
//   services: {
//     database: true,
//     aiGeneration: true,
//     promptTemplates: true,
//     insights: true
//   },
//   lastChecked: "2025-10-09T10:47:00.000Z"
// }
```

### Usage Logs

Alle AI-Service-Aufrufe werden in `ai_service_logs` Tabelle geloggt:

```sql
SELECT 
  service_type,
  COUNT(*) as calls,
  AVG(response_time_ms) as avg_response_time
FROM ai_service_logs
WHERE user_id = 'xxx'
  AND created_at > NOW() - INTERVAL '7 days'
GROUP BY service_type;
```

## Datenschutz

### DSGVO-Compliance

1. **User-Consent erforderlich:** Privacy Preferences im Onboarding
2. **Opt-Out möglich:** `showAICoaching` Toggle
3. **Daten-Minimierung:** Nur notwendige Kontextdaten
4. **Keine Speicherung bei Anthropic:** Nur während Request

### Gesendete Daten an Anthropic:

- User-Antworten (wenn eingegeben)
- LifeWheel-Werte (aggregiert, keine Namen)
- System-Prompts
- **NICHT** gesendet: E-Mail, Name, sensible persönliche Daten

### Privacy Settings

User kann AI-Features steuern in `privacy_settings` (JSONB):

```typescript
{
  "ai_coaching_enabled": true,
  "data_processing_consent": true,
  "analytics_enabled": false
}
```

## Troubleshooting

### Problem: "Anthropic Service nicht verfügbar"

**Lösung:**
1. Check `.env` Datei existiert
2. Verify API-Key korrekt kopiert
3. App neu starten (Metro Bundler)
4. Check Console für Details

### Problem: Rate Limit Error

**Lösung:**
1. Warte 60 Sekunden
2. Fallback wird automatisch genutzt
3. Implementiere Request-Queue falls nötig

### Problem: Timeout

**Lösung:**
1. Check Internetverbindung
2. Erhöhe Timeout in `AnthropicService.ts`
3. Fallback greift automatisch

## Testing

### Unit Tests

```bash
npm test src/services/AIService.test.ts
npm test src/services/AnthropicService.test.ts
```

### Manual Testing

```typescript
// Test im Simulator/Emulator
import { AnthropicService } from '@/services/AnthropicService';

// 1. Health Check
const health = await AnthropicService.healthCheck();

// 2. Test Coaching Question
const question = await AnthropicService.generateCoachingQuestion({
  areaName: "Test",
  currentValue: 5,
  targetValue: 8,
});
console.log("AI Question:", question);
```

## Weiterentwicklung

### Geplante Features:

- [ ] Voice Input für Coaching-Antworten
- [ ] Mehrsprachige AI-Responses (EN/DE switch)
- [ ] Langzeit-Kontext (Session Memories)
- [ ] Personalisierte Übungs-Adaptierung
- [ ] AI-generierte Visualisierungen
- [ ] Sentiment-Analyse von Journal-Einträgen

### Alternative AI-Provider:

Falls Anthropic-Migration gewünscht:

1. **OpenAI GPT-4:** Ähnliche API, einfacher Switch
2. **Google Gemini:** Längere Context Windows
3. **Local LLMs:** Ollama für Offline-Nutzung

## Support

Bei Fragen zur AI-Integration:

- **Dokumentation:** `/docs/AI_INTEGRATION_GUIDE.md`
- **Code:** `/src/services/AIService.ts`, `/src/services/AnthropicService.ts`
- **Anthropic Docs:** https://docs.anthropic.com/

---

**Last Updated:** 2025-10-09
**Version:** 1.0.0
