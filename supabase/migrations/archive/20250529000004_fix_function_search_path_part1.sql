-- Migration: Fix all function search_path security warnings (Part 1)
-- This addresses functions with mutable search_path from Supabase Database Linter

-- The Problem: Functions without SET search_path = '' are vulnerable to search path injection
-- The Solution: Add SET search_path = '' to all functions to prevent malicious schema manipulation

-- 1. Utility Functions
-- Fix set_updated_at function
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

-- Fix update_modified_column function  
CREATE OR REPLACE FUNCTION public.update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

-- 2. Translation Core Functions
-- Fix get_translated_text function
CREATE OR REPLACE FUNCTION public.get_translated_text(
  original_text TEXT, 
  translations JSONB, 
  field_name TEXT, 
  lang_code TEXT DEFAULT 'en'
) 
RETURNS TEXT AS $$
BEGIN
  IF translations ? lang_code AND translations->lang_code ? field_name THEN
    RETURN translations->lang_code->>field_name;
  ELSE
    RETURN original_text;
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE SET search_path = '';

-- Fix set_translation function
CREATE OR REPLACE FUNCTION public.set_translation(
  translations JSONB, 
  lang_code TEXT, 
  field_name TEXT, 
  translated_text TEXT
) 
RETURNS JSONB AS $$
DECLARE
  lang_obj JSONB;
BEGIN
  IF translations ? lang_code THEN
    lang_obj := translations->lang_code;
  ELSE
    lang_obj := '{}'::jsonb;
  END IF;
  
  lang_obj := jsonb_set(lang_obj, ARRAY[field_name], to_jsonb(translated_text));
  RETURN jsonb_set(translations, ARRAY[lang_code], lang_obj);
END;
$$ LANGUAGE plpgsql IMMUTABLE SET search_path = '';
