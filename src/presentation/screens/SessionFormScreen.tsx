import { Save } from "lucide-react-native";
import { useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";

import { AppButton } from "../components/AppButton";
import { AppInput } from "../components/AppInput";
import { EntitySelect } from "../components/EntitySelect";
import { PageHeader } from "../components/PageHeader";
import { ScreenContainer } from "../components/ScreenContainer";
import { FORM_SCREEN_EDGES, FORM_SCROLL_CONTENT_STYLE } from "../theme/layout";
import { showValidationAlert } from "../utils/alerts";
import { fromDateInput, toDateInput } from "../utils/date";
import { useIronHabitStore } from "../store/useIronHabitStore";

const blankSession = {
  title: "",
  date: new Date().toISOString(),
  planId: null,
  exerciseIds: [],
  status: "planned" as const,
  notes: ""
};

const formatPlanningDate = (value) => {
  const label = new Intl.DateTimeFormat("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long"
  }).format(new Date(fromDateInput(value)));
  return label.charAt(0).toUpperCase() + label.slice(1);
};

export function SessionFormScreen({ navigation, route }) {
  const id = route.params?.id;
  const requestedDate = route.params?.date;
  const plans = useIronHabitStore((state) => state.plans);
  const plannedSessions = useIronHabitStore((state) => state.plannedSessions);
  const existing = useIronHabitStore((state) => state.plannedSessions.find((session) => session.id === id));
  const addSession = useIronHabitStore((state) => state.addSession);
  const updateSession = useIronHabitStore((state) => state.updateSession);
  const [form, setForm] = useState(() => existing || { ...blankSession, date: requestedDate ? fromDateInput(requestedDate) : blankSession.date });
  const [dateText] = useState(() => toDateInput(existing?.date || requestedDate || blankSession.date));
  const pageDate = formatPlanningDate(dateText);
  const titleText = String(form.title ?? "").trim();
  const unavailablePlanIds = useMemo(() => {
    const ids = plannedSessions
      .filter((session) => session.id !== id && toDateInput(session.date) === dateText && session.planId)
      .map((session) => session.planId);
    return new Set(ids);
  }, [dateText, id, plannedSessions]);
  const unavailablePlans = useMemo(
    () => plans.filter((plan) => unavailablePlanIds.has(plan.id)).map((plan) => plan.name),
    [plans, unavailablePlanIds]
  );

  const setField = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const saveDisabled = !form.planId && !titleText.length;

  const save = () => {
    if (form.planId && unavailablePlanIds.has(form.planId)) {
      showValidationAlert(new Error("Questa scheda e gia pianificata per questo giorno."));
      return;
    }
    const plan = plans.find((item) => item.id === form.planId);
    const payload = {
      title: plan?.name || titleText,
      date: fromDateInput(dateText),
      planId: form.planId,
      exerciseIds: [],
      status: existing?.status || "planned",
      notes: form.notes
    };
    try {
      if (id) {
        updateSession(id, payload);
      } else {
        addSession(payload);
      }
      navigation.goBack();
    } catch (error) {
      showValidationAlert(error);
    }
  };

  return (
    <ScreenContainer edges={FORM_SCREEN_EDGES}>
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={FORM_SCROLL_CONTENT_STYLE}>
          <PageHeader title={id ? `Modifica sessione del ${pageDate}` : `Nuova sessione per ${pageDate}`} />

          <View className="gap-4">
            <EntitySelect
              label="Scheda da svolgere"
              items={plans}
              value={form.planId}
              onChange={(value) => setField("planId", value)}
              disabledIds={[...unavailablePlanIds]}
              disabledDescription="Gia pianificata"
              helperText={unavailablePlans.length ? `Gia pianificate per questo giorno: ${unavailablePlans.join(", ")}.` : "Lascia nessuna selezione per pianificare una sessione libera."}
            />
            {!form.planId ? (
              <>
                <AppInput
                  label="Titolo sessione"
                  value={form.title}
                  onChangeText={(value) => setField("title", value)}
                  placeholder="Es. Cardio leggero"
                />
                <Text className="text-xs font-medium leading-5 text-iron-muted">
                  Il titolo e obbligatorio quando non associ una scheda.
                </Text>
              </>
            ) : null}
            <AppInput label="Note" value={form.notes} onChangeText={(value) => setField("notes", value)} multiline />
            <AppButton title="Salva sessione" icon={Save} variant="info" disabled={saveDisabled} onPress={save} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
