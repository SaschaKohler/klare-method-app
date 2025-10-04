# KLARE Methode App

Eine mobile App zur Begleitung bei der Veränderungsarbeit mit der KLARE Methode.

## Über das Projekt

Die KLARE Methode ist ein 5-Schritte-Prozess für persönliche Transformation:

- **K**larheit über die aktuelle Situation
- **L**ebendigkeit erkennen und Ressourcen nutzen
- **A**usrichtung der Lebensbereiche
- **R**ealisierung im Alltag
- **E**ntfaltung durch vollständige Kongruenz

Diese App unterstützt Benutzer dabei, die KLARE Methode in ihrem Leben anzuwenden.

## Technologien

- React Native mit Expo
- TypeScript
- Supabase (Backend)
- React Navigation
- React Native Paper

## Erste Schritte

### Voraussetzungen

- Node.js (>=14.0.0)
- npm oder yarn
- Expo CLI

### Installation

1. Repository klonen

   ```bash
   git clone [repository-url]
   cd klare-methode-app
   ```

2. Abhängigkeiten installieren

   ```bash
   npm install
   # oder
   yarn
   ```

3. `.env` Datei erstellen (siehe `.env.example`)

4. App starten

   ```bash
   npm start
   # oder
   yarn start
   ```

## Supabase Setup

1. Supabase-Projekt erstellen unter [supabase.com](https://supabase.com)
2. SQL-Migrations-Dateien im Supabase SQL-Editor ausführen

## Tests

- **Unit-/Store-Tests**: `npm test`
- **Supabase Integrations-Tests** (gegen nicht-produktive DB):

  1. `.env.test` mit folgenden Variablen anlegen:

     ```env
     RUN_DB_TESTS=true
     SUPABASE_TEST_URL=<https://...>
     SUPABASE_TEST_SERVICE_KEY=<service-role-key>
     ```

  2. Befehl ausführen:

     ```bash
     RUN_DB_TESTS=true npx jest src/store/__tests__/integration --runInBand
     ```

  Der Guard `RUN_DB_TESTS` verhindert, dass Integrations-Tests versehentlich gegen Produktivinstanzen laufen.

## Funktionen

- Benutzerauthentifizierung
- Lebensrad zur Standortbestimmung
- Interaktive Darstellung der KLARE Methode
- Fortschrittsverfolgung
- Übungen und Ressourcen

## Copyright & Lizenz

© 2025 Sascha Kohler. Alle Rechte vorbehalten.

Diese Software und die zugehörige Dokumentation sind urheberrechtlich geschützt. Die KLARE Methode ist eine geschützte Methodologie, entwickelt von Sascha Kohler.

**Proprietäre Softwarelizenz**  
Unbefugte Verwendung, Reproduktion oder Verteilung dieser Software, der Dokumentation oder der KLARE Methode ist ohne ausdrückliche schriftliche Genehmigung des Urheberrechtsinhabers nicht gestattet.

Kontakt für Lizenz- und Nutzungsanfragen: [office@sascha-kohler.at](mailto:office@sascha-kohler.at)

## Entwickelt von

Sascha Kohler - [skit.sascha-kohler.at](https://skit.sascha-kohler.at)
