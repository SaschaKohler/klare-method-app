// src/components/transformation/TransformationList.tsx
import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { useTheme } from "react-native-paper";
import TransformationPath from "./TransformationPath";
import Animated, { FadeIn } from "react-native-reanimated";

interface TransformationPoint {
  from: string;
  to: string;
}

interface TransformationListProps {
  title?: string;
  transformationPoints: TransformationPoint[];
  color: string;
  stepId: "K" | "L" | "A" | "R" | "E";
}

const TransformationList: React.FC<TransformationListProps> = ({
  title = "Transformationswege",
  transformationPoints,
  color,
  stepId,
}) => {
  const theme = useTheme();
  const isDark = theme.dark;
  const [activePointIndex, setActivePointIndex] = useState<number | null>(null);

  const handlePointPress = (index: number) => {
    setActivePointIndex(index === activePointIndex ? null : index);
  };

  return (
    <View style={styles.container}>
      <Animated.Text
        entering={FadeIn.duration(600)}
        style={[styles.sectionTitle, { color: isDark ? "#FFFFFF" : "#333333" }]}
      >
        {title}
      </Animated.Text>

      {transformationPoints.map((point, index) => (
        <TransformationPath
          key={index}
          point={point}
          color={color}
          index={index}
          isActive={activePointIndex === index}
          onPress={() => handlePointPress(index)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
    marginTop: 8,
  },
});

export default TransformationList;
