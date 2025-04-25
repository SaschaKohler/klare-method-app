// src/components/transformation/TransformationPath.tsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Chip, useTheme } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  withTiming,
  interpolateColor,
  useSharedValue,
  withSequence,
  withDelay,
} from "react-native-reanimated";

interface TransformationPoint {
  from: string;
  to: string;
}

interface TransformationPathProps {
  point: TransformationPoint;
  color: string;
  index: number;
  isActive?: boolean;
  onPress?: () => void;
}

const TransformationPath: React.FC<TransformationPathProps> = ({
  point,
  color,
  index,
  isActive = false,
  onPress,
}) => {
  const theme = useTheme();
  const isDark = theme.dark;

  // Animation values
  const animationProgress = useSharedValue(0);
  const scaleValue = useSharedValue(1);

  // Start animation when component mounts
  React.useEffect(() => {
    animationProgress.value = 0;
    animationProgress.value = withDelay(
      index * 150,
      withTiming(1, { duration: 600 }),
    );

    // Optional pulse animation
    if (isActive) {
      scaleValue.value = withSequence(
        withDelay(index * 150 + 300, withTiming(1.03, { duration: 200 })),
        withTiming(1, { duration: 200 }),
      );
    }
  }, [index, isActive]);

  // Animated styles
  const animatedCardStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      animationProgress.value,
      [0, 1],
      [
        isDark ? "#1E1E2E" : "#F7F9FC",
        isActive ? `${color}15` : isDark ? "#252536" : "#FFFFFF",
      ],
    );

    return {
      opacity: animationProgress.value,
      transform: [
        { translateY: (1 - animationProgress.value) * 20 },
        { scale: scaleValue.value },
      ],
      backgroundColor,
      borderLeftColor: color,
    };
  });

  return (
    <Animated.View style={[styles.container, animatedCardStyle]}>
      <TouchableOpacity
        style={styles.touchable}
        onPress={onPress}
        activeOpacity={0.8}
      >
        {/* FROM section */}
        <View style={styles.fromSection}>
          <Chip
            style={[styles.chip, { backgroundColor: `${color}15` }]}
            textStyle={{ color }}
            compact
          >
            Von
          </Chip>
          <Text
            style={[
              styles.transformationText,
              { color: isDark ? "#E0E0E0" : "#333333" },
            ]}
          >
            {point.from}
          </Text>
        </View>

        {/* Arrow section */}
        <View style={styles.arrowSection}>
          <View style={[styles.arrowLine, { backgroundColor: color }]} />
          <View
            style={[
              styles.arrowCircle,
              { backgroundColor: `${color}20`, borderColor: color },
            ]}
          >
            <Ionicons name="arrow-down" size={16} color={color} />
          </View>
        </View>

        {/* TO section */}
        <View style={styles.toSection}>
          <Chip
            style={[styles.chip, { backgroundColor: `${color}15` }]}
            textStyle={{ color }}
            compact
          >
            Zu
          </Chip>
          <View
            style={[
              styles.toContainer,
              { backgroundColor: `${color}10`, borderColor: `${color}30` },
            ]}
          >
            <Text
              style={[
                styles.transformationText,
                styles.transformationTextBold,
                { color: isDark ? "#FFFFFF" : "#111111" },
              ]}
            >
              {point.to}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderLeftWidth: 4,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // overflow: "hidden",
  },
  touchable: {
    padding: 16,
  },
  fromSection: {
    marginBottom: 12,
  },
  toSection: {
    marginTop: 12,
  },
  arrowSection: {
    alignItems: "center",
    height: 28,
    position: "relative",
  },
  arrowLine: {
    position: "absolute",
    width: 1.5,
    height: "100%",
  },
  arrowCircle: {
    position: "absolute",
    bottom: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  chip: {
    alignSelf: "flex-start",
    marginBottom: 8,
    height: 28,
  },
  transformationText: {
    fontSize: 16,
    lineHeight: 22,
  },
  transformationTextBold: {
    fontWeight: "600",
  },
  toContainer: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
});

export default TransformationPath;
