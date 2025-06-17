# Content Export Helper

Da Supabase SQL Editor keine direkten CSV-Exports macht, hier die einfache Methode:

## 🎯 Export-Prozess:

### 1. SQL Queries ausführen
- Öffne **Supabase SQL Editor** (altes Projekt)
- Führe **eine Query nach der anderen** aus `01_content_export.sql`
- **Download als CSV** über das Download-Icon in den Results

### 2. Lokale Speicherung
Speichere die Downloads hier:
```
migration/exports/
├── module_contents.csv
├── content_sections.csv  
├── exercise_steps.csv
├── quiz_questions.csv
├── journal_templates.csv
├── journal_categories.csv
├── users.csv
├── life_wheel_areas.csv
├── completed_modules.csv
├── personal_values.csv
├── vision_board_items.csv
├── practical_exercises.csv
├── supporting_questions.csv
└── transformation_paths.csv
```

**Das sind 14 CSV-Dateien total!**

### 3. Alternative: JSON Export
Falls CSV-Download nicht funktioniert:
- Kopiere **Query-Results** (Ctrl+A, Ctrl+C)
- Speichere als `.json` Files
- Import-Script kann beide Formate

## 🚀 Vereinfachte Export-Queries:

Führe diese **8 einzelnen Queries** aus:

```sql
-- Query 1: Module Contents
SELECT * FROM module_contents ORDER BY module_id, order_index;

-- Query 2: Content Sections  
SELECT * FROM content_sections ORDER BY module_content_id, order_index;

-- Query 3: Exercise Steps
SELECT * FROM exercise_steps ORDER BY module_content_id, order_index;

-- Query 4: Quiz Questions
SELECT * FROM quiz_questions ORDER BY module_content_id, order_index;

-- Query 5: Journal Templates
SELECT * FROM journal_templates ORDER BY category, order_index;

-- Query 6: Journal Categories
SELECT * FROM journal_template_categories ORDER BY order_index;

-- Query 7: Practical Exercises
SELECT * FROM klare_content.practical_exercises ORDER BY step_id, sort_order;

-- Query 8: Supporting Questions
SELECT * FROM klare_content.supporting_questions ORDER BY step_id, sort_order;
```

## ✅ Nach Export:
- Du hast 8 CSV/JSON Files mit deinen Inhalten
- Ready für Import ins neue Schema
- Alle Übersetzungen sind erhalten

**Viel einfacher als 69 Migrations!** 🎉
