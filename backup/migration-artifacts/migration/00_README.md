# Clean Slate Migration - KLARE App Database

## 🎯 Ziel: Von 69 chaotischen Migrations zu sauberer AI-Ready Architektur

Dieses Verzeichnis enthält alle Scripts für die komplette Database-Migration basierend auf deiner **Adaptive KLARE Strategy**.

## 📁 Migration Files

### Phase 0: Content Export & Backup
- `01_content_export.sql` - Exportiert alle wertvollen Inhalte
- `02_verification_queries.sql` - Prüft Export-Qualität

### Phase 1: New Schema  
- `03_ai_ready_schema.sql` - Komplettes neues Schema (AI-ready)
- `04_initial_data.sql` - KLARE Module & Basis-Daten

### Phase 2: Content Import
- `05_content_import.sql` - Importiert deine Inhalte in neue Struktur
- `06_translation_migration.sql` - JSONB → Normalized Translation System

### Phase 3: Verification & Cleanup
- `07_data_verification.sql` - Prüft Migration-Erfolg
- `08_performance_optimization.sql` - Indizes & Performance-Tuning

## 🚀 Migration Steps

### SCHRITT 1: Content sichern
```bash
# In Supabase SQL Editor:
cat 01_content_export.sql | psql your_supabase_connection
```

### SCHRITT 2: Neues Schema deployen
```bash
# Neues Supabase-Projekt oder Database Reset
cat 03_ai_ready_schema.sql | psql new_supabase_connection
```

### SCHRITT 3: Content importieren
```bash
# Nach CSV-Upload in Supabase:
cat 05_content_import.sql | psql new_supabase_connection
```

### SCHRITT 4: App-Config updaten
- Update `.env` mit neuer Supabase URL/Keys
- Update `src/types/supabase.ts` mit neuen Types
- Test alle Features

## ✅ Success Criteria

Nach der Migration solltest du haben:
- [ ] Alle aktuellen App-Funktionen funktionieren
- [ ] Saubere, AI-ready Database-Architektur  
- [ ] Normalized Translation System
- [ ] Basis für deine 16-Wochen Adaptive KLARE Strategy
- [ ] Weniger als 10 Migration-Files statt 69

## 🆘 Rollback Plan

Falls etwas schief geht:
1. Behalte alte Supabase-Projekt als Backup
2. Verwende `old_project_backup.sql` für Wiederherstellung
3. Update `.env` zurück auf alte Credentials

## 📞 Support

Bei Problemen: Alle Scripts sind dokumentiert und haben Verification-Queries.
