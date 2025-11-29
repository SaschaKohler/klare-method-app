// src/components/KModuleAICoach.tsx
/**
 * AI-Coach Komponente für K-Module
 * 
 * Zeigt personalisierte AI-generierte Coaching-Inhalte an
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, Avatar, Button, ActivityIndicator, useTheme, Chip } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import KModuleAICoaching, { AIInsight } from '../services/KModuleAICoaching';
import { useUserStore } from '../store/useUserStore';

interface KModuleAICoachProps {
  moduleId: string;
  moduleName: string;
  showIntro?: boolean;
  showInsights?: boolean;
  lifeWheelData?: any;
}

export const KModuleAICoach: React.FC<KModuleAICoachProps> = ({
  moduleId,
  moduleName,
  showIntro = false,
  showInsights = false,
  lifeWheelData
}) => {
  const theme = useTheme();
  const user = useUserStore(state => state.user);
  
  const [loading, setLoading] = useState(false);
  const [introText, setIntroText] = useState<string>('');
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (showIntro && user?.id) {
      loadPersonalizedIntro();
    }
  }, [showIntro, user?.id]);

  useEffect(() => {
    if (showInsights && user?.id && lifeWheelData) {
      loadInsights();
    }
  }, [showInsights, user?.id, lifeWheelData]);

  const loadPersonalizedIntro = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const intro = await KModuleAICoaching.getPersonalizedIntro(user.id);
      setIntroText(intro);
    } catch (err) {
      console.error('Error loading personalized intro:', err);
      setError('Konnte personalisierte Einführung nicht laden');
    } finally {
      setLoading(false);
    }
  };

  const loadInsights = async () => {
    if (!user?.id || !lifeWheelData) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const aiInsights = await KModuleAICoaching.analyzeLifeWheelInsights(user.id, lifeWheelData);
      setInsights(aiInsights);
    } catch (err) {
      console.error('Error loading insights:', err);
      setError('Konnte Insights nicht laden');
    } finally {
      setLoading(false);
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'insight':
        return 'bulb-outline';
      case 'warning':
        return 'alert-circle-outline';
      case 'encouragement':
        return 'heart-outline';
      case 'suggestion':
        return 'arrow-forward-circle-outline';
      default:
        return 'information-circle-outline';
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'insight':
        return '#6366F1'; // Indigo
      case 'warning':
        return '#F59E0B'; // Amber
      case 'encouragement':
        return '#10B981'; // Green
      case 'suggestion':
        return '#8B5CF6'; // Purple
      default:
        return theme.colors.primary;
    }
  };

  if (loading) {
    return (
      <Card style={styles.card}>
        <Card.Content style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Dein AI-Coach bereitet sich vor...</Text>
        </Card.Content>
      </Card>
    );
  }

  if (error) {
    return (
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={32} color={theme.colors.error} />
            <Text style={styles.errorText}>{error}</Text>
            <Button mode="outlined" onPress={() => showIntro ? loadPersonalizedIntro() : loadInsights()}>
              Erneut versuchen
            </Button>
          </View>
        </Card.Content>
      </Card>
    );
  }

  return (
    <View style={styles.container}>
      {/* Personalisierte Einführung */}
      {showIntro && introText && (
        <Card style={[styles.card, styles.introCard]}>
          <Card.Content>
            <View style={styles.coachHeader}>
              <Avatar.Icon 
                size={48} 
                icon="account-tie" 
                style={{ backgroundColor: theme.colors.primary }}
              />
              <View style={styles.coachInfo}>
                <Text variant="titleMedium" style={styles.coachName}>Dein AI-Coach</Text>
                <Text variant="bodySmall" style={styles.coachSubtitle}>Personalisiert für dich</Text>
              </View>
              <Chip compact icon="star-four-points" style={styles.aiChip}>AI</Chip>
            </View>
            
            <View style={styles.messageContainer}>
              <Text style={styles.introText}>{introText}</Text>
            </View>
          </Card.Content>
        </Card>
      )}

      {/* AI-Insights */}
      {showInsights && insights.length > 0 && (
        <View style={styles.insightsContainer}>
          <Text variant="titleMedium" style={styles.insightsTitle}>
            Deine persönlichen Insights
          </Text>
          
          {insights.map((insight, index) => (
            <Card key={index} style={[styles.card, styles.insightCard]}>
              <Card.Content>
                <View style={styles.insightHeader}>
                  <Ionicons 
                    name={getInsightIcon(insight.type) as any} 
                    size={24} 
                    color={getInsightColor(insight.type)} 
                  />
                  <Text 
                    variant="titleSmall" 
                    style={[styles.insightTitle, { color: getInsightColor(insight.type) }]}
                  >
                    {insight.title}
                  </Text>
                </View>
                
                <Text style={styles.insightContent}>{insight.content}</Text>
                
                {insight.actionable && (
                  <Button 
                    mode="text" 
                    icon="arrow-right"
                    style={styles.actionButton}
                    onPress={() => {
                      // Navigation zu related module
                      console.log('Navigate to:', insight.relatedModule);
                    }}
                  >
                    Mehr erfahren
                  </Button>
                )}
              </Card.Content>
            </Card>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  card: {
    marginVertical: 8,
    elevation: 2,
  },
  introCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#6366F1',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    opacity: 0.7,
  },
  errorContainer: {
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  errorText: {
    textAlign: 'center',
    opacity: 0.7,
  },
  coachHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  coachInfo: {
    flex: 1,
  },
  coachName: {
    fontWeight: '600',
  },
  coachSubtitle: {
    opacity: 0.6,
  },
  aiChip: {
    backgroundColor: '#6366F1',
  },
  messageContainer: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
  },
  introText: {
    lineHeight: 24,
  },
  insightsContainer: {
    gap: 12,
  },
  insightsTitle: {
    marginBottom: 8,
    fontWeight: '600',
  },
  insightCard: {
    borderLeftWidth: 3,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  insightTitle: {
    fontWeight: '600',
  },
  insightContent: {
    lineHeight: 22,
    opacity: 0.8,
  },
  actionButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
});

export default KModuleAICoach;
