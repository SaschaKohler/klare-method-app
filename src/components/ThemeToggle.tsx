import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Switch, Text, useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../store/useThemeStore';

interface ThemeToggleProps {
  showLabel?: boolean;
}

export default function ThemeToggle({ showLabel = true }: ThemeToggleProps) {
  const theme = useTheme();
  const { getActiveTheme, toggleTheme, isSystemTheme, setSystemTheme } = useThemeStore();
  const isDarkMode = getActiveTheme();

  return (
    <View style={styles.container}>
      {showLabel && (
        <Text style={[styles.label, { color: theme.colors.text }]}>
          {isDarkMode ? 'Dunkelmodus' : 'Hellmodus'}
        </Text>
      )}
      
      <View style={styles.toggleRow}>
        <Ionicons 
          name="sunny" 
          size={20} 
          color={!isDarkMode ? theme.colors.primary : theme.colors.text} 
        />
        
        <Switch
          value={isDarkMode}
          onValueChange={toggleTheme}
          color={theme.colors.primary}
          style={styles.switch}
        />
        
        <Ionicons 
          name="moon" 
          size={20} 
          color={isDarkMode ? theme.colors.primary : theme.colors.text} 
        />
      </View>
      
      <View style={styles.systemRow}>
        <Switch
          value={isSystemTheme}
          onValueChange={setSystemTheme}
          color={theme.colors.primary}
          style={styles.systemSwitch}
        />
        <Text style={{ color: theme.colors.text, fontSize: 12 }}>
          Systemeinstellung verwenden
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
  },
  label: {
    marginBottom: 8,
    fontWeight: '500',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  switch: {
    marginHorizontal: 8,
  },
  systemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  systemSwitch: {
    marginRight: 8,
  },
});