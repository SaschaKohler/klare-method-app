// src/providers/JournalTranslationProvider.tsx

import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useJournalStore from '../hooks/useJournalStore';

interface JournalTranslationProviderProps {
  children: React.ReactNode;
}

/**
 * Provider-Komponente, die sicherstellt, dass Journal-Templates und -Kategorien
 * bei Sprachänderungen aktualisiert werden.
 */
const JournalTranslationProvider: React.FC<JournalTranslationProviderProps> = ({ children }) => {
  const { i18n } = useTranslation();
  const refreshTranslations = useJournalStore(state => state.refreshTranslations);
  const loadTemplates = useJournalStore(state => state.loadTemplates);
  const loadCategories = useJournalStore(state => state.loadCategories);

  // Initial Templates und Kategorien laden
  useEffect(() => {
    loadTemplates();
    loadCategories();
  }, [loadTemplates, loadCategories]);

  // Auf Sprachänderungen reagieren
  useEffect(() => {
    // Handler für Sprachänderungen
    const handleLanguageChange = () => {
      console.log('Language changed to:', i18n.language);
      refreshTranslations();
    };

    // Event-Listener hinzufügen
    i18n.on('languageChanged', handleLanguageChange);
    
    // Event-Listener beim Unmount entfernen
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n, refreshTranslations]);

  return <>{children}</>;
};

export default JournalTranslationProvider;
