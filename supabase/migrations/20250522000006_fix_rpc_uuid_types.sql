-- Migration: Korrektur der RPC-Funktion für korrekte UUID-Datentypen

-- Alte Funktion löschen
DROP FUNCTION IF EXISTS get_translated_life_wheel_areas(TEXT, TEXT);

-- RPC-Funktion mit korrigierten Datentypen neu erstellen
