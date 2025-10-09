# Supabase Dashboard Database Reset Guide

## 🚨 Problem

Die CLI-Befehle (`npx supabase db reset`) schlagen fehl und die `schema_migrations` Tabelle ist Supabase-managed.

## ✅ Lösung: Dashboard Reset

### Schritt 1: Dashboard öffnen

Öffne: https://supabase.com/dashboard/project/awqavfvsnqhubvbfaccv/settings/general

### Schritt 2: Database Reset durchführen

1. Scrolle nach unten zu **"Pause project"**
2. Klicke auf **"Pause project"** (wartet 10 Sekunden)
3. Nach dem Pause: Klicke auf **"Resume project"**

**ODER (direkterer Weg):**

1. Gehe zu: https://supabase.com/dashboard/project/awqavfvsnqhubvbfaccv/settings/database
2. Scrolle zu **"Reset database password"**
3. **WICHTIG**: Dieser Reset löscht ALLE Daten!
4. Gib ein neues Passwort ein
5. Bestätige mit "Reset"

### Schritt 3: Nach dem Reset

```bash
# 1. Link neu verbinden
npx supabase link --project-ref awqavfvsnqhubvbfaccv

# 2. Alle Migrationen pushen
npx supabase db push --linked

# 3. Status prüfen
npx supabase migration list --linked
```

## 🔄 Alternative: Nur neue Migrationen pushen

Falls du KEINEN kompletten Reset möchtest:

```bash
# Pushe nur die fehlenden Migrationen
npx supabase db push --linked
```

Dies fügt die beiden zurückbenannten Migrationen hinzu:
- `20250109000001_k_module_complete_flow.sql`
- `20250109000002_fix_relationships_and_constraints.sql`

## ⚡ Schnellste Lösung (EMPFOHLEN)

Da die Dateien jetzt wieder `20250109...` heißen und die Remote-DB diese Version erwartet:

```bash
# Einfach die neuen Migrationen pushen
npx supabase db push --linked
```

Das sollte jetzt funktionieren, da:
- ✅ Local: `20250109000001_k_module_complete_flow.sql` existiert
- ✅ Remote: `20250109000001` ist bereits in der History
- ✅ Supabase erkennt: "Datei vorhanden, History vorhanden" → OK!

## 🧪 Nach dem Push testen

```bash
# 1. Migration Status prüfen
npx supabase migration list --linked

# 2. App starten
npm run ios

# 3. K-Module testen
# - Öffne "Einführung in die Klarheit"
# - Teste Meta-Modell-Analyse
# - Teste Inkongruenz-Analyse
# - Prüfe Weiter-Button funktioniert
```

## 📊 Erwartetes Ergebnis

Nach erfolgreichem Push:

```
Local          | Remote         | Time (UTC)          
---------------|----------------|---------------------
20250109000001 | 20250109000001 | 2025-01-09 00:00:01  ✓
20250109000002 | 20250109000002 | 2025-01-09 00:00:02  ✓
20250610000001 | 20250610000001 | 2025-06-10 00:00:01  ✓
...alle anderen Migrationen...
```

Alle sollten synced sein!
