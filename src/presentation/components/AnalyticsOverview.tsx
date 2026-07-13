import { Text, View } from "react-native";
import Svg, { Circle, G, Line, Polyline, Rect, Text as SvgText } from "react-native-svg";

import { colors } from "../theme/colors";
import { Card } from "./Card";

export function AnalyticsOverview({ stats, oneRepMaxTrend = [], selectedExerciseName = "Esercizio", compact = false }) {
  const exerciseTrend = oneRepMaxTrend.length ? oneRepMaxTrend : [{ value: 0, label: "-" }];

  return (
    <View className="mt-3 gap-3">
      <Card>
        <Text className="mb-3 text-base font-semibold leading-5 text-iron-text">Volume settimanale</Text>
        <BarChart data={stats.weeklyVolume} compact={compact} />
      </Card>

      {compact ? null : (
      <Card>
        <Text className="mb-3 text-base font-semibold leading-5 text-iron-text">1RM stimato - {selectedExerciseName}</Text>
        <TrendChart data={exerciseTrend} />
      </Card>
      )}

      {compact ? null : (
      <Card>
        <Text className="mb-4 text-base font-semibold leading-5 text-iron-text">Distribuzione muscolare</Text>
        {stats.muscleDistribution.length ? (
          stats.muscleDistribution.map((item) => (
            <View key={item.text} className="mb-3">
              <View className="mb-1 flex-row items-center justify-between">
                <Text className="text-sm font-bold text-iron-text">{item.text}</Text>
                <Text className="text-sm font-semibold text-iron-muted">{item.percentage}%</Text>
              </View>
              <View className="h-2 overflow-hidden rounded-full bg-iron-line">
                <View className="h-full rounded-full bg-iron-text" style={{ width: `${item.percentage}%` }} />
              </View>
            </View>
          ))
        ) : (
          <Text className="text-sm font-medium text-iron-muted">Nessun esercizio disponibile.</Text>
        )}
      </Card>
      )}

      <Card>
        <Text className="mb-3 text-base font-semibold leading-5 text-iron-text">Sessioni pianificate</Text>
        <PlanningChart data={stats.plannedCompleted} compact={compact} />
      </Card>
    </View>
  );
}

function TrendChart({ data }) {
  const width = 360;
  const height = 170;
  const padding = { top: 18, right: 18, bottom: 28, left: 34 };
  const maxValue = Math.max(1, ...data.map((item) => Number(item.value || 0)));
  const pointsFor = (rows) =>
    rows.map((item, index) => ({
      x: padding.left + (rows.length === 1 ? (width - padding.left - padding.right) / 2 : (index / (rows.length - 1)) * (width - padding.left - padding.right)),
      y: padding.top + (height - padding.top - padding.bottom) * (1 - Number(item.value || 0) / maxValue),
      label: item.label
    }));
  const primary = pointsFor(data);

  return (
    <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} accessibilityLabel="Andamento del massimale stimato">
      {[0, 1, 2, 3].map((step) => {
        const y = padding.top + (step / 3) * (height - padding.top - padding.bottom);
        return <Line key={step} x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke={colors.line} strokeWidth="1" />;
      })}
      <Polyline points={primary.map((point) => `${point.x},${point.y}`).join(" ")} fill="none" stroke={colors.text} strokeWidth="3" />
      {primary.map((point, index) => <Circle key={`load-${index}`} cx={point.x} cy={point.y} r="4" fill={colors.text} />)}
      {primary.map((point, index) => (
        <SvgText key={`label-${index}`} x={point.x} y={height - 8} fill={colors.muted} fontSize="10" textAnchor="middle">
          {data.length > 6 && index !== 0 && index !== data.length - 1 ? "" : point.label}
        </SvgText>
      ))}
    </Svg>
  );
}

function BarChart({ data, compact = false }) {
  const width = 360;
  const height = compact ? 126 : 160;
  const maxValue = Math.max(1, ...data.map((item) => Number(item.value || 0)));
  const gap = 8;
  const barWidth = (width - 28 - gap * (data.length - 1)) / data.length;
  const chartBottom = compact ? 94 : 122;
  const maxBarHeight = compact ? 76 : 105;
  const labelY = compact ? 116 : 146;

  return (
    <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} accessibilityLabel="Grafico del volume settimanale">
      {data.map((item, index) => {
        const barHeight = Math.max(3, (Number(item.value || 0) / maxValue) * maxBarHeight);
        const x = 14 + index * (barWidth + gap);
        const y = chartBottom - barHeight;
        return (
          <G key={`${item.label}-${index}`}>
            <Rect x={x} y={y} width={barWidth} height={barHeight} rx="5" fill={index === data.length - 1 ? colors.text : colors.muted} />
            <SvgText x={x + barWidth / 2} y={labelY} fill={colors.muted} fontSize="9" textAnchor="middle">
              {index % 2 === 0 || index === data.length - 1 ? item.label : ""}
            </SvgText>
          </G>
        );
      })}
    </Svg>
  );
}

function PlanningChart({ data, compact = false }) {
  const width = 360;
  const height = compact ? 122 : 150;
  const maxValue = Math.max(1, ...data.map((item) => Number(item.value || 0)));
  const barWidth = 86;
  const gap = (width - 40 - data.length * barWidth) / Math.max(1, data.length - 1);
  const chartBottom = compact ? 88 : 112;
  const maxBarHeight = compact ? 70 : 92;
  const labelY = compact ? 112 : 138;

  return (
    <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} accessibilityLabel="Sessioni pianificate per stato">
      {data.map((item, index) => {
        const value = Number(item.value || 0);
        const barHeight = (value / maxValue) * maxBarHeight;
        const x = 20 + index * (barWidth + gap);
        const y = chartBottom - barHeight;
        return (
          <G key={item.label}>
            <Rect x={x} y={y} width={barWidth} height={Math.max(3, barHeight)} rx="6" fill={item.color || colors.muted} />
            <SvgText x={x + barWidth / 2} y={Math.max(14, y - 7)} fill={colors.text} fontSize="12" fontWeight="700" textAnchor="middle">
              {value}
            </SvgText>
            <SvgText x={x + barWidth / 2} y={labelY} fill={colors.muted} fontSize="11" textAnchor="middle">
              {item.label}
            </SvgText>
          </G>
        );
      })}
    </Svg>
  );
}
