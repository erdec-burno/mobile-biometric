import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';

export type BiometricConfirmationResult =
  | { success: true }
  | { success: false; reason: BiometricFailureReason };

export type BiometricFailureReason = 'unsupported' | 'not-enrolled' | 'cancelled' | 'failed';

export function getBiometricFailureMessage(reason: BiometricFailureReason): string {
  const messages: Record<BiometricFailureReason, string> = {
    unsupported: 'На этом устройстве биометрия недоступна.',
    'not-enrolled': 'Добавьте отпечаток пальца или Face ID в настройках устройства.',
    cancelled: 'Подтверждение отменено.',
    failed: 'Не удалось подтвердить действие. Попробуйте ещё раз.',
  };

  return messages[reason];
}

export async function confirmWithBiometrics(
  promptMessage: string,
): Promise<BiometricConfirmationResult> {
  if (Platform.OS === 'web') {
    return { success: false, reason: 'unsupported' };
  }

  try {
    const [hasHardware, isEnrolled] = await Promise.all([
      LocalAuthentication.hasHardwareAsync(),
      LocalAuthentication.isEnrolledAsync(),
    ]);

    if (!hasHardware) {
      return { success: false, reason: 'unsupported' };
    }

    if (!isEnrolled) {
      return { success: false, reason: 'not-enrolled' };
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      promptDescription: 'Подтвердите действие биометрией устройства',
      cancelLabel: 'Отмена',
      biometricsSecurityLevel: 'strong',
      disableDeviceFallback: true,
      requireConfirmation: true,
    });

    if (result.success) {
      return { success: true };
    }

    if (result.error === 'user_cancel' || result.error === 'system_cancel') {
      return { success: false, reason: 'cancelled' };
    }

    return { success: false, reason: 'failed' };
  } catch {
    return { success: false, reason: 'failed' };
  }
}
