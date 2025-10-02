// src/components/lifewheel/LifeWheelChart.tsx
import React, { useMemo, useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Platform,
  TouchableOpacity,
} from "react-native";
import { useTheme } from "react-native-paper";
import Svg, {
  Circle,
  G,
  Line,
  Polygon,
  Text as SvgText,
} from "react-native-svg";
import { darkKlareColors, lightKlareColors } from "../../constants/theme";
import {
  useLifeWheelStore,
  LifeWheelArea,
} from "../../store/useLifeWheelStore";

// Konstanten für das Lebensrad
const WHEEL_PADDING = 40;
const MAX_VALUE = 10;
const TOUCH_POINT_SIZE = 24; // Größerer Touchbereich für die Punkte

interface LifeWheelChartProps {
  showTargetValues?: boolean;
  size?: number;
  onAreaPress?: (areaId: string) => void;
  lifeWheelAreas?: LifeWheelArea[]; // Kann direkt übergeben werden
}

const LifeWheelChart: React.FC<LifeWheelChartProps> = ({
  showTargetValues = false,
  size: propSize,
  onAreaPress,
  lifeWheelAreas: propLifeWheelAreas,
}) => {
  // Memoize the chart size to prevent unnecessary recalculations
  const size = useMemo(() => {
    return (
      propSize ||
      Math.min(Dimensions.get("window").width - WHEEL_PADDING * 2, 300)
    );
  }, [propSize]);
  // Theme für bessere Kontraste
  const themeMode = useTheme();
  const [theme, setTheme] = useState(themeMode.dark ? darkKlareColors : lightKlareColors);

  useEffect(() => {
    setTheme(themeMode.dark ? darkKlareColors : lightKlareColors);
  }, [themeMode]);

  const isDarkMode = themeMode.dark;
  const themeColors = themeMode.dark ? darkKlareColors : lightKlareColors;

  // Entweder direkt übergebene Daten oder Daten aus dem Store nehmen
  const { lifeWheelAreas: storeLifeWheelAreas, updateLifeWheelArea } = useLifeWheelStore();
  // Wenn LifeWheelAreas als Prop übergeben wurden, verwende diese, ansonsten aus dem Store
  const lifeWheelAreas = propLifeWheelAreas || storeLifeWheelAreas;

  useEffect(() => {
    console.log('LifeWheelChart received areas:', JSON.stringify(lifeWheelAreas, null, 2));
  }, [lifeWheelAreas]);

  // Validierung: Sicherstellen, dass wir gültige Daten haben
  const validLifeWheelAreas = lifeWheelAreas.filter(area => 
    area && 
    typeof area.currentValue === 'number' && 
    !isNaN(area.currentValue) &&
    typeof area.targetValue === 'number' && 
    !isNaN(area.targetValue)
  );

  // Wenn keine gültigen Daten vorhanden sind, zeige nichts an
  if (validLifeWheelAreas.length === 0) {
    console.warn('LifeWheelChart: No valid areas to display');
    return null;
  }

  // Berechnete Werte
  const center = size / 2;
  const radius = size * 0.4;

  // Winkel für jede Area berechnen
  const calculateAngle = (index: number, total: number) => {
    return (index * 360) / total;
  };

  // Konvertierung von Polarkoordinaten zu kartesischen Koordinaten
  const polarToCartesian = (radius: number, angleInDegrees: number) => {
    // Sicherstellen, dass der Radius gültig ist
    const safeRadius = Math.max(0, Math.min(radius, size / 2 * 0.99)); // 99% des maximalen Radius
    
    // Winkel in Bogenmaß umrechnen und sicherstellen, dass er im Bereich [0, 2π] liegt
    const normalizedAngle = ((angleInDegrees % 360) + 360) % 360; // Normalisieren auf [0, 360)
    const angleInRadians = ((normalizedAngle - 90) * Math.PI) / 180.0;
    
    // Koordinaten berechnen
    const x = safeRadius * Math.cos(angleInRadians) + center;
    const y = safeRadius * Math.sin(angleInRadians) + center;
    
    // Sicherstellen, dass die Koordinaten innerhalb der SVG-Grenzen liegen
    return {
      x: Math.max(0, Math.min(x, size)),
      y: Math.max(0, Math.min(y, size))
    };
  };

  // Punkte für das Current-Value-Polygon berechnen
  const currentValuePoints = validLifeWheelAreas
    .map((area, index) => {
      const angle = calculateAngle(index, validLifeWheelAreas.length);
      // Sicherstellen, dass currentValue eine gültige Zahl ist
      const currentValue = typeof area.currentValue === 'number' && !isNaN(area.currentValue) 
        ? Math.max(0, Math.min(Math.round(area.currentValue), MAX_VALUE))
        : 0;
      
      const point = polarToCartesian(
        (radius * currentValue) / MAX_VALUE,
        angle,
      );
      
      // Koordinaten runden für saubere SVG-Punkte
      return `${Math.round(point.x)},${Math.round(point.y)}`;
    })
    .join(" ");

  // Punkte für das Target-Value-Polygon berechnen (falls aktiviert)
  const targetValuePoints = showTargetValues
    ? validLifeWheelAreas
        .map((area, index) => {
          const angle = calculateAngle(index, validLifeWheelAreas.length);
          // Sicherstellen, dass targetValue eine gültige Zahl ist
          const targetValue = typeof area.targetValue === 'number' && !isNaN(area.targetValue) 
            ? area.targetValue 
            : 0;
          const point = polarToCartesian(
            (radius * targetValue) / MAX_VALUE,
            angle,
          );
          return `${point.x},${point.y}`;
        })
        .join(" ")
    : "";

  // SVG allein kann die Touch-Events nicht zuverlässig verarbeiten,
  // daher verwenden wir TouchableOpacity-Komponenten, die über dem SVG positioniert werden
  const renderTouchPoints = () => {
    return validLifeWheelAreas.map((area, index) => {
      const angle = calculateAngle(index, validLifeWheelAreas.length);

      // Position für aktuellen Wert
      const validCurrentValue = typeof area.currentValue === 'number' && !isNaN(area.currentValue) 
        ? area.currentValue 
        : 0;
      const currentPoint = polarToCartesian(
        (radius * validCurrentValue) / MAX_VALUE,
        angle,
      );

      // Position für Zielwert (falls aktiviert)
      const validTargetValue = typeof area.targetValue === 'number' && !isNaN(area.targetValue) 
        ? area.targetValue 
        : 0;
      const targetPoint = showTargetValues
        ? polarToCartesian((radius * validTargetValue) / MAX_VALUE, angle)
        : null;

      return (
        <React.Fragment key={`touch-point-${area.id ?? index}`}>
          {/* Touchpoint für aktuellen Wert */}
          <TouchableOpacity
            style={[
              styles.touchPoint,
              {
                left: currentPoint.x - TOUCH_POINT_SIZE / 2,
                top: currentPoint.y - TOUCH_POINT_SIZE / 2,
                width: TOUCH_POINT_SIZE,
                height: TOUCH_POINT_SIZE,
              },
            ]}
            onPress={() => onAreaPress && onAreaPress(area.id)}
            activeOpacity={0.6}
          />

          {/* Touchpoint für Zielwert */}
          {targetPoint && (
            <TouchableOpacity
              style={[
                styles.touchPoint,
                {
                  left: targetPoint.x - TOUCH_POINT_SIZE / 2,
                  top: targetPoint.y - TOUCH_POINT_SIZE / 2,
                  width: TOUCH_POINT_SIZE,
                  height: TOUCH_POINT_SIZE,
                },
              ]}
              onPress={() => onAreaPress && onAreaPress(area.id)}
              activeOpacity={0.6}
            />
          )}
        </React.Fragment>
      );
    });
  };

  // Verbesserte Transparenz für Background-Elemente im Dark Mode
  const bgOpacity = isDarkMode ? "30" : "20";
  const bgStrokeOpacity = isDarkMode ? "40" : "30";

  const handleValueChange = (area: LifeWheelArea, newValue: number) => {
    updateLifeWheelArea(area.id, { currentValue: newValue });
  };

  const getAreaPoints = () => {
    const points = lifeWheelAreas.map((area, index) => {
      const angle = calculateAngle(index, lifeWheelAreas.length);
      const point = polarToCartesian(radius, angle);
      return `${point.x},${point.y}`;
    });
    return points.join(" ");
  };

  const getTargetPointString = () => {
    if (!lifeWheelAreas || lifeWheelAreas.length === 0) {
      return "";
    }

    const points = lifeWheelAreas
      .map((area, index) => {
        const angle = calculateAngle(index, lifeWheelAreas.length);
        const rawTarget =
          typeof area.targetValue === "number" && !Number.isNaN(area.targetValue)
            ? area.targetValue
            : 0;
        const targetValue = Math.max(0, Math.min(rawTarget, MAX_VALUE));
        const point = polarToCartesian((radius * targetValue) / MAX_VALUE, angle);
        return `${Math.round(point.x)},${Math.round(point.y)}`;
      })
      .filter(Boolean);

    if (points.length === 0) {
      return "";
    }

    return `${points.join(" ")} ${points[0]}`;
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Hintergrundkreise mit verbessertem Kontrast */}
        {[...Array(MAX_VALUE)].map((_, i) => (
          <Circle
            key={`circle-${i}`}
            cx={center}
            cy={center}
            r={radius * ((i + 1) / MAX_VALUE)}
            fill="none"
            stroke={`${themeColors.k}${bgOpacity}`}
            strokeWidth={i % 5 === 0 ? "1.5" : "1"} // Dickere Linie für 5er-Werte
          />
        ))}

        {/* Speichen für jede Area */}
        {validLifeWheelAreas.map((area, index) => {
          const angle = calculateAngle(index, validLifeWheelAreas.length);
          const point = polarToCartesian(radius, angle);

          return (
            <Line
              key={`line-${area.id ?? index}`}
              x1={center}
              y1={center}
              x2={point.x}
              y2={point.y}
              stroke={`${themeColors.k}${bgStrokeOpacity}`}
              strokeWidth="1"
            />
          );
        })}

        {/* Beschriftungen für jede Area */}
        {validLifeWheelAreas.map((area, index) => {
          const angle = calculateAngle(index, validLifeWheelAreas.length);
          const labelRadius = radius + 15; // Näher am Rad
          const labelPoint = polarToCartesian(labelRadius, angle);

          // State für erweiterten Text
          const [expanded, setExpanded] = React.useState(false);

          // Standardmäßig nur Anfangsbuchstaben groß zeigen
          const displayText = expanded
            ? area.name
            : area.name
                .split(" ")
                .map((w) => w.charAt(0).toUpperCase())
                .join("");

          // Textgröße anpassen
          const fontSize = expanded ? 10 : 14;

          // Textpositionierung
          const textAnchor = "middle";
          const alignmentBaseline = "middle";

          return (
            <G key={`label-${area.id ?? index}`}>
              {/* Touchable Area für Interaktion */}
              <TouchableOpacity
                style={[
                  styles.labelTouchArea,
                  {
                    left: labelPoint.x - 20,
                    top: labelPoint.y - 15,
                    width: 40,
                    height: 30,
                  },
                ]}
                onPressIn={() => setExpanded(true)}
                onPressOut={() => setExpanded(false)}
                activeOpacity={1}
              />

              {/* Beschriftung */}
              <SvgText
                x={labelPoint.x}
                y={labelPoint.y}
                textAnchor={textAnchor}
                alignmentBaseline={alignmentBaseline}
                fontSize={fontSize}
                fontWeight="600"
                fill={themeColors.text}
                stroke={isDarkMode ? "#00000055" : "#ffffff55"}
                strokeWidth="0.5"
              >
                {displayText}
              </SvgText>
            </G>
          );
        })}

        {/* Polygon für aktuelle Werte mit verbesserter Opazität */}
        <Polygon
          points={currentValuePoints}
          fill={`${themeColors.k}40`}
          stroke={themeColors.k}
          strokeWidth="2"
        />

        {/* Polygon für Zielwerte (falls aktiviert) mit verbessertem Kontrast */}
        {showTargetValues && (
          <Polygon
            points={getTargetPointString()}
            fill={`${themeColors.a}30`}
            stroke={themeColors.a}
            strokeWidth="2"
            strokeDasharray="5,5"
          />
        )}

        {/* Punkte für die Werte mit verbesserten Visuellen */}
        {validLifeWheelAreas.map((area, index) => {
          const angle = calculateAngle(index, validLifeWheelAreas.length);
          const validCurrentValue = typeof area.currentValue === 'number' && !isNaN(area.currentValue) 
            ? area.currentValue 
            : 0;
          const currentPoint = polarToCartesian(
            (radius * validCurrentValue) / MAX_VALUE,
            angle,
          );

          return (
            <G key={`point-${area.id ?? index}`}>
              {/* Sichtbarer Punkt für aktuellen Wert */}
              <Circle
                cx={currentPoint.x}
                cy={currentPoint.y}
                r="6"
                fill={themeColors.k}
                stroke={isDarkMode ? "#222" : "white"}
                strokeWidth="2"
              />

              {/* Wertanzeige neben dem Punkt für bessere Übersicht */}
              <SvgText
                x={currentPoint.x}
                y={currentPoint.y - 15}
                textAnchor="middle"
                alignmentBaseline={
                  Platform.OS === "android" ? "middle" : "central"
                }
                fontSize="9"
                fontWeight="bold"
                fill={themeColors.text}
                // Leichter Textschatten für bessere Lesbarkeit
                stroke={
                  Platform.OS === "android"
                    ? isDarkMode
                      ? "#00000055"
                      : "#ffffff55"
                    : "none"
                }
                strokeWidth="0.5"
              >
                {validCurrentValue}
              </SvgText>

              {/* Punkt für Zielwert (falls aktiviert) */}
              {showTargetValues &&
                (() => {
                  const validTargetValue = typeof area.targetValue === 'number' && !isNaN(area.targetValue) 
                    ? area.targetValue 
                    : 0;
                  const targetPoint = polarToCartesian(
                    (radius * validTargetValue) / MAX_VALUE,
                    angle,
                  );

                  return (
                    <>
                      {/* Sichtbarer Punkt für Zielwert */}
                      <Circle
                        cx={targetPoint.x}
                        cy={targetPoint.y}
                        r="5"
                        fill={isDarkMode ? "#222" : "white"}
                        stroke={themeColors.a}
                        strokeWidth="2"
                      />

                      {/* Zielwertanzeige neben dem Punkt */}
                      <SvgText
                        x={targetPoint.x}
                        y={targetPoint.y - 15}
                        textAnchor="middle"
                        alignmentBaseline={
                          Platform.OS === "android" ? "middle" : "central"
                        }
                        fontSize="9"
                        fontWeight="bold"
                        fill={themeColors.a}
                        // Leichter Textschatten für bessere Lesbarkeit
                        stroke={
                          Platform.OS === "android"
                            ? isDarkMode
                              ? "#00000055"
                              : "#ffffff55"
                            : "none"
                        }
                        strokeWidth="0.5"
                      >
                        {validTargetValue}
                      </SvgText>
                    </>
                  );
                })()}
            </G>
          );
        })}

        {/* Mittelpunkt */}
        <Circle cx={center} cy={center} r="4" fill={themeColors.k} />
      </Svg>

      {/* Touchable-Layer über dem SVG für bessere Interaktivität */}
      <View style={[styles.touchLayer, { width: size, height: size }]}>
        {renderTouchPoints()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: "center",
    margin: 10,
    position: "relative",
  },
  touchLayer: {
    position: "absolute",
    top: 0,
    left: 0,
    // Die TouchableOpacity-Komponenten werden absolut positioniert
    // über dem SVG, um bessere Touch-Events zu ermöglichen
  },
  touchPoint: {
    position: "absolute",
    borderRadius: TOUCH_POINT_SIZE,
    // Für Debugging: Uncomment die nächste Zeile
    // backgroundColor: 'rgba(255, 0, 0, 0.3)',
    zIndex: 1000,
  },
  labelTouchArea: {
    position: "absolute",
    zIndex: 1001,
    // Für Debugging: Uncomment die nächste Zeile
    // backgroundColor: 'rgba(0, 255, 0, 0.2)',
  },
});

export default LifeWheelChart;
