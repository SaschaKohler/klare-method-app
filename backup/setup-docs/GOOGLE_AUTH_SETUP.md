# Google OAuth Setup für die KLARE Methode App

Diese Anleitung beschreibt, wie die Google OAuth-Authentifizierung für die KLARE Methode App korrekt eingerichtet wird.

## Voraussetzungen

- Zugang zur [Google Cloud Console](https://console.cloud.google.com/)
- Zugang zum [Supabase Dashboard](https://app.supabase.com/)
- Die KLARE Methode App Codebase

## Schritt 1: Konfiguration in der Google Cloud Console

1. Gehe zur [Google Cloud Console](https://console.cloud.google.com/) und wähle dein Projekt aus (oder erstelle ein neues)
2. Navigiere zu "APIs & Dienste" > "Anmeldedaten"
3. Klicke auf "+ Anmeldedaten erstellen" > "OAuth-Client-ID"
4. Wähle als Anwendungstyp "Web-Anwendung"
5. Gib einen Namen für den Client ein (z.B. "KLARE App OAuth")
6. Füge unter "Autorisierte Weiterleitungs-URIs" folgende URI hinzu:
   ```
   https://wxnjfyrkcqwnjjtlufhg.supabase.co/auth/v1/callback
   ```
7. Klicke auf "Erstellen"
8. Notiere dir die Client-ID und das Client-Secret

## Schritt 2: Konfiguration in Supabase

1. Gehe zum [Supabase Dashboard](https://app.supabase.com/)
2. Wähle dein KLARE-Methode-Projekt aus
3. Navigiere zu "Authentication" > "URL Configuration"
4. Stelle sicher, dass die Site URL korrekt ist:
   ```
   https://wxnjfyrkcqwnjjtlufhg.supabase.co
   ```
5. Füge unter "Redirect URLs" folgende URL hinzu:
   ```
   klare-app://auth/callback
   ```
6. Gehe zu "Authentication" > "Providers"
7. Aktiviere "Google" und trage die Client-ID und das Client-Secret ein, die du von der Google Cloud Console erhalten hast
8. Speichere die Änderungen

## Schritt 3: App-Konfiguration überprüfen

Führe den Auth-Check-Skript aus, um zu verifizieren, dass alle Einstellungen korrekt sind:

```bash
npm run check-auth
```

Dieser Skript überprüft:
- Die korrekte Konfiguration in app.json
- Vorhandensein der notwendigen Umgebungsvariablen in .env
- Die URL-Schemes und Intent-Filter für iOS und Android

## Schritt 4: App neu bauen und testen

Nach allen Änderungen ist es wichtig, die App neu zu bauen:

```bash
# Für iOS
npm run ios

# Für Android
npm run android
```

## Fehlerbehebung

### Safari kann die Seite nicht öffnen

Wenn beim Anmelden mit Google der Fehler "Safari cannot open the page because the address is invalid" erscheint:

1. Überprüfe, ob das URL-Schema in app.json korrekt konfiguriert ist
2. Stelle sicher, dass die Redirect-URL in Supabase exakt `klare-app://auth/callback` lautet
3. Vergewissere dich, dass die iOS-spezifischen URL-Typen in app.json konfiguriert sind
4. Prüfe, ob die Authorized Redirect URI in der Google Cloud Console korrekt ist
5. Baue die App nach den Änderungen neu

### Weitere Unterstützung

Bei anhaltenden Problemen kann über den "Konfiguration anzeigen" Button im Fehlerdialog eine detaillierte Übersicht aller Deep-Link-Einstellungen angezeigt werden.

## Wichtige Dateien

Die folgenden Dateien sind für die Authentifizierung relevant:

- `src/lib/supabase.ts` - Supabase-Konfiguration und Deep-Link-Handler
- `src/store/useUserStore.ts` - Authentifizierungsmethoden
- `src/screens/AuthScreen.tsx` - Anmelde-UI und Social Login-Buttons
- `app.json` - Deep-Link-Konfiguration für iOS und Android
