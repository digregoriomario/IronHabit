import { Pause, Play, RotateCcw, Timer } from "lucide-react-native";
import { Text, View } from "react-native";

import { useCountdown, useStopwatch } from "../hooks/useCountdown";
import { formatSeconds } from "../utils/format";
import { AppButton } from "./AppButton";
import { Card } from "./Card";
import { IconButton } from "./IconButton";
import { colors } from "../theme/colors";

export function TimerPanel({ restSeconds = 90, settings, compact = false }) {
  const countdown = useCountdown({ initialSeconds: restSeconds, settings });
  const stopwatch = useStopwatch();

  if (compact) {
    return (
      <Card className="gap-3">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <Timer size={18} color={colors.text} />
            <Text className="font-bold text-iron-text">Recupero {formatSeconds(countdown.secondsLeft)}</Text>
          </View>
          <View className="flex-row gap-2">
            <IconButton label={countdown.running ? "Pausa recupero" : "Avvia recupero"} icon={countdown.running ? Pause : Play} onPress={countdown.running ? countdown.pause : countdown.start} color={colors.text} />
            <IconButton label="Reimposta recupero" icon={RotateCcw} onPress={() => countdown.reset(restSeconds)} color={colors.muted} />
          </View>
        </View>
      </Card>
    );
  }

  return (
    <Card className="gap-4">
      <View className="flex-row gap-3">
        <View className="flex-1 rounded-md border border-iron-line bg-iron-surface p-4">
          <Text className="text-xs font-semibold uppercase text-iron-muted">Cronometro</Text>
          <Text className="mt-2 text-3xl font-semibold text-iron-text">{formatSeconds(stopwatch.seconds)}</Text>
          <View className="mt-3 flex-row gap-2">
            <IconButton label={stopwatch.running ? "Pausa cronometro" : "Avvia cronometro"} icon={stopwatch.running ? Pause : Play} onPress={stopwatch.running ? stopwatch.pause : stopwatch.start} color={colors.text} />
            <IconButton label="Reimposta cronometro" icon={RotateCcw} onPress={stopwatch.reset} color={colors.muted} />
          </View>
        </View>
        <View className="flex-1 rounded-md border border-iron-line bg-iron-surface p-4">
          <Text className="text-xs font-semibold uppercase text-iron-muted">Countdown</Text>
          <Text className="mt-2 text-3xl font-semibold text-iron-text">{formatSeconds(countdown.secondsLeft)}</Text>
          <View className="mt-3 flex-row gap-2">
            <IconButton label={countdown.running ? "Pausa countdown" : "Avvia countdown"} icon={countdown.running ? Pause : Play} onPress={countdown.running ? countdown.pause : countdown.start} color={colors.text} />
            <IconButton label="Reimposta countdown" icon={RotateCcw} onPress={() => countdown.reset(restSeconds)} color={colors.muted} />
          </View>
        </View>
      </View>
      <AppButton title="Avvia recupero" icon={Play} onPress={countdown.start} variant="success" />
    </Card>
  );
}
