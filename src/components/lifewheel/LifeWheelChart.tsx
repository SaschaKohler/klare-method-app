// src/components/lifewheel/LifeWheelChart.tsx
import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { Text } from "react-native-paper";
import Svg, {
  Circle,
  G,
  Line,
  Polygon,
  Text as SvgText,
} from "react-native-svg";
import { klareColors } from "../../constants/theme";
import { useUserStore } from "../../store/useUserStore";

// Konstanten für das Lebensrad
const WHEEL_PADDING = 40;
const MAX_VALUE = 10;
const LABEL_RADIUS_EXTRA = 30;

interface LifeWheelChartProps {
  showTargetValues?: boolean;
  size?: number;
  onAreaPress?: (areaId: string) => void;
}

const LifeWheelChart: React.FC<LifeWheelChartProps> = ({
  showTargetValues = false,
  size = Math.min(Dimensions.get("window").width - WHEEL_PADDING * 2, 300),
  onAreaPress,
}) => {
  // Lebensrad-Daten aus dem Store holen
  const lifeWheelAreas = useUserStore((state) => state.lifeWheelAreas);

  // Berechnete Werte
  const center = size / 2;
  const radius = size * 0.4;

  // Winkel für jede Area berechnen
  const calculateAngle = (index: number, total: number) => {
    return (index * 360) / total;
  };

  // Konvertierung von Polarkoordinaten zu kartesischen Koordinaten
  const polarToCartesian = (radius: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: radius * Math.cos(angleInRadians) + center,
      y: radius * Math.sin(angleInRadians) + center,
    };
  };

  // Punkte für das Current-Value-Polygon berechnen
  const currentValuePoints = lifeWheelAreas
    .map((area, index) => {
      const angle = calculateAngle(index, lifeWheelAreas.length);
      const point = polarToCartesian(
        (radius * area.currentValue) / MAX_VALUE,
        angle,
      );
      return `${point.x},${point.y}`;
    })
    .join(" ");

  // Punkte für das Target-Value-Polygon berechnen (falls aktiviert)
  const targetValuePoints = showTargetValues
    ? lifeWheelAreas
        .map((area, index) => {
          const angle = calculateAngle(index, lifeWheelAreas.length);
          const point = polarToCartesian(
            (radius * area.targetValue) / MAX_VALUE,
            angle,
          );
          return `${point.x},${point.y}`;
        })
        .join(" ")
    : "";

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Hintergrundkreise */}
        {[...Array(MAX_VALUE)].map((_, i) => (
          <Circle
            key={`circle-${i}`}
            cx={center}
            cy={center}
            r={radius * ((i + 1) / MAX_VALUE)}
            fill="none"
            stroke={`${klareColors.k}20`}
            strokeWidth="1"
          />
        ))}

        {/* Teilungslinien */}
        {lifeWheelAreas.map((_, index) => {
          const angle = calculateAngle(index, lifeWheelAreas.length);
          const point = polarToCartesian(radius, angle);

          return (
            <Line
              key={`line-${index}`}
              x1={center}
              y1={center}
              x2={point.x}
              y2={point.y}
              stroke={`${klareColors.k}30`}
              strokeWidth="1"
            />
          );
        })}

        {/* Beschriftungen */}
        {lifeWheelAreas.map((area, index) => {
          const angle = calculateAngle(index, lifeWheelAreas.length);
          const labelPoint = polarToCartesian(
            radius + LABEL_RADIUS_EXTRA,
            angle,
          );

          return (
            <G key={`label-${index}`}>
              <SvgText
                x={labelPoint.x}
                y={labelPoint.y}
                textAnchor="middle"
                alignmentBaseline="middle"
                fontSize="10"
                fill={klareColors.text}
              >
                {area.name}
              </SvgText>
            </G>
          );
        })}

        {/* Polygon für aktuelle Werte */}
        <Polygon
          points={currentValuePoints}
          fill={`${klareColors.k}40`}
          stroke={klareColors.k}
          strokeWidth="2"
        />

        {/* Polygon für Zielwerte (falls aktiviert) */}
        {showTargetValues && (
          <Polygon
            points={targetValuePoints}
            fill={`${klareColors.a}20`}
            stroke={klareColors.a}
            strokeWidth="2"
            strokeDasharray="5,5"
          />
        )}

        {/* Punkte für die Werte */}
        {lifeWheelAreas.map((area, index) => {
          const angle = calculateAngle(index, lifeWheelAreas.length);
          const currentPoint = polarToCartesian(
            (radius * area.currentValue) / MAX_VALUE,
            angle,
          );

          return (
            <G key={`point-${index}`}>
              {/* Punkt für aktuellen Wert */}
              <Circle
                cx={currentPoint.x}
                cy={currentPoint.y}
                r="6"
                fill={klareColors.k}
                stroke="white"
                strokeWidth="2"
                onPress={() => onAreaPress && onAreaPress(area.id)}
              />

              {/* Punkt für Zielwert (falls aktiviert) */}
              {showTargetValues &&
                (() => {
                  const targetPoint = polarToCartesian(
                    (radius * area.targetValue) / MAX_VALUE,
                    angle,
                  );

                  return (
                    <Circle
                      cx={targetPoint.x}
                      cy={targetPoint.y}
                      r="5"
                      fill="white"
                      stroke={klareColors.a}
                      strokeWidth="2"
                      onPress={() => onAreaPress && onAreaPress(area.id)}
                    />
                  );
                })()}
            </G>
          );
        })}

        {/* Mittelpunkt */}
        <Circle cx={center} cy={center} r="4" fill={klareColors.k} />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: "center",
    margin: 10,
  },
});

export default LifeWheelChart;
