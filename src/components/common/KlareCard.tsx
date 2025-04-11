import React, { ReactNode } from 'react';
import { View, TouchableOpacity, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { klareColors } from '../../constants/theme';

interface KlareCardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  accentColor?: string;
  showAccent?: boolean;
  accentPosition?: 'left' | 'top' | 'right' | 'bottom';
}

const KlareCard: React.FC<KlareCardProps> = ({
  children,
  style,
  onPress,
  accentColor = klareColors.k,
  showAccent = false,
  accentPosition = 'left',
}) => {
  const renderContent = () => (
    <View
      style={[
        styles.container,
        showAccent && accentPosition === 'left' && {
          borderLeftWidth: 3,
          borderLeftColor: accentColor,
        },
        showAccent && accentPosition === 'top' && {
          borderTopWidth: 3,
          borderTopColor: accentColor,
        },
        showAccent && accentPosition === 'right' && {
          borderRightWidth: 3,
          borderRightColor: accentColor,
        },
        showAccent && accentPosition === 'bottom' && {
          borderBottomWidth: 3,
          borderBottomColor: accentColor,
        },
        style,
      ]}
    >
      {children}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
      >
        {renderContent()}
      </TouchableOpacity>
    );
  }

  return renderContent();
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: klareColors.cardBackground,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: klareColors.cardBorder,
    marginBottom: 16,
  },
});

export default KlareCard;
