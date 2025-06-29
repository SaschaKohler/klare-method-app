# KLARE Schritt K (Klarheit) - Implementation Guide

## 🎯 Übersicht
Implementation des ersten KLARE-Schritts mit Fokus auf Meta-Modell der Sprache als Haupttool für IST-Analyse nach TFP-Seminar Methodik.

## 📋 Implementation Phases

### Phase 1: Navigation & Core Setup ✅
- [x] Navigation-Problem analysiert (HomeScreen → ModuleScreen)
- [ ] Navigation korrigieren
- [ ] K-spezifische Module-Komponente erstellen
- [ ] ModuleScreen K-Integration

### Phase 2: Meta-Modell TFP-Integration
- [ ] Meta-Modell Exercise-Komponente 
- [ ] 5-Level Progression System
- [ ] AI-Mockup für personalisierte Fragen
- [ ] TFP-Techniken Integration

### Phase 3: Content & AI-Mockup
- [ ] Deutsche K-Module Inhalte
- [ ] AI-Coach Mockup-Responses
- [ ] Progress Tracking
- [ ] Testing & Refinement

## 🗄️ Existierende Database-Struktur

### K-Module bereits vorhanden:
```sql
-- Aus 20250611000009_initial_data_seed.sql:
'k-intro' → 'Klarheit - Einführung'
'k-meta-model' → 'Meta-Modell der Sprache'
```

### TFP-Integration bereits implementiert:
```sql
-- Meta-Model progression (Level 1-5)
-- TFP prompt templates für K-Schritt
-- Journal templates mit TFP-Focus
```

## 🎨 UI-Komponenten Plan

### KModuleComponent.tsx
- Meta-Modell Exercise Interface
- 5-Level Progression Display
- AI-Coach Integration
- German/English Support

### Meta-Model Exercise Features:
1. **Level 1**: Universalquantoren erkennen ("alle", "nie", "immer")
2. **Level 2**: Ursache-Wirkung-Verzerrungen identifizieren
3. **Level 3**: Komplexe Tilgungen aufdecken
4. **Level 4**: Vorannahmen erkennen
5. **Level 5**: Emotionale Gespräche Meta-Modell anwenden

## 🤖 AI-Mockup Strategie

### K-Schritt AI-Coach Personalities:
- **Clarity Coach**: Fokus auf Bewusste Wahrnehmung
- **Communication Expert**: Meta-Modell Spezialist
- **TFP Facilitator**: Technische NLP-Integration

### Mock Response Types:
- Onboarding Welcome (warmth + safety)
- Meta-Model Analysis (precision + insight)
- Progress Feedback (encouragement + challenge)
- Exercise Guidance (step-by-step + personalization)

## 📱 Navigation Fix

### Problem identifiziert:
```typescript
// HomeScreen.tsx:724
navigation.navigate("Modules" as never, { 
  step: activity.step,
  autoOpen: true 
} as never);

// Aber MainNavigator.tsx hat nur:
<Stack.Screen name="ModuleScreen" component={ModuleScreen} />
```

### Lösung:
```typescript
// Korrigiere zu:
navigation.navigate("ModuleScreen" as never, { 
  stepId: activity.step,
  moduleId: `${activity.step.toLowerCase()}-intro`
} as never);
```

## 🔄 Next Steps

1. **HomeScreen Navigation Fix** → ModuleScreen mit korrekten Parameters
2. **KModuleComponent erstellen** → Meta-Modell Focus
3. **AI-Mockup Integration** → Personalisierte K-Coaching
4. **Content Population** → Deutsche Inhalte für K-Module
5. **Testing** → User Flow vom HomeScreen zu K-Modulen

---

**Ziel**: User kann vom HomeScreen direkt zu K-Modulen navigieren und mit Meta-Modell der Sprache beginnen.
