# AI Testing Guide - Anthropic Claude Integration

## Quick Start Testing

### 1. Environment Setup

```bash
# Erstelle .env Datei
cp .env.example .env

# Füge deinen Anthropic API Key ein
# Öffne .env und setze:
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
```

### 2. App starten

```bash
# iOS
npm run ios

# Android
npm run android
```

### 3. Test-Flow

#### A) Ohne API-Key (Fallback-Testing)

1. Starte App **ohne** API-Key in `.env`
2. Registriere neuen Test-User
3. Durchlaufe Onboarding bis LifeWheelSetup
4. **Erwartung:** Mock-Fragen werden angezeigt
5. **Console:** `"ℹ️ Verwende Mock-Responses (Anthropic nicht verfügbar)"`

#### B) Mit API-Key (Echte AI-Testing)

1. Füge gültigen API-Key in `.env` ein
2. Stoppe und starte App neu
3. Registriere neuen Test-User (oder lösche alten)
4. Durchlaufe Onboarding bis LifeWheelSetup
5. **Erwartung:** AI-generierte personalisierte Fragen
6. **Console:** `"✅ Anthropic Client erfolgreich initialisiert"`

## Test-Scenarios

### Scenario 1: LifeWheel Setup mit AI-Coaching

**Schritte:**
1. Navigiere zu LifeWheelSetupScreen
2. Wähle Werte für einen Bereich (z.B. Gesundheit: IST=5, ZIEL=8)
3. Beobachte AI-Coaching-Frage

**Erwartetes Verhalten:**
- ✅ Loading-Indikator erscheint kurz
- ✅ Personalisierte Frage wird angezeigt
- ✅ Text-Input für Antwort verfügbar
- ✅ "Neue Frage generieren" Button funktioniert
- ✅ Bei Klick wird neue Frage geladen

**Beispiel-Output:**
```
AI-Frage: "Was würde sich in deinem Leben verändern, 
wenn du dich körperlich und mental gestärkt fühlst?"
```

### Scenario 2: Health Check

**Console-Test:**
```typescript
import { AnthropicService } from '@/services/AnthropicService';

const health = await AnthropicService.healthCheck();
console.log('Health:', health);
```

**Erwartetes Result:**
```json
{
  "available": true,
  "model": "claude-3-5-sonnet-20241022",
  "responseTime": 847
}
```

### Scenario 3: Coaching Question Generation

**Console-Test:**
```typescript
import { AIService } from '@/services/AIService';

const question = await AIService.generateLifeWheelCoachingQuestion({
  userId: 'test-user-id',
  areaName: 'Gesundheit',
  areaId: 'health',
  currentValue: 5,
  targetValue: 8,
});

console.log('Generated Question:', question);
```

### Scenario 4: Fallback-Mechanismus

**Test:**
1. Setze ungültigen API-Key: `ANTHROPIC_API_KEY=invalid-key`
2. Starte App neu
3. Navigiere zu LifeWheelSetup

**Erwartetes Verhalten:**
- ✅ Keine Fehler-Anzeige für User
- ✅ Vordefinierte Fragen werden verwendet
- ✅ Console: `"⚠️ ANTHROPIC_API_KEY nicht konfiguriert"`

## Performance Testing

### Response Time Benchmarks

| Feature | Erwartete Zeit | Akzeptabel |
|---------|----------------|------------|
| Coaching-Frage | 800-1200ms | < 2000ms |
| Health Check | 500-800ms | < 1500ms |
| LifeWheel Insights | 1500-2500ms | < 4000ms |

### Test-Script

```typescript
// In einer Test-Komponente oder Console
const startTime = Date.now();
const question = await AIService.generateLifeWheelCoachingQuestion({...});
const duration = Date.now() - startTime;
console.log(`Response Time: ${duration}ms`);
// Erwartung: < 2000ms
```

## Error Testing

### Test 1: Network Timeout

```bash
# Offline-Modus aktivieren im Simulator
# Entwicklermenü > Network Link Conditioner > 100% Loss
```

**Erwartetes Verhalten:**
- Request timeout nach ~30 Sekunden
- Automatischer Fallback auf Mock-Responses
- User sieht keine Error-Message

### Test 2: Rate Limit

```typescript
// 60+ Requests in kurzer Zeit senden
for (let i = 0; i < 60; i++) {
  await AIService.generateLifeWheelCoachingQuestion({...});
}
```

**Erwartetes Verhalten:**
- Nach ~50 Requests: Rate Limit Error
- Fallback aktiviert sich
- Console: `"⚠️ Anthropic API Fehler, nutze Fallback"`

### Test 3: Invalid API Key

**.env:**
```env
ANTHROPIC_API_KEY=sk-ant-invalid-key-123
```

**Erwartetes Verhalten:**
- Service nicht als "available" markiert
- Sofortiger Fallback
- Console: `"⚠️ ANTHROPIC_API_KEY nicht konfiguriert"`

## Manual Test Checklist

### LifeWheelSetupScreen

- [ ] AI-Coaching-Section wird angezeigt
- [ ] Loading-Spinner erscheint beim Laden
- [ ] Frage wird nach Loading angezeigt
- [ ] Text-Input ist funktional
- [ ] "Neue Frage generieren" lädt neue Frage
- [ ] Navigation (Vor/Zurück) funktioniert
- [ ] Bei Bereichswechsel wird neue Frage geladen
- [ ] Alle 8 Bereiche funktionieren

### Fallback-Modus

- [ ] App funktioniert ohne API-Key
- [ ] Keine Error-Messages für User
- [ ] Vordefinierte Fragen werden gezeigt
- [ ] Alle Features bleiben nutzbar

### Performance

- [ ] Keine UI-Blockierung während AI-Request
- [ ] Response-Zeit < 2 Sekunden
- [ ] Smooth Transitions
- [ ] Keine Memory Leaks

## Debugging

### Console Logs

**Erfolgreiche Initialisierung:**
```
✅ Anthropic Client erfolgreich initialisiert
```

**Fallback-Aktivierung:**
```
ℹ️ Verwende Mock-Responses (Anthropic nicht verfügbar)
```

**API-Fehler:**
```
⚠️ Anthropic API Fehler, nutze Fallback: [Error Details]
```

### React Native Debugger

```bash
# Metro Bundler Console öffnen
# Drücke 'j' für Debugger
# Chrome DevTools öffnen
```

**Breakpoints setzen:**
- `src/services/AnthropicService.ts:72` - generateResponse
- `src/services/AIService.ts:776` - generateLifeWheelCoachingQuestion

## API Usage Monitoring

### Supabase Database

```sql
-- Check AI Service Logs
SELECT 
  service_type,
  COUNT(*) as total_calls,
  AVG(response_time_ms) as avg_response_time
FROM ai_service_logs
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY service_type;

-- Check Failed Requests
SELECT *
FROM ai_service_logs
WHERE success = false
ORDER BY created_at DESC
LIMIT 10;
```

### Anthropic Dashboard

1. Login to [Anthropic Console](https://console.anthropic.com/)
2. Navigate to **Usage**
3. Check:
   - Request Count
   - Token Usage
   - Costs
   - Errors

## Known Issues

### Issue 1: "Service nicht verfügbar"

**Symptom:** AI-Features nutzen immer Fallback

**Lösung:**
```bash
# 1. Check .env existiert
ls -la .env

# 2. Check API-Key gesetzt
cat .env | grep ANTHROPIC

# 3. Metro Bundler neu starten
# Drücke 'r' im Metro Terminal
# oder
npm run ios -- --reset-cache
```

### Issue 2: TypeScript Errors

**Symptom:** Red squiggles in IDE

**Lösung:**
```bash
# TypeScript Server neu starten
# VSCode: Cmd+Shift+P > "TypeScript: Restart TS Server"
```

### Issue 3: Environment Variables nicht geladen

**Symptom:** `undefined` für `ANTHROPIC_API_KEY`

**Lösung:**
```bash
# 1. Lösche Build-Cache
rm -rf ios/build android/build

# 2. Reinstall Dependencies
npm install

# 3. Rebuild App
npm run ios
```

## Production Readiness Checklist

Vor Launch:

- [ ] API-Key in Production `.env` konfiguriert
- [ ] Rate Limiting implementiert (optional)
- [ ] Error Monitoring Setup (Sentry etc.)
- [ ] Kosten-Tracking aktiviert
- [ ] Fallback-Responses qualitätsgeprüft
- [ ] Privacy Policy updated (Anthropic erwähnt)
- [ ] User-Consent Flow getestet
- [ ] DSGVO-Compliance geprüft

## Support

**Fragen? Probleme?**

1. Check Console Logs
2. Check API-Key Konfiguration
3. Check Anthropic Dashboard (Usage/Status)
4. Check Docs: `/docs/AI_INTEGRATION_GUIDE.md`

---

**Version:** 1.0.0
**Last Updated:** 2025-10-09
