# K-Modul Fertigstellungsplan mit AI-Coaching Integration

**Priorität: HOCH**  
**Ziel**: Vollständige Fertigstellung des K-Moduls (Klarheit) mit personalisiertem AI-Coaching bis Herbst 2025

## 📊 Aktueller Status

### Datenbank-Stand
- ✅ **23 K-Module** in der Datenbank
- ✅ **6 AI-Prompt Templates** bereits vorhanden
- ✅ **45 Exercise Steps** über verschiedene Module verteilt
- ✅ **5 Quiz Questions** im K-Quiz
- ⚠️ **Viele Module ohne Content** (content_count = 0)

### K-Modul Stationen (nach order_index)

#### Phase 1: Einführung & Grundlagen (Order 1-2)
1. **k-welcome** ✅ (1 Content, AI-Template vorhanden)
2. **k-intro** ⚠️ (Kein Content)
3. **k-theory** ⚠️ (Kein Content)
4. **k-meta-model** ⚠️ (Kein Content)
5. **k-lifewheel-analysis** ✅ (1 Content, AI-Template vorhanden)

#### Phase 2: Meta-Modell Training (Order 3-6)
6. **k-metamodel-intro** ✅ (1 Content)
7. **k-metamodel-level1** ⚠️ (Kein Content, AI-Template vorhanden)
8. **k-metamodel-level2** ⚠️ (Kein Content)
9. **k-metamodel-level3** ⚠️ (Kein Content)
10. **k-lifewheel** ✅ (1 Content, 10 Exercises)
11. **k-reality-check** ✅ (1 Content, 5 Exercises)

#### Phase 3: Vertiefung & Praxis (Order 5-9)
12. **k-incongruence-finder** ⚠️ (Kein Content)
13. **k-reflection** ⚠️ (Kein Content)
14. **k-genius-gate** ⚠️ (Kein Content)
15. **k-genius-gate-practice** ✅ (1 Content, 6 Exercises, AI-Template)
16. **k-incongruence-mapping** ✅ (1 Content, 7 Exercises, AI-Template)

#### Phase 4: Integration & Abschluss (Order 10-12)
17. **k-clarity-reflection** ⚠️ (Kein Content)
18. **k-clarity-journal** ✅ (1 Content, 5 Exercises)
19. **k-clarity-journal-setup** ⚠️ (Kein Content)
20. **k-completion** ⚠️ (Kein Content, AI-Template vorhanden)
21. **k-quiz** ✅ (1 Content, 5 Quiz Questions)

## 🎯 Prioritäten für AI-Coaching Integration

### 1. Content-Vervollständigung (KRITISCH)
**Module ohne Content (12 Stück):**
- k-intro
- k-theory
- k-meta-model
- k-metamodel-level1
- k-metamodel-level2
- k-metamodel-level3
- k-incongruence-finder
- k-reflection
- k-genius-gate
- k-clarity-reflection
- k-clarity-journal-setup
- k-completion

**Aktion**: Content aus `klareModuleContent.ts` in Datenbank migrieren oder neu erstellen

### 2. AI-Prompt Templates erweitern
**Vorhandene Templates:**
- ✅ k_welcome_personalized (coaching)
- ✅ k_lifewheel_insights (analysis)
- ✅ k_metamodel_analysis (analysis)
- ✅ k_genius_gate_coaching (coaching)
- ✅ k_incongruence_insights (analysis)
- ✅ k_completion_summary (summary)

**Fehlende Templates (zu erstellen):**
- k_intro_personalized (coaching)
- k_theory_explanation (teaching)
- k_metamodel_level2_coaching (coaching)
- k_metamodel_level3_coaching (coaching)
- k_reality_check_feedback (feedback)
- k_reflection_guided (coaching)
- k_journal_prompts (prompt_generation)

### 3. User-Spezifische AI-Personalisierung

#### Datenquellen für Personalisierung:
```typescript
interface UserContextForAI {
  // Aus user_profiles
  age_range: string;
  experience_level: string;
  primary_goals: string[];
  time_commitment: string;
  
  // Aus life_wheel_areas
  lifeWheelData: {
    lowestAreas: string[];
    highestAreas: string[];
    gapAreas: string[];
  };
  
  // Aus k_module_progress
  currentPhase: string;
  completedPhases: string[];
  metamodelLevel: number;
  keyInsights: any[];
  patternsIdentified: any[];
  
  // Aus user_answers
  previousResponses: {
    exercise_id: string;
    answer_data: any;
    reflection_text: string;
  }[];
  
  // Privacy Settings
  aiPersonalizationLevel: 'basic' | 'enhanced' | 'ai' | 'predictive';
  allowsAiQuestions: boolean;
}
```

## 🔧 Technische Implementation

### Phase 1: Datenbankfehler beheben ✅
- [x] UUID/Slug Lookup in HybridContentService
- [x] Foreign Key Beziehungen korrigieren
- [x] Spalten-Mapping anpassen

### Phase 2: Content Migration (IN PROGRESS)
```typescript
// Strategie:
// 1. Prüfe lokale klareModuleContent.ts
// 2. Migriere Content zu module_contents Tabelle
// 3. Verknüpfe mit modules via module_id (UUID)
```

**Dateien zu prüfen:**
- `src/data/klareModuleContent.ts`
- `src/data/klareMethodModules.ts`

### Phase 3: AI-Service Integration
```typescript
// src/services/KModuleAICoaching.ts (NEU)
export class KModuleAICoaching {
  async getPersonalizedIntro(userId: string): Promise<string>
  async analyzeLifeWheelInsights(userId: string, lifeWheelData: any): Promise<AIInsight>
  async provideMetaModelFeedback(userId: string, userResponse: string, level: number): Promise<AIFeedback>
  async generateReflectionPrompts(userId: string, phase: string): Promise<string[]>
  async summarizeProgress(userId: string): Promise<ProgressSummary>
}
```

### Phase 4: UI-Komponenten erweitern
**Neue Komponenten:**
- `KModuleAICoach.tsx` - AI-Coach Avatar/Chat Interface
- `PersonalizedInsight.tsx` - AI-generierte Insights anzeigen
- `AdaptiveExercise.tsx` - Übungen basierend auf User-Level
- `ProgressVisualization.tsx` - AI-basierte Fortschrittsvisualisierung

### Phase 5: Privacy-First Implementation
```typescript
// Respektiere user_profiles.privacy_settings
const canUseAI = user.privacy_settings.aiEnabled && 
                 user.privacy_settings.aiPersonalizationLevel !== 'none';

if (!canUseAI) {
  // Fallback zu statischem Content
  return loadStaticModuleContent(moduleId);
}
```

## 📝 Content-Struktur für K-Module

### Beispiel: k-intro (zu erstellen)
```json
{
  "module_id": "e45a3d9e-8191-42b8-8757-c2dae95e5596",
  "title": "Einführung in die Klarheit",
  "content_type": "intro",
  "content": {
    "intro_text": "Willkommen zum ersten Schritt der KLARE-Methode...",
    "key_concepts": [
      "Was bedeutet Klarheit?",
      "Warum ist Klarheit wichtig?",
      "Das Meta-Modell der Sprache"
    ],
    "learning_objectives": [
      "Verstehe das Konzept der Klarheit",
      "Erkenne Sprachmuster in deinem Denken",
      "Lerne das Meta-Modell kennen"
    ],
    "duration_minutes": 5
  }
}
```

### AI-Prompt Template Struktur
```json
{
  "template_name": "k_intro_personalized",
  "prompt_type": "coaching",
  "module_reference": "k-intro",
  "prompt_template": "Du bist ein einfühlsamer Coach für die KLARE-Methode. Der User {{user_name}} ({{age_range}}) möchte {{primary_goal}} erreichen. Basierend auf dem Lebensrad zeigt sich, dass {{lowest_area}} Aufmerksamkeit braucht. Erstelle eine personalisierte Einführung in das K-Modul...",
  "variables": ["user_name", "age_range", "primary_goal", "lowest_area"],
  "personalization_factors": ["age_range", "experience_level", "life_wheel_data"],
  "model_settings": {
    "temperature": 0.7,
    "max_tokens": 500
  }
}
```

## 🎨 UX-Flow mit AI-Coaching

### Typischer Modul-Durchlauf:
1. **Einstieg**: AI-personalisierte Begrüßung
2. **Theorie**: Adaptive Erklärungen basierend auf Vorwissen
3. **Übung**: AI-generierte Fragen basierend auf User-Kontext
4. **Feedback**: Sofortiges AI-Feedback zu Antworten
5. **Reflexion**: AI-gestützte Reflexionsfragen
6. **Zusammenfassung**: Personalisierte Insights & nächste Schritte

### Beispiel-Interaktion:
```
User startet k-lifewheel-analysis
↓
AI lädt User-Profil & bisherige Antworten
↓
AI generiert personalisierte Einleitung:
"Hallo Sarah! Ich sehe, dass du besonders an deiner Work-Life-Balance 
arbeiten möchtest. Lass uns gemeinsam schauen, wie dein Lebensrad 
aktuell aussieht..."
↓
User füllt Lebensrad aus
↓
AI analysiert Ergebnisse in Echtzeit:
"Interessant! Deine Gesundheit (3/10) und Karriere (8/10) zeigen eine 
große Diskrepanz. Das könnte auf..."
↓
AI schlägt nächste Schritte vor:
"Basierend auf deinen Ergebnissen empfehle ich dir als nächstes 
k-reality-check, um..."
```

## 📊 Success Metrics

### Technische Metriken:
- [ ] Alle 23 K-Module haben Content (aktuell: 11/23)
- [ ] Alle Module haben AI-Prompt Templates (aktuell: 6/23)
- [ ] 100% der Exercises haben AI-Feedback-Mechanismus
- [ ] < 2s Ladezeit für AI-generierte Inhalte
- [ ] 95%+ Erfolgsrate bei AI-API-Calls

### User-Experience Metriken:
- [ ] User-Zufriedenheit mit AI-Coaching > 4.5/5
- [ ] Completion-Rate K-Modul > 80%
- [ ] Durchschnittliche Session-Dauer > 15 Min
- [ ] Wiederkehr-Rate nach 7 Tagen > 60%

## 🚀 Nächste Schritte (Priorisiert)

### Woche 1: Foundation
1. ✅ Datenbankfehler beheben
2. Content für fehlende Module erstellen/migrieren
3. AI-Prompt Templates für alle Module erstellen

### Woche 2: AI Integration
4. KModuleAICoaching Service implementieren
5. User-Context-Aggregation implementieren
6. Privacy-Checks integrieren

### Woche 3: UI & UX
7. AI-Coach UI-Komponenten erstellen
8. Adaptive Exercise Components
9. Progress Visualization mit AI-Insights

### Woche 4: Testing & Refinement
10. End-to-End Testing aller K-Module
11. AI-Response Quality Testing
12. Performance Optimization
13. User Acceptance Testing

## 📚 Referenzen

### Wichtige Dateien:
- `src/services/HybridContentService.ts` - Content Loading
- `src/services/AIService.ts` - AI Integration (816 Zeilen)
- `src/data/klareModuleContent.ts` - Lokaler Content
- `src/store/useProgressionStore.ts` - Progress Tracking
- `supabase/migrations/` - Datenbank Schema

### Datenbank-Tabellen:
- `modules` - Modul-Definitionen
- `module_contents` - Modul-Inhalte
- `ai_prompt_templates` - AI-Prompts
- `k_module_progress` - User-Progress
- `user_answers` - User-Antworten
- `life_wheel_areas` - Lebensrad-Daten

---

**Status**: In Progress  
**Letztes Update**: 20. Oktober 2025  
**Verantwortlich**: AI-Assisted Development Team
