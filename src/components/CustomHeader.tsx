import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text, useTheme } from "react-native-paper";
import KlareLogo from "./KlareLogo";
import { klareColors } from "../constants/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface CustomHeaderProps {
  title?: string;
  showLogo?: boolean;
  showBack?: boolean;
  onBackPress?: () => void;
  noTopPadding?: boolean; // Neue Eigenschaft
}

const CustomHeader: React.FC<CustomHeaderProps> = ({
  title,
  showLogo = true,
  showBack = false,
  onBackPress,
  noTopPadding = false,
}) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.shadowWrapper}>
      <View style={{ overflow: "visible" }}>
        <View
          style={[
            styles.container,
            {
              paddingTop: noTopPadding ? 0 : insets.top,
              backgroundColor: theme.colors.surface,
            },
          ]}
        >
          <View style={styles.content}>
            {showBack && (
              <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
                <Text style={styles.backText}>Zurück</Text>
              </TouchableOpacity>
            )}

            {title ? (
              <Text style={styles.title}>{title}</Text>
            ) : showLogo ? (
              <View style={styles.logoContainer}>
                <KlareLogo size={30} spacing={4} animated={true} />
              </View>
            ) : null}

            <View style={styles.rightContainer} />
          </View>
        </View>
        {/* <View style={styles.shadowWrapper}> */}
        {/*   <View */}
        {/*     style={{ */}
        {/*       height: 1, */}
        {/*       backgroundColor: theme.colors.border, */}
        {/*     }} */}
        {/*   /> */}
        {/* </View> */}
      </View>
    </View>
  );
};

// Styles
//

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: klareColors.border,
    backgroundColor: "#fff",
  },
  shadowWrapper: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    backgroundColor: "transparent",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 48,
    paddingHorizontal: 16,
  },
  logoContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: klareColors.text,
    flex: 1,
    textAlign: "center",
  },
  backButton: {
    marginRight: 8,
  },
  backText: {
    color: klareColors.k,
  },
  rightContainer: {
    width: 44,
  },
});

export default CustomHeader;
