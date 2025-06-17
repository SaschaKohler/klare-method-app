import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ViewStyle, 
  TextStyle,
  ActivityIndicator,
  View,
} from 'react-native';
import { Colors } from '../../constants/Colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
  iconPosition = 'left',
}) => {
  const getButtonStyle = (): ViewStyle => {
    const baseStyle = styles.button;
    const sizeStyle = styles[`${size}Button` as keyof typeof styles] as ViewStyle;
    const variantStyle = styles[`${variant}Button` as keyof typeof styles] as ViewStyle;
    const disabledStyle = disabled ? styles.disabledButton : {};

    return {
      ...baseStyle,
      ...sizeStyle,
      ...variantStyle,
      ...disabledStyle,
    };
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle = styles.buttonText;
    const sizeStyle = styles[`${size}ButtonText` as keyof typeof styles] as TextStyle;
    const variantStyle = styles[`${variant}ButtonText` as keyof typeof styles] as TextStyle;
    const disabledStyle = disabled ? styles.disabledButtonText : {};

    return {
      ...baseStyle,
      ...sizeStyle,
      ...variantStyle,
      ...disabledStyle,
    };
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator 
            color={variant === 'primary' ? 'white' : Colors.primary} 
            size="small" 
          />
        </View>
      );
    }

    const textElement = (
      <Text style={[getTextStyle(), textStyle]}>{title}</Text>
    );

    if (!icon) {
      return textElement;
    }

    return (
      <View style={styles.iconContainer}>
        {iconPosition === 'left' && icon}
        {textElement}
        {iconPosition === 'right' && icon}
      </View>
    );
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  
  // Size styles
  smallButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 36,
  },
  mediumButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 44,
  },
  largeButton: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    minHeight: 52,
  },
  
  // Variant styles
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  secondaryButton: {
    backgroundColor: Colors.secondary,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  ghostButton: {
    backgroundColor: 'transparent',
  },
  
  // Disabled styles
  disabledButton: {
    opacity: 0.5,
  },
  
  // Text styles
  buttonText: {
    fontWeight: '600',
    textAlign: 'center',
  },
  
  // Size text styles
  smallButtonText: {
    fontSize: 14,
    lineHeight: 18,
  },
  mediumButtonText: {
    fontSize: 16,
    lineHeight: 20,
  },
  largeButtonText: {
    fontSize: 18,
    lineHeight: 22,
  },
  
  // Variant text styles
  primaryButtonText: {
    color: 'white',
  },
  secondaryButtonText: {
    color: Colors.text,
  },
  outlineButtonText: {
    color: Colors.primary,
  },
  ghostButtonText: {
    color: Colors.primary,
  },
  
  disabledButtonText: {
    opacity: 0.7,
  },
  
  // Icon and loading styles
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
