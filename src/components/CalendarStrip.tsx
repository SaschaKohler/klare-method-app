// src/components/CalendarStrip.tsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { format, addDays, isSameDay } from 'date-fns';
import { de } from 'date-fns/locale';
import { useTheme } from 'react-native-paper';
import { useThemeStore } from '../store/useThemeStore';
import { lightKlareColors, darkKlareColors } from '../constants/theme';

const { width } = Dimensions.get('window');
const DAY_WIDTH = width / 7;

interface CalendarStripProps {
  selectedDate: Date;
  onDateSelected: (date: Date) => void;
  startingDate?: Date;
  daysCount?: number;
  highlightColor?: string;
  dayTextStyle?: object;
  dateTextStyle?: object;
  highlightDateTextStyle?: object;
  highlightDateContainerStyle?: object;
}

const CalendarStrip: React.FC<CalendarStripProps> = ({
  selectedDate,
  onDateSelected,
  startingDate = new Date(),
  daysCount = 14,
  highlightColor,
  dayTextStyle,
  dateTextStyle,
  highlightDateTextStyle,
  highlightDateContainerStyle,
}) => {
  const [dates, setDates] = useState<Date[]>([]);
  const scrollViewRef = React.useRef<ScrollView>(null);
  
  // Theme handling
  const theme = useTheme();
  const { getActiveTheme } = useThemeStore();
  const isDarkMode = getActiveTheme();
  const klareColors = isDarkMode ? darkKlareColors : lightKlareColors;

  const styles = useMemo(
    () => createStyles(theme, klareColors, highlightColor),
    [theme, klareColors, highlightColor],
  );

  // Generiere die Liste der anzuzeigenden Tage
  useEffect(() => {
    const dateArray: Date[] = [];
    for (let i = 0; i < daysCount; i++) {
      dateArray.push(addDays(startingDate, i));
    }
    setDates(dateArray);
  }, [startingDate, daysCount]);

  // Scrolle zum ausgewählten Datum
  useEffect(() => {
    const dateIndex = dates.findIndex(date => isSameDay(date, selectedDate));
    if (dateIndex !== -1 && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: dateIndex * DAY_WIDTH - DAY_WIDTH, // Zentriere das ausgewählte Datum
        animated: true,
      });
    }
  }, [dates, selectedDate]);

  const renderDateItem = (date: Date, index: number) => {
    const isSelected = isSameDay(date, selectedDate);
    
    return (
      <TouchableOpacity
        key={index}
        style={[styles.dateContainer, isSelected && styles.selectedDateContainer]}
        onPress={() => onDateSelected(date)}
      >
        <Text
          style={[
            styles.dayText,
            dayTextStyle,
            isSelected && styles.selectedText,
            isSelected && highlightDateTextStyle,
          ]}
        >
          {format(date, 'EEE', { locale: de }).toUpperCase()}
        </Text>
        <View
          style={[
            styles.dateWrapper,
            isSelected && styles.selectedDateWrapper,
            isSelected && highlightDateContainerStyle,
          ]}
        >
          <Text
            style={[
              styles.dateText,
              dateTextStyle,
              isSelected && styles.selectedText,
              isSelected && highlightDateTextStyle,
            ]}
          >
            {format(date, 'd')}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {dates.map((date, index) => renderDateItem(date, index))}
      </ScrollView>
    </View>
  );
};

const createStyles = (theme: any, klareColors: any, highlightColor?: string) => StyleSheet.create({
  container: {
    height: 80,
    width: '100%',
  },
  scrollContent: {
    paddingHorizontal: 8,
    alignItems: 'center',
    paddingVertical: 8,
  },
  dateContainer: {
    width: DAY_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  selectedDateContainer: {
    // Kein Styling erforderlich, da die Selektion im dateWrapper erfolgt
  },
  dayText: {
    fontSize: 12,
    marginBottom: 4,
    color: theme.colors.text,
  },
  dateWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  selectedDateWrapper: {
    backgroundColor: highlightColor || klareColors.k,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  selectedText: {
    color: '#FFFFFF',
  },
});

export default CalendarStrip;
