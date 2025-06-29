# Projektplan: Klare-Methode-App (Deployment Herbst 2025)

## 🎯 Vision
Dieses Dokument skizziert den detaillierten Plan, um die Klare-Methode-App erfolgreich bis zum Herbst 2025 zur Produktionsreife zu führen und in den App Stores zu veröffentlichen.

---

## Phase 1: Analyse & Fundament (Juli 2025)

**Ziel:** Eine stabile, gut getestete und verstandene Codebasis als Grundlage für die weitere Entwicklung schaffen.

-   **[ ] Code-Audit & Dokumentation:**
    -   [ ] Bestehende Komponenten, Services und State-Management-Strukturen analysieren und dokumentieren.
    -   [ ] Wichtige Code-Pfade und Datenflüsse in einem Diagramm visualisieren.
    -   [ ] `TODO`s und `FIXME`s im Code sammeln und priorisieren.
-   **[ ] Kernfunktionalität finalisieren:**
    -   [ ] Navigation vollständig implementieren und auf allen Screens testen.
    -   [ ] Authentifizierung und Benutzer-Onboarding fertigstellen.
    -   [ ] Kernmodule (K-L-A-R-E) in ihrer Grundfunktionalität implementieren.
-   **[ ] Test-Infrastruktur aufbauen:**
    -   [ ] Unit-Test-Coverage für kritische Services und Logik auf >80% erhöhen.
    -   [ ] Component-Tests für alle wiederverwendbaren UI-Komponenten erstellen.
    -   [ ] Erste E2E-Tests für die Haupt-User-Flows (Login, Navigation durch ein Modul) mit Maestro einrichten.
-   **[ ] Supabase Backend härten:**
    -   [ ] Row-Level Security (RLS) Policies für alle Tabellen überprüfen und vervollständigen.
    -   [ ] Datenbank-Schema finalisieren und auf Stabilität prüfen.
    -   [ ] Edge Functions auf Performance und Fehleranfälligkeit testen.

---

## Phase 2: Stabilisierung & Optimierung (August 2025)

**Ziel:** Die App performant, stabil und sicher machen. Fokus auf Qualitätssicherung und Backend-Integration.

-   **[ ] Performance-Optimierung:**
    -   [ ] App-Startzeit analysieren und optimieren.
    -   [ ] Re-Renders in React-Komponenten mit React DevTools aufspüren und minimieren.
    -   [ ] Bundle-Größe analysieren und unnötige Abhängigkeiten entfernen.
-   **[ ] Fehlerbehandlung & Logging:**
    -   [ ] Ein durchgängiges Fehlerbehandlungs-Konzept für Frontend und Backend implementieren.
    -   [ ] Externes Logging-Tool (z.B. Sentry) integrieren, um Fehler im Produktivbetrieb zu erfassen.
-   **[ ] E2E-Testing ausbauen:**
    -   [ ] Test-Suite für alle KLARE-Module und kritischen User-Flows vervollständigen.
    -   [ ] Tests auf verschiedenen Geräten und OS-Versionen (simuliert) durchführen.
-   **[ ] Inhalte & Lokalisierung:**
    -   [ ] Alle deutschen Texte für die UI in die `i18n`-Dateien einpflegen.
    -   [ ] Inhalte für die KLARE-Module finalisieren und integrieren.

---

## Phase 3: Release-Vorbereitung & Deployment (September 2025)

**Ziel:** Die App für die Veröffentlichung vorbereiten, Beta-Tests durchführen und in den Apple App Store und Google Play Store einreichen.

-   **[ ] Beta-Testing:**
    -   [ ] Internen Beta-Test mit einer kleinen Gruppe von Nutzern durchführen.
    -   [ ] Feedback sammeln, priorisieren und kritische Bugs beheben.
-   **[ ] App Store Vorbereitung:**
    -   [ ] App-Icons, Screenshots und Marketing-Texte erstellen.
    -   [ ] Datenschutzrichtlinie und Nutzungsbedingungen finalisieren.
    -   [ ] App Store Connect und Google Play Console Einträge vorbereiten.
-   **[ ] Finaler Schliff:**
    -   [ ] Alle `console.log` und Debug-Utilities entfernen.
    -   [ ] App-Versionierung festlegen.
    -   [ ] Letzte manuelle Tests des gesamten Funktionsumfangs.
-   **[ ] Deployment:**
    -   [ ] Release-Builds für iOS und Android erstellen.
    -   [ ] App bei Apple und Google zur Überprüfung einreichen.
    -   [ ] Launch feiern! 🎉
