import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Colors } from '../../constants/Colors';

interface KLARELogoProps {
  size?: number;
  animated?: boolean;
}

export const KLARELogo: React.FC<KLARELogoProps> = ({ 
  size = 80, 
  animated = false 
}) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (animated) {
      // Subtle rotation animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 10000,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 0,
            duration: 10000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Breathing scale animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.05,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [animated, rotateAnim, scaleAnim]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const logoSize = size;
  const letterSize = logoSize * 0.2;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width: logoSize,
          height: logoSize,
          transform: animated ? [{ rotate }, { scale: scaleAnim }] : undefined,
        },
      ]}
    >
      {/* Background circle */}
      <View style={[styles.backgroundCircle, { width: logoSize, height: logoSize }]} />
      
      {/* KLARE letters arranged in a circle */}
      {['K', 'L', 'A', 'R', 'E'].map((letter, index) => {
        const angle = (index * 72 - 90) * (Math.PI / 180); // 72 degrees apart, starting from top
        const radius = logoSize * 0.28;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        
        return (
          <View
            key={letter}
            style={[
              styles.letterContainer,
              {
                width: letterSize,
                height: letterSize,
                backgroundColor: Colors.klare[index],
                left: logoSize / 2 + x - letterSize / 2,
                top: logoSize / 2 + y - letterSize / 2,
              },
            ]}
          >
            <View style={styles.letterContent}>
              <View style={styles.letterText}>
                {/* Letter would be rendered here - using a simple colored circle for now */}
              </View>
            </View>
          </View>
        );
      })}
      
      {/* Center circle */}
      <View
        style={[
          styles.centerCircle,
          {
            width: logoSize * 0.3,
            height: logoSize * 0.3,
            left: logoSize * 0.35,
            top: logoSize * 0.35,
          },
        ]}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backgroundCircle: {
    borderRadius: 1000,
    backgroundColor: Colors.primaryLight,
    opacity: 0.1,
  },
  letterContainer: {
    position: 'absolute',
    borderRadius: 1000,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  letterContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  letterText: {
    width: '60%',
    height: '60%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 1000,
  },
  centerCircle: {
    position: 'absolute',
    borderRadius: 1000,
    backgroundColor: Colors.primary,
    opacity: 0.8,
  },
});
