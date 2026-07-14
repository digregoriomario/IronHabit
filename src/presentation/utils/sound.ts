import { Vibration } from "react-native";

const timerNotificationSource = require("../../../assets/timer_notification.mp3");
const TIMER_NOTIFICATION_DURATION_MS = 2142;
const TIMER_PLAYER_CLEANUP_DELAY_MS = TIMER_NOTIFICATION_DURATION_MS + 300;
const TIMER_HAPTIC_INTERVAL_MS = 320;

const loadExpoAudio = () => {
  try {
    return require("expo-audio");
  } catch {
    return null;
  }
};

const loadExpoHaptics = () => {
  try {
    return require("expo-haptics");
  } catch {
    return null;
  }
};

const playWithExpoAudio = async () => {
  const ExpoAudio = loadExpoAudio();
  if (!ExpoAudio?.createAudioPlayer) return false;

  if (ExpoAudio.setAudioModeAsync) {
    await ExpoAudio.setAudioModeAsync({
      playsInSilentMode: true,
      interruptionMode: "mixWithOthers"
    });
  }

  const player = ExpoAudio.createAudioPlayer(timerNotificationSource);
  player.volume = 0.9;
  player.play();
  setTimeout(() => {
    try {
      player.remove();
    } catch {}
  }, TIMER_PLAYER_CLEANUP_DELAY_MS);
  return true;
};

const triggerTimerHapticPulse = async () => {
  const Haptics = loadExpoHaptics();
  try {
    if (Haptics?.performAndroidHapticsAsync && Haptics.AndroidHaptics?.Confirm) {
      await Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Confirm);
      return;
    }
    if (Haptics?.impactAsync) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      return;
    }
    if (Haptics?.notificationAsync) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  } catch {}
};

const playTimerVibration = () => {
  Vibration.cancel();
  Vibration.vibrate(TIMER_NOTIFICATION_DURATION_MS);
  void triggerTimerHapticPulse();

  for (let offset = TIMER_HAPTIC_INTERVAL_MS; offset < TIMER_NOTIFICATION_DURATION_MS; offset += TIMER_HAPTIC_INTERVAL_MS) {
    setTimeout(() => {
      void triggerTimerHapticPulse();
    }, offset);
  }
};

export const playTimerFeedback = async ({ soundEnabled = true, vibrationEnabled = true } = {}) => {
  if (vibrationEnabled) {
    playTimerVibration();
  }
  if (!soundEnabled) return;
  try {
    if (await playWithExpoAudio()) return;
  } catch {}
};

export const playSetCompletionFeedback = async ({ vibrationEnabled = true } = {}) => {
  if (!vibrationEnabled) return;
  const Haptics = loadExpoHaptics();
  try {
    if (Haptics?.impactAsync) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      return;
    }
  } catch {}
  Vibration.vibrate(60);
};
