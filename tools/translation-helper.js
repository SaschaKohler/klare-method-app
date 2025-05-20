#!/usr/bin/env node
/**
 * Hilfsskript zum Exportieren und Importieren von Übersetzungsdaten
 * 
 * Verwendet: 
 * - export-translations: Exportiert übersetzbare Textinhalte in eine CSV-Datei
 * - import-translations: Importiert übersetzte Textinhalte aus einer CSV-Datei zurück in die Datenbank
 * 
 * Verwendung:
 * node translation-helper.js export-translations de > translations-de.csv
 * node translation-helper.js import-translations de translations-de.csv
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const csv = require('csv-parser');
const fastcsv = require('fast-csv');

// Supabase-Konfiguration (sollte in einer .env-Datei gespeichert werden)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Initialisiere Supabase-Client
const supabase = createClient(supabaseUrl, supabaseKey);

// Tabellen mit übersetzbaren Inhalten
const translatableTables = [
  { name: 'practical_exercises', schema: 'klare_content', fields: ['title', 'description'] },
  { name: 'supporting_questions', schema: 'klare_content', fields: ['question_text'] },
  { name: 'transformation_paths', schema: 'klare_content', fields: ['from_text', 'to_text'] },
  { name: 'content_sections', schema: 'public', fields: ['title', 'content'] },
  { name: 'exercise_steps', schema: 'public', fields: ['title', 'instructions'] },
  { name: 'journal_template_categories', schema: 'public', fields: ['name', 'description'] },
  { name: 'quiz_questions', schema: 'public', fields: ['question', 'explanation'] }
];
// Exportiert übersetzbare Textinhalte in eine CSV-Datei
async function exportTranslations(language) {
  // CSV-Header
  const csvData = [
    ['table_name', 'schema_name', 'id', 'field_name', 'original_text', 'translated_text']
  ];

  // Für jede Tabelle
  for (const table of translatableTables) {
    console.error(`Exportiere aus ${table.schema}.${table.name}...`);
    
    // Daten abrufen
    const { data, error } = await supabase
      .from(`${table.schema}.${table.name}`)
      .select(`id, ${table.fields.join(', ')}, translations`);
      
    if (error) {
      console.error(`Fehler beim Abrufen von ${table.name}:`, error);
      continue;
    }
    
    // Für jeden Datensatz
    for (const row of data) {
      // Für jedes übersetzbare Feld
      for (const field of table.fields) {
        if (row[field]) {
          // Prüfe, ob bereits eine Übersetzung existiert
          const translatedText = row.translations 
            && row.translations[language] 
            && row.translations[language][field] 
            ? row.translations[language][field] 
            : '';
            
          // Füge Zeile zum CSV hinzu
          csvData.push([
            table.name,
            table.schema,
            row.id,
            field,
            row[field],
            translatedText
          ]);
        }
      }
    }
  }
  
  // Ausgabe als CSV
  csvData.forEach(row => {
    console.log(row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','));
  });
}
// Importiert übersetzte Textinhalte aus einer CSV-Datei
async function importTranslations(language, filePath) {
  const translations = {};
  
  // Lese CSV-Datei
  await new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        const tableKey = `${row.schema_name}.${row.table_name}`;
        
        if (!translations[tableKey]) {
          translations[tableKey] = {};
        }
        
        if (!translations[tableKey][row.id]) {
          translations[tableKey][row.id] = {};
        }
        
        translations[tableKey][row.id][row.field_name] = row.translated_text;
      })
      .on('end', resolve)
      .on('error', reject);
  });
  
  // Für jede Tabelle
  for (const tableKey in translations) {
    const [schema, table] = tableKey.split('.');
    console.error(`Importiere in ${schema}.${table}...`);
    
    // Für jeden Datensatz
    for (const id in translations[tableKey]) {
      const fields = translations[tableKey][id];
      
      // Bestehendes Translations-Objekt abrufen
      const { data, error } = await supabase
        .from(`${schema}.${table}`)
        .select('translations')
        .eq('id', id)
        .single();
        
      if (error) {
        console.error(`Fehler beim Abrufen von Übersetzungen für ${table} ID ${id}:`, error);
        continue;
      }
      
      // Bestehende Übersetzungen aktualisieren
      const existingTranslations = data.translations || {};
      let updatedTranslations = { ...existingTranslations };
      
      // Neue Übersetzungen hinzufügen
      if (!updatedTranslations[language]) {
        updatedTranslations[language] = {};
      }
      
      for (const field in fields) {
        if (fields[field]) {
          updatedTranslations[language][field] = fields[field];
        }
      }
      
      // Übersetzungen aktualisieren
      const { error: updateError } = await supabase
        .from(`${schema}.${table}`)
        .update({ translations: updatedTranslations })
        .eq('id', id);
        
      if (updateError) {
        console.error(`Fehler beim Aktualisieren von Übersetzungen für ${table} ID ${id}:`, updateError);
      }
    }
  }
  
  console.error('Import abgeschlossen!');
}
// Hauptfunktion
async function main() {
  const command = process.argv[2];
  const language = process.argv[3];
  
  if (!language) {
    console.error('Sprachcode fehlt. Bitte gib einen Sprachcode an (z.B. de, en).');
    process.exit(1);
  }
  
  if (command === 'export-translations') {
    await exportTranslations(language);
  } else if (command === 'import-translations') {
    const filePath = process.argv[4];
    
    if (!filePath) {
      console.error('Dateipfad fehlt. Bitte gib einen Pfad zur CSV-Datei an.');
      process.exit(1);
    }
    
    await importTranslations(language, filePath);
  } else {
    console.error(`Unbekannter Befehl: ${command}`);
    console.error('Verfügbare Befehle: export-translations, import-translations');
    process.exit(1);
  }
}

// Führe das Skript aus
main().catch(error => {
  console.error('Ein Fehler ist aufgetreten:', error);
  process.exit(1);
});
