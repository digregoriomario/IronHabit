import { Save } from "lucide-react-native";
import { useState } from "react";
import { Alert, ScrollView, Switch, Text, View } from "react-native";

import { AppButton } from "../components/AppButton";
import { AppInput } from "../components/AppInput";
import { AppSelect } from "../components/AppSelect";
import { Card } from "../components/Card";
import { RestTimerSelect } from "../components/RestTimerSelect";
import { ScreenContainer } from "../components/ScreenContainer";
import { colors, normalizeThemeMode } from "../theme/colors";
import { themeModeOptions } from "../utils/labels";
import { useIronHabitStore } from "../store/useIronHabitStore";

export function InitialSetupScreen() {
  const settings = useIronHabitStore((state) => state.settings);
  const updateSettings = useIronHabitStore((state) => state.updateSettings);
  const [profileName, setProfileName] = useState(settings.profileName || "");
  const [themeMode, setThemeMode] = useState(() => normalizeThemeMode(settings.themeMode));
  const [soundEnabled, setSoundEnabled] = useState(settings.soundEnabled);
  const [vibrationEnabled, setVibrationEnabled] = useState(settings.vibrationEnabled);
  const [defaultRestSeconds, setDefaultRestSeconds] = useState(settings.defaultRestSeconds || 90);

  const completeSetup = () => {
    const name = profileName.trim();
    if (!name) {
      Alert.alert("Controlla i dati", "Inserisci il tuo nome per completare la configurazione.");
      return;
    }

    updateSettings({
      profileName: name,
      themeMode,
      soundEnabled,
      vibrationEnabled,
      defaultRestSeconds,
      onboardingCompleted: true
    });
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <View className="mb-5">
          <Text className="text-2xl font-semibold leading-8 text-iron-text">Configurazione iniziale</Text>
        </View>

        <Card className="gap-4">
          <AppInput
            label="Nome"
            value={profileName}
            onChangeText={(value) => {
              setProfileName(value);
              updateSettings({ profileName: value });
            }}
            placeholder="Il tuo nome"
          />
          <AppSelect
            label="Tema"
            options={themeModeOptions}
            value={themeMode}
            onChange={(value) => {
              setThemeMode(value);
              updateSettings({ themeMode: value });
            }}
          />
          <SetupSwitch
            label="Feedback sonoro"
            value={soundEnabled}
            onValueChange={(value) => {
              setSoundEnabled(value);
              updateSettings({ soundEnabled: value });
            }}
          />
          <SetupSwitch
            label="Vibrazione"
            value={vibrationEnabled}
            onValueChange={(value) => {
              setVibrationEnabled(value);
              updateSettings({ vibrationEnabled: value });
            }}
          />
          <RestTimerSelect
            label="Recupero predefinito"
            value={defaultRestSeconds}
            onChange={(value) => {
              setDefaultRestSeconds(value);
              updateSettings({ defaultRestSeconds: value });
            }}
          />
          <AppButton title="Inizia" icon={Save} variant="info" onPress={completeSetup} />
        </Card>
      </ScrollView>
    </ScreenContainer>
  );
}

function SetupSwitch({ label, value, onValueChange }) {
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
