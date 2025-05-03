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
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: image_url }}
                style={styles.image}
                resizeMode="contain"
                onError={(e) => console.error('Image load error:', e.nativeEvent.error)}
              />

              {/* Add a fallback placeholder */}
              <View style={styles.imagePlaceholder}>
                <Text>Loading...</Text>
              </View>
            </View>
          )}

          <View style={[styles.content, { backgroundColor: color || theme.colors.surface }]}>
            <Text
              style={[styles.title, { 
                color: theme.colors.onSurface,
                backgroundColor: 'rgba(255,255,255,0.7)',
                padding: 4,
                borderRadius: 4
              }]}
              numberOfLines={2}
            >
              {title}
            </Text>

            {description && (
              <Text 
                style={[
                  styles.description, 
                  { 
                    color: theme.colors.onSurface,
                    backgroundColor: 'rgba(255,255,255,0.7)',
                    padding: 4,
                    borderRadius: 4
                  }
                ]} 
                numberOfLines={2}
              >
                {description}
              </Text>
            )}

            <Chip 
              style={[
                styles.areaChip, 
                { 
                  backgroundColor: theme.colors.primaryContainer 
                }
              ]} 
              textStyle={{ 
                fontSize: 10,
                color: theme.colors.onPrimaryContainer
              }} 
              compact
            >
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
  imageContainer: {
    width: "100%",
    height: "60%",
    position: "relative",
    backgroundColor: "#f0f0f0",
    overflow: "hidden",
  },
  imagePlaceholder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    zIndex: -1,
  },
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
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  title: {
    fontWeight: "bold",
    fontSize: 14,
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    marginBottom: 4,
    flex: 1,
  },
  areaChip: {
    alignSelf: "flex-start",
    height: 24,
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
