# HomeScreen Test Issue

## Problem
Die Unit Tests für `HomeScreen.tsx` schlagen fehl, weil die Komponente nicht vollständig gerendert wird.

### Symptome
- Test-Output zeigt nur `<RNCSafeAreaProvider />` ohne Inhalte
- `getByText()` findet keine UI-Elemente
- Keine Fehlermeldungen, aber auch kein Content

### Root Cause
1. **Complex Component**: `HomeScreen` hat viele Dependencies (`useKlareStores`, `useTheme`, `KlareMethodCards`, etc.)
2. **Mock Incomplete**: Der `useKlareStores` Mock wird nicht korrekt angewendet oder gibt unvollständige Daten zurück
3. **Silent Failures**: React Native Testing Library zeigt keine Render-Errors an

## Lösungsansätze

### ✅ Empfohlen: Vereinfachte Tests
Statt vollständiges Screen-Rendering zu testen, fokussiere auf:

1. **Logic Tests**: Teste einzelne Funktionen (z.B. `getGreeting`, `getNextActivities`)
2. **Snapshot Tests**: Verwende Snapshots für Struktur-Validierung
3. **E2E Tests**: Nutze Maestro für echte User-Flows

### Beispiel: Logic Test
```typescript
// src/screens/__tests__/HomeScreen.logic.test.ts
describe('HomeScreen Logic', () => {
  describe('getGreeting', () => {
    it('returns morning greeting before 12:00', () => {
      const hour = 10;
      const greeting = getGreeting(hour);
      expect(greeting).toBe('Guten Morgen');
    });
  });
});
```

### Beispiel: Snapshot Test
```typescript
it('matches snapshot with full data', () => {
  const { toJSON } = renderHomeScreen();
  expect(toJSON()).toMatchSnapshot();
});
```

## Warum nicht fixen?
- **Aufwand vs. Nutzen**: Vollständiges Mocking aller Dependencies ist sehr aufwendig
- **Bessere Alternativen**: E2E Tests (Maestro) testen realistischer
- **Maintenance**: Unit Tests für komplexe Screens sind schwer zu warten

## Nächste Schritte
1. ✅ Syntax-Fehler behoben (`{{ ... }}` entfernt)
2. ✅ i18n defaultValues hinzugefügt
3. ✅ Store-Mocks erweitert
4. ⏭️ **Empfehlung**: Tests vereinfachen oder durch E2E ersetzen

## Referenzen
- Maestro Tests: `e2e/flows/klare-method-navigation.yaml`
- Store Mocks: `src/screens/__tests__/HomeScreen.test.tsx`
- Component: `src/screens/HomeScreen.tsx`
