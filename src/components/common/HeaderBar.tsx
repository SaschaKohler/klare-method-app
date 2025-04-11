import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { klareColors } from '../../constants/theme';
import { useNavigation } from '@react-navigation/native';

interface HeaderBarProps {
  title?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightIcon?: {
    name: string;
    onPress: () => void;
  };
  showSearch?: boolean;
  onSearchPress?: () => void;
  showAvatar?: boolean;
  avatarLetter?: string;
  greeting?: string;
  userName?: string;
}

const HeaderBar: React.FC<HeaderBarProps> = ({
  title,
  showBackButton = false,
  onBackPress,
  rightIcon,
  showSearch = false,
  onSearchPress,
  showAvatar = false,
  avatarLetter = 'S',
  greeting,
  userName,
}) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: Platform.OS === 'ios' ? insets.top : 16 + insets.top,
          paddingHorizontal: 16,
        },
      ]}
    >
      <View style={styles.leftContainer}>
        {showBackButton && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={24} color={klareColors.text} />
          </TouchableOpacity>
        )}
        
        {showAvatar && (
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{avatarLetter}</Text>
            </View>
            <View>
              {greeting && <Text style={styles.greeting}>{greeting}</Text>}
              {userName && <Text style={styles.userName}>{userName}</Text>}
            </View>
          </View>
        )}
        
        {title && !showAvatar && (
          <Text style={styles.title}>{title}</Text>
        )}
      </View>

      <View style={styles.rightContainer}>
        {showSearch && (
          <TouchableOpacity 
            style={styles.searchButton}
            onPress={onSearchPress}
          >
            <Text style={styles.searchButtonText}>Suchen</Text>
            <Ionicons 
              name="search-outline" 
              size={18} 
              color={klareColors.text} 
              style={{ marginLeft: 4, opacity: 0.7 }} 
            />
          </TouchableOpacity>
        )}
        
        {rightIcon && (
          <TouchableOpacity
            style={styles.rightIconButton}
            onPress={rightIcon.onPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name={rightIcon.name as any} size={24} color={klareColors.text} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    backgroundColor: klareColors.background,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: klareColors.k,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  greeting: {
    fontSize: 14,
    color: klareColors.textSecondary,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: klareColors.text,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: klareColors.text,
  },
  rightIconButton: {
    marginLeft: 16,
  },
  searchButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchButtonText: {
    color: klareColors.text,
  },
});

export default HeaderBar;
