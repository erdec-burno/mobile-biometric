import type { ReactNode } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Button, StyleSheet, type AppStateStatus } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import {
  confirmWithBiometrics,
  getBiometricFailureMessage,
  type BiometricFailureReason,
} from '@/lib/biometrics';

type BiometricGateProps = {
  children: ReactNode;
  promptMessage?: string;
};

export function BiometricGate({
  children,
  promptMessage = 'Войти в приложение',
}: BiometricGateProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [failureReason, setFailureReason] = useState<BiometricFailureReason | null>(null);
  const hasRequestedOnStart = useRef(false);
  const appState = useRef<AppStateStatus>(AppState.currentState);
  const isAuthenticatedRef = useRef(false);
  const shouldReauthenticate = useRef(false);

  const authenticate = useCallback(async () => {
    setIsConfirming(true);
    setFailureReason(null);

    const result = await confirmWithBiometrics(promptMessage);
    setIsConfirming(false);

    if (result.success) {
      isAuthenticatedRef.current = true;
      setIsAuthenticated(true);
      return;
    }

    setFailureReason(result.reason);
  }, [promptMessage]);

  useEffect(() => {
    if (!hasRequestedOnStart.current) {
      hasRequestedOnStart.current = true;
      void authenticate();
    }
  }, [authenticate]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      const wasInBackground = appState.current === 'background' || appState.current === 'inactive';

      if (
        isAuthenticatedRef.current &&
        (nextAppState === 'background' || nextAppState === 'inactive')
      ) {
        shouldReauthenticate.current = true;
      }

      appState.current = nextAppState;

      if (wasInBackground && nextAppState === 'active' && shouldReauthenticate.current) {
        shouldReauthenticate.current = false;
        isAuthenticatedRef.current = false;
        setIsAuthenticated(false);
        void authenticate();
      }
    });

    return () => subscription.remove();
  }, [authenticate]);

  if (isAuthenticated) {
    return children;
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title" style={styles.title}>
          Вход защищён
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.description}>
          Подтвердите вход отпечатком пальца или Face ID.
        </ThemedText>
        {failureReason && (
          <ThemedText themeColor="textSecondary" style={styles.description}>
            {getBiometricFailureMessage(failureReason)}
          </ThemedText>
        )}
        <Button
          title={isConfirming ? 'Ожидание подтверждения…' : 'Повторить проверку'}
          onPress={() => void authenticate()}
          disabled={isConfirming}
        />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  safeArea: {
    flex: 1,
    maxWidth: MaxContentWidth,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
  },
  title: {
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
  },
});
