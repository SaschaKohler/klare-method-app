// src/components/vision-board/VisionBoardItem.tsx
import React from "react";
import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  Animated,
} from "react-native";
import { Text, Card, Chip, useTheme } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";

interface VisionBoardItemProps {
  id?: string;
  title: string;
  description?: string;
  life_area: string;
  image_url?: string;
  color?: string;
  width: number;
  height: number;
  isSelected: boolean;
  onPress: () => void;
  style?: any;
  panHandlers?: any;
}

const VisionBoardItem: React.FC<VisionBoardItemProps> = ({
  id,
  title,
  description,
  life_area,
  image_url,
  color,
  width,
  height,
  isSelected,
  onPress,
  style,
  panHandlers,
}) => {
  const theme = useTheme();

  return (
    <Animated.View
      style={[styles.container, { width, height }, style]}
      {...panHandlers}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        style={{ width: "100%", height: "100%" }}
      >
        <Card
          style={[
            styles.card,
            isSelected && styles.selectedCard,
            { backgroundColor: color || theme.colors.surface },
          ]}
        >
          {image_url && (
            <Image
              source={{ uri: image_url }}
              style={styles.image}
              resizeMode="cover"
            />
          )}

          <View style={styles.content}>
            <Text
              style={[styles.title, { color: theme.colors.onSurface }]}
              numberOfLines={2}
            >
              {title}
            </Text>

            {description && (
              <Text style={styles.description} numberOfLines={2}>
                {description}
              </Text>
            )}

            <Chip style={styles.areaChip} textStyle={{ fontSize: 10 }} compact>
              {life_area}
            </Chip>
          </View>

          {isSelected && (
            <View style={styles.selectedIndicator}>
              <Ionicons
                name="checkmark-circle"
                size={16}
                color={theme.colors.primary}
              />
            </View>
          )}
        </Card>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
  },
  card: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
    overflow: "hidden",
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  image: {
    width: "100%",
    height: "60%",
  },
  content: {
    padding: 8,
    flex: 1,
    justifyContent: "space-between",
  },
  title: {
    fontWeight: "bold",
    fontSize: 14,
    marginBottom: 2,
  },
  description: {
    fontSize: 12,
    opacity: 0.7,
    flex: 1,
  },
  areaChip: {
    alignSelf: "flex-start",
    height: 20,
    marginTop: 4,
  },
  selectedIndicator: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 2,
  },
});

export default VisionBoardItem;
