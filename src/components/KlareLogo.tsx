import React, { useEffect } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import Svg, { Circle, Text as SvgText } from "react-native-svg";
import { klareColors } from "../constants/theme";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from "react-native-reanimated";

interface KlareLogoProps {
  size?: number;
  horizontal?: boolean;
  spacing?: number;
  fontSize?: number;
  animated?: boolean;
  onPress?: () => void;
  style?: any;
  animationDelay?: number;
  pulsate?: boolean;
}

const KlareLogo: React.FC<KlareLogoProps> = ({
  size = 50,
  horizontal = true,
  spacing = 10,
  fontSize = 30,
  animated = false,
  onPress,
  style,
  animationDelay = 0,
  pulsate = false,
}) => {
  // Animation Values
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  // Start animations if enabled
  useEffect(() => {
    if (animated) {
      opacity.value = withTiming(1, { duration: 1000 });
    }

    if (pulsate) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.1, {
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        ),
        -1, // Infinite repetitions
        true, // Reverse
      );
    }
  }, [animated, pulsate, opacity, scale]);

  // Animated styles
  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ scale: scale.value }],
    };
  });

  // KLARE Farben und Buchstaben
  const letters = [
    { letter: "K", color: klareColors.k },
    { letter: "L", color: klareColors.l },
    { letter: "A", color: klareColors.a },
    { letter: "R", color: klareColors.r },
    { letter: "E", color: klareColors.e },
  ];

  // Verwende den Container je nach Animation-Status
  const Container = animated
    ? Animated.View
    : onPress
      ? TouchableOpacity
      : View;

  return (
    <Container
      style={[
        styles.container,
        horizontal ? styles.horizontal : styles.vertical,
        { gap: spacing },
        animated ? animatedStyle : {},
        style,
      ]}
      onPress={onPress}
    >
      {letters.map((item, index) => (
        <Svg key={index} width={size} height={size} viewBox="0 0 100 100">
          <Circle cx="50" cy="50" r="45" fill={item.color} />
          <SvgText
            x="50"
            y="68"
            fontSize={fontSize}
            fontWeight="bold"
            textAnchor="middle"
            fill="white"
            fontFamily="Arial, sans-serif"
          >
            {item.letter}
          </SvgText>
        </Svg>
      ))}
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  horizontal: {
    flexDirection: "row",
  },
  vertical: {
    flexDirection: "column",
  },
});

export default KlareLogo;
