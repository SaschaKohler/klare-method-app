import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { HybridContentService, PrivacyService, ContentSensitivity } from '../services/HybridContentService';

// =======================================
// PRIVACY-AWARE JOURNAL INPUT
// =======================================

interface PrivacyAwareJournalInputProps {
  templateId: string;
  questionText: string;
  onResponseSaved: (responseId: string) => void;
  userId: string;
}

export const PrivacyAwareJournalInput: React.FC<PrivacyAwareJournalInputProps> = ({
  templateId,
  questionText,
  onResponseSaved,
  userId
}) => {
  const { t } = useTranslation();
  const [responseText, setResponseText] = useState('');
  const [contentSensitivity, setContentSensitivity] = useState<ContentSensitivity | null>(null);
  const [saving, setSaving] = useState(false);
  const [showPrivacyHint, setShowPrivacyHint] = useState(false);
  
  const hybridContentService = new HybridContentService();
  const privacyService = PrivacyService.getInstance();

  // Real-time content sensitivity analysis
  useEffect(() => {
    if (responseText.length > 20) {
      const sensitivity = privacyService.classifyContentSensitivity(responseText);
      setContentSensitivity(sensitivity);
      
      // Show privacy hint for sensitive content
      if (sensitivity.level === 'intimate' || sensitivity.level === 'sensitive') {
        setShowPrivacyHint(true);
      }
    } else {
      setContentSensitivity(null);
      setShowPrivacyHint(false);
    }
  }, [responseText]);

  const handleSave = async () => {
    if (!responseText.trim()) return;
    
    setSaving(true);
    try {
      await hybridContentService.saveJournalResponse(
        userId,
        templateId,
        questionText,
        responseText
      );
      
      Alert.alert(
        t('journal.saved.title'),
        getPrivacyAwareSaveMessage(),
        [{ text: t('common.ok'), onPress: () => onResponseSaved(`response_${Date.now()}`) }]
      );
      
      setResponseText('');
      setContentSensitivity(null);
      setShowPrivacyHint(false);
      
    } catch (error) {
      console.error('Failed to save journal response:', error);
      Alert.alert(t('error'), t('journal.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  const getPrivacyAwareSaveMessage = (): string => {
    if (!contentSensitivity) return t('journal.saved.general');
    
    switch (contentSensitivity.level) {
      case 'intimate':
        return t('journal.saved.intimate');
      case 'sensitive':
        return t('journal.saved.sensitive');
      default:
        return t('journal.saved.general');
    }
  };

  const getSensitivityColor = (level: string): string => {
    switch (level) {
      case 'intimate': return '#EF4444';
      case 'sensitive': return '#F59E0B';
      default: return '#10B981';
    }
  };

  const getSensitivityIcon = (level: string): string => {
    switch (level) {
      case 'intimate': return 'lock';
      case 'sensitive': return 'security';
      default: return 'public';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.questionText}>{questionText}</Text>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.textInput,
            contentSensitivity && { borderColor: getSensitivityColor(contentSensitivity.level) }
          ]}
          value={responseText}
          onChangeText={setResponseText}
          placeholder={t('journal.input.placeholder')}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />
        
        {contentSensitivity && (
          <View style={[
            styles.sensitivityIndicator,
            { backgroundColor: getSensitivityColor(contentSensitivity.level) + '20' }
          ]}>
            <MaterialIcons 
              name={getSensitivityIcon(contentSensitivity.level) as any} 
              size={16} 
              color={getSensitivityColor(contentSensitivity.level)} 
            />
            <Text style={[
              styles.sensitivityText,
              { color: getSensitivityColor(contentSensitivity.level) }
            ]}>
              {t(`journal.sensitivity.${contentSensitivity.level}`)}
            </Text>
          </View>
        )}
      </View>

      {showPrivacyHint && (
        <PrivacyHint
          sensitivityLevel={contentSensitivity?.level || 'sensitive'}
          onDismiss={() => setShowPrivacyHint(false)}
        />
      )}

      <TouchableOpacity
        style={[styles.saveButton, saving && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={saving || !responseText.trim()}
      >
        <MaterialIcons 
          name={saving ? "hourglass-empty" : "save"} 
          size={20} 
          color="#FFFFFF" 
        />
        <Text style={styles.saveButtonText}>
          {saving ? t('journal.saving') : t('journal.save')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

// =======================================
// PRIVACY HINT COMPONENT
// =======================================

interface PrivacyHintProps {
  sensitivityLevel: 'sensitive' | 'intimate';
  onDismiss: () => void;
}

const PrivacyHint: React.FC<PrivacyHintProps> = ({ sensitivityLevel, onDismiss }) => {
  const { t } = useTranslation();
  
  const getHintConfig = () => {
    switch (sensitivityLevel) {
      case 'intimate':
        return {
          icon: 'lock',
          color: '#EF4444',
          backgroundColor: '#FEF2F2',
          borderColor: '#FEE2E2',
          title: t('privacy.hints.intimate.title'),
          message: t('privacy.hints.intimate.message')
        };
      case 'sensitive':
        return {
          icon: 'security',
          color: '#F59E0B',
          backgroundColor: '#FFFBEB',
          borderColor: '#FEF3C7',
          title: t('privacy.hints.sensitive.title'),
          message: t('privacy.hints.sensitive.message')
        };
      default:
        return {
          icon: 'info',
          color: '#6366F1',
          backgroundColor: '#EEF2FF',
          borderColor: '#E0E7FF',
          title: t('privacy.hints.general.title'),
          message: t('privacy.hints.general.message')
        };
    }
  };

  const config = getHintConfig();

  return (
    <View style={[
      styles.privacyHint,
      { 
        backgroundColor: config.backgroundColor,
        borderColor: config.borderColor
      }
    ]}>
      <View style={styles.privacyHintHeader}>
        <MaterialIcons name={config.icon as any} size={20} color={config.color} />
        <Text style={[styles.privacyHintTitle, { color: config.color }]}>
          {config.title}
        </Text>
        <TouchableOpacity onPress={onDismiss}>
          <MaterialIcons name="close" size={20} color={config.color} />
        </TouchableOpacity>
      </View>
      <Text style={styles.privacyHintMessage}>
        {config.message}
      </Text>
    </View>
  );
};

// =======================================
// CONTENT MODE SELECTOR
// =======================================

interface ContentModeSelectorProps {
  currentMode: 'static' | 'hybrid' | 'ai';
  onModeChange: (mode: 'static' | 'hybrid' | 'ai') => void;
  aiAvailable: boolean;
}

export const ContentModeSelector: React.FC<ContentModeSelectorProps> = ({
  currentMode,
  onModeChange,
  aiAvailable
}) => {
  const { t } = useTranslation();

  const modes = [
    {
      key: 'static' as const,
      title: t('content.modes.static.title'),
      description: t('content.modes.static.description'),
      icon: 'list',
      color: '#10B981',
      available: true
    },
    {
      key: 'hybrid' as const,
      title: t('content.modes.hybrid.title'),
      description: t('content.modes.hybrid.description'),
      icon: 'alt-route',
      color: '#6366F1',
      available: aiAvailable
    },
    {
      key: 'ai' as const,
      title: t('content.modes.ai.title'),
      description: t('content.modes.ai.description'),
      icon: 'smart-toy',
      color: '#F59E0B',
      available: aiAvailable
    }
  ];

  return (
    <View style={styles.modeSelector}>
      <Text style={styles.modeSelectorTitle}>{t('content.modes.title')}</Text>
      <View style={styles.modeOptions}>
        {modes.map((mode) => (
          <TouchableOpacity
            key={mode.key}
            style={[
              styles.modeOption,
              currentMode === mode.key && styles.modeOptionSelected,
              !mode.available && styles.modeOptionDisabled
            ]}
            onPress={() => mode.available && onModeChange(mode.key)}
            disabled={!mode.available}
          >
            <MaterialIcons 
              name={mode.icon as any} 
              size={24} 
              color={mode.available ? mode.color : '#9CA3AF'} 
            />
            <View style={styles.modeContent}>
              <Text style={[
                styles.modeTitle,
                !mode.available && styles.modeTextDisabled
              ]}>
                {mode.title}
              </Text>
              <Text style={[
                styles.modeDescription,
                !mode.available && styles.modeTextDisabled
              ]}>
                {mode.description}
              </Text>
            </View>
            {currentMode === mode.key && mode.available && (
              <MaterialIcons name="check-circle" size={20} color={mode.color} />
            )}
            {!mode.available && (
              <MaterialIcons name="lock" size={20} color="#9CA3AF" />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

// =======================================
// DATA LOCATION INDICATOR
// =======================================

interface DataLocationIndicatorProps {
  storageLocation: 'local_only' | 'cloud_safe' | 'ai_enabled';
  sensitivityLevel: 'public' | 'sensitive' | 'intimate';
}

export const DataLocationIndicator: React.FC<DataLocationIndicatorProps> = ({
  storageLocation,
  sensitivityLevel
}) => {
  const { t } = useTranslation();

  const getLocationConfig = () => {
    switch (storageLocation) {
      case 'local_only':
        return {
          icon: 'smartphone',
          color: '#10B981',
          title: t('storage.localOnly.title'),
          description: t('storage.localOnly.description')
        };
      case 'cloud_safe':
        return {
          icon: 'cloud',
          color: '#6366F1',
          title: t('storage.cloudSafe.title'),
          description: t('storage.cloudSafe.description')
        };
      case 'ai_enabled':
        return {
          icon: 'smart-toy',
          color: '#F59E0B',
          title: t('storage.aiEnabled.title'),
          description: t('storage.aiEnabled.description')
        };
    }
  };

  const getSensitivityConfig = () => {
    switch (sensitivityLevel) {
      case 'intimate':
        return { icon: 'lock', color: '#EF4444' };
      case 'sensitive':
        return { icon: 'security', color: '#F59E0B' };
      default:
        return { icon: 'public', color: '#10B981' };
    }
  };

  const locationConfig = getLocationConfig();
  const sensitivityConfig = getSensitivityConfig();

  return (
    <View style={styles.dataLocationIndicator}>
      <View style={styles.locationSection}>
        <MaterialIcons name={locationConfig.icon as any} size={16} color={locationConfig.color} />
        <Text style={[styles.locationText, { color: locationConfig.color }]}>
          {locationConfig.title}
        </Text>
      </View>
      
      <View style={styles.sensitivitySection}>
        <MaterialIcons name={sensitivityConfig.icon as any} size={16} color={sensitivityConfig.color} />
        <Text style={[styles.sensitivityText, { color: sensitivityConfig.color }]}>
          {t(`sensitivity.${sensitivityLevel}`)}
        </Text>
      </View>
    </View>
  );
};

// =======================================
// STYLES
// =======================================

const styles = {
  container: {
    padding: 16,
    backgroundColor: '#FFFFFF'
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#374151',
    marginBottom: 16,
    lineHeight: 24
  },
  inputContainer: {
    position: 'relative' as const,
    marginBottom: 16
  },
  textInput: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#374151',
    backgroundColor: '#FFFFFF',
    minHeight: 120
  },
  sensitivityIndicator: {
    position: 'absolute' as const,
    top: 8,
    right: 8,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  sensitivityText: {
    fontSize: 12,
    fontWeight: '600' as const,
    marginLeft: 4
  },
  privacyHint: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16
  },
  privacyHintHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: 8
  },
  privacyHintTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    flex: 1,
    marginLeft: 8
  },
  privacyHintMessage: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20
  },
  saveButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: '#6366F1',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12
  },
  saveButtonDisabled: {
    backgroundColor: '#9CA3AF'
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600' as const,
    marginLeft: 8
  },
  modeSelector: {
    marginBottom: 24
  },
  modeSelectorTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#374151',
    marginBottom: 12
  },
  modeOptions: {
    gap: 12
  },
  modeOption: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB'
  },
  modeOptionSelected: {
    borderColor: '#6366F1',
    backgroundColor: '#EEF2FF'
  },
  modeOptionDisabled: {
    backgroundColor: '#F3F4F6',
    borderColor: '#D1D5DB'
  },
  modeContent: {
    flex: 1,
    marginLeft: 12
  },
  modeTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#374151',
    marginBottom: 4
  },
  modeDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 18
  },
  modeTextDisabled: {
    color: '#9CA3AF'
  },
  dataLocationIndicator: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 16
  },
  locationSection: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const
  },
  locationText: {
    fontSize: 12,
    fontWeight: '600' as const,
    marginLeft: 4
  },
  sensitivitySection: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const
  }
};

export { PrivacyAwareJournalInput, ContentModeSelector, DataLocationIndicator };
