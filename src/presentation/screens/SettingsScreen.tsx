import { ScrollView, Switch, Text, View } from "react-native";

import { AppInput } from "../components/AppInput";
import { AppSelect } from "../components/AppSelect";
import { Card } from "../components/Card";
import { PageHeader } from "../components/PageHeader";
import { RestTimerSelect } from "../components/RestTimerSelect";
import { ScreenContainer } from "../components/ScreenContainer";
import { colors, normalizeThemeMode } from "../theme/colors";
import { themeModeOptions } from "../utils/labels";
import { useIronHabitStore } from "../store/useIronHabitStore";

export function SettingsScreen() {
  const settings = useIronHabitStore((state) => state.settings);
  const updateSettings = useIronHabitStore((state) => state.updateSettings);

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <PageHeader title="Impostazioni" />

        <Card className="gap-4">
          <Text className="text-lg font-semibold leading-6 text-iron-text">Profilo</Text>
          <AppInput
            label="Nome utente"
            value={settings.profileName}
            onChangeText={(value) => updateSettings({ profileName: value })}
          />
        </Card>

        <Card className="mt-3 gap-4">
          <Text className="text-lg font-semibold leading-6 text-iron-text">Aspetto</Text>
          <AppSelect
            label="Tema"
            options={themeModeOptions}
            value={normalizeThemeMode(settings.themeMode)}
            onChange={(themeMode) => updateSettings({ themeMode })}
          />
        </Card>

        <Card className="mt-3 gap-4">
          <Text className="text-lg font-semibold leading-6 text-iron-text">Timer e feedback</Text>
          <SettingSwitch
            label="Feedback sonoro"
            value={settings.soundEnabled}
            onValueChange={(value) => updateSettings({ soundEnabled: value })}
          />
          <SettingSwitch
            label="Vibrazione"
            value={settings.vibrationEnabled}
            onValueChange={(value) => updateSettings({ vibrationEnabled: value })}
          />
          <RestTimerSelect
            label="Recupero predefinito"
            value={settings.defaultRestSeconds}
            onChange={(defaultRestSeconds) => updateSettings({ defaultRestSeconds })}
          />
        </Card>
      </ScrollView>
    </ScreenContainer>
  );
}

function SettingSwitch({ label, value, onValueChange }) {
  return (
    <View className="min-h-12 flex-row items-center justify-between gap-4 border-b border-iron-line pb-3">
      <Text className="flex-1 text-base font-semibold text-iron-text">{label}</Text>
      <Switch
        accessibilityLabel={label}
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.line, true: colors.text }}
        thumbColor={colors.inverseText}
      />
    </View>
  );
}
