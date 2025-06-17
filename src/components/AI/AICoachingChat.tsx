      t('ai.disable', { defaultValue: 'Disable AI' }),
      t('ai.disableConfirm', { 
        defaultValue: 'Are you sure you want to disable AI features? This will clear your current conversation.' 
      }),
      [
        { text: t('common.cancel', { defaultValue: 'Cancel' }), style: 'cancel' },
        { 
          text: t('ai.disable', { defaultValue: 'Disable' }), 
          style: 'destructive',
          onPress: () => {
            disableAI();
            setShowPrivacySettings(false);
          }
        }
      ]
    );
  };
  
  const renderMessage = (message: any, index: number) => {
    const isUser = message.type === 'user';
    const isSystem = message.type === 'system';
    
    if (isSystem) return null; // Don't show system messages
    
    return (
      <View
        key={message.id}
        style={[
          styles.messageContainer,
          isUser ? styles.userMessage : styles.aiMessage
        ]}
      >
        <View style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.aiBubble
        ]}>
          <Text style={[
            styles.messageText,
            isUser ? styles.userText : styles.aiText
          ]}>
            {message.content}
          </Text>
          
          {/* Show insights if available */}
          {message.insights && message.insights.length > 0 && (
            <View style={styles.insightsContainer}>
              <Text style={styles.insightsTitle}>
                {t('ai.insights', { defaultValue: 'Insights' })}
              </Text>
              {message.insights.map((insight: PersonalInsight, idx: number) => (
                <View key={idx} style={styles.insightItem}>
                  <MaterialIcons name="lightbulb-outline" size={16} color="#F59E0B" />
                  <Text style={styles.insightText}>{insight.title}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
        
        <Text style={styles.messageTime}>
          {message.timestamp.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </Text>
      </View>
    );
  };
  
  const renderPrivacySettings = () => (
    <View style={styles.privacyOverlay}>
      <View style={styles.privacyModal}>
        <View style={styles.privacyHeader}>
          <Text style={styles.privacyTitle}>
            {t('ai.privacySettings', { defaultValue: 'AI Privacy Settings' })}
          </Text>
          <TouchableOpacity
            onPress={() => setShowPrivacySettings(false)}
            style={styles.closeButton}
          >
            <MaterialIcons name="close" size={24} color="#64748B" />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.privacyContent}>
          <Text style={styles.privacyDescription}>
            {t('ai.privacyDescription', {
              defaultValue: 'Choose how you want to use AI features in your KLARE journey. You can change these settings anytime.'
            })}
          </Text>
          
          <View style={styles.privacyOption}>
            <TouchableOpacity
              style={[styles.optionButton, !isAIEnabled && styles.optionButtonActive]}
              onPress={() => isAIEnabled && handleDisableAI()}
            >
              <MaterialIcons name="block" size={24} color={!isAIEnabled ? "#fff" : "#64748B"} />
              <View style={styles.optionContent}>
                <Text style={[styles.optionTitle, !isAIEnabled && styles.optionTitleActive]}>
                  {t('ai.disableAI', { defaultValue: 'No AI Features' })}
                </Text>
                <Text style={[styles.optionDescription, !isAIEnabled && styles.optionDescriptionActive]}>
                  {t('ai.disableDescription', { defaultValue: 'Use only static content. All data stays local.' })}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
          
          <View style={styles.privacyOption}>
            <TouchableOpacity
              style={[
                styles.optionButton, 
                isAIEnabled && privacyPreferences.aiPersonalizationLevel === 'basic' && styles.optionButtonActive
              ]}
              onPress={() => handleEnableAI('basic')}
            >
              <MaterialIcons name="psychology" size={24} color={
                isAIEnabled && privacyPreferences.aiPersonalizationLevel === 'basic' ? "#fff" : "#64748B"
              } />
              <View style={styles.optionContent}>
                <Text style={[
                  styles.optionTitle, 
                  isAIEnabled && privacyPreferences.aiPersonalizationLevel === 'basic' && styles.optionTitleActive
                ]}>
                  {t('ai.basicAI', { defaultValue: 'Basic AI Coaching' })}
                </Text>
                <Text style={[
                  styles.optionDescription,
                  isAIEnabled && privacyPreferences.aiPersonalizationLevel === 'basic' && styles.optionDescriptionActive
                ]}>
                  {t('ai.basicDescription', { defaultValue: 'AI coaching with privacy-safe personalization.' })}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
          
          <View style={styles.privacyOption}>
            <TouchableOpacity
              style={[
                styles.optionButton, 
                isAIEnabled && privacyPreferences.aiPersonalizationLevel === 'advanced' && styles.optionButtonActive
              ]}
              onPress={() => handleEnableAI('advanced')}
            >
              <MaterialIcons name="auto_awesome" size={24} color={
                isAIEnabled && privacyPreferences.aiPersonalizationLevel === 'advanced' ? "#fff" : "#64748B"
              } />
              <View style={styles.optionContent}>
                <Text style={[
                  styles.optionTitle,
                  isAIEnabled && privacyPreferences.aiPersonalizationLevel === 'advanced' && styles.optionTitleActive
                ]}>
                  {t('ai.advancedAI', { defaultValue: 'Advanced AI Coaching' })}
                </Text>
                <Text style={[
                  styles.optionDescription,
                  isAIEnabled && privacyPreferences.aiPersonalizationLevel === 'advanced' && styles.optionDescriptionActive
                ]}>
                  {t('ai.advancedDescription', { defaultValue: 'Full AI personalization with insights and content generation.' })}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
          
          <View style={styles.serviceHealth}>
            <Text style={styles.healthTitle}>
              {t('ai.serviceStatus', { defaultValue: 'Service Status' })}
            </Text>
            <View style={styles.healthIndicator}>
              <View style={[
                styles.healthDot,
                { backgroundColor: serviceHealth.status === 'healthy' ? '#10B981' : 
                                 serviceHealth.status === 'degraded' ? '#F59E0B' : '#EF4444' }
              ]} />
              <Text style={styles.healthText}>
                {t(`ai.status.${serviceHealth.status}`, { 
                  defaultValue: serviceHealth.status.charAt(0).toUpperCase() + serviceHealth.status.slice(1) 
                })}
              </Text>
            </View>
            <Text style={styles.capabilitiesText}>
              {t('ai.capabilities', { defaultValue: 'Available features' })}: {serviceHealth.capabilities.join(', ')}
            </Text>
          </View>
        </ScrollView>
      </View>
    </View>
  );
  
  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }, style]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MaterialIcons name="psychology" size={24} color="#6366F1" />
          <Text style={styles.headerTitle}>
            {t('ai.coach', { defaultValue: 'AI Coach' })}
          </Text>
          {isAIEnabled && (
            <View style={[styles.statusIndicator, {
              backgroundColor: serviceHealth.status === 'healthy' ? '#10B981' : 
                             serviceHealth.status === 'degraded' ? '#F59E0B' : '#EF4444'
            }]} />
          )}
        </View>
        
        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={() => setShowPrivacySettings(true)}
            style={styles.settingsButton}
          >
            <MaterialIcons name="settings" size={20} color="#64748B" />
          </TouchableOpacity>
          
          {conversation.messages.length > 0 && (
            <TouchableOpacity
              onPress={clearConversation}
              style={styles.clearButton}
            >
              <MaterialIcons name="clear-all" size={20} color="#64748B" />
            </TouchableOpacity>
          )}
          
          {onClose && (
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={20} color="#64748B" />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      {/* Error Banner */}
      {hasError && (
        <View style={styles.errorBanner}>
          <MaterialIcons name="error-outline" size={16} color="#EF4444" />
          <Text style={styles.errorText}>{errorMessage}</Text>
          <TouchableOpacity onPress={clearError}>
            <MaterialIcons name="close" size={16} color="#EF4444" />
          </TouchableOpacity>
        </View>
      )}
      
      {/* Chat Area */}
      <View style={styles.chatContainer}>
        {!isAIEnabled ? (
          <View style={styles.aiDisabledContainer}>
            <MaterialIcons name="psychology" size={48} color="#D1D5DB" />
            <Text style={styles.aiDisabledTitle}>
              {t('ai.notEnabled', { defaultValue: 'AI Coach Not Enabled' })}
            </Text>
            <Text style={styles.aiDisabledDescription}>
              {t('ai.enableToStart', { 
                defaultValue: 'Enable AI features to start a coaching conversation.' 
              })}
            </Text>
            <TouchableOpacity
              style={styles.enableButton}
              onPress={() => setShowPrivacySettings(true)}
            >
              <Text style={styles.enableButtonText}>
                {t('ai.enableFeatures', { defaultValue: 'Enable AI Features' })}
              </Text>
            </TouchableOpacity>
          </View>
        ) : !conversation.sessionId ? (
          <View style={styles.startContainer}>
            <MaterialIcons name="chat" size={48} color="#6366F1" />
            <Text style={styles.startTitle}>
              {t('ai.readyToChat', { defaultValue: 'Ready to Start Coaching' })}
            </Text>
            <Text style={styles.startDescription}>
              {t('ai.coachingDescription', { 
                defaultValue: 'Your AI coach is ready to help you explore your KLARE journey with personalized questions and insights.' 
              })}
            </Text>
            <TouchableOpacity
              style={styles.startButton}
              onPress={handleStartConversation}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.startButtonText}>
                  {t('ai.startCoaching', { defaultValue: 'Start Coaching Session' })}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView 
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
          >
            {conversation.messages.map(renderMessage)}
            
            {conversation.isTyping && (
              <View style={[styles.messageContainer, styles.aiMessage]}>
                <View style={[styles.messageBubble, styles.aiBubble, styles.typingBubble]}>
                  <View style={styles.typingIndicator}>
                    <View style={[styles.typingDot, { animationDelay: '0ms' }]} />
                    <View style={[styles.typingDot, { animationDelay: '200ms' }]} />
                    <View style={[styles.typingDot, { animationDelay: '400ms' }]} />
                  </View>
                </View>
              </View>
            )}
          </ScrollView>
        )}
      </View>
      
      {/* Input Area */}
      {isAIEnabled && conversation.sessionId && (
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder={t('ai.typeMessage', { defaultValue: 'Type your message...' })}
              placeholderTextColor="#9CA3AF"
              multiline
              maxLength={1000}
              onSubmitEditing={handleSendMessage}
              blurOnSubmit={false}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!inputText.trim() || conversation.isTyping) && styles.sendButtonDisabled
              ]}
              onPress={handleSendMessage}
              disabled={!inputText.trim() || conversation.isTyping}
            >
              <MaterialIcons 
                name="send" 
                size={20} 
                color={(!inputText.trim() || conversation.isTyping) ? "#D1D5DB" : "#fff"} 
              />
            </TouchableOpacity>
          </View>
        </View>
      )}
      
      {/* Privacy Settings Modal */}
      {showPrivacySettings && renderPrivacySettings()}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingsButton: {
    padding: 8,
  },
  clearButton: {
    padding: 8,
  },
  closeButton: {
    padding: 8,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FEF2F2',
    borderBottomWidth: 1,
    borderBottomColor: '#FECACA',
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#EF4444',
  },
  chatContainer: {
    flex: 1,
  },
  aiDisabledContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  aiDisabledTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    textAlign: 'center',
  },
  aiDisabledDescription: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 24,
  },
  enableButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
  },
  enableButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  startContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  startTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    textAlign: 'center',
  },
  startDescription: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 24,
  },
  startButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
    minWidth: 120,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    gap: 16,
  },
  messageContainer: {
    maxWidth: width * 0.8,
  },
  userMessage: {
    alignSelf: 'flex-end',
  },
  aiMessage: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: '#6366F1',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: '#F3F4F6',
    borderBottomLeftRadius: 4,
  },
  typingBubble: {
    paddingVertical: 16,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#fff',
  },
  aiText: {
    color: '#1F2937',
  },
  messageTime: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
    textAlign: 'right',
  },
  insightsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  insightsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  insightText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#9CA3AF',
    // Note: Animation would be handled with react-native-reanimated in a real implementation
  },
  inputContainer: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    padding: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
    backgroundColor: '#F9FAFB',
  },
  sendButton: {
    backgroundColor: '#6366F1',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#F3F4F6',
  },
  privacyOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  privacyModal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '100%',
    maxHeight: '80%',
  },
  privacyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  privacyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  privacyContent: {
    padding: 20,
  },
  privacyDescription: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
    marginBottom: 24,
  },
  privacyOption: {
    marginBottom: 16,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  optionButtonActive: {
    borderColor: '#6366F1',
    backgroundColor: '#6366F1',
  },
  optionContent: {
    flex: 1,
    marginLeft: 12,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  optionTitleActive: {
    color: '#fff',
  },
  optionDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  optionDescriptionActive: {
    color: '#E0E7FF',
  },
  serviceHealth: {
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  healthTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  healthIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  healthDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  healthText: {
    fontSize: 14,
    color: '#374151',
    textTransform: 'capitalize',
  },
  capabilitiesText: {
    fontSize: 12,
    color: '#6B7280',
  },
});

export default AICoachingChat;