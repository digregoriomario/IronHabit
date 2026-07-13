import { Vibration } from "react-native";

const beepUri =
  "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA=";

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

const playWithExpoAudio = () => {
  const ExpoAudio = loadExpoAudio();
  if (!ExpoAudio?.createAudioPlayer) return false;
  const player = ExpoAudio.createAudioPlayer(beepUri);
  player.volume = 0.9;
  player.play();
  setTimeout(() => {
    try {
      player.remove();
    } catch {}
  }, 1200);
  return true;
};

export const playTimerFeedback = async ({ soundEnabled = true, vibrationEnabled = true } = {}) => {
  if (vibrationEnabled) {
    const Haptics = loadExpoHaptics();
    if (Haptics?.notificationAsync) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Vibration.vibrate(250);
    }
  }
  if (!soundEnabled) return;
  try {
    if (playWithExpoAudio()) return;
  } catch {
    Vibration.vibrate([80, 80, 120]);
  }
};

export const playSetCompletionFeedback = async ({ vibrationEnabled = true } = {}) => {
  if (!vibrationEnabled) return;
  const Haptics = loadExpoHaptics();
  if (Haptics?.impactAsync) {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    return;
  }
  Vibration.vibrate(60);
};
