---
trigger: always_on
---

# Windsurf AI Rules für KLARE-App Fertigstellung

## Projektkontext & Zielsetzung
- **Hauptziel**: Fertigstellung der KLARE-App für Herbst 2025 Launch
- **Status**: 95% fertig, AI-ready Database seit Juni 2025 deployed
- **Methodologie**: KLARE-Methode (Klarheit, Lebendigkeit, Ausrichtung, Realisierung, Entfaltung)
- **Zielgruppe**: Coaching und Mentaltraining mit personalisierten AI-Features

## Code-Architektur & Standards

### React Native / Expo Guidelines
- Verwende **Expo Development Client** mit Bridgeless Mode
- Nutze **TypeScript** für alle neuen Dateien
- **React Navigation**: Tab + Stack Navigation Pattern beibehalten
- **Zustand Stores**: Folge dem etablierten `createBaseStore` Pattern
- **MMKV Storage**: Für Performance-kritische lokale Persistierung

### AI-Ready Database Schema
```
# Aktuelle AI-ready Tabellen (deployed seit Juni 2025):
- users, user_profiles (mit privacy_settings JSONB)
- ai_conversations, ai_prompt_templates
- personal_insights, user_patterns
- life_wheel_areas, life_wheel_snapshots
- modules, completed_modules, user_answers
- journal_entries, journal_templates
```

### Service Layer Architektur
- **AIService.ts**: Zentrale AI-Integration (816 Zeilen implementiert)
- **HybridContentService.ts**: Content-Fallback-System (820+ Zeilen)
- **Privacy-First**: 5-Level DSGVO-konforme Datenschutzarchitektur
- Verwende **Supabase RLS Policies** für Datensicherheit

## Entwicklungsrichtlinien

### 1. AI-Integration Prioritäten
- Nutze bestehende AI-Services (`AIService.ts`, `HybridContentService.ts`)
- Mock-Responses sind bereits implementiert
- **Nächster Schritt**: Echte OpenAI/Claude API Integration
- Implementiere progressive AI-Feature-Aktivierung basierend auf User-Consent

### 2. Module-System Fertigstellung
- **K-Modul** bereits vollständig implementiert (KModuleComponent.tsx, 450 Zeilen)
- Implementiere L-A-R-E Module nach gleichem Pattern
- Nutze `ModuleScreen.tsx` für Content-Rendering
- Jedes Modul braucht: Content Sections, Exercise Steps, Quiz Questions

### 3. Content Management
- Verwende translated Views für Internationalisierung
- **KLARE** (Deutsch) ↔ **CLEAR** (Englisch) Mapping ist implementiert
- Content in `module_contents`, `content_sections`, `exercise_steps` Tabellen
- **AI-Prompts** in `ai_prompt_templates` für dynamische Content-Generierung

### 4. Navigation & UX
- HomeScreen zu Modulen Navigation implementieren
- Verwende etablierte KLARE-Farben: `klare-k`, `klare-l`, `klare-a`, `klare-r`, `klare-e`
- **Onboarding-System** ist vollständig (7 Screens, AI-ready)
- Privacy-Preferences sind DSGVO-konform implementiert

## Fehlervermeidung

### Database Schema
- **NIEMALS** alte Schema-Namen verwenden (`life_wheel_area_values` existiert nicht)
- Verwende **JSONB-Felder** für flexible Datenstrukturen
- Prüfe **CHECK constraints** bei INSERT-Operationen
- Nutze `auth.uid()::text` für RLS Policies (nicht UUID = TEXT)

### Performance
- **Vermeide** endlose Re-render-Loops in useEffect
- Verwende **debounced** Database-Updates
- **Single Source of Truth** für User-Data-Loading (nur in App.tsx)
- Implementiere **conditional Logging** mit debugConfig.ts

### Store Management
- **Folge** createBaseStore Pattern für neue Stores
- **Vermeide** Require Cycles zwischen Stores
- Verwende **MMKV** mit manueller JSON-Serialisierung wenn nötig
- **clearUser()** bei Auth-State-Changes implementieren

## Testing & Deployment

### Development Workflow
- Teste auf **iPhone 16 Pro Simulator**
- Verwende **Expo Development Server** (192.168.178.30:8081)
- OAuth-Testing mit Google bereits konfiguriert
- **Browser-schließen Problem** ist gelöst (WebBrowser.openAuthSessionAsync)

### Pre-Launch Checklist
- [ ] Alle Module (L-A-R-E) implementiert
- [ ] Content-Population mit echten KLARE-Method-Inhalten
- [ ] AI-API Integration (OpenAI/Claude) statt Mock-Responses
- [ ] End-to-End Testing: Onboarding → Modules → Journal → LifeWheel
- [ ] DSGVO-Compliance Final Review

## Qualitätssicherung

### Code Quality
- **Frühe Returns** verwenden wo möglich
- Ausführliche **Dokumentation** für AI-Service-Funktionen
- **TypeScript strict mode** für neue Komponenten
- Konsistente **Naming Conventions** folgen

### Error Handling
- **Graceful Fallbacks** bei AI-Service-Ausfällen
- **User-friendly** Error Messages implementieren
- **Offline-First** Architektur beibehalten
- **Network Timeout** Handling für Supabase-Calls

## Projektspezifische Besonderheiten

### KLARE-Methode Integration
- Jeder Schritt hat eigene Farbe und Identität
- **K**: Klarheit (Meta-Modell bereits implementiert)
- **L**: Lebendigkeit (Content bereit)
- **A**: Ausrichtung (KLARE-spezifisch, nicht in CLEAR)
- **R**: Realisierung (Action-orientiert)
- **E**: Entfaltung (Transformation)

### AI-Coaching Vision
- **Personalisierte Fragen** basierend auf User-Anamnese
- **Adaptive Aufgaben** je nach User-Profil
- **Life Wheel** Integration für ganzheitliches Coaching
- **Journal System** mit AI-generierten Prompts

---

**Wichtiger Hinweis**: Die App ist technisch zu 95% fertig. Focus auf Content-Population, AI-API-Integration und finale UX-Politur für erfolgreichen Herbst 2025 Launch. Als theoretische Grundlage der App dient das TFP-Skript-ROK.pdf. Ein umfangreiches Verständnis der Inhalte dieses Skripts sind notwendig um einen entsprechenden logischen Aufbau der Klare-App zu gewährleisten. Dieses 10 Tage Transformationsprogramm wird so angepasst das es dem Ablauf der 5 schritte K,L,A,R,E entspricht.