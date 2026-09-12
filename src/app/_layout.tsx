import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { BiometricGate } from '@/components/biometric-gate';
import { ColorSchemeProvider, useColorScheme } from '@/hooks/use-color-scheme';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  return (
    <ColorSchemeProvider>
      <ThemedTabLayout />
    </ColorSchemeProvider>
  );
}

function ThemedTabLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <BiometricGate>
        <AppTabs />
      </BiometricGate>
    </ThemeProvider>
  );
}
