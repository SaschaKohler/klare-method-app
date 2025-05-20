# Internationalisierung der Klare-Methode-App

Dieses Dokument beschreibt den Prozess zur Internationalisierung der Klare-Methode-App, sowohl für die UI-Komponenten als auch für die Inhalte in der Datenbank.

## Übersicht

Die Internationalisierung besteht aus zwei Hauptteilen:

1. **Frontend-Übersetzung**: Übersetzung der UI-Komponenten mit i18next
2. **Datenbank-Übersetzung**: Übersetzung der dynamischen Inhalte in der Supabase-Datenbank

## Frontend-Übersetzung

### Struktur

Die Übersetzungsdateien befinden sich in `src/translations/` mit der folgenden Struktur:

```
src/
  translations/
    de/
      common.json      # Allgemeine Texte
      profile.json     # Profil-spezifische Texte
      navigation.json  # Navigationselemente
      lifeWheel.json   # Lebensrad-Komponente
      ...
    en/
      common.json
      profile.json
      navigation.json
      lifeWheel.json
      ...
```

### Verwendung in Komponenten

Um Übersetzungen in Komponenten zu verwenden:

```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation(['namespace', 'common']);
  
  return (
    <View>
      <Text>{t('namespace:key')}</Text>
      <Button title={t('common:actions.save')} />
    </View>
  );
}
```

### Sprachauswahl

Die Sprachauswahl wird über die `LanguageSelector`-Komponente implementiert, die in die Profilseite integriert ist. Die ausgewählte Sprache wird in MMKV gespeichert und beim App-Start geladen.

## Datenbank-Übersetzung

### Struktur

Die Datenbank verwendet eine JSONB-Spalte `translations` für jede Tabelle mit übersetzbaren Inhalten. Das Format ist:

```json
{
  "en": {
    "title": "English Title",
    "description": "English Description"
  },
  "fr": {
    "title": "Titre Français",
    "description": "Description Française"
  }
}
```

### SQL-Funktionen

Folgende SQL-Funktionen wurden implementiert:

- `get_translated_text(original_text, translations, field_name, lang_code)`: Gibt einen übersetzten Text zurück
- `set_translation(translations, lang_code, field_name, translated_text)`: Fügt eine Übersetzung hinzu
- `update_translations(table_name, schema_name, id, lang_code, translations)`: Aktualisiert Übersetzungen

### RPC-Funktionen

Für den API-Zugriff wurden RPC-Funktionen implementiert:

- `get_translated_practical_exercises(step_id, lang)`: Gibt übersetzte Übungen zurück
- `get_translated_supporting_questions(step_id, lang)`: Gibt übersetzte Fragen zurück
- `get_translated_content_sections(module_content_id, lang)`: Gibt übersetzte Inhaltsabschnitte zurück

### Views

Für jeden Tabellentyp wurden Views erstellt:

- `klare_content.translated_practical_exercises`
- `klare_content.translated_supporting_questions`
- `klare_content.translated_transformation_paths`
- `public.translated_content_sections`
- usw.

## Übersetzungs-Workflow

### Für UI-Komponenten

1. Identifizieren Sie statische Strings in den Komponenten
2. Fügen Sie Übersetzungsschlüssel zur passenden Datei in `src/translations/de/` hinzu
3. Ersetzen Sie statische Strings durch `t('key')` oder `t('namespace:key')`
4. Fügen Sie die entsprechenden Übersetzungen in `src/translations/en/` hinzu

### Für Datenbankinhalte

1. Führen Sie das Exportskript aus:
   ```
   SUPABASE_URL=xxx SUPABASE_SERVICE_ROLE_KEY=xxx node tools/translation-helper.js export-translations en > translations-en.csv
   ```

2. Bearbeiten Sie die CSV-Datei mit den übersetzten Texten

3. Importieren Sie die Übersetzungen:
   ```
   SUPABASE_URL=xxx SUPABASE_SERVICE_ROLE_KEY=xxx node tools/translation-helper.js import-translations en translations-en.csv
   ```

## Testen

Zum Testen der Übersetzungen:

1. Wechseln Sie die Sprache über die `LanguageSelector`-Komponente
2. Überprüfen Sie, ob alle UI-Elemente korrekt übersetzt sind
3. Überprüfen Sie, ob alle dynamischen Inhalte aus der Datenbank korrekt übersetzt angezeigt werden

## Hinzufügen einer neuen Sprache

Um eine neue Sprache hinzuzufügen:

1. Erstellen Sie einen neuen Ordner in `src/translations/` (z.B. `fr/`)
2. Kopieren Sie die JSON-Dateien aus `en/` und übersetzen Sie den Inhalt
3. Fügen Sie die neue Sprache zur Liste in `LanguageSelector.tsx` hinzu
4. Erstellen Sie Datenbankübersetzungen mit dem Übersetzungs-Workflow

## FAQ

**F: Warum werden meine Übersetzungen nicht angezeigt?**
A: Stellen Sie sicher, dass die Übersetzungsschlüssel korrekt sind und dass Sie den richtigen Namespace verwenden.

**F: Wie kann ich fehlende Übersetzungen behandeln?**
A: i18next fällt automatisch auf die Standardsprache zurück. Sie können auch `t('key', 'Default Text')` verwenden.

**F: Wie kann ich dynamische Werte in Übersetzungen einfügen?**
A: Verwenden Sie Interpolation: `t('greeting', { name: 'John' })` mit einem Übersetzungsschlüssel wie `"greeting": "Hallo, {{name}}!"`.
