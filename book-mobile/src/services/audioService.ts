import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';

export async function speakArabic(text: string, muted: boolean = false): Promise<void> {
  if (muted || !text) return;
  try {
    const isSpeaking = await Speech.isSpeakingAsync();
    if (isSpeaking) {
      await Speech.stop();
    }
    Speech.speak(text, {
      language: 'ar',
      pitch: 1.0,
      rate: 0.88,
    });
  } catch {}
}

export async function stopSpeech(): Promise<void> {
  try {
    await Speech.stop();
  } catch {}
}

export function triggerHaptic(type: 'light' | 'success' | 'error' = 'light'): void {
  try {
    if (type === 'light') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else if (type === 'success') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else if (type === 'error') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  } catch {}
}

export function triggerPeriodHaptic(period: 'ones' | 'thousands' | 'millions'): void {
  try {
    if (period === 'millions') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } else if (period === 'thousands') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  } catch {}
}
