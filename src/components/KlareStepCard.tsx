import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { KlareStep } from '../data/klareMethodData';
import { klareColors } from '../constants/theme';

interface KlareStepCardProps {
  step: KlareStep;
  progress: number;
  isActive?: boolean;
  onPress: () => void;
}

const KlareStepCard: React.FC<KlareStepCardProps> = ({
  step,
  progress,
  isActive = false,
  onPress,
}) => {
  // Calculate minutes based on progress (just for UI example)
  const minutes = Math.round(progress * 35);
  
  // Dynamic descriptions for each step
  const getStepDescription = () => {
    switch (step.id) {
      case 'K':
        return "Erkenne klar deine aktuelle Situation ohne Beschönigung.";
      case 'L':
        return "Aktiviere deine natürlichen Energiequellen und Ressourcen.";
      case 'A':
        return "Bringe alle Lebensbereiche in Einklang mit deinen Werten.";
      case 'R':
        return "Setze konkrete Schritte in deinem Alltag um.";
      case 'E':
        return "Erlebe mühelose Manifestation durch Kongruenz.";
      default:
        return "";
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { borderColor: isActive || progress > 0 ? step.color : 'transparent' },
      ]}
      onPress={onPress}
    >
      <View style={styles.header}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: `${step.color}20` },
          ]}
        >
          <Ionicons
            name={step.iconName as any}
            size={22}
            color={step.color}
          />
        </View>
        
        <Text style={styles.minutes}>
          {minutes} Min.
        </Text>
      </View>
      
      <Text style={[styles.letter, { color: step.color }]}>
        {step.id}
      </Text>
      
      <Text style={styles.title}>{step.title}</Text>
      
      <Text style={styles.description}>
        {getStepDescription()}
      </Text>
      
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill,
              { 
                width: `${progress * 100}%`,
                backgroundColor: step.color 
              }
            ]} 
          />
        </View>
        
        <View style={styles.progressLabels}>
          <Text style={styles.progressText}>Fortschritt</Text>
          <Text style={styles.progressValue}>
            {Math.round(progress * 100)}%
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 170,
    minHeight: 220,
    backgroundColor: klareColors.cardBackground,
    borderRadius: 20,
    marginRight: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: klareColors.cardBorder,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  minutes: {
    color: klareColors.textSecondary,
    fontSize: 12,
  },
  letter: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: klareColors.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 13,
    color: klareColors.textSecondary,
    marginBottom: 16,
    lineHeight: 18,
    flex: 1,
  },
  progressBarContainer: {
    marginTop: 'auto',
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
    position: 'relative',
  },
  progressFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 2,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressText: {
    fontSize: 12,
    color: klareColors.textSecondary,
  },
  progressValue: {
    fontSize: 12,
    color: klareColors.text,
    fontWeight: '600',
  },
});

export default KlareStepCard;