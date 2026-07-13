import { ChevronLeft, ChevronRight, Edit3, Play, Settings, Trash2 } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";

import { statusLabels } from "../../domain/constants";
import { buildStatistics } from "../../usecases/statisticsUseCases";
import { AnalyticsOverview } from "../components/AnalyticsOverview";
import { Card } from "../components/Card";
import { IconButton } from "../components/IconButton";
import { MetricStrip } from "../components/MetricStrip";
import { PageHeader } from "../components/PageHeader";
import { ScreenContainer } from "../components/ScreenContainer";
import { sessionStatusMeta } from "../components/SessionStatusBadge";
import { useIronHabitStore } from "../store/useIronHabitStore";
import { colors } from "../theme/colors";
import { formatDate, formatShortDate, toDateInput } from "../utils/date";

const startOfWeek = (weekOffset = 0) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7) + weekOffset * 7);
  return monday;
};

const agendaDays = (weekOffset = 0) => {
  const monday = startOfWeek(weekOffset);
  return Array.from({ length: 7 }).map((_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return date;
  });
};

const sameDay = (left, right) => toDateInput(left) === toDateInput(right);

export function DashboardScreen({ navigation }) {
  const exercises = useIronHabitStore((state) => state.exercises);
  const plans = useIronHabitStore((state) => state.plans);
  const plannedSessions = useIronHabitStore((state) => state.plannedSessions);
  const workoutLogs = useIronHabitStore((state) => state.workoutLogs);
  const goals = useIronHabitStore((state) => state.goals);
  const settings = useIronHabitStore((state) => state.settings);
  const startWorkout = useIronHabitStore((state) => state.startWorkout);
  const deleteSession = useIronHabitStore((state) => state.deleteSession);
  const [weekOffset, setWeekOffset] = useState(0);
  const days = useMemo(() => agendaDays(weekOffset), [weekOffset]);
  const weekLabel = useMemo(() => `${formatShortDate(days[0])} - ${formatShortDate(days[6])}`, [days]);
  const todayKey = toDateInput(new Date());
  const stats = useMemo(
    () => buildStatistics({ exercises, plans, plannedSessions, workoutLogs, goals }),
    [exercises, goals, plans, plannedSessions, workoutLogs]
  );

  const startSession = (session) => {
    startWorkout({ sessionId: session.id });
    navigation.navigate("GuidedWorkout");
  };

  const removeSession = (session) => {
    try {
      deleteSession(session.id);
    } catch (error) {
      Alert.alert("Eliminazione bloccata", error instanceof Error ? error.message : "Sessione non eliminata.");
    }
  };

  return (
    <ScreenContainer>
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
        <PageHeader
          title={`Ciao ${settings.profileName || "atleta"}!`}
          action={<IconButton icon={Settings} label="Apri impostazioni" onPress={() => navigation.navigate("Settings")} />}
        />

        <MetricStrip
          items={[
            { label: "Workout", value: stats.totals.completedWorkouts, onPress: () => navigation.navigate("HistoryTab") },
            { label: "Obiettivi", value: stats.totals.activeGoals, onPress: () => navigation.navigate("GoalsTab") }
          ]}
        />

        <AnalyticsOverview stats={stats} compact />

        <View className="mb-3 mt-6 flex-row items-center justify-between gap-3">
          <View className="min-w-0 flex-1">
            <Text className="text-lg font-semibold leading-6 text-iron-text">Agenda</Text>
            <Text className="mt-1 text-sm font-medium leading-5 text-iron-muted">{weekLabel}</Text>
          </View>
          <View className="flex-row gap-2">
            <IconButton
              icon={ChevronLeft}
              label="Settimana precedente"
              onPress={() => setWeekOffset((value) => value - 1)}
            />
            <IconButton
              icon={ChevronRight}
              label="Settimana successiva"
              onPress={() => setWeekOffset((value) => value + 1)}
            />
          </View>
        </View>

        <Card>
          <View className="gap-2">
            {days.map((day) => {
              const dateKey = toDateInput(day);
              const sessions = plannedSessions
                .filter((session) => sameDay(session.date, day))
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
              const isToday = dateKey === todayKey;
              const isPast = dateKey < todayKey;
              const navigateToDay = () => {
                navigation.navigate("SessionForm", { date: toDateInput(day) });
              };
              const dayHeaderContent = (
                <>
                  <View className={`h-12 w-12 items-center justify-center rounded-md border ${
                    isToday ? "border-iron-text bg-iron-card" : "border-iron-line bg-iron-surface"
                  }`}>
                    <Text className="text-[10px] font-semibold uppercase text-iron-muted">
                      {new Intl.DateTimeFormat("it-IT", { weekday: "short" }).format(day)}
                    </Text>
                    <Text className="text-lg font-semibold leading-6 text-iron-text">{day.getDate()}</Text>
                  </View>
                  <View className={`min-w-0 flex-1 ${isPast ? "justify-center" : ""}`}>
                    <Text className="text-base font-semibold leading-5 text-iron-text" numberOfLines={1}>
                      {isPast
                        ? "Giorno passato"
                        : sessions.length
                          ? `${sessions.length} ${sessions.length === 1 ? "sessione" : "sessioni"}`
                          : (isToday ? "Oggi libero" : "Giornata libera")}
                    </Text>
                    {!isPast ? (
                      <Text className="mt-1 text-sm font-medium leading-5 text-iron-muted" numberOfLines={1}>
                        {sessions.length ? "Tocca per aggiungerne un'altra" : "Tocca per pianificare"}
                      </Text>
                    ) : null}
                  </View>
                </>
              );

              return (
                <View
                  key={day.toISOString()}
                  className={`rounded-lg border px-3 py-3 ${
                    isToday ? "border-iron-text bg-iron-surface" : "border-iron-line bg-iron-card"
                  } ${isPast ? "opacity-60" : ""}`}
                >
                  {isPast ? (
                    <View className="flex-row items-center gap-3">
                      {dayHeaderContent}
                    </View>
                  ) : (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`${formatDate(day)}${sessions.length ? `, ${sessions.length} sessioni pianificate` : ", nessuna sessione"}. Tocca per aggiungere una sessione.`}
                      onPress={navigateToDay}
                      className="flex-row items-center gap-3"
                    >
                      {dayHeaderContent}
                    </Pressable>
                  )}

                  {sessions.length ? (
                    <View className="mt-3 gap-2 border-t border-iron-line pt-3">
                      {sessions.map((session) => {
                        const meta = sessionStatusMeta(session.status);
                        const StatusIcon = meta.Icon;
                        const canEdit = session.status === "planned" && !isPast;
                        const canStart = session.status === "planned" && isToday;
                        const canDelete = session.status === "planned" && !isPast;

                        return (
                          <View
                            key={session.id}
                            className="flex-row items-center gap-2 rounded-md border border-iron-line bg-iron-card px-2 py-2"
                          >
                            {isPast ? (
                              <View className="min-w-0 flex-1">
                                <Text className="text-sm font-semibold leading-5 text-iron-text" numberOfLines={1}>{session.title}</Text>
                                <View className="mt-1 flex-row items-center gap-1">
                                  <StatusIcon size={13} color={meta.color} />
                                  <Text className="text-xs font-semibold" style={{ color: meta.color }}>
                                    {statusLabels[session.status]}
                                  </Text>
                                </View>
                              </View>
                            ) : (
                              <Pressable
                                accessibilityRole="button"
                                accessibilityLabel={`Apri ${session.title}`}
                                onPress={() => navigation.navigate("SessionDetail", { id: session.id })}
                                className="min-w-0 flex-1"
                              >
                                <Text className="text-sm font-semibold leading-5 text-iron-text" numberOfLines={1}>{session.title}</Text>
                                <View className="mt-1 flex-row items-center gap-1">
                                  <StatusIcon size={13} color={meta.color} />
                                  <Text className="text-xs font-semibold" style={{ color: meta.color }}>
                                    {statusLabels[session.status]}
                                  </Text>
                                </View>
                              </Pressable>
                            )}
                            {canStart ? (
                              <IconButton
                                icon={Play}
                                label={`Esegui ${session.title}`}
                                color={colors.success}
                                onPress={() => startSession(session)}
                              />
                            ) : null}
                            {canEdit ? (
                              <IconButton
                                icon={Edit3}
                                label={`Modifica ${session.title}`}
                                color={colors.info}
                                onPress={() => navigation.navigate("SessionForm", { id: session.id })}
                              />
                            ) : null}
                            {canDelete ? (
                              <IconButton
                                icon={Trash2}
                                label={`Cancella ${session.title}`}
                                color={colors.danger}
                                onPress={() => removeSession(session)}
                              />
                            ) : null}
                          </View>
                        );
                      })}
                    </View>
                  ) : null}
                </View>
              );
            })}
          </View>
        </Card>
      </ScrollView>
    </ScreenContainer>
  );
}
