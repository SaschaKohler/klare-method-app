import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';

interface TextProps extends RNTextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'subtitle' | 'body' | 'caption';
  color?: string;
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
}

export const Text: React.FC<TextProps> = ({ 
  variant = 'body', 
  color,
  weight = 'normal',
  style, 
  ...props 
}) => {
  const getVariantStyle = () => {
    switch (variant) {
      case 'h1':
        return styles.h1;
      case 'h2':
        return styles.h2;
      case 'h3':
        return styles.h3;
      case 'subtitle':
        return styles.subtitle;
      case 'body':
        return styles.body;
      case 'caption':
        return styles.caption;
      default:
        return styles.body;
    }
  };

  const getWeightStyle = () => {
    switch (weight) {
      case 'medium':
        return styles.medium;
      case 'semibold':
        return styles.semibold;
      case 'bold':
        return styles.bold;
      default:
        return null;
    }
  };

  return (
    <RNText
      style={[
        getVariantStyle(),
        getWeightStyle(),
        color && { color },
        style,
      ]}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  h1: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    color: Colors.text,
  },
  h2: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '600',
    color: Colors.text,
  },
  h3: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '600',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500',
    color: Colors.text,
  },
  body: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '400',
    color: Colors.text,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
    color: Colors.textSecondary,
  },
  medium: {
    fontWeight: '500',
  },
  semibold: {
    fontWeight: '600',
  },
  bold: {
    fontWeight: '700',
  },
});
