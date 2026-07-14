import { Text, View } from "react-native";
import Svg, { G, Rect, Text as SvgText } from "react-native-svg";

import { colors } from "../theme/colors";
import { Card } from "./Card";

export function AnalyticsOverview({ stats, compact = false }) {
  return (
    <View className="mt-3 gap-3">
      <Card>
        <Text className="mb-3 text-base font-semibold leading-5 text-iron-text">Volume settimanale (kg)</Text>
        <BarChart data={stats.weeklyVolume} compact={compact} />
      </Card>

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

function BarChart({ data, compact = false }) {
  const width = 360;
  const height = compact ? 140 : 168;
  const maxValue = Math.max(1, ...data.map((item) => Number(item.value || 0)));
  const gap = 8;
  const barWidth = (width - 28 - gap * (data.length - 1)) / data.length;
  const chartBottom = compact ? 104 : 130;
  const maxBarHeight = compact ? 72 : 94;
  const labelY = compact ? 130 : 156;

  return (
    <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} accessibilityLabel="Grafico del volume settimanale">
      {data.map((item, index) => {
        const value = Math.round(Number(item.value || 0));
        const barHeight = Math.max(3, (value / maxValue) * maxBarHeight);
        const x = 14 + index * (barWidth + gap);
        const y = chartBottom - barHeight;
        const fill = item.isToday ? colors.text : colors.muted;
        return (
          <G key={`${item.label}-${index}`}>
            <SvgText x={x + barWidth / 2} y={Math.max(14, y - 7)} fill={colors.text} fontSize="10" fontWeight="700" textAnchor="middle">
              {value}
            </SvgText>
            <Rect x={x} y={y} width={barWidth} height={barHeight} rx="5" fill={fill} />
            <SvgText x={x + barWidth / 2} y={labelY} fill={colors.muted} fontSize="9" textAnchor="middle">
              {item.label}
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
