# EXPO DEVELOPMENT CLIENT OAUTH FIX

## Problem
- App läuft mit Expo Development Client
- Schema: exp+klaremethode:// (nicht klare-app://)
- Server: 192.168.178.30:8081

## Supabase Authentication Settings UPDATE

### Redirect URLs - Füge ALLE hinzu:

# Expo Development Client URLs
exp+klaremethode://expo-development-client/?url=http%3A%2F%2F192.168.178.30%3A8081
exp://192.168.178.30:8081/auth/callback

# Original URLs (behalten)
klare-app://auth/callback
com.blisha1.klaremethode://auth/callback

# Localhost Varianten (für verschiedene Netzwerke)
exp://localhost:8081/auth/callback
exp://127.0.0.1:8081/auth/callback

## Site URL
https://awqavfvsnqhubvbfaccv.supabase.co

## WICHTIG
Nach dem Hinzufügen der URLs in Supabase Dashboard:
1. Warte 5-10 Minuten
2. Teste OAuth erneut
3. Browser sollte sich jetzt automatisch schließen
